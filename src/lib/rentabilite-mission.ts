// ─────────────────────────────────────────────────────────────────────────────
// Rentabilité de mission — boni / mali.
//
// Le boni (ou mali) est l'écart entre le budget d'honoraires facturé au client
// et le coût interne réel de la mission : temps passé par chaque collaborateur,
// valorisé à son coût horaire. Un boni signifie que la mission a coûté moins
// cher au cabinet que ce qu'elle a rapporté ; un mali, l'inverse.
//
// Le coût horaire interne (`User.costRate`) est un paramétrage propre à chaque
// cabinet, absent tant qu'il n'a pas été renseigné. Une mission dont un seul
// contributeur n'a pas de coût horaire paramétré n'a PAS un coût interne nul :
// il est INDÉTERMINÉ, et ce module le signale plutôt que de l'ignorer.
// ─────────────────────────────────────────────────────────────────────────────

export type Intervenant = {
    userId: string;
    heures: number;
    /** Coût horaire interne, en FCFA. `null`/`undefined` si non paramétré. */
    coutHoraire: number | null | undefined;
};

export type Mission = {
    id: string;
    /** Budget d'honoraires : prix forfaitaire, ou taux horaire × heures budgétées. */
    budgetHonoraires: number;
    budgetHeures: number;
    intervenants: Intervenant[];
};

export type StatutBoniMali = "BONI" | "MALI" | "EQUILIBRE" | "INDETERMINE";

export type AnalyseRentabilite = {
    missionId: string;
    budgetHonoraires: number;
    budgetHeures: number;
    heuresPassees: number;
    /** Coût interne total. `null` si un intervenant au moins n'a pas de coût horaire paramétré. */
    coutInterne: number | null;
    /** boni/mali = budgetHonoraires - coûtInterne. `null` si le coût interne est indéterminé. */
    boniMali: number | null;
    tauxBoniMali: number | null;
    statut: StatutBoniMali;
    /** Écart d'heures : positif si le budget est dépassé. */
    ecartHeures: number;
    tauxConsommationHeures: number | null;
    /** Nombre d'intervenants sans coût horaire paramétré. */
    intervenantsNonParametres: number;
    avertissements: string[];
};

/** Tolérance en deçà de laquelle le résultat est considéré à l'équilibre. */
const TOLERANCE_EQUILIBRE_PCT = 2;

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function analyserRentabilite(mission: Mission): AnalyseRentabilite {
    const avertissements: string[] = [];
    const intervenants = mission.intervenants ?? [];

    const heuresPassees = round2(intervenants.reduce((s, i) => s + i.heures, 0));
    const ecartHeures = round2(heuresPassees - mission.budgetHeures);
    const tauxConsommationHeures =
        mission.budgetHeures > 0 ? round2((heuresPassees / mission.budgetHeures) * 100) : null;

    const sansCout = intervenants.filter((i) => i.coutHoraire == null && i.heures > 0);

    let coutInterne: number | null = null;
    let boniMali: number | null = null;
    let tauxBoniMali: number | null = null;
    let statut: StatutBoniMali = "INDETERMINE";

    if (sansCout.length > 0) {
        avertissements.push(
            `${sansCout.length} intervenant(s) sans coût horaire interne paramétré : ` +
                `le coût réel de la mission est sous-estimé tant qu'il n'est pas renseigné.`
        );
    } else if (intervenants.length === 0) {
        avertissements.push("Aucun temps saisi sur cette mission : le boni/mali ne peut pas être établi.");
    } else {
        coutInterne = round2(
            intervenants.reduce((s, i) => s + i.heures * (i.coutHoraire ?? 0), 0)
        );
        boniMali = round2(mission.budgetHonoraires - coutInterne);
        tauxBoniMali =
            mission.budgetHonoraires > 0
                ? round2((boniMali / mission.budgetHonoraires) * 100)
                : null;

        if (tauxBoniMali === null) {
            statut = "INDETERMINE";
            avertissements.push("Budget d'honoraires non renseigné : le taux de boni/mali ne peut pas être calculé.");
        } else if (Math.abs(tauxBoniMali) <= TOLERANCE_EQUILIBRE_PCT) {
            statut = "EQUILIBRE";
        } else if (boniMali > 0) {
            statut = "BONI";
        } else {
            statut = "MALI";
        }
    }

    if (ecartHeures > 0 && mission.budgetHeures > 0) {
        avertissements.push(
            `Budget temps dépassé de ${ecartHeures} h (${tauxConsommationHeures}% consommés).`
        );
    }

    return {
        missionId: mission.id,
        budgetHonoraires: mission.budgetHonoraires,
        budgetHeures: mission.budgetHeures,
        heuresPassees,
        coutInterne,
        boniMali,
        tauxBoniMali,
        statut,
        ecartHeures,
        tauxConsommationHeures,
        intervenantsNonParametres: sansCout.length,
        avertissements,
    };
}

export type SyntheseRentabilite = {
    nbMissions: number;
    nbEvaluees: number;
    nbIndeterminees: number;
    nbBoni: number;
    nbMali: number;
    nbEquilibre: number;
    budgetHonorairesTotal: number;
    /** Somme des coûts internes, sur les seules missions évaluées. */
    coutInterneTotal: number;
    boniMaliTotal: number;
};

/** Agrège une liste d'analyses en synthèse de portefeuille. */
export function synthetiserRentabilite(analyses: AnalyseRentabilite[]): SyntheseRentabilite {
    const evaluees = analyses.filter((a) => a.boniMali !== null);

    return {
        nbMissions: analyses.length,
        nbEvaluees: evaluees.length,
        nbIndeterminees: analyses.length - evaluees.length,
        nbBoni: analyses.filter((a) => a.statut === "BONI").length,
        nbMali: analyses.filter((a) => a.statut === "MALI").length,
        nbEquilibre: analyses.filter((a) => a.statut === "EQUILIBRE").length,
        budgetHonorairesTotal: round2(analyses.reduce((s, a) => s + a.budgetHonoraires, 0)),
        coutInterneTotal: round2(evaluees.reduce((s, a) => s + (a.coutInterne ?? 0), 0)),
        boniMaliTotal: round2(evaluees.reduce((s, a) => s + (a.boniMali ?? 0), 0)),
    };
}
