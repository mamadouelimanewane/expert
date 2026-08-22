// ─────────────────────────────────────────────────────────────────────────────
// Méthodes de valorisation d'entreprise.
//
// Corrections par rapport à la version précédente :
//
//  1. DIVISION PAR ZÉRO — la valeur terminale de Gordon-Shapiro s'écrit
//     CF × (1+g) / (k - g). Lorsque le taux d'actualisation k était inférieur
//     ou égal à la croissance perpétuelle g, le dénominateur devenait nul ou
//     négatif : la fonction renvoyait Infinity ou une valeur d'entreprise
//     négative, sans le signaler. Le cas est désormais rejeté explicitement.
//  2. MARGE DE FLUX DE TRÉSORERIE EN DUR — le flux initial était figé à 15 % du
//     chiffre d'affaires ("for demo"). C'est un paramètre de la mission, pas
//     une constante du logiciel.
//  3. Croissance perpétuelle figée à 2 % : elle est désormais paramétrable.
// ─────────────────────────────────────────────────────────────────────────────

export class ValorisationError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "ValorisationError";
        this.code = code;
    }
}

export interface ParametresDCF {
    /** Marge de flux de trésorerie disponible, en % du chiffre d'affaires. */
    margeFluxTresorerie?: number;
    /** Croissance perpétuelle retenue au-delà de l'horizon explicite, en %. */
    croissancePerpetuelle?: number;
}

export interface ResultatDCF {
    /** Flux actualisés de l'horizon explicite. */
    values: number[];
    /** Valeur terminale actualisée. */
    terminalValue: number;
    /** Valeur terminale avant actualisation. */
    terminalValueBrute: number;
    /** Somme des flux actualisés de l'horizon explicite. */
    valeurActuelleFlux: number;
    enterpriseValue: number;
    /** Part de la valeur d'entreprise portée par la valeur terminale, en %. */
    poidsValeurTerminale: number;
    avertissements: string[];
}

/** Marge de flux de trésorerie retenue par défaut, faute de paramétrage. */
export const MARGE_FCF_PAR_DEFAUT = 15;
/** Croissance perpétuelle retenue par défaut. */
export const CROISSANCE_PERPETUELLE_PAR_DEFAUT = 2;

/**
 * Valorisation par actualisation des flux de trésorerie disponibles.
 *
 * @param ca                  chiffre d'affaires de départ
 * @param tauxCroissance      croissance annuelle des flux sur l'horizon, en %
 * @param tauxActualisation   coût moyen pondéré du capital, en %
 * @param annees              horizon explicite, en années
 *
 * @throws {ValorisationError} si les paramètres rendent le modèle non calculable.
 */
export function calculateDCF(
    ca: number,
    tauxCroissance: number,
    tauxActualisation: number,
    annees: number,
    parametres: ParametresDCF = {}
): ResultatDCF {
    const margeFcf = parametres.margeFluxTresorerie ?? MARGE_FCF_PAR_DEFAUT;
    const croissancePerpetuelle =
        parametres.croissancePerpetuelle ?? CROISSANCE_PERPETUELLE_PAR_DEFAUT;

    const avertissements: string[] = [];

    if (!Number.isFinite(ca) || ca < 0) {
        throw new ValorisationError("CA_INVALIDE", "Le chiffre d'affaires doit être un nombre positif.");
    }
    if (!Number.isInteger(annees) || annees < 1) {
        throw new ValorisationError(
            "HORIZON_INVALIDE",
            "L'horizon explicite doit être d'au moins une année entière."
        );
    }
    if (!Number.isFinite(tauxActualisation) || tauxActualisation <= 0) {
        throw new ValorisationError(
            "TAUX_ACTUALISATION_INVALIDE",
            "Le taux d'actualisation doit être strictement positif."
        );
    }

    const k = tauxActualisation / 100;
    const g = croissancePerpetuelle / 100;

    // Condition d'existence du modèle de Gordon-Shapiro.
    if (k <= g) {
        throw new ValorisationError(
            "GORDON_NON_APPLICABLE",
            `Le modèle de Gordon-Shapiro exige un taux d'actualisation (${tauxActualisation} %) ` +
                `strictement supérieur à la croissance perpétuelle (${croissancePerpetuelle} %). ` +
                `Réduisez la croissance perpétuelle ou relevez le coût du capital.`
        );
    }

    if (tauxCroissance > tauxActualisation) {
        avertissements.push(
            "La croissance de l'horizon explicite dépasse le coût du capital : " +
                "la valorisation est très sensible à l'horizon retenu."
        );
    }

    // ── Flux actualisés de l'horizon explicite ──────────────────────────────
    const values: number[] = [];
    let fluxCourant = ca * (margeFcf / 100);
    let valeurActuelleFlux = 0;

    for (let i = 1; i <= annees; i++) {
        fluxCourant = fluxCourant * (1 + tauxCroissance / 100);
        const actualise = fluxCourant / Math.pow(1 + k, i);
        values.push(actualise);
        valeurActuelleFlux += actualise;
    }

    // ── Valeur terminale ────────────────────────────────────────────────────
    const terminalValueBrute = (fluxCourant * (1 + g)) / (k - g);
    const terminalValue = terminalValueBrute / Math.pow(1 + k, annees);

    const enterpriseValue = valeurActuelleFlux + terminalValue;
    const poidsValeurTerminale =
        enterpriseValue !== 0 ? (terminalValue / enterpriseValue) * 100 : 0;

    if (poidsValeurTerminale > 75) {
        avertissements.push(
            `La valeur terminale représente ${poidsValeurTerminale.toFixed(0)} % de la valeur ` +
                `d'entreprise : allongez l'horizon explicite pour fiabiliser l'évaluation.`
        );
    }

    return {
        values,
        terminalValue,
        terminalValueBrute,
        valeurActuelleFlux,
        enterpriseValue,
        poidsValeurTerminale,
        avertissements,
    };
}

/** Valorisation par multiple d'EBITDA. */
export function calculateEBITDAMultiple(ebitda: number, multiple: number): number {
    if (!Number.isFinite(ebitda) || !Number.isFinite(multiple)) {
        throw new ValorisationError("PARAMETRE_INVALIDE", "EBITDA et multiple doivent être numériques.");
    }
    if (multiple < 0) {
        throw new ValorisationError("MULTIPLE_INVALIDE", "Le multiple d'EBITDA ne peut pas être négatif.");
    }
    return ebitda * multiple;
}

/** Actif net réévalué : actif - dettes + ajustements de réévaluation. */
export function calculateANR(actif: number, dettes: number, ajustements: number): number {
    if (![actif, dettes, ajustements].every(Number.isFinite)) {
        throw new ValorisationError("PARAMETRE_INVALIDE", "Tous les paramètres doivent être numériques.");
    }
    return actif - dettes + ajustements;
}
