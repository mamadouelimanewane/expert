import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
    construireBordereauDeficits,
    calculerImputationOptimale,
    projeterDeficits,
    genererRapportDeficits,
} from "@/lib/ohada/deficits-reportables";
import type { PaysFiscal } from "@/lib/tax-simulator";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { pays = "SN", exerciceCourant = 2024, historique = [], resultatFiscalBrut, projectionsResultats } = body;

        const bordereau = construireBordereauDeficits(pays as PaysFiscal, Number(exerciceCourant), historique);
        const rapport = genererRapportDeficits(bordereau);

        let imputation = null;
        if (typeof resultatFiscalBrut === "number") {
            imputation = calculerImputationOptimale(bordereau, resultatFiscalBrut);
        }

        let projections = null;
        if (Array.isArray(projectionsResultats) && projectionsResultats.length > 0) {
            projections = projeterDeficits(bordereau, projectionsResultats, Number(exerciceCourant));
        }

        return NextResponse.json({
            bordereau,
            imputation,
            projections,
            rapport,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
