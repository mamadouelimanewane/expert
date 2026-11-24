import type { DeclarationType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue générique indicatif des obligations fiscales et sociales — zone OHADA / UEMOA.
//
// Les règles versionnées validées par le cabinet le remplacent pour les codes
// concernés. Aucune échéance ne doit être présentée comme officielle ou
// adaptée à un dossier sans contrôle du texte, du pays et de l'assujettissement.
//
// Les volumes et montants proviennent des déclarations réellement saisies
// (voir /api/fiscalite/obligations), jamais de données de démonstration.
// ─────────────────────────────────────────────────────────────────────────────

export type CategorieObligation = "TVA" | "IS" | "SOCIAL" | "BIC" | "RAS";

export type ObligationFiscale = {
    id: string;
    titre: string;
    description: string;
    categorie: CategorieObligation;
    /** Pays où l'obligation existe, en code ISO à deux lettres. */
    pays: string[];
    /** Jour du mois de l'échéance. */
    jourEcheance: number;
    /** Périodicité : mensuelle, trimestrielle ou annuelle. */
    periodicite: "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE";
    /** Types de déclaration Prisma rattachés, pour l'agrégation. */
    typesDeclaration: DeclarationType[];
    /** Référence du texte applicable. */
    reference: string;
};

export const OBLIGATIONS_FISCALES: ObligationFiscale[] = [
    {
        id: "tva-mensuelle",
        titre: "Déclaration et paiement de la TVA",
        description:
            "Déclaration de la TVA collectée et de la TVA déductible du mois écoulé, accompagnée du paiement du solde dû.",
        categorie: "TVA",
        pays: ["SN", "CI", "CM", "BJ", "BF", "ML", "TG", "NE"],
        jourEcheance: 15,
        periodicite: "MENSUELLE",
        typesDeclaration: ["TVA"],
        reference: "CGI Sénégal art. 396 ; CGI Côte d'Ivoire art. 383",
    },
    {
        id: "ipres-css",
        titre: "Cotisations sociales IPRES et CSS",
        description:
            "Déclaration et paiement des cotisations de retraite (IPRES régime général et complémentaire) et de sécurité sociale (CSS).",
        categorie: "SOCIAL",
        pays: ["SN"],
        jourEcheance: 15,
        periodicite: "MENSUELLE",
        typesDeclaration: ["COTISATION_SOCIALE"],
        reference: "Code de la sécurité sociale du Sénégal",
    },
    {
        id: "cfce",
        titre: "Contribution forfaitaire à la charge de l'employeur",
        description:
            "3 % de la masse salariale brute, à la charge exclusive de l'employeur. Déclarée conjointement avec la paie.",
        categorie: "SOCIAL",
        pays: ["SN"],
        jourEcheance: 15,
        periodicite: "MENSUELLE",
        typesDeclaration: ["COTISATION_SOCIALE"],
        reference: "CGI Sénégal art. 197",
    },
    {
        id: "ras-bnc",
        titre: "Retenue à la source sur honoraires (BNC)",
        description:
            "Retenues opérées sur les honoraires versés à des prestataires non salariés, à reverser au Trésor.",
        categorie: "RAS",
        pays: ["SN", "CI", "CM"],
        jourEcheance: 15,
        periodicite: "MENSUELLE",
        typesDeclaration: ["IRPP", "AUTRE"],
        reference: "CGI Sénégal art. 200 et suivants",
    },
    {
        id: "irpp-salaires",
        titre: "Impôt sur le revenu retenu sur salaires",
        description:
            "Reversement de l'impôt sur le revenu et de la TRIMF retenus à la source sur les rémunérations du mois.",
        categorie: "RAS",
        pays: ["SN", "CI", "CM", "BJ"],
        jourEcheance: 15,
        periodicite: "MENSUELLE",
        typesDeclaration: ["IRPP"],
        reference: "CGI Sénégal art. 182",
    },
];

/** Obligations applicables à un pays donné. */
export function obligationsPourPays(pays: string): ObligationFiscale[] {
    const code = (pays ?? "").trim().toUpperCase();
    return OBLIGATIONS_FISCALES.filter((o) => o.pays.includes(code));
}

/**
 * Date d'échéance d'une obligation pour un mois donné.
 *
 * Le jour indiqué peut dépasser le nombre de jours du mois (échéance au 30 en
 * février) : on retient alors le dernier jour du mois.
 */
export function echeancePour(obligation: ObligationFiscale, annee: number, mois: number): Date {
    const dernierJour = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
    return new Date(Date.UTC(annee, mois, Math.min(obligation.jourEcheance, dernierJour)));
}

/**
 * Niveau d'urgence, d'après le nombre de jours restants.
 * `null` si l'échéance est passée.
 */
export function urgenceDe(echeance: Date, reference: Date = new Date()): "DEPASSEE" | "IMMINENTE" | "PROCHE" | "NORMALE" {
    const jours = Math.ceil((echeance.getTime() - reference.getTime()) / 86_400_000);

    if (jours < 0) return "DEPASSEE";
    if (jours <= 7) return "IMMINENTE";
    if (jours <= 21) return "PROCHE";
    return "NORMALE";
}
