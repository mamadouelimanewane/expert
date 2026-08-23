// ─────────────────────────────────────────────────────────────────────────────
// Référentiel des obligations légales OHADA / UEMOA.
//
// Comme le calendrier fiscal, ce catalogue est une donnée de RÉFÉRENCE : les
// articles cités viennent des Actes uniformes et des codes nationaux. Il est
// légitimement figé dans le code et doit être revu à chaque révision de texte.
//
// Ce qui ne doit PAS être figé, et ne l'est plus : le VERDICT DE CONFORMITÉ par
// client. La page affichait « Livre d'inventaire non coté et non paraphé
// détecté — Risque » pour n'importe quel client sélectionné, sans avoir rien
// vérifié. Un constat de non-conformité engage le cabinet : il ne peut venir
// que d'une vérification enregistrée, jamais d'une valeur par défaut.
// ─────────────────────────────────────────────────────────────────────────────

export type SourceObligation = "OHADA" | "CGI" | "UEMOA" | "SOCIAL";

export type ObligationLegale = {
    id: string;
    source: SourceObligation;
    titre: string;
    article: string;
    description: string;
    /** Pays concernés ; vide signifie « toute la zone OHADA ». */
    pays?: string[];
    /**
     * Ce que le cabinet doit pouvoir produire pour établir la conformité.
     * Sert de guide de vérification, pas de conclusion.
     */
    pieceProbante: string;
};

export const OBLIGATIONS_LEGALES: ObligationLegale[] = [
    {
        id: "depot-comptes",
        source: "OHADA",
        titre: "Dépôt des états financiers annuels",
        article: "Art. 269 AUSCGIE",
        description:
            "Les états financiers de synthèse approuvés doivent être déposés au greffe dans le mois qui suit leur approbation par l'assemblée générale.",
        pieceProbante: "Récépissé de dépôt au greffe du tribunal de commerce",
    },
    {
        id: "livres-obligatoires",
        source: "OHADA",
        titre: "Tenue des livres comptables obligatoires",
        article: "Art. 13 à 19 AUDCIF",
        description:
            "Livre-journal, grand livre et livre d'inventaire doivent être tenus, et les livres cotés et paraphés conservés dix ans.",
        pieceProbante: "Livres cotés et paraphés, avec mention du greffe",
    },
    {
        id: "assemblee-generale",
        source: "OHADA",
        titre: "Tenue de l'assemblée générale ordinaire annuelle",
        article: "Art. 348 AUSCGIE",
        description:
            "L'assemblée statuant sur les comptes doit se réunir dans les six mois de la clôture de l'exercice.",
        pieceProbante: "Procès-verbal d'assemblée générale signé",
    },
    {
        id: "commissaire-comptes",
        source: "OHADA",
        titre: "Désignation d'un commissaire aux comptes",
        article: "Art. 376 et 702 AUSCGIE",
        description:
            "La désignation est obligatoire pour les SA, et pour les SARL dépassant deux des trois seuils légaux (capital, chiffre d'affaires, effectif).",
        pieceProbante: "Lettre d'acceptation et mandat en cours de validité",
    },
    {
        id: "rccm",
        source: "OHADA",
        titre: "Immatriculation et mises à jour au RCCM",
        article: "Art. 44 et suivants AUDCG",
        description:
            "Toute modification statutaire doit faire l'objet d'une inscription modificative au registre du commerce et du crédit mobilier.",
        pieceProbante: "Extrait RCCM à jour",
    },
    {
        id: "retenue-source-bnc",
        source: "CGI",
        titre: "Retenue à la source sur honoraires",
        article: "Art. 200 CGI Sénégal ; art. 92 CGI Côte d'Ivoire",
        description:
            "Les retenues opérées sur les rémunérations de prestataires non salariés doivent être reversées avant le 15 du mois suivant.",
        pieceProbante: "Quittance de reversement et état récapitulatif",
    },
    {
        id: "facturation-normalisee",
        source: "CGI",
        titre: "Facturation normalisée",
        article: "CGI, dispositions relatives à la facturation",
        description:
            "Les factures doivent comporter les mentions obligatoires et, selon les pays, être émises via un dispositif certifié.",
        pieceProbante: "Échantillon de factures conformes",
    },
    {
        id: "reglementation-changes",
        source: "UEMOA",
        titre: "Réglementation des changes",
        article: "Règlement 09/2010/CM/UEMOA",
        description:
            "Les transferts hors zone UEMOA doivent être domiciliés et déclarés auprès d'un intermédiaire agréé.",
        pieceProbante: "Dossier de domiciliation bancaire",
    },
    {
        id: "declaration-employeur",
        source: "SOCIAL",
        titre: "Déclaration annuelle des salaires",
        article: "Code de la sécurité sociale",
        description:
            "L'employeur dépose chaque année l'état récapitulatif des rémunérations versées et des cotisations acquittées.",
        pieceProbante: "Déclaration annuelle des salaires visée par l'organisme",
    },
];

/** Obligations applicables à un pays donné. */
export function obligationsLegalesPourPays(pays: string): ObligationLegale[] {
    const code = (pays ?? "").trim().toUpperCase();
    return OBLIGATIONS_LEGALES.filter((o) => !o.pays || o.pays.includes(code));
}

/**
 * État de conformité d'une obligation pour un client.
 *
 * `NON_EVALUE` est la valeur par défaut et doit le rester : tant qu'aucune
 * vérification n'a été enregistrée, l'application ne se prononce pas.
 */
export type EtatConformite = "CONFORME" | "ALERTE" | "RISQUE" | "NON_EVALUE";

export const LIBELLE_CONFORMITE: Record<EtatConformite, string> = {
    CONFORME: "Conforme",
    ALERTE: "Alerte",
    RISQUE: "Risque",
    NON_EVALUE: "Non évalué",
};
