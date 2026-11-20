import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
    calculerPrejudiceFinancier,
    calculerEtatFraisExpertise,
    genererRapportExpertiseJudiciaire,
    type DossierExpertiseJudiciaire,
    type ParametresEvaluationPrejudice,
} from "@/lib/ohada/expertise-judiciaire";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { action, paramsPrejudice, dossier } = body;

        if (action === "CALCULER_PREJUDICE" && paramsPrejudice) {
            const prejudice = calculerPrejudiceFinancier(paramsPrejudice as ParametresEvaluationPrejudice);
            return NextResponse.json({ prejudice });
        }

        if (action === "GENERER_RAPPORT" && dossier) {
            const rapport = genererRapportExpertiseJudiciaire(dossier as DossierExpertiseJudiciaire);
            const frais = calculerEtatFraisExpertise(dossier as DossierExpertiseJudiciaire);
            return NextResponse.json({ rapport, frais });
        }

        return NextResponse.json(
            { error: `Action invalide ou paramètres manquants: ${action}` },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
