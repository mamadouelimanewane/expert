// ─────────────────────────────────────────────────────────────────────────────
// Simulation de l'imposition des bénéfices — zone OHADA / UEMOA.
//
// Corrections par rapport à la version précédente :
//
//  1. IMPÔT MINIMUM FORFAITAIRE ABSENT — tous ces pays imposent un minimum
//     assis sur le chiffre d'affaires, dû même en cas de déficit. Une
//     simulation qui l'ignore annonce zéro impôt à une entreprise déficitaire,
//     alors qu'elle en doit un.
//  2. `regime` ET `secteur` ÉTAIENT IGNORÉS — les deux paramètres étaient
//     acceptés puis jamais lus, ce qui laissait croire à un paramétrage.
//  3. CFCE MAL ASSISE — la CFCE est une contribution sénégalaise assise sur la
//     MASSE SALARIALE, pas sur le bénéfice imposable, et elle n'existe pas
//     ailleurs. Elle était appliquée à 3 % du bénéfice pour les quatre pays.
//  4. La TVA était additionnée aux charges fiscales. La TVA est neutre pour
//     l'entreprise : elle est collectée puis reversée, elle n'entre pas dans
//     le coût fiscal. Elle est désormais présentée à part, comme un flux.
// ─────────────────────────────────────────────────────────────────────────────

export type PaysFiscal = "sn" | "ci" | "cm" | "bj";
export type RegimeFiscal = "reel" | "simplifie";
export type SecteurActivite = "services" | "commerce" | "industrie";

export interface TaxSimulation {
    /** Résultat fiscal (bénéfice imposable). Peut être négatif. */
    baseImposable: number;
    pays: PaysFiscal;
    regime: RegimeFiscal;
    secteur: SecteurActivite;
    /** Chiffre d'affaires hors taxes — requis pour l'impôt minimum. */
    chiffreAffaires?: number;
    /** Masse salariale brute annuelle — assiette de la CFCE au Sénégal. */
    masseSalariale?: number;
}

export interface ResultatSimulation {
    /** Impôt sur les sociétés issu du barème. */
    is: number;
    /** Impôt minimum forfaitaire assis sur le chiffre d'affaires. */
    impotMinimum: number;
    /** Montant réellement dû : le plus élevé des deux. */
    isDu: number;
    /** `true` si c'est le minimum forfaitaire qui s'applique. */
    minimumApplique: boolean;
    /** Contribution forfaitaire à la charge de l'employeur (Sénégal). */
    cfce: number;
    /** Total des charges fiscales à la charge de l'entreprise. */
    total: number;
    /** TVA collectée estimée — flux neutre, hors coût fiscal. */
    tvaMoyenne: number;
    tauxIS: number;
    tauxTVA: number;
    hypotheses: string[];
    avertissements: string[];
}

interface RegleFiscale {
    libelle: string;
    /** Taux normal d'impôt sur les sociétés. */
    tauxIS: number;
    /** Taux réduit éventuel applicable au régime simplifié. */
    tauxISSimplifie?: number;
    /** Taux de TVA de droit commun. */
    tauxTVA: number;
    /** Impôt minimum : taux appliqué au chiffre d'affaires, plancher et plafond. */
    minimum: { taux: number; plancher: number; plafond?: number };
    /** Contribution assise sur la masse salariale (CFCE sénégalaise). */
    cfceSurMasseSalariale?: number;
}

/**
 * Paramètres par pays. Les taux sont ceux du droit commun et doivent être
 * revus à chaque loi de finances — d'où leur regroupement en un seul endroit.
 */
export const REGLES_FISCALES: Record<PaysFiscal, RegleFiscale> = {
    sn: {
        libelle: "Sénégal",
        tauxIS: 0.3,
        tauxTVA: 0.18,
        minimum: { taux: 0.005, plancher: 500_000, plafond: 5_000_000 },
        cfceSurMasseSalariale: 0.03,
    },
    ci: {
        libelle: "Côte d'Ivoire",
        tauxIS: 0.25,
        tauxTVA: 0.18,
        minimum: { taux: 0.005, plancher: 3_000_000, plafond: 35_000_000 },
    },
    cm: {
        libelle: "Cameroun",
        // 30 % majorés de 10 % de centimes additionnels communaux.
        tauxIS: 0.33,
        tauxISSimplifie: 0.33,
        tauxTVA: 0.1925,
        minimum: { taux: 0.022, plancher: 0 },
    },
    bj: {
        libelle: "Bénin",
        tauxIS: 0.3,
        tauxTVA: 0.18,
        minimum: { taux: 0.01, plancher: 250_000 },
    },
};

