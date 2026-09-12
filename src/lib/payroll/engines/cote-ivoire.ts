// ─────────────────────────────────────────────────────────────────────────────
// Moteur de paie — Côte d'Ivoire (réforme ITS en vigueur au 1er janvier 2024)
//
// Références :
//  - Ordonnance n° 2023-719 du 13 septembre 2023 (Loi de finances 2024) :
//    fusion de l'IS, de la CN et de l'IGR en un Impôt sur les Traitements et
//    Salaires (ITS) unique, barème progressif mensuel, suppression de
//    l'abattement forfaitaire de 20 %, réduction d'impôt pour charges de
//    famille (RICF) remplaçant le quotient familial.
//    https://tresor.gouv.ci/tres/traitements-salaires-pensions-et-rentes-viageres-voici-ce-qui-attend-travailleurs-et-retraites-a-partir-du-1er-janvier-2024/
//  - Barème, RICF, CNPS, FDFP : https://africapaierh.com/juridique/cotisations-sociales-et-impots-en-cote-divoire/
//    et https://macalculatriceenligne.com/afrique/calcul-ir-cote-ivoire/
//    (concordants entre eux sur toutes les valeurs utilisées ici).
//  - Code de prévoyance sociale (CNPS) : retraite 14 % (6,3 % salarié,
//    7,7 % employeur) plafonnée à 45 × SMIG ; prestations familiales,
//    maternité et accidents du travail plafonnés à 70 000 F.
//
// Comme pour le Sénégal, la version précédente de l'application appliquait
// des taux forfaitaires (« IGR approx 5 % ») : le calcul était refusé depuis.
// Ce moteur applique le barème réel ; chaque paramètre est nommé et testé,
// de sorte qu'une mise à jour de loi de finances se limite aux constantes
// ci-dessous. Les montants s'entendent par mois, l'ITS étant mensuel.
// ─────────────────────────────────────────────────────────────────────────────

import type { PayrollParams } from "./senegal";

export interface PayrollDetailCI {
    /** Cotisation salariale CNPS retraite (6,3 %). */
    cnpsRetraite: number;
    /** Part salariale de la CMU (forfait). */
    cmuSalarial: number;
    /** Cotisations patronales. */
    cnpsRetraitePatronal: number;
    cnpsPrestationsFamiliales: number;
    cnpsMaternite: number;
    cnpsAccidentTravail: number;
    cmuPatronal: number;
    taxeApprentissage: number;
    formationProfessionnelle: number;
    /** Impôt. */
    parts: number;
    baseImposableMensuelle: number;
    itsAvantReduction: number;
    reductionChargesFamille: number;
    its: number;
    /** Rémunération brute des heures supplémentaires. */
    remunerationHeuresSup: number;
    /** Avantages en nature retenus dans l'assiette. */
    avantagesNature: number;
    /** Assiettes (pour les bordereaux de déclaration). */
    brutImposable: number;
    assietteRetraite: number;
    assiettePf: number;
}

export interface PayrollResultCI {
    grossSalary: number;
    taxableIncome: number;
    socialSecurity: number;
    taxes: number;
    netSalary: number;
    employerContributions: number;
    detail: PayrollDetailCI;
    avertissements: string[];
}

// ── Barèmes ─────────────────────────────────────────────────────────────────

/** SMIG mensuel (décret 2023, en vigueur depuis le 1er octobre 2023). */
export const SMIG_CI = 75_000;
/** Plafond mensuel de l'assiette CNPS retraite : 45 × SMIG. */
export const PLAFOND_CNPS_RETRAITE = 45 * SMIG_CI; // 3 375 000
/** Plafond mensuel des assiettes prestations familiales, maternité, AT. */
export const PLAFOND_CNPS_PF = 70_000;
/** Indemnité de transport exonérée d'ITS et de cotisations, par mois. */
export const TRANSPORT_EXONERE_CI = 30_000;
/** CMU : cotisation mensuelle forfaitaire de 1 000 F par salarié, partagée. */
export const CMU_SALARIAL = 500;
export const CMU_PATRONAL = 500;
/** Durée légale mensuelle du travail (40 h / semaine). */
const HEURES_MENSUELLES = 173.33;

export const TAUX_CI = {
    cnpsRetraiteSalarial: 0.063,
    cnpsRetraitePatronal: 0.077,
    cnpsPrestationsFamiliales: 0.05,
    cnpsMaternite: 0.0075,
    /** Taxe d'apprentissage (FDFP). */
    taxeApprentissage: 0.004,
    /** Taxe de formation professionnelle continue (FDFP), part totale. */
    formationProfessionnelle: 0.012,
} as const;

