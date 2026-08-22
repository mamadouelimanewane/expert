import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { balanceDepuisJournal } from "@/lib/ohada/balance-from-journal";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";

// Compte de résultat SYSCOHADA révisé, produit par le moteur commun.
//
// Les soldes intermédiaires de gestion (marge commerciale, valeur ajoutée, EBE,
// résultat d'exploitation, financier, HAO, net) sont calculés en cascade sur la
// balance reconstituée à partir du journal, et non approximés ligne à ligne.

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
            resultat: etats.resultat,
            resultatNet: etats.resultatNet,
            controles: {
                balance: etats.controleBalance,
                comptesNonAffectes: etats.comptesNonAffectes,
                anomalies: etats.anomalies,
            },
            source: {
                ecrituresN: ecrituresN.length,
                ecrituresN1: ecrituresN1.length,
                periode,
                periodeN1,
            },
        });
    } catch (error) {
        console.error("Erreur API Resultat:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
