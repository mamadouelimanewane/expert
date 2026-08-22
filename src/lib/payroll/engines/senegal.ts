// ─────────────────────────────────────────────────────────────────────────────
// Moteur de paie — Sénégal
//
// Références : Code Général des Impôts sénégalais (art. 173 barème IR, art. 174
// réduction pour charge de famille, art. 187 TRIMF), Code du travail (majorations
// pour heures supplémentaires), barèmes IPRES / CSS / CFCE.
//
// Trois corrections de fond par rapport à la version précédente, chacune
// couverte par un test :
//
//  1. L'IR était calculé à la française (base ÷ parts, barème, × parts). Le
//     Sénégal applique le barème sur la base ENTIÈRE puis une réduction pour
//     charge de famille encadrée par un plancher et un plafond (art. 174).
//  2. Le TRIMF est un impôt ANNUEL. Les montants du barème étaient prélevés
//     chaque mois, soit douze fois le montant dû.
//  3. Le barème s'arrêtait à 37 % : la tranche supérieure à 40 % manquait.
//
// Tous les barèmes sont annuels ; le calcul mensuel annualise la base puis
// divise le résultat par douze, comme le fait la retenue à la source.
// ─────────────────────────────────────────────────────────────────────────────

export interface PayrollParams {
    baseSalary: number;
    absencesDays: number;
    /** Heures supplémentaires de jour, semaine ouvrable. */
    overtimeHours: number;
    bonuses: number;
    transportAllowance: number;
    /** "MARIE" ouvre droit à 1,5 part ; toute autre valeur vaut 1 part. */
    maritalStatus: string;
    childrenCount: number;
    /** Un cadre cotise en plus au régime complémentaire IPRES. */
    isCadre: boolean;

    // ── Champs facultatifs ──────────────────────────────────────────────────
    /** Heures majorées à 60 % : nuit en semaine, ou jour de repos/férié de jour. */
    overtimeNightHours?: number;
    /** Heures majorées à 100 % : nuit un jour de repos ou férié. */
    overtimeHolidayHours?: number;
    /**
     * Taux de cotisation accident du travail à la charge de l'employeur, selon
     * la classe de risque de l'entreprise : 1 %, 3 % ou 5 %. Défaut : 1 %.
     */
    accidentRate?: number;
}

export interface PayrollDetail {
    /** Cotisations salariales. */
    ipresRegimeGeneral: number;
    ipresRegimeComplementaire: number;
    /** Cotisations patronales. */
    ipresRegimeGeneralPatronal: number;
    ipresRegimeComplementairePatronal: number;
    cssPrestationsFamiliales: number;
    cssAccidentTravail: number;
    cfce: number;
    /** Impôt. */
    parts: number;
    baseImposableAnnuelle: number;
    irAvantReduction: number;
    reductionChargeFamille: number;
    impotRevenu: number;
    trimf: number;
    /** Abattement forfaitaire de 30 %, plafonné. */
    abattement: number;
    /** Rémunération brute des heures supplémentaires. */
    remunerationHeuresSup: number;
}

export interface PayrollResult {
    grossSalary: number;
    taxableIncome: number;
    socialSecurity: number;
    taxes: number;
    netSalary: number;
    employerContributions: number;
    detail: PayrollDetail;
    /** Anomalies à examiner avant émission du bulletin. */
    avertissements: string[];
}

// ── Barèmes ─────────────────────────────────────────────────────────────────

/** Plafond mensuel de l'assiette IPRES régime général. */
const PLAFOND_IPRES_RG = 360_000;
/** Plafond mensuel de l'assiette IPRES régime complémentaire (cadres). */
const PLAFOND_IPRES_RC = 1_080_000;
/** Plafond mensuel de l'assiette CSS (prestations familiales, accident travail). */
const PLAFOND_CSS = 63_000;
/** Indemnité de transport exonérée d'impôt et de cotisations, par mois. */
export const TRANSPORT_EXONERE = 20_800;
/** Durée légale mensuelle du travail. */
const HEURES_MENSUELLES = 173.33;

const TAUX = {
    ipresRgSalarial: 0.056,
    ipresRgPatronal: 0.084,
    ipresRcSalarial: 0.024,
    ipresRcPatronal: 0.036,
    cssPrestationsFamiliales: 0.07,
    cfce: 0.03,
} as const;

/** Barème progressif annuel de l'impôt sur le revenu (CGI art. 173). */
const BAREME_IR_ANNUEL: { plafond: number; taux: number }[] = [
    { plafond: 630_000, taux: 0 },
    { plafond: 1_500_000, taux: 0.20 },
    { plafond: 4_000_000, taux: 0.30 },
    { plafond: 8_000_000, taux: 0.35 },
    { plafond: 13_500_000, taux: 0.37 },
    { plafond: Infinity, taux: 0.40 },
];