/** Barème progressif MENSUEL de l'ITS (réforme 2024). */
export const BAREME_ITS_MENSUEL: { plafond: number; taux: number }[] = [
    { plafond: 75_000, taux: 0 },
    { plafond: 240_000, taux: 0.16 },
    { plafond: 800_000, taux: 0.21 },
    { plafond: 2_400_000, taux: 0.24 },
    { plafond: 8_000_000, taux: 0.28 },
    { plafond: Infinity, taux: 0.32 },
];

/** Réduction d'impôt pour charges de famille : par demi-part au-delà de la première part. */
export const RICF_PAR_DEMI_PART = 5_500;
export const PARTS_MAX_CI = 5;

// ── Calculs élémentaires ────────────────────────────────────────────────────

/** Applique le barème progressif mensuel à une base imposable mensuelle. */
export function calculerItsBrutMensuel(baseMensuelle: number): number {
    if (baseMensuelle <= 0) return 0;

    let impot = 0;
    let plancher = 0;

    for (const tranche of BAREME_ITS_MENSUEL) {
        if (baseMensuelle <= plancher) break;
        const assiette = Math.min(baseMensuelle, tranche.plafond) - plancher;
        impot += assiette * tranche.taux;
        plancher = tranche.plafond;
    }

    return impot;
}

/**
 * Nombre de parts : 1 pour un célibataire, 2 pour une personne mariée,
 * plus 0,5 par enfant à charge, plafonné à 5 parts.
 */
export function calculerPartsCI(maritalStatus: string, childrenCount: number): number {
    const base = maritalStatus?.toUpperCase() === "MARIE" ? 2 : 1;
    const enfants = Math.max(0, Math.floor(childrenCount || 0)) * 0.5;
    return Math.min(PARTS_MAX_CI, base + enfants);
}

/**
 * RICF mensuelle : 5 500 F par demi-part au-delà de la première part
 * (1 part → 0 ; 2 parts → 11 000 ; 5 parts → 44 000), sans pouvoir rendre
 * l'impôt négatif.
 */
export function calculerRicf(itsBrut: number, parts: number): number {
    const demiParts = Math.max(0, Math.round((parts - 1) * 2));
    return Math.min(demiParts * RICF_PAR_DEMI_PART, itsBrut);
}

/**
 * Heures supplémentaires (Code du travail ivoirien, décret 96-203) :
 * +15 % de la 41e à la 46e heure hebdomadaire (≈ 26 h par mois), +50 %
 * au-delà, +75 % de nuit ou un jour de repos, +100 % de nuit un jour férié.
 */
export function calculerHeuresSupplementairesCI(
    tauxHoraire: number,
    heuresJour: number,
    heuresNuit = 0,
    heuresFeries = 0
): number {
    const SEUIL_15 = (6 * 52) / 12; // six heures par semaine, ramenées au mois

    const jour = Math.max(heuresJour, 0);
    const a15 = Math.min(jour, SEUIL_15);
    const a50 = Math.max(0, jour - SEUIL_15);

    return (
        a15 * tauxHoraire * 1.15 +
        a50 * tauxHoraire * 1.5 +
        Math.max(0, heuresNuit) * tauxHoraire * 1.75 +
        Math.max(0, heuresFeries) * tauxHoraire * 2.0
    );
}

// ── Bulletin complet ────────────────────────────────────────────────────────

