import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { balanceDepuisJournal } from "@/lib/ohada/balance-from-journal";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";
import { genererTFT } from "@/lib/ohada/tft-engine";

// Tableau des Flux de Trésorerie — méthode indirecte simplifiée (tft-engine.ts).
// Contrairement au bilan/résultat, la période N-1 est ici OBLIGATOIRE : sans
// elle, toutes les variations ne seraient que les soldes N eux-mêmes.

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

        if (!clientId || !periode || !periodeN1) {
            return NextResponse.json({ error: "clientId, periode et periodeN1 sont requis" }, { status: 400 });
        }

        const base = { clientId, status: "EXPORTED", source: { not: "WHATSAPP_TEST" } };

        const [ecrituresN, ecrituresN1] = await Promise.all([
            prisma.tpeJournal.findMany({ where: { ...base, periode }, select: SELECTION }),
            prisma.tpeJournal.findMany({ where: { ...base, periode: periodeN1 }, select: SELECTION }),
        ]);

        const statement = genererEtatsFinanciers(
            balanceDepuisJournal(ecrituresN),
            balanceDepuisJournal(ecrituresN1)
        );

        if (!statement.controleEquilibre.equilibre) {
            return NextResponse.json({
                error: "Le bilan de la période N n'est pas équilibré (actif ≠ passif) : corrigez-le avant de calculer le TFT.",
                anomalies: statement.anomalies,
            }, { status: 422 });
        }

        const tft = genererTFT(statement);

        return NextResponse.json({
            tft,
            source: { ecrituresN: ecrituresN.length, ecrituresN1: ecrituresN1.length, periode, periodeN1 },
            anomalies: statement.anomalies,
        });
    } catch (error) {
        console.error("Erreur API TFT:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
