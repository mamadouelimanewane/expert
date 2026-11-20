import {
    calculateSenegalPayroll,
    type PayrollParams,
    type PayrollResult as PayrollResultSN,
} from "./senegal";
import { calculateCoteIvoirePayroll, type PayrollResultCI } from "./cote-ivoire";

export type { PayrollParams, PayrollDetail } from "./senegal";
export type { PayrollResultCI, PayrollDetailCI } from "./cote-ivoire";

export type PayrollRuleSource = { sujet: string; reference: string; applicableFrom: string; url: string };
export type PayrollRulesetInfo = {
    version: string;
    pays: PaysSupporte;
    statutValidation: "REVUE_EXPERT_REQUISE";
    sources: PayrollRuleSource[];
    avertissements: string[];
};

/**
 * Résultat d'un bulletin, quel que soit le pays : les agrégats sont communs
 * (brut, imposable, cotisations salariales, impôts, net, charges patronales,
 * avertissements) ; `detail` est propre à chaque législation.
 */
export type PayrollResult = PayrollResultSN | PayrollResultCI;

// ─────────────────────────────────────────────────────────────────────────────
// Routage du calcul de paie par pays.
//
// La version précédente retombait sur le barème SÉNÉGALAIS pour tout pays non
// implémenté, y compris le Cameroun ou le Bénin, et renvoyait le bulletin sans
// aucune mention. Un cabinet éditait donc des bulletins faux en croyant les
// avoir paramétrés. La Côte d'Ivoire était par ailleurs traitée par des taux
// forfaitaires ("IGR approx 5 %") sans rapport avec le barème réel.
//
// Politique retenue : ne calculer que ce qui est réellement implémenté, et
// échouer explicitement sinon. Un bulletin absent vaut mieux qu'un bulletin faux.
// ─────────────────────────────────────────────────────────────────────────────

/** Pays dont le barème est implémenté et couvert par des tests. */
export const PAYS_SUPPORTES = ["SN", "CI"] as const;

export type PaysSupporte = (typeof PAYS_SUPPORTES)[number];

/** Libellé de la législation appliquée, pour les bulletins et l'écran de paie. */
export const LEGISLATION_PAIE: Record<PaysSupporte, string> = {
    SN: "Sénégal — barème IR (CGI art. 173), TRIMF, IPRES, CSS, CFCE",
    CI: "Côte d'Ivoire — ITS unifié (réforme 2024), RICF, CNPS, CMU, FDFP",
};

/** Provenance métier affichée avec les simulations et bulletins. */
export const REGLES_PAIE: Record<PaysSupporte, PayrollRulesetInfo> = {
    SN: {
        version: "SN-CGI-2025 / SOCIAL-2026-01",
        pays: "SN",
        statutValidation: "REVUE_EXPERT_REQUISE",
        sources: [
            { sujet: "IR, art. 173", reference: "DGID — Code général des impôts et barème IR en vigueur", applicableFrom: "CGI édition 2025; date d'effet détaillée à confirmer", url: "https://www.dgid.sn/loi-reglement" },
            { sujet: "Cotisations sociales", reference: "CLEISS — cotisations au Sénégal", applicableFrom: "Mise à jour publiée au 01/01/2026", url: "https://www.cleiss.fr/docs/cotisations/senegal.html" },
        ],
        avertissements: ["Les règles sont versionnées et sourcées, mais leur validation par un professionnel local reste requise avant déclaration."],
    },
    CI: {
        version: "CI-ITS-2024 / CNPS-REFERENCES-2026",
        pays: "CI",
        statutValidation: "REVUE_EXPERT_REQUISE",
        sources: [
            { sujet: "ITS", reference: "Ordonnance n° 2023-719 — application annoncée au 01/01/2024 par le Trésor", applicableFrom: "2024-01-01", url: "https://www.tresor.gouv.ci/tres/traitements-salaires-pensions-et-rentes-viageres-voici-ce-qui-attend-travailleurs-et-retraites-a-partir-du-1er-janvier-2024/" },
            { sujet: "Cotisations sociales", reference: "CNPS — cotisations employeur", applicableFrom: "Page de référence consultée le 2026-11-18; date d'effet à confirmer", url: "https://www.cnps.ci/employeur/" },
        ],
        avertissements: ["Une divergence a été relevée entre le plafond retraite de la page CNPS consultée et la constante du moteur; faites confirmer le paramétrage avant toute déclaration."],
    },
};

export function obtenirReglesPaie(countryCode: string): PayrollRulesetInfo | null {
    const pays = normaliserPays(countryCode);
    return pays ? REGLES_PAIE[pays] : null;
}

/** Levée lorsqu'aucun moteur n'existe pour le pays demandé. */
export class PaysNonSupporteError extends Error {
    readonly code = "PAYS_NON_SUPPORTE";
    readonly pays: string;

    constructor(pays: string) {
        super(
            `Aucun moteur de paie n'est implémenté pour « ${pays} ». ` +
                `Pays disponibles : ${PAYS_SUPPORTES.join(", ")}. ` +
                `Le calcul est refusé plutôt que d'appliquer le barème d'un autre pays.`
        );
        this.name = "PaysNonSupporteError";
        this.pays = pays;
    }
}

const ALIAS: Record<string, PaysSupporte> = {
    SN: "SN",
    SEN: "SN",
    SENEGAL: "SN",
    "SÉNÉGAL": "SN",
    CI: "CI",
    CIV: "CI",
    "COTE D'IVOIRE": "CI",
    "CÔTE D'IVOIRE": "CI",
    "COTE D’IVOIRE": "CI",
    "CÔTE D’IVOIRE": "CI",
};

/** Normalise un code ou un nom de pays, ou `null` s'il n'est pas supporté. */
export function normaliserPays(countryCode: string): PaysSupporte | null {
    const cle = (countryCode ?? "").trim().toUpperCase();
    return ALIAS[cle] ?? null;
}

export function estPaysSupporte(countryCode: string): boolean {
    return normaliserPays(countryCode) !== null;
}

/**
 * Calcule un bulletin de paie pour le pays demandé.
 * @throws {PaysNonSupporteError} si aucun barème n'est implémenté pour ce pays.
 */
export function calculatePayroll(countryCode: string, params: PayrollParams): PayrollResult {
    const pays = normaliserPays(countryCode);

    if (pays === null) {
        throw new PaysNonSupporteError(countryCode);
    }

    switch (pays) {
        case "SN":
            return calculateSenegalPayroll(params);
        case "CI":
            return calculateCoteIvoirePayroll(params);
    }
}
