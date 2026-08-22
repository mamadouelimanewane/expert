import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { balanceDepuisJournal } from "@/lib/ohada/balance-from-journal";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";

// Bilan SYSCOHADA révisé, produit par le moteur commun (src/lib/ohada).
//
// Le résultat net n'est plus déduit par différence : il provient de la cascade
// des soldes intermédiaires de gestion. Le bilan peut donc apparaître
// déséquilibré si les écritures le sont — c'est précisément l'information dont
// l'expert a besoin, et elle est remontée dans `controles` plutôt que masquée.

const SELECTION = {
    debitCompte: true,
    debitIntitule: true,
    creditCompte: true,
    creditIntitule: true,
    montant: true,
} as const;

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");
        const periodeN1 = searchParams.get("periodeN1");

        const base = {
            status: "EXPORTED",
            source: { not: "WHATSAPP_TEST" },
            ...(clientId ? { clientId } : {}),
        };

        const [ecrituresN, ecrituresN1] = await Promise.all([
            prisma.tpeJournal.findMany({
                where: { ...base, ...(periode ? { periode } : {}) },
                select: SELECTION,
            }),
            periodeN1
                ? prisma.tpeJournal.findMany({
                      where: { ...base, periode: periodeN1 },
                      select: SELECTION,
                  })
                : Promise.resolve([]),
        ]);

        const etats = genererEtatsFinanciers(
            balanceDepuisJournal(ecrituresN),
            balanceDepuisJournal(ecrituresN1)
        );

        return NextResponse.json({
            actif: etats.actif,
            passif: etats.passif,
            resultatNet: etats.resultatNet,
            controles: {
                balance: etats.controleBalance,
                equilibre: etats.controleEquilibre,
                comptesNonAffectes: etats.comptesNonAffectes,
            },
            source: {
                ecrituresN: ecrituresN.length,
                ecrituresN1: ecrituresN1.length,
                periode,
                periodeN1,
            },
        });
    } catch (error) {
        console.error("Erreur API Bilan:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