/** Réduction pour charge de famille (CGI art. 174), montants annuels. */
const REDUCTION_CHARGE_FAMILLE: Record<string, { taux: number; min: number; max: number }> = {
    "1": { taux: 0, min: 0, max: 0 },
    "1.5": { taux: 0.10, min: 100_000, max: 300_000 },
    "2": { taux: 0.15, min: 200_000, max: 650_000 },
    "2.5": { taux: 0.20, min: 300_000, max: 1_100_000 },
    "3": { taux: 0.25, min: 400_000, max: 1_650_000 },
    "3.5": { taux: 0.30, min: 500_000, max: 2_030_000 },
    "4": { taux: 0.35, min: 600_000, max: 2_490_000 },
    "4.5": { taux: 0.40, min: 700_000, max: 2_755_000 },
    "5": { taux: 0.45, min: 800_000, max: 3_180_000 },
};

/** Barème annuel de la TRIMF (CGI art. 187). */
const BAREME_TRIMF_ANNUEL: { plafond: number; montant: number }[] = [
    { plafond: 600_000, montant: 900 },
    { plafond: 1_000_000, montant: 3_600 },
    { plafond: 2_000_000, montant: 4_800 },
    { plafond: 7_000_000, montant: 12_000 },
    { plafond: 12_000_000, montant: 18_000 },
    { plafond: Infinity, montant: 36_000 },
];

// ── Calculs élémentaires ────────────────────────────────────────────────────

/** Applique le barème progressif annuel à une base imposable annuelle. */
export function calculerIrBrutAnnuel(baseAnnuelle: number): number {
    if (baseAnnuelle <= 0) return 0;

    let impot = 0;
    let plancher = 0;

    for (const tranche of BAREME_IR_ANNUEL) {
        if (baseAnnuelle <= plancher) break;
        const assiette = Math.min(baseAnnuelle, tranche.plafond) - plancher;
        impot += assiette * tranche.taux;
        plancher = tranche.plafond;
    }

    return impot;
}

/**
 * Nombre de parts : 1 pour un célibataire, 1,5 pour une personne mariée,
 * plus 0,5 par enfant à charge, plafonné à 5 parts.
 */
export function calculerParts(maritalStatus: string, childrenCount: number): number {
    const base = maritalStatus?.toUpperCase() === "MARIE" ? 1.5 : 1;
    const enfants = Math.max(0, Math.floor(childrenCount || 0)) * 0.5;
    return Math.min(5, base + enfants);
}

/**
 * Réduction annuelle pour charge de famille : un pourcentage de l'impôt brut,
 * encadré par un plancher et un plafond propres au nombre de parts.
 */
export function calculerReductionChargeFamille(irBrutAnnuel: number, parts: number): number {
    const bareme = REDUCTION_CHARGE_FAMILLE[String(parts)];
    if (!bareme || bareme.taux === 0) return 0;

    const brute = irBrutAnnuel * bareme.taux;
    const encadree = Math.min(Math.max(brute, bareme.min), bareme.max);

    // La réduction ne peut pas rendre l'impôt négatif.
    return Math.min(encadree, irBrutAnnuel);
}

/** TRIMF mensuel, déduit du barème annuel. */
export function calculerTrimfMensuel(baseAnnuelle: number): number {
    if (baseAnnuelle <= 0) return 0;
    const tranche =
        BAREME_TRIMF_ANNUEL.find((t) => baseAnnuelle < t.plafond) ??
        BAREME_TRIMF_ANNUEL[BAREME_TRIMF_ANNUEL.length - 1];
    return tranche.montant / 12;
}

/**
 * Rémunération des heures supplémentaires selon le Code du travail :
 * +15 % pour les huit premières heures hebdomadaires (soit ~34,67 par mois),
 * +40 % au-delà, +60 % de nuit ou un jour de repos, +100 % de nuit un jour férié.
 */
export function calculerHeuresSupplementaires(
    tauxHoraire: number,
    heuresJour: number,
    heuresNuit = 0,
    heuresFeries = 0
): number {
    const SEUIL_15 = (8 * 52) / 12; // huit heures par semaine, ramenées au mois

    const jour = Math.max(heuresJour, 0);
    const a15 = Math.min(jour, SEUIL_15);
    const a40 = Math.max(0, jour - SEUIL_15);

    return (
        a15 * tauxHoraire * 1.15 +
        a40 * tauxHoraire * 1.4 +
        Math.max(0, heuresNuit) * tauxHoraire * 1.6 +
        Math.max(0, heuresFeries) * tauxHoraire * 2.0
    );
}

// ── Bulletin complet ────────────────────────────────────────────────────────

