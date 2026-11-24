import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

// ─────────────────────────────────────────────────────────────────────────────
// Score de solvabilité — barème interne du cabinet.
//
// Cette route s'appuyait sur `prisma.client.findFirst()` sans aucun critère :
// elle calculait, renvoyait et surtout PERSISTAIT un CreditScore (avec son
// indicateur d'éligibilité, destiné à être présenté à des banques) sur le
// premier client retourné par MongoDB, dans un ordre non déterministe. Sur un
// portefeuille de plusieurs clients, la note atterrissait donc en base sur le
// mauvais dossier. Un simple GET créait en outre un client fictif
// ("Cabinet 360 Client Default") quand la collection était vide.
//
// Le client est désormais explicite et obligatoire, et le score n'est calculé
// que si le dossier contient au moins une donnée réelle.
//
// Le barème (400 + 550 × moyenne des 4 facteurs, éligibilité à 700) est une
// convention interne du cabinet, pas une cotation bancaire normalisée : il sert
// à hiérarchiser les dossiers entre eux, pas à préjuger d'une décision de
// crédit. Les facteurs sans donnée sous-jacente sont neutralisés à 50 et
// listés dans `facteursIndetermines`, pour ne pas faire passer une absence
// d'information pour une performance moyenne établie.
// ─────────────────────────────────────────────────────────────────────────────

const NEUTRE = 50;

function estIdentifiantValide(clientId: unknown): clientId is string {
    return typeof clientId === "string" && clientId.length === 24;
}

export async function GET(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    try {
        const clientId = new URL(req.url).searchParams.get("clientId");
        if (!estIdentifiantValide(clientId) || !isObjectId(clientId)) {
            return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        }

        const score = await prisma.creditScore.findFirst({
            where: { clientId, cabinetId: session.cabinetId },
            orderBy: { evaluatedAt: 'desc' }
        });

        return NextResponse.json(score || null);
    } catch (error) {
        console.error("Erreur GET CreditScore:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { clientId } = await req.json().catch(() => ({ clientId: null }));
        if (!estIdentifiantValide(clientId)) {
            return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        }

        if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
        const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
        }

        const [invoices, journals, mmTx] = await Promise.all([
            prisma.invoice.findMany({ where: { clientId: client.id, cabinetId: session.cabinetId } }),
            prisma.tpeJournal.findMany({ where: { clientId: client.id, cabinetId: session.cabinetId, source: { not: 'WHATSAPP_TEST' } }, orderBy: { createdAt: 'desc' } }),
            prisma.mobileMoneyTransaction.findMany({ where: { clientId: client.id, cabinetId: session.cabinetId } }),
        ]);

        if (invoices.length === 0 && journals.length === 0 && mmTx.length === 0) {
            return NextResponse.json(
                {
                    aucuneDonnee: true,
                    error:
                        "Aucune facture, écriture ou transaction Mobile Money n'est rattachée à ce client : " +
                        "un score serait entièrement composé de valeurs neutres et n'aurait aucune valeur informative.",
                },
                { status: 422 }
            );
        }

        const facteursIndetermines: string[] = [];

        // 1. Historique de règlement des factures du cabinet : part des factures payées
        const paymentHistory = invoices.length > 0
            ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100)
            : NEUTRE;
        if (invoices.length === 0) facteursIndetermines.push("Historique de règlement");

        // 2. Évolution des encaissements entre les deux dernières périodes du journal
        const periods = Array.from(new Set(journals.map(j => j.periode))).sort();
        let revenueGrowth = NEUTRE;
        if (periods.length >= 2) {
            const lastP = periods[periods.length - 1];
            const prevP = periods[periods.length - 2];
            const lastCA = journals.filter(j => j.periode === lastP).reduce((s, j) => s + j.entree, 0);
            const prevCA = journals.filter(j => j.periode === prevP).reduce((s, j) => s + j.entree, 0);
            revenueGrowth = prevCA > 0 ? Math.max(0, Math.min(100, Math.round(50 + ((lastCA - prevCA) / prevCA) * 100))) : NEUTRE;
            if (prevCA <= 0) facteursIndetermines.push("Évolution des encaissements");
        } else {
            facteursIndetermines.push("Évolution des encaissements");
        }

        // 3. Part des entrées dans le flux total du journal
        const totalEntree = journals.reduce((s, j) => s + j.entree, 0);
        const totalSortie = journals.reduce((s, j) => s + j.sortie, 0);
        const fluxTotal = totalEntree + totalSortie;
        const debtRatio = fluxTotal > 0
            ? Math.round(100 - (totalSortie / fluxTotal) * 100)
            : NEUTRE;
        if (fluxTotal === 0) facteursIndetermines.push("Structure des flux");

        // 4. Nombre de canaux d'encaissement Mobile Money distincts
        const channels = new Set(mmTx.map(t => t.operator));
        const clientDiversification = Math.min(100, 20 + channels.size * 20);
        if (mmTx.length === 0) facteursIndetermines.push("Canaux d'encaissement");

        const score = Math.round(400 + ((paymentHistory + revenueGrowth + debtRatio + clientDiversification) / 400) * 550);
        const isEligible = score >= 700;

        const factors = { paymentHistory, revenueGrowth, debtRatio, clientDiversification };

        const newScore = await prisma.creditScore.create({
            data: {
                score,
                factors,
                isEligible,
                clientId: client.id,
                cabinetId: session.cabinetId,
                evaluatedAt: new Date()
            }
        });

        return NextResponse.json({ ...newScore, facteursIndetermines }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST CreditScore:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
