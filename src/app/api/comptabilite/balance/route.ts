import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { analyserMontant, normaliserPeriode } from "@/lib/validation";
import type { CompteBalance } from "@/lib/ohada/types";

/**
 * Balance générale importée pour un dossier et une période de clôture.
 *
 * Le fichier (CSV/Excel) est lu dans le navigateur ; seules les lignes
 * normalisées { numero, intitule, debit, credit } arrivent ici. Le serveur
 * revalide chaque ligne, calcule les totaux et vérifie l'équilibre ; il
 * enregistre même une balance déséquilibrée, en le signalant, parce que
 * c'est précisément ce que l'expert doit voir — mais il refuse tout compte
 * illisible plutôt que de l'ignorer en silence.
 */

const MAX_LIGNES = 5000;
const TOLERANCE = 1; // FCFA — arrondis de saisie

type LigneBrute = { numero?: unknown; intitule?: unknown; debit?: unknown; credit?: unknown };

function analyserLignes(brutes: unknown): { ok: true; lignes: CompteBalance[]; rejets: string[] } | { ok: false; raison: string; rejets?: string[] } {
    if (!Array.isArray(brutes) || brutes.length === 0) return { ok: false, raison: "Aucune ligne de balance reçue." };
    if (brutes.length > MAX_LIGNES) return { ok: false, raison: `${MAX_LIGNES} lignes au maximum par balance.` };
    const parCompte = new Map<string, CompteBalance>();
    const rejets: string[] = [];
    brutes.forEach((b: LigneBrute, i) => {
        const n = i + 1;
        const numero = String(b.numero ?? "").replace(/\s+/g, "").trim();
        if (!/^\d{1,13}$/.test(numero)) {
            rejets.push(`Ligne ${n} : numéro de compte illisible « ${String(b.numero ?? "")} ».`);
            return;
        }
        const debit = analyserMontant(b.debit ?? 0, { min: 0 });
        const credit = analyserMontant(b.credit ?? 0, { min: 0 });
        if (!debit.ok) {
            rejets.push(`Ligne ${n} (${numero}) : débit — ${debit.raison}`);
            return;
        }
        if (!credit.ok) {
            rejets.push(`Ligne ${n} (${numero}) : crédit — ${credit.raison}`);
            return;
        }
        if (debit.valeur === 0 && credit.valeur === 0) return; // compte soldé : sans effet
        const intitule = String(b.intitule ?? "").trim().slice(0, 200) || numero;
        // Un même compte réparti sur plusieurs lignes (sous-totaux, auxiliaires) est cumulé.
        const existant = parCompte.get(numero);
        if (existant) {
            existant.debit += debit.valeur;
            existant.credit += credit.valeur;
        } else {
            parCompte.set(numero, { numero, intitule, debit: debit.valeur, credit: credit.valeur });
        }
    });
    if (rejets.length > 0) return { ok: false, raison: "Certaines lignes n'ont pas pu être lues : la balance n'a pas été enregistrée.", rejets: rejets.slice(0, 30) };
    if (parCompte.size === 0) return { ok: false, raison: "Toutes les lignes sont à zéro." };
    return { ok: true, lignes: [...parCompte.values()].sort((a, b) => a.numero.localeCompare(b.numero)), rejets };
}

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");
        if (!clientId || clientId.length !== 24) {
            return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        }
        if (periode) {
            const p = normaliserPeriode(periode);
            if (!p) return NextResponse.json({ error: "Période illisible (AAAA-MM attendu)." }, { status: 400 });
            const balance = await prisma.balanceImportee.findUnique({
                where: { clientId_periode: { clientId, periode: p } },
                include: { importedBy: { select: { firstName: true, lastName: true } } },
            });
            if (!balance) return NextResponse.json({ balance: null });
            return NextResponse.json({ balance });
        }
        const balances = await prisma.balanceImportee.findMany({
            where: { clientId },
            orderBy: { periode: "desc" },
            select: { id: true, periode: true, fichier: true, nbLignes: true, totalDebit: true, totalCredit: true, equilibree: true, createdAt: true, importedBy: { select: { firstName: true, lastName: true } } },
        });
        return NextResponse.json({ balances });
    } catch (error) {
        console.error("Erreur GET comptabilite/balance:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;
    try {
        const body = await request.json().catch(() => ({}));
        const clientId = typeof body.clientId === "string" ? body.clientId : "";
        if (clientId.length !== 24) return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        const periode = normaliserPeriode(body.periode);
        if (!periode) return NextResponse.json({ error: "Période de clôture illisible (AAAA-MM attendu, ex. 2025-12)." }, { status: 400 });
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, companyName: true } });
        if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

        const analyse = analyserLignes(body.lignes);
        if (!analyse.ok) return NextResponse.json({ error: analyse.raison, rejets: analyse.rejets ?? [] }, { status: 400 });

        const totalDebit = analyse.lignes.reduce((s, l) => s + l.debit, 0);
        const totalCredit = analyse.lignes.reduce((s, l) => s + l.credit, 0);
        const equilibree = Math.abs(totalDebit - totalCredit) <= TOLERANCE;
        const fichier = typeof body.fichier === "string" ? body.fichier.slice(0, 200) : null;

        const balance = await prisma.balanceImportee.upsert({
            where: { clientId_periode: { clientId, periode } },
            create: {
                clientId, periode, fichier,
                lignes: analyse.lignes as unknown as object[],
                nbLignes: analyse.lignes.length, totalDebit, totalCredit, equilibree,
                importedById: session!.id,
            },
            update: {
                fichier,
                lignes: analyse.lignes as unknown as object[],
                nbLignes: analyse.lignes.length, totalDebit, totalCredit, equilibree,
                importedById: session!.id,
            },
            select: { id: true, periode: true, nbLignes: true, totalDebit: true, totalCredit: true, equilibree: true, createdAt: true, updatedAt: true },
        });
        await AuditService.log({
            action: "IMPORT",
            entity: "BALANCE",
            entityId: balance.id,
            details: `Balance ${periode} importée pour ${client.companyName ?? clientId} : ${balance.nbLignes} comptes, débit ${Math.round(totalDebit)} / crédit ${Math.round(totalCredit)}${equilibree ? "" : " — DÉSÉQUILIBRÉE"}`,
        });
        return NextResponse.json({
            balance,
            ecart: Math.round((totalDebit - totalCredit) * 100) / 100,
            avertissements: equilibree ? [] : [`La balance n'est pas équilibrée : écart de ${Math.round(totalDebit - totalCredit).toLocaleString("fr-FR")} FCFA entre débit et crédit.`],
        }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST comptabilite/balance:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId") ?? "";
        const periode = normaliserPeriode(searchParams.get("periode"));
        if (clientId.length !== 24 || !periode) return NextResponse.json({ error: "clientId et periode requis." }, { status: 400 });
        const result = await prisma.balanceImportee.deleteMany({ where: { clientId, periode } });
        if (result.count === 0) return NextResponse.json({ error: "Aucune balance pour cette période." }, { status: 404 });
        await AuditService.log({ action: "DELETE", entity: "BALANCE", entityId: clientId, details: `Balance ${periode} supprimée` });
        return NextResponse.json({ supprimee: true });
    } catch (error) {
        console.error("Erreur DELETE comptabilite/balance:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
