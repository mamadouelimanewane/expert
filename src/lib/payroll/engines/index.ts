import {
    calculateSenegalPayroll,
    type PayrollParams,
    type PayrollResult,
} from "./senegal";

export type { PayrollParams, PayrollResult, PayrollDetail } from "./senegal";

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
export const PAYS_SUPPORTES = ["SN"] as const;

export type PaysSupporte = (typeof PAYS_SUPPORTES)[number];

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
    }
}
