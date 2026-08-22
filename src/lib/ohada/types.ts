// ─────────────────────────────────────────────────────────────────────────────
// Types du moteur SYSCOHADA révisé (Acte uniforme relatif au droit comptable
// et à l'information financière — AUDCIF, applicable depuis le 01/01/2018).
// ─────────────────────────────────────────────────────────────────────────────

/** Une ligne de balance générale, telle qu'importée d'un XLSX/CSV. */
export type CompteBalance = {
    numero: string;
    intitule: string;
    debit: number;
    credit: number;
    /**
     * Solde éventuellement fourni par la source. Le moteur ne s'en sert JAMAIS :
     * il recalcule systématiquement `debit - credit` pour éviter de propager une
     * incohérence du fichier importé.
     */
    solde?: number;
};

/** Sens dans lequel une ligne d'état est présentée. */
export type Sens = "DEBIT" | "CREDIT";

export type Section =
    | "ACTIF_IMMOBILISE"
    | "ACTIF_CIRCULANT"
    | "TRESORERIE_ACTIF"
    | "CAPITAUX_PROPRES"
    | "DETTES_FINANCIERES"
    | "PASSIF_CIRCULANT"
    | "TRESORERIE_PASSIF"
    | "RESULTAT";

/**
 * Définition d'une ligne d'état financier.
 *
 * `children` n'est renseigné que pour les totaux, et les ensembles d'enfants
 * sont disjoints par construction : un même code n'apparaît jamais dans deux
 * totaux de même niveau, ce qui interdit tout double comptage.
 */
export type LineDef = {
    code: string;
    label: string;
    section: Section;
    /** Sens de présentation : une ligne CREDIT est affichée en valeur positive. */
    sens: Sens;
    /** Codes agrégés si la ligne est un total. */
    children?: string[];
    /** Total de niveau supérieur (mise en forme). */
    isTotal?: boolean;
    /** Solde intermédiaire de gestion (compte de résultat). */
    isSIG?: boolean;
};

/**
 * Règle d'affectation d'un préfixe de compte.
 *
 * Le moteur applique la règle au **préfixe le plus long** qui correspond, si
 * bien que chaque compte de la balance est affecté à exactement une ligne.
 * C'est ce qui garantit l'absence de double comptage entre l'actif et le passif
 * pour les classes bidirectionnelles (40, 41, 42…).
 */
export type AccountRule = {
    /** Préfixe de numéro de compte, ex. "2181", "409", "41". */
    prefix: string;
    /** Ligne d'affectation si le compte présente un solde débiteur. */
    debit?: string;
    /** Ligne d'affectation si le compte présente un solde créditeur. */
    credit?: string;
    /**
     * Le compte est un amortissement ou une dépréciation : son solde est
     * soustrait du brut de la ligne d'actif indiquée (colonne AMORT/DEPREC).
     */
    depreciationOf?: string;
};

/** Valeurs calculées pour une ligne d'actif (présentation brut / amort / net). */
export type ReportLine = {
    code: string;
    label: string;
    section: Section;
    /** Montant brut de l'exercice N. */
    brutN: number;
    /** Amortissements et dépréciations de l'exercice N (valeur positive). */
    amortN: number;
    /** Net N = brutN - amortN. */
    netN: number;
    /** Net de l'exercice N-1. */
    netN1: number;
    isTotal?: boolean;
    isSIG?: boolean;
    children?: string[];
};

/** Compte présent dans la balance mais qu'aucune règle ne sait affecter. */
export type CompteNonAffecte = {
    numero: string;
    intitule: string;
    solde: number;
};

export type ControleEquilibre = {
    totalActif: number;
    totalPassif: number;
    ecart: number;
    equilibre: boolean;
};

export type ControleBalance = {
    totalDebit: number;
    totalCredit: number;
    ecart: number;
    equilibree: boolean;
};

export type FinancialStatement = {
    /** Bilan — Actif. */
    actif: ReportLine[];
    /** Bilan — Passif. */
    passif: ReportLine[];
    /** Compte de résultat, soldes intermédiaires de gestion inclus. */
    resultat: ReportLine[];
    /** Résultat net de l'exercice, reporté au passif (ligne CJ). */
    resultatNet: number;
    /** Comptes qu'aucune règle n'a su affecter — à traiter avant publication. */
    comptesNonAffectes: CompteNonAffecte[];
    /** Contrôle débit = crédit sur la balance source. */
    controleBalance: ControleBalance;
    /** Contrôle actif = passif sur le bilan produit. */
    controleEquilibre: ControleEquilibre;
    /**
     * Anomalies expliquant un éventuel déséquilibre, en clair. Un écart sans
     * explication est inexploitable en revue : chaque cause détectée est
     * nommée ici.
     */
    anomalies: string[];
};
