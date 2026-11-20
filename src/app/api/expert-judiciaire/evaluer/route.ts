import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
    calculerPrejudiceFinancier,
    evaluerCessationPaiements,
    qualifierInfractionsPenales,
    auditerContradictoire,
    genererReponseDireAvecIA,
    calculerEtatFraisExpertise,
    genererRapportExpertiseJudiciaire,
    type DossierExpertiseJudiciaire,
    type ParametresEvaluationPrejudice,
    type ParametresCessationPaiements,
    type ConstatInfractionPenale,
    type TypeMissionJudiciaire,
} from "@/lib/ohada/expertise-judiciaire";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { action, paramsPrejudice, paramsAUPCAP, constatsPenaux, dossier, typeMission, direTexte, argumentsExpert } = body;

        if (action === "CALCULER_PREJUDICE" && paramsPrejudice) {
            const prejudice = calculerPrejudiceFinancier(paramsPrejudice as ParametresEvaluationPrejudice);
            return NextResponse.json({ prejudice });
        }

        if (action === "EVALUER_AUPCAP" && paramsAUPCAP) {
            const analyseAUPCAP = evaluerCessationPaiements(paramsAUPCAP as ParametresCessationPaiements);
            return NextResponse.json({ analyseAUPCAP });
        }

        if (action === "QUALIFIER_INFRACTIONS_PENALES" && Array.isArray(constatsPenaux)) {
            const analysePenale = qualifierInfractionsPenales(constatsPenaux as ConstatInfractionPenale[]);
            return NextResponse.json({ analysePenale });
        }

        if (action === "AUDITER_CONTRADICTOIRE" && dossier) {
            const auditProcedural = auditerContradictoire(dossier as DossierExpertiseJudiciaire);
            return NextResponse.json({ auditProcedural });
        }

        if (action === "REPONDRE_DIRE_IA" && direTexte) {
            const reponseIA = await genererReponseDireAvecIA(
                (typeMission || "EVALUATION_PREJUDICE") as TypeMissionJudiciaire,
                direTexte,
                argumentsExpert || ""
            );
            return NextResponse.json({ reponseIA });
        }

        if (action === "GENERER_RAPPORT" && dossier) {
            const rapport = genererRapportExpertiseJudiciaire(dossier as DossierExpertiseJudiciaire);
            const frais = calculerEtatFraisExpertise(dossier as DossierExpertiseJudiciaire);
            const auditProcedural = auditerContradictoire(dossier as DossierExpertiseJudiciaire);
            return NextResponse.json({ rapport, frais, auditProcedural });
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
