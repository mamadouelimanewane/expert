import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
    initialiserDossierCAC,
    ajouterFeuilleTravail,
    evaluerCompletudeDossier,
    scellerDossierAudit,
} from "@/lib/ohada/audit-dossier-complet";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { action, entite, exercice, seuilSignification, dossier, sectionCode, feuille, signataire } = body;

        if (action === "INITIALISER") {
            const nouveau = initialiserDossierCAC(entite, Number(exercice), Number(seuilSignification));
            const bilan = evaluerCompletudeDossier(nouveau);
            return NextResponse.json({ dossier: nouveau, bilan });
        }

        if (action === "AJOUTER_FEUILLE" && dossier && sectionCode && feuille) {
            const maj = ajouterFeuilleTravail(dossier, sectionCode, feuille);
            const bilan = evaluerCompletudeDossier(maj);
            return NextResponse.json({ dossier: maj, bilan });
        }

        if (action === "SCELLER" && dossier && signataire) {
            const scelle = scellerDossierAudit(dossier, signataire);
            return NextResponse.json({ scelle });
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