export function calculateCoteIvoirePayroll(params: PayrollParams): PayrollResultCI {
    const {
        baseSalary,
        absencesDays,
        overtimeHours,
        bonuses,
        transportAllowance,
        maritalStatus,
        childrenCount,
        overtimeNightHours = 0,
        overtimeHolidayHours = 0,
        accidentRate = 0.02,
        benefitsInKind = 0,
    } = params;

    const avertissements: string[] = [];

    if (baseSalary < 0) avertissements.push("Salaire de base négatif.");
    if (baseSalary > 0 && baseSalary < SMIG_CI) {
        avertissements.push(`Salaire de base inférieur au SMIG ivoirien (${SMIG_CI.toLocaleString("fr-FR")} F).`);
    }
    if (absencesDays > 30) avertissements.push("Plus de 30 jours d'absence sur un mois.");
    if (accidentRate < 0.02 || accidentRate > 0.05) {
        avertissements.push("Taux accident du travail hors de la fourchette CNPS (2 % à 5 %).");
    }

    // ── 1. Salaire brut ─────────────────────────────────────────────────────
    const tauxJournalier = baseSalary / 30;
    const tauxHoraire = baseSalary / HEURES_MENSUELLES;

    const remunerationHeuresSup = calculerHeuresSupplementairesCI(
        tauxHoraire,
        overtimeHours,
        overtimeNightHours,
        overtimeHolidayHours
    );

    const avantagesNature = Math.max(0, benefitsInKind);
    const brutEspeces =
        baseSalary -
        Math.min(Math.max(absencesDays, 0), 30) * tauxJournalier +
        remunerationHeuresSup +
        bonuses +
        transportAllowance;
    // Brut total : espèces + avantages en nature (imposables et cotisables
    // à leur valeur réelle ou au barème administratif, non versés).
    const grossSalary = brutEspeces + avantagesNature;

    // ── 2. Assiettes ────────────────────────────────────────────────────────
    // L'indemnité de transport est exonérée jusqu'à 30 000 F ; l'excédent est
    // réintégré. La même assiette sert aux cotisations et à l'ITS, la réforme
    // 2024 ayant supprimé l'abattement de 20 % et l'ITS s'appliquant au brut
    // imposable sans déduction des cotisations salariales.
    const transportSoumis = Math.max(0, transportAllowance - TRANSPORT_EXONERE_CI);
    const brutImposable = Math.max(0, grossSalary - transportAllowance + transportSoumis);

    const assietteRetraite = Math.min(brutImposable, PLAFOND_CNPS_RETRAITE);
    const assiettePf = Math.min(brutImposable, PLAFOND_CNPS_PF);

    const cnpsRetraite = assietteRetraite * TAUX_CI.cnpsRetraiteSalarial;
    const cnpsRetraitePatronal = assietteRetraite * TAUX_CI.cnpsRetraitePatronal;
    const cnpsPrestationsFamiliales = assiettePf * TAUX_CI.cnpsPrestationsFamiliales;
    const cnpsMaternite = assiettePf * TAUX_CI.cnpsMaternite;
    const cnpsAccidentTravail = assiettePf * accidentRate;
    const taxeApprentissage = brutImposable * TAUX_CI.taxeApprentissage;
    const formationProfessionnelle = brutImposable * TAUX_CI.formationProfessionnelle;

    const cmuSalarial = brutImposable > 0 ? CMU_SALARIAL : 0;
    const cmuPatronal = brutImposable > 0 ? CMU_PATRONAL : 0;

    const totalSocialSalarial = cnpsRetraite + cmuSalarial;
    const totalSocialPatronal =
        cnpsRetraitePatronal +
        cnpsPrestationsFamiliales +
        cnpsMaternite +
        cnpsAccidentTravail +
        cmuPatronal +
        taxeApprentissage +
        formationProfessionnelle;

    // ── 3. Impôt sur les traitements et salaires ────────────────────────────
    const parts = calculerPartsCI(maritalStatus, childrenCount);
    const itsAvantReduction = calculerItsBrutMensuel(brutImposable);
    const reductionChargesFamille = calculerRicf(itsAvantReduction, parts);
    const its = itsAvantReduction - reductionChargesFamille;

    // ── 4. Net à payer ──────────────────────────────────────────────────────
    const netSalary = brutEspeces - totalSocialSalarial - its;

    if (baseSalary > 0 && grossSalary <= 0) {
        avertissements.push(
            "Brut nul alors qu'un salaire de base est renseigné : un bulletin à zéro ne doit pas " +
                "être émis sans vérification des absences."
        );
    }
    if (netSalary < 0) {
        avertissements.push(
            "Net à payer négatif : vérifiez les absences, les primes et le paramétrage des cotisations."
        );
    }
    if (netSalary > grossSalary) {
        avertissements.push("Net à payer supérieur au brut : paramétrage incohérent.");
    }

    const arrondi = (n: number) => Math.round(n);

    return {
        grossSalary: arrondi(grossSalary),
        taxableIncome: arrondi(brutImposable),
        socialSecurity: arrondi(totalSocialSalarial),
        taxes: arrondi(its),
        netSalary: arrondi(netSalary),
        employerContributions: arrondi(totalSocialPatronal),
        detail: {
            cnpsRetraite: arrondi(cnpsRetraite),
            cmuSalarial,
            cnpsRetraitePatronal: arrondi(cnpsRetraitePatronal),
            cnpsPrestationsFamiliales: arrondi(cnpsPrestationsFamiliales),
            cnpsMaternite: arrondi(cnpsMaternite),
            cnpsAccidentTravail: arrondi(cnpsAccidentTravail),
            cmuPatronal,
            taxeApprentissage: arrondi(taxeApprentissage),
            formationProfessionnelle: arrondi(formationProfessionnelle),
            parts,
            baseImposableMensuelle: arrondi(brutImposable),
            itsAvantReduction: arrondi(itsAvantReduction),
            reductionChargesFamille: arrondi(reductionChargesFamille),
            its: arrondi(its),
            remunerationHeuresSup: arrondi(remunerationHeuresSup),
            avantagesNature: arrondi(avantagesNature),
            brutImposable: arrondi(brutImposable),
            assietteRetraite: arrondi(assietteRetraite),
            assiettePf: arrondi(assiettePf),
        },
        avertissements,
    };
}
