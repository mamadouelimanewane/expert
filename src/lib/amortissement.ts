// ─────────────────────────────────────────────────────────────────────────────
// Plan d'amortissement des immobilisations (SYSCOHADA révisé).
//
// Le modèle FixedAsset suivait les immobilisations pour l'inventaire physique
// (présent / manquant / à vérifier) mais ne portait aucune donnée de
// dépréciation : ni durée d'utilité, ni méthode, ni valeur résiduelle. La
// valeur nette comptable ne pouvait donc pas être calculée, et l'écran de parc
// industriel affichait des VNC inscrites en dur.
//
// Deux méthodes sont implémentées :
//   • LINEAIRE — annuité constante sur la durée d'utilité, prorata temporis la
//     première année à partir de la date de mise en service ;
//   • DEGRESSIF — taux linéaire majoré d'un coefficient fonction de la durée,
//     avec bascule sur le linéaire dès que celui-ci devient plus favorable.
//
// La base amortissable est la valeur d'origine diminuée de la valeur
// résiduelle. L'amortissement s'arrête à cette valeur résiduelle : la VNC ne
// descend jamais en dessous.
// ─────────────────────────────────────────────────────────────────────────────

export type MethodeAmortissement = "LINEAIRE" | "DEGRESSIF" | "NON_AMORTISSABLE";

export type Immobilisation = {
    /** Valeur d'origine (coût d'acquisition). */
    valeurOrigine: number;
    /** Durée d'utilité en années. */
    dureeAnnees: number | null | undefined;
    methode: MethodeAmortissement;
    /** Valeur résiduelle en fin de plan. */
    valeurResiduelle?: number;
    /** Date de mise en service ; à défaut, date d'acquisition. */
    dateMiseEnService: Date;
};

export type LignePlan = {
    annee: number;
    /** Base restant à amortir en début d'exercice. */
    baseDebut: number;
    /** Dotation de l'exercice. */
    dotation: number;
    /** Cumul des amortissements à la clôture. */
    cumul: number;
    /** Valeur nette comptable à la clôture. */
    vnc: number;
};

export type PlanAmortissement = {
    lignes: LignePlan[];
    /** Base amortissable = valeur d'origine - valeur résiduelle. */
    baseAmortissable: number;
    anomalies: string[];
};

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Coefficient de dégressivité selon la durée d'utilité.
 * Barème usuel en zone OHADA, aligné sur la pratique fiscale française.
 */
export function coefficientDegressif(dureeAnnees: number): number {
    if (dureeAnnees <= 4) return 1.5;
    if (dureeAnnees <= 6) return 2;
    return 2.5;
}

/**
 * Fraction de la première année ouvrant droit à amortissement, en mois.
 * L'amortissement court à compter du mois de mise en service inclus.
 */
export function moisAmortissablesPremiereAnnee(dateMiseEnService: Date): number {
    return 12 - dateMiseEnService.getUTCMonth();
}

/**
 * Construit le plan d'amortissement complet.
 *
 * @param immo caractéristiques de l'immobilisation
 */
export function genererPlanAmortissement(immo: Immobilisation): PlanAmortissement {
    const anomalies: string[] = [];
    const valeurResiduelle = Math.max(0, immo.valeurResiduelle ?? 0);

    if (!Number.isFinite(immo.valeurOrigine) || immo.valeurOrigine < 0) {
        anomalies.push("Valeur d'origine invalide.");
        return { lignes: [], baseAmortissable: 0, anomalies };
    }

    if (valeurResiduelle > immo.valeurOrigine) {
        anomalies.push(
            "La valeur résiduelle dépasse la valeur d'origine : aucun amortissement n'est possible."
        );
        return { lignes: [], baseAmortissable: 0, anomalies };
    }

    const baseAmortissable = round2(immo.valeurOrigine - valeurResiduelle);

    if (immo.methode === "NON_AMORTISSABLE") {
        return { lignes: [], baseAmortissable: 0, anomalies };
    }

    const duree = immo.dureeAnnees;
    if (!duree || !Number.isFinite(duree) || duree <= 0) {
        anomalies.push(
            "Durée d'utilité non renseignée : le plan d'amortissement ne peut pas être établi."
        );
        return { lignes: [], baseAmortissable, anomalies };
    }

    if (baseAmortissable === 0) {
        return { lignes: [], baseAmortissable, anomalies };
    }

    const anneeDepart = immo.dateMiseEnService.getUTCFullYear();
    const moisPremiereAnnee = moisAmortissablesPremiereAnnee(immo.dateMiseEnService);

    const lignes: LignePlan[] = [];
    let restant = baseAmortissable;
    let cumul = 0;

    // Le plan s'étale sur `duree` exercices pleins, plus un exercice
    // supplémentaire lorsque la première année est incomplète.
    const nbExercices = moisPremiereAnnee === 12 ? duree : duree + 1;

    const tauxLineaire = 1 / duree;
    const tauxDegressif = tauxLineaire * coefficientDegressif(duree);

    for (let i = 0; i < nbExercices && restant > 0.005; i++) {
        const baseDebut = restant;
        const prorata = i === 0 ? moisPremiereAnnee / 12 : 1;

        let dotation: number;

        if (immo.methode === "DEGRESSIF") {
            const dotationDegressive = restant * tauxDegressif * prorata;

            // Bascule sur le linéaire dès qu'il devient plus avantageux : on
            // répartit le restant sur les exercices non encore courus.
            const exercicesRestants = Math.max(1, nbExercices - i);
            const dotationLineaire = restant / exercicesRestants;

            dotation = Math.max(dotationDegressive, dotationLineaire);
        } else {
            dotation = baseAmortissable * tauxLineaire * prorata;
        }

        // L'amortissement ne peut pas dépasser ce qui reste à amortir.
        dotation = Math.min(dotation, restant);

        cumul = round2(cumul + dotation);
        restant = round2(restant - dotation);

        lignes.push({
            annee: anneeDepart + i,
            baseDebut: round2(baseDebut),
            dotation: round2(dotation),
            cumul,
            vnc: round2(immo.valeurOrigine - cumul),
        });
    }

    return { lignes, baseAmortissable, anomalies };
}

/**
 * Valeur nette comptable à une date donnée, et dotation de l'exercice en cours.
 */
export function valeurNetteComptable(
    immo: Immobilisation,
    aLaDate: Date = new Date()
): { vnc: number; cumul: number; dotationExercice: number; anomalies: string[] } {
    const plan = genererPlanAmortissement(immo);
    const annee = aLaDate.getUTCFullYear();

    if (plan.lignes.length === 0) {
        return {
            vnc: round2(immo.valeurOrigine),
            cumul: 0,
            dotationExercice: 0,
            anomalies: plan.anomalies,
        };
    }

    // Dernière ligne dont l'exercice est clos ou en cours.
    const echues = plan.lignes.filter((l) => l.annee < annee);
    const enCours = plan.lignes.find((l) => l.annee === annee);

    const cumul = echues.length > 0 ? echues[echues.length - 1].cumul : 0;
    const derniere = plan.lignes[plan.lignes.length - 1];

    // Au-delà du plan, l'immobilisation est totalement amortie.
    if (annee > derniere.annee) {
        return {
            vnc: derniere.vnc,
            cumul: derniere.cumul,
            dotationExercice: 0,
            anomalies: plan.anomalies,
        };
    }

    return {
        vnc: round2(immo.valeurOrigine - cumul),
        cumul,
        dotationExercice: enCours?.dotation ?? 0,
        anomalies: plan.anomalies,
    };
}