export function calculateSenegalPayroll(params: PayrollParams): PayrollResult {
    const {
        baseSalary,
        absencesDays,
        overtimeHours,
        bonuses,
        transportAllowance,
        maritalStatus,
        childrenCount,
        isCadre,
        overtimeNightHours = 0,
        overtimeHolidayHours = 0,
        accidentRate = 0.01,
    } = params;

    const avertissements: string[] = [];

    if (baseSalary < 0) avertissements.push("Salaire de base négatif.");
    if (absencesDays > 30) avertissements.push("Plus de 30 jours d'absence sur un mois.");

    // ── 1. Salaire brut ─────────────────────────────────────────────────────
    const tauxJournalier = baseSalary / 30;
    const tauxHoraire = baseSalary / HEURES_MENSUELLES;

    const remunerationHeuresSup = calculerHeuresSupplementaires(
        tauxHoraire,
        overtimeHours,
        overtimeNightHours,
        overtimeHolidayHours
    );

    const grossSalary =
        baseSalary -
        Math.min(Math.max(absencesDays, 0), 30) * tauxJournalier +
        remunerationHeuresSup +
        bonuses +
        transportAllowance;

    // ── 2. Assiette sociale ─────────────────────────────────────────────────
    // L'indemnité de transport est exonérée jusqu'à 20 800 F ; l'excédent est
    // réintégré dans les assiettes sociale et fiscale.
    const transportSoumis = Math.max(0, transportAllowance - TRANSPORT_EXONERE);
    const brutSocial = grossSalary - transportAllowance + transportSoumis;

    const ipresRegimeGeneral = Math.min(brutSocial, PLAFOND_IPRES_RG) * TAUX.ipresRgSalarial;
    const ipresRegimeGeneralPatronal =
        Math.min(brutSocial, PLAFOND_IPRES_RG) * TAUX.ipresRgPatronal;

    const ipresRegimeComplementaire = isCadre
        ? Math.min(brutSocial, PLAFOND_IPRES_RC) * TAUX.ipresRcSalarial
        : 0;
    const ipresRegimeComplementairePatronal = isCadre
        ? Math.min(brutSocial, PLAFOND_IPRES_RC) * TAUX.ipresRcPatronal
        : 0;

    const assietteCss = Math.min(brutSocial, PLAFOND_CSS);
    const cssPrestationsFamiliales = assietteCss * TAUX.cssPrestationsFamiliales;
    const cssAccidentTravail = assietteCss * accidentRate;
    const cfce = brutSocial * TAUX.cfce;

    const totalSocialSalarial = ipresRegimeGeneral + ipresRegimeComplementaire;
    const totalSocialPatronal =
        ipresRegimeGeneralPatronal +
        ipresRegimeComplementairePatronal +
        cssPrestationsFamiliales +
        cssAccidentTravail +
        cfce;

    // ── 3. Assiette fiscale ─────────────────────────────────────────────────
    const brutFiscal = brutSocial - totalSocialSalarial;

    // Abattement forfaitaire de 30 %, plafonné à 900 000 F par an (75 000 par mois).
    const abattement = Math.min(Math.max(brutFiscal, 0) * 0.3, 75_000);
    const baseImposableMensuelle = Math.max(0, brutFiscal - abattement);
    const baseImposableAnnuelle = baseImposableMensuelle * 12;

    // ── 4. Impôt sur le revenu ──────────────────────────────────────────────
    const parts = calculerParts(maritalStatus, childrenCount);
    const irAvantReduction = calculerIrBrutAnnuel(baseImposableAnnuelle);
    const reductionChargeFamille = calculerReductionChargeFamille(irAvantReduction, parts);
    const impotRevenu = (irAvantReduction - reductionChargeFamille) / 12;

    const trimf = calculerTrimfMensuel(baseImposableAnnuelle);
    const totalTaxes = impotRevenu + trimf;

    // ── 5. Net à payer ──────────────────────────────────────────────────────
    const netSalary = grossSalary - totalSocialSalarial - totalTaxes;

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
        taxableIncome: arrondi(baseImposableMensuelle),
        socialSecurity: arrondi(totalSocialSalarial),
        taxes: arrondi(totalTaxes),
        netSalary: arrondi(netSalary),
        employerContributions: arrondi(totalSocialPatronal),
        detail: {
            ipresRegimeGeneral: arrondi(ipresRegimeGeneral),
            ipresRegimeComplementaire: arrondi(ipresRegimeComplementaire),
            ipresRegimeGeneralPatronal: arrondi(ipresRegimeGeneralPatronal),
            ipresRegimeComplementairePatronal: arrondi(ipresRegimeComplementairePatronal),
            cssPrestationsFamiliales: arrondi(cssPrestationsFamiliales),
            cssAccidentTravail: arrondi(cssAccidentTravail),
            cfce: arrondi(cfce),
            parts,
            baseImposableAnnuelle: arrondi(baseImposableAnnuelle),
            irAvantReduction: arrondi(irAvantReduction),
            reductionChargeFamille: arrondi(reductionChargeFamille),
            impotRevenu: arrondi(impotRevenu),
            trimf: arrondi(trimf),
            abattement: arrondi(abattement),
            remunerationHeuresSup: arrondi(remunerationHeuresSup),
        },
        avertissements,
    };
}
