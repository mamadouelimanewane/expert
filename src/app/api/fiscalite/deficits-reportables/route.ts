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
        const body: unknown = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
        }
        const input = body as Record<string, unknown>;
        const pays = input.pays;
        const exerciceCourant = input.exerciceCourant;
        const resultatFiscalBrut = input.resultatFiscalBrut;
        const historique = input.historique;
        const projectionsResultats = input.projectionsResultats;

        if (typeof pays !== "string" || !["sn", "ci", "cm", "bj"].includes(pays.toLowerCase())) {
            return NextResponse.json({ error: "Juridiction fiscale non prise en charge." }, { status: 400 });
        }
        if (typeof exerciceCourant !== "number" || !Number.isInteger(exerciceCourant)
            || exerciceCourant < 1900 || exerciceCourant > new Date().getFullYear()) {
            return NextResponse.json({ error: "L’exercice clos doit être une année valide qui n’est pas dans le futur." }, { status: 400 });
        }
        if (typeof resultatFiscalBrut !== "number" || !Number.isFinite(resultatFiscalBrut) || resultatFiscalBrut < 0) {
            return NextResponse.json({ error: "Le résultat fiscal brut doit être renseigné et supérieur ou égal à zéro." }, { status: 400 });
        }
        if (!Array.isArray(historique) || historique.length === 0 || historique.length > 50) {
            return NextResponse.json({ error: "Ajoutez entre 1 et 50 déficits réellement constatés." }, { status: 400 });
        }
        const historiquesValides = historique.every((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return false;
            const ligne = item as Record<string, unknown>;
            return typeof ligne.exercice === "number" && Number.isInteger(ligne.exercice)
                && ligne.exercice >= 1900 && ligne.exercice < exerciceCourant
                && typeof ligne.montant === "number" && Number.isFinite(ligne.montant) && ligne.montant > 0
                && typeof ligne.montantDejaImpute === "number" && Number.isFinite(ligne.montantDejaImpute)
                && ligne.montantDejaImpute >= 0 && ligne.montantDejaImpute <= ligne.montant
                && (ligne.type === "ORDINAIRE" || ligne.type === "AMORTISSEMENT_DIFFERE");
        });
        if (!historiquesValides) {
            return NextResponse.json({ error: "Chaque déficit doit comporter un exercice, un montant et une imputation antérieure valides." }, { status: 400 });
        }

        const bordereau = construireBordereauDeficits(pays.toLowerCase() as PaysFiscal, exerciceCourant, historique as Array<{ exercice: number; montant: number; type?: "ORDINAIRE" | "AMORTISSEMENT_DIFFERE"; montantDejaImpute?: number }>);
        const rapport = genererRapportDeficits(bordereau);

        let imputation = null;
        imputation = calculerImputationOptimale(bordereau, resultatFiscalBrut);

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