/**
 * Coefficient de marge retenu, par secteur, pour estimer le chiffre d'affaires
 * lorsqu'il n'est pas fourni. C'est une hypothèse grossière, signalée comme
 * telle dans `hypotheses` : renseigner `chiffreAffaires` reste préférable.
 */
const MARGE_PAR_SECTEUR: Record<SecteurActivite, number> = {
    services: 0.25,
    commerce: 0.08,
    industrie: 0.15,
};

export function simulateCorporateTax(params: TaxSimulation): ResultatSimulation {
    const regle = REGLES_FISCALES[params.pays];
    const hypotheses: string[] = [];
    const avertissements: string[] = [];

    if (!regle) {
        throw new Error(`Pays fiscal non pris en charge : ${params.pays}`);
    }

    const base = Number(params.baseImposable) || 0;

    // ── Chiffre d'affaires ──────────────────────────────────────────────────
    let chiffreAffaires = Number(params.chiffreAffaires) || 0;
    if (chiffreAffaires <= 0) {
        const marge = MARGE_PAR_SECTEUR[params.secteur] ?? MARGE_PAR_SECTEUR.services;
        chiffreAffaires = base > 0 ? base / marge : 0;
        hypotheses.push(
            `Chiffre d'affaires non renseigné : estimé à partir d'une marge de ` +
                `${(marge * 100).toFixed(0)} % pour le secteur « ${params.secteur} ». ` +
                `Renseignez-le pour fiabiliser l'impôt minimum.`
        );
    }

    // ── Impôt sur les sociétés ──────────────────────────────────────────────
    const tauxIS =
        params.regime === "simplifie" && regle.tauxISSimplifie !== undefined
            ? regle.tauxISSimplifie
            : regle.tauxIS;

    const is = Math.max(0, base) * tauxIS;

    // ── Impôt minimum forfaitaire ───────────────────────────────────────────
    // Dû même en l'absence de bénéfice : c'est précisément le cas que la
    // version précédente chiffrait à zéro.
    let impotMinimum = chiffreAffaires * regle.minimum.taux;
    impotMinimum = Math.max(impotMinimum, regle.minimum.plancher);
    if (regle.minimum.plafond !== undefined) {
        impotMinimum = Math.min(impotMinimum, regle.minimum.plafond);
    }

    const isDu = Math.max(is, impotMinimum);
    const minimumApplique = impotMinimum > is;

    if (base <= 0) {
        avertissements.push(
            `Résultat fiscal nul ou déficitaire : l'impôt minimum forfaitaire de ` +
                `${Math.round(impotMinimum).toLocaleString("fr-FR")} FCFA reste dû.`
        );
    } else if (minimumApplique) {
        avertissements.push(
            "L'impôt minimum forfaitaire dépasse l'impôt sur les sociétés : c'est lui qui s'applique."
        );
    }

    // ── CFCE (Sénégal uniquement, assise sur la masse salariale) ────────────
    let cfce = 0;
    if (regle.cfceSurMasseSalariale) {
        const masseSalariale = Number(params.masseSalariale) || 0;
        cfce = masseSalariale * regle.cfceSurMasseSalariale;
        if (masseSalariale <= 0) {
            hypotheses.push(
                "Masse salariale non renseignée : la CFCE (3 % de la masse salariale) est chiffrée à zéro."
            );
        }
    }

    // ── TVA : flux neutre, présenté séparément ──────────────────────────────
    const tvaMoyenne = chiffreAffaires * regle.tauxTVA;
    hypotheses.push(
        "La TVA est collectée puis reversée : elle n'entre pas dans le coût fiscal de l'entreprise."
    );

    return {
        is,
        impotMinimum,
        isDu,
        minimumApplique,
        cfce,
        total: isDu + cfce,
        tvaMoyenne,
        tauxIS,
        tauxTVA: regle.tauxTVA,
        hypotheses,
        avertissements,
    };
}
