import type { AccountRule, LineDef } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Plan de correspondance SYSCOHADA révisé (AUDCIF) : balance générale → états
// financiers du système normal.
//
// Deux principes structurent ce fichier, et ils sont ce qui rend le résultat
// vérifiable :
//
//  1. AFFECTATION UNIQUE — chaque compte de la balance est rattaché à la règle
//     dont le préfixe correspondant est le PLUS LONG. Un compte ne peut donc
//     jamais alimenter deux lignes, ce qui interdit structurellement le double
//     comptage entre actif et passif sur les classes bidirectionnelles.
//
//  2. RECLASSEMENT PAR LE SENS — pour les comptes de tiers, la ligne dépend du
//     sens réel du solde : un 401 débiteur est une créance (avance versée), un
//     411 créditeur est une dette (avance reçue). Les règles portent donc un
//     code `debit` et un code `credit` distincts.
//
// Les amortissements et dépréciations (28x, 29x, 39x, 49x, 59x) ne sont pas
// exclus : ils sont rattachés via `depreciationOf` à la ligne d'actif dont ils
// viennent en diminution, et alimentent la colonne AMORT/DÉPRÉC.
// ─────────────────────────────────────────────────────────────────────────────

// ── BILAN — ACTIF ───────────────────────────────────────────────────────────
export const ACTIF_LINES: LineDef[] = [
    { code: "AE", label: "Frais de développement et de prospection", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AF", label: "Brevets, licences, logiciels et droits similaires", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AG", label: "Fonds commercial et droit au bail", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AH", label: "Autres immobilisations incorporelles", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AI", label: "IMMOBILISATIONS INCORPORELLES", section: "ACTIF_IMMOBILISE", sens: "DEBIT", children: ["AE", "AF", "AG", "AH"] },

    { code: "AJ", label: "Terrains", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AK", label: "Bâtiments", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AL", label: "Aménagements, agencements et installations", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AM", label: "Matériel, mobilier et actifs biologiques", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AN", label: "Matériel de transport", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AP", label: "IMMOBILISATIONS CORPORELLES", section: "ACTIF_IMMOBILISE", sens: "DEBIT", children: ["AJ", "AK", "AL", "AM", "AN"] },

    { code: "AQ", label: "Avances et acomptes versés sur immobilisations", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AR", label: "Titres de participation", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AS", label: "Autres immobilisations financières", section: "ACTIF_IMMOBILISE", sens: "DEBIT" },
    { code: "AT", label: "IMMOBILISATIONS FINANCIÈRES", section: "ACTIF_IMMOBILISE", sens: "DEBIT", children: ["AR", "AS"] },

    { code: "AZ", label: "TOTAL ACTIF IMMOBILISÉ", section: "ACTIF_IMMOBILISE", sens: "DEBIT", isTotal: true, children: ["AI", "AP", "AQ", "AT"] },

    { code: "BA", label: "Actif circulant HAO", section: "ACTIF_CIRCULANT", sens: "DEBIT" },
    { code: "BB", label: "Stocks et en-cours", section: "ACTIF_CIRCULANT", sens: "DEBIT" },
    { code: "BH", label: "Fournisseurs, avances versées", section: "ACTIF_CIRCULANT", sens: "DEBIT" },
    { code: "BI", label: "Clients et comptes rattachés", section: "ACTIF_CIRCULANT", sens: "DEBIT" },
    { code: "BJ", label: "Autres créances", section: "ACTIF_CIRCULANT", sens: "DEBIT" },
    { code: "BK", label: "TOTAL ACTIF CIRCULANT", section: "ACTIF_CIRCULANT", sens: "DEBIT", isTotal: true, children: ["BA", "BB", "BH", "BI", "BJ"] },

    { code: "BQ", label: "Titres de placement", section: "TRESORERIE_ACTIF", sens: "DEBIT" },
    { code: "BR", label: "Valeurs à encaisser", section: "TRESORERIE_ACTIF", sens: "DEBIT" },
    { code: "BS", label: "Banques, chèques postaux, caisse et assimilés", section: "TRESORERIE_ACTIF", sens: "DEBIT" },
    { code: "BT", label: "TOTAL TRÉSORERIE-ACTIF", section: "TRESORERIE_ACTIF", sens: "DEBIT", isTotal: true, children: ["BQ", "BR", "BS"] },

    { code: "BU", label: "Écart de conversion-Actif", section: "ACTIF_CIRCULANT", sens: "DEBIT" },

    { code: "BZ", label: "TOTAL GÉNÉRAL ACTIF", section: "ACTIF_CIRCULANT", sens: "DEBIT", isTotal: true, children: ["AZ", "BK", "BT", "BU"] },
];

// ── BILAN — PASSIF ──────────────────────────────────────────────────────────
export const PASSIF_LINES: LineDef[] = [
    { code: "CA", label: "Capital", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    // Sens CREDIT volontaire : le compte 109 est débiteur, il produit donc une
    // valeur négative qui vient bien en diminution des capitaux propres (CP).
    { code: "CB", label: "Apporteurs, capital non appelé (-)", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CD", label: "Primes liées au capital social", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CE", label: "Écarts de réévaluation", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CF", label: "Réserves indisponibles", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CG", label: "Réserves libres", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CH", label: "Report à nouveau (+ ou -)", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CJ", label: "Résultat net de l'exercice (+ ou -)", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CL", label: "Subventions d'investissement", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CM", label: "Provisions réglementées", section: "CAPITAUX_PROPRES", sens: "CREDIT" },
    { code: "CP", label: "TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES", section: "CAPITAUX_PROPRES", sens: "CREDIT", isTotal: true, children: ["CA", "CB", "CD", "CE", "CF", "CG", "CH", "CJ", "CL", "CM"] },

    { code: "DA", label: "Emprunts et dettes financières diverses", section: "DETTES_FINANCIERES", sens: "CREDIT" },
    { code: "DB", label: "Dettes de location acquisition", section: "DETTES_FINANCIERES", sens: "CREDIT" },
    { code: "DC", label: "Provisions pour risques et charges", section: "DETTES_FINANCIERES", sens: "CREDIT" },
    { code: "DD", label: "TOTAL DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES", section: "DETTES_FINANCIERES", sens: "CREDIT", isTotal: true, children: ["DA", "DB", "DC"] },

    { code: "DF", label: "TOTAL RESSOURCES STABLES", section: "DETTES_FINANCIERES", sens: "CREDIT", isTotal: true, children: ["CP", "DD"] },

    { code: "DH", label: "Dettes circulantes HAO", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DI", label: "Clients, avances reçues", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DJ", label: "Fournisseurs d'exploitation", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DK", label: "Dettes fiscales et sociales", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DM", label: "Autres dettes", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DN", label: "Provisions pour risques à court terme", section: "PASSIF_CIRCULANT", sens: "CREDIT" },
    { code: "DP", label: "TOTAL PASSIF CIRCULANT", section: "PASSIF_CIRCULANT", sens: "CREDIT", isTotal: true, children: ["DH", "DI", "DJ", "DK", "DM", "DN"] },

    { code: "DQ", label: "Banques, crédits d'escompte", section: "TRESORERIE_PASSIF", sens: "CREDIT" },
    { code: "DR", label: "Banques, établissements financiers et crédits de trésorerie", section: "TRESORERIE_PASSIF", sens: "CREDIT" },
    { code: "DT", label: "TOTAL TRÉSORERIE-PASSIF", section: "TRESORERIE_PASSIF", sens: "CREDIT", isTotal: true, children: ["DQ", "DR"] },

    { code: "DV", label: "Écart de conversion-Passif", section: "PASSIF_CIRCULANT", sens: "CREDIT" },

    { code: "DZ", label: "TOTAL GÉNÉRAL PASSIF", section: "PASSIF_CIRCULANT", sens: "CREDIT", isTotal: true, children: ["DF", "DP", "DT", "DV"] },
];

// ── COMPTE DE RÉSULTAT ──────────────────────────────────────────────────────
// Les lignes `isSIG` sont les soldes intermédiaires de gestion : elles ne sont
// pas alimentées par des comptes mais calculées en cascade par le moteur.
export const RESULTAT_LINES: LineDef[] = [
    { code: "TA", label: "Ventes de marchandises", section: "RESULTAT", sens: "CREDIT" },
    { code: "RA", label: "Achats de marchandises", section: "RESULTAT", sens: "DEBIT" },
    { code: "RB", label: "Variation de stocks de marchandises", section: "RESULTAT", sens: "DEBIT" },
    { code: "XA", label: "MARGE COMMERCIALE", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "TB", label: "Ventes de produits fabriqués", section: "RESULTAT", sens: "CREDIT" },
    { code: "TC", label: "Travaux, services vendus", section: "RESULTAT", sens: "CREDIT" },
    { code: "TD", label: "Produits accessoires", section: "RESULTAT", sens: "CREDIT" },
    { code: "XB", label: "CHIFFRE D'AFFAIRES", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "TE", label: "Production stockée (ou déstockage)", section: "RESULTAT", sens: "CREDIT" },
    { code: "TF", label: "Production immobilisée", section: "RESULTAT", sens: "CREDIT" },
    { code: "TG", label: "Subventions d'exploitation", section: "RESULTAT", sens: "CREDIT" },
    { code: "TH", label: "Autres produits", section: "RESULTAT", sens: "CREDIT" },
    { code: "TI", label: "Transferts de charges d'exploitation", section: "RESULTAT", sens: "CREDIT" },

    { code: "RC", label: "Achats de matières premières et fournitures liées", section: "RESULTAT", sens: "DEBIT" },
    { code: "RD", label: "Variation de stocks de matières premières", section: "RESULTAT", sens: "DEBIT" },
    { code: "RE", label: "Autres achats", section: "RESULTAT", sens: "DEBIT" },
    { code: "RF", label: "Variation de stocks d'autres approvisionnements", section: "RESULTAT", sens: "DEBIT" },
    { code: "RG", label: "Transports", section: "RESULTAT", sens: "DEBIT" },
    { code: "RH", label: "Services extérieurs", section: "RESULTAT", sens: "DEBIT" },
    { code: "RI", label: "Impôts et taxes", section: "RESULTAT", sens: "DEBIT" },
    { code: "RJ", label: "Autres charges", section: "RESULTAT", sens: "DEBIT" },
    { code: "XC", label: "VALEUR AJOUTÉE", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "RK", label: "Charges de personnel", section: "RESULTAT", sens: "DEBIT" },
    { code: "XD", label: "EXCÉDENT BRUT D'EXPLOITATION", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "TJ", label: "Reprises d'amortissements, provisions et dépréciations", section: "RESULTAT", sens: "CREDIT" },
    { code: "RL", label: "Dotations aux amortissements, provisions et dépréciations", section: "RESULTAT", sens: "DEBIT" },
    { code: "XE", label: "RÉSULTAT D'EXPLOITATION", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "TK", label: "Revenus financiers et assimilés", section: "RESULTAT", sens: "CREDIT" },
    { code: "TL", label: "Reprises de provisions et dépréciations financières", section: "RESULTAT", sens: "CREDIT" },
    { code: "TM", label: "Transferts de charges financières", section: "RESULTAT", sens: "CREDIT" },
    { code: "RM", label: "Frais financiers et charges assimilées", section: "RESULTAT", sens: "DEBIT" },
    { code: "RN", label: "Dotations aux provisions et dépréciations financières", section: "RESULTAT", sens: "DEBIT" },
    { code: "XF", label: "RÉSULTAT FINANCIER", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "XG", label: "RÉSULTAT DES ACTIVITÉS ORDINAIRES", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "TN", label: "Produits des cessions d'immobilisations", section: "RESULTAT", sens: "CREDIT" },
    { code: "TO", label: "Autres produits HAO", section: "RESULTAT", sens: "CREDIT" },
    { code: "RO", label: "Valeurs comptables des cessions d'immobilisations", section: "RESULTAT", sens: "DEBIT" },
    { code: "RP", label: "Autres charges HAO", section: "RESULTAT", sens: "DEBIT" },
    { code: "XH", label: "RÉSULTAT HORS ACTIVITÉS ORDINAIRES", section: "RESULTAT", sens: "CREDIT", isSIG: true },

    { code: "RQ", label: "Participation des travailleurs", section: "RESULTAT", sens: "DEBIT" },
    { code: "RS", label: "Impôts sur le résultat", section: "RESULTAT", sens: "DEBIT" },
    { code: "XI", label: "RÉSULTAT NET DE L'EXERCICE", section: "RESULTAT", sens: "CREDIT", isSIG: true },
];

// ── RÈGLES D'AFFECTATION DES COMPTES ────────────────────────────────────────
// Ordonnées librement : le moteur retient toujours le préfixe le plus long.
export const ACCOUNT_RULES: AccountRule[] = [
    // ── Classe 1 — Ressources durables ──────────────────────────────────────
    { prefix: "10", credit: "CA", debit: "CA" },
    { prefix: "104", credit: "CD", debit: "CD" },
    { prefix: "105", credit: "CE", debit: "CE" },
    { prefix: "106", credit: "CF", debit: "CF" },
    { prefix: "1068", credit: "CG", debit: "CG" },
    { prefix: "109", debit: "CB", credit: "CB" },
    { prefix: "11", credit: "CG", debit: "CG" },
    { prefix: "118", credit: "CG", debit: "CG" },
    { prefix: "12", credit: "CH", debit: "CH" },
    { prefix: "13", credit: "CJ", debit: "CJ" },
    { prefix: "14", credit: "CL", debit: "CL" },
    { prefix: "15", credit: "CM", debit: "CM" },
    { prefix: "16", credit: "DA", debit: "DA" },
    { prefix: "17", credit: "DB", debit: "DB" },
    { prefix: "18", credit: "DA", debit: "DA" },
    { prefix: "19", credit: "DC", debit: "DC" },

    // ── Classe 2 — Actif immobilisé ─────────────────────────────────────────
    { prefix: "20", debit: "AE", credit: "AE" },
    { prefix: "201", debit: "AE", credit: "AE" },
    { prefix: "2012", debit: "AE", credit: "AE" },
    { prefix: "211", debit: "AF", credit: "AF" },
    { prefix: "212", debit: "AF", credit: "AF" },
    { prefix: "213", debit: "AF", credit: "AF" },
    { prefix: "214", debit: "AF", credit: "AF" },
    { prefix: "215", debit: "AG", credit: "AG" },
    { prefix: "216", debit: "AG", credit: "AG" },
    { prefix: "217", debit: "AH", credit: "AH" },
    { prefix: "218", debit: "AH", credit: "AH" },
    { prefix: "21", debit: "AH", credit: "AH" },
    { prefix: "22", debit: "AJ", credit: "AJ" },
    { prefix: "23", debit: "AK", credit: "AK" },
    { prefix: "233", debit: "AL", credit: "AL" },
    { prefix: "237", debit: "AL", credit: "AL" },
    { prefix: "238", debit: "AL", credit: "AL" },
    { prefix: "24", debit: "AM", credit: "AM" },
    { prefix: "245", debit: "AN", credit: "AN" },
    { prefix: "25", debit: "AQ", credit: "AQ" },
    { prefix: "26", debit: "AR", credit: "AR" },
    { prefix: "27", debit: "AS", credit: "AS" },

    // Amortissements et dépréciations d'immobilisations : viennent en
    // diminution du brut de la ligne correspondante (colonne AMORT/DÉPRÉC).
    { prefix: "280", depreciationOf: "AE" },
    { prefix: "2801", depreciationOf: "AE" },
    { prefix: "2811", depreciationOf: "AF" },
    { prefix: "2812", depreciationOf: "AF" },
    { prefix: "2813", depreciationOf: "AF" },
    { prefix: "2814", depreciationOf: "AF" },
    { prefix: "2815", depreciationOf: "AG" },
    { prefix: "2816", depreciationOf: "AG" },
    { prefix: "2817", depreciationOf: "AH" },
    { prefix: "2818", depreciationOf: "AH" },
    { prefix: "281", depreciationOf: "AH" },
    { prefix: "282", depreciationOf: "AJ" },
    { prefix: "283", depreciationOf: "AK" },
    { prefix: "2833", depreciationOf: "AL" },
    { prefix: "2837", depreciationOf: "AL" },
    { prefix: "2838", depreciationOf: "AL" },
    { prefix: "284", depreciationOf: "AM" },
    { prefix: "2845", depreciationOf: "AN" },
    { prefix: "290", depreciationOf: "AE" },
    { prefix: "291", depreciationOf: "AH" },
    { prefix: "292", depreciationOf: "AJ" },
    { prefix: "293", depreciationOf: "AK" },
    { prefix: "294", depreciationOf: "AM" },
    { prefix: "296", depreciationOf: "AR" },
    { prefix: "297", depreciationOf: "AS" },

    // ── Classe 3 — Stocks ───────────────────────────────────────────────────
    { prefix: "3", debit: "BB", credit: "BB" },
    { prefix: "39", depreciationOf: "BB" },

    // ── Classe 4 — Tiers (reclassement par le sens du solde) ────────────────
    { prefix: "40", debit: "BH", credit: "DJ" },
    { prefix: "409", debit: "BH", credit: "DJ" },
    { prefix: "41", debit: "BI", credit: "DI" },
    { prefix: "419", debit: "BI", credit: "DI" },
    { prefix: "42", debit: "BJ", credit: "DK" },
    { prefix: "43", debit: "BJ", credit: "DK" },
    { prefix: "44", debit: "BJ", credit: "DK" },
    { prefix: "45", debit: "BJ", credit: "DM" },
    { prefix: "46", debit: "BA", credit: "DH" },
    { prefix: "47", debit: "BJ", credit: "DM" },
    { prefix: "478", debit: "BU", credit: "DV" },
    { prefix: "479", debit: "BU", credit: "DV" },
    { prefix: "48", debit: "BA", credit: "DH" },
    { prefix: "499", depreciationOf: "BJ" },
    { prefix: "491", depreciationOf: "BI" },
    { prefix: "492", depreciationOf: "BJ" },
    { prefix: "493", depreciationOf: "BJ" },
    { prefix: "494", depreciationOf: "BJ" },
    { prefix: "495", depreciationOf: "BJ" },
    { prefix: "496", depreciationOf: "BJ" },
    { prefix: "498", depreciationOf: "BA" },

    // ── Classe 5 — Trésorerie ───────────────────────────────────────────────
    { prefix: "50", debit: "BQ", credit: "BQ" },
    { prefix: "51", debit: "BR", credit: "DQ" },
    { prefix: "52", debit: "BS", credit: "DR" },
    { prefix: "53", debit: "BS", credit: "DR" },
    { prefix: "54", debit: "BS", credit: "DR" },
    { prefix: "55", debit: "BS", credit: "DR" },
    { prefix: "56", debit: "BS", credit: "DR" },
    { prefix: "57", debit: "BS", credit: "DR" },
    { prefix: "58", debit: "BS", credit: "DR" },
    { prefix: "59", depreciationOf: "BQ" },

    // ── Classe 6 — Charges ──────────────────────────────────────────────────
    { prefix: "601", debit: "RA", credit: "RA" },
    { prefix: "6031", debit: "RB", credit: "RB" },
    { prefix: "602", debit: "RC", credit: "RC" },
    { prefix: "6032", debit: "RD", credit: "RD" },
    { prefix: "604", debit: "RE", credit: "RE" },
    { prefix: "605", debit: "RE", credit: "RE" },
    { prefix: "608", debit: "RE", credit: "RE" },
    { prefix: "6033", debit: "RF", credit: "RF" },
    { prefix: "603", debit: "RF", credit: "RF" },
    { prefix: "60", debit: "RE", credit: "RE" },
    { prefix: "61", debit: "RG", credit: "RG" },
    { prefix: "62", debit: "RH", credit: "RH" },
    { prefix: "63", debit: "RH", credit: "RH" },
    { prefix: "64", debit: "RI", credit: "RI" },
    { prefix: "65", debit: "RJ", credit: "RJ" },
    { prefix: "66", debit: "RK", credit: "RK" },
    { prefix: "67", debit: "RM", credit: "RM" },
    { prefix: "68", debit: "RL", credit: "RL" },
    { prefix: "69", debit: "RL", credit: "RL" },
    { prefix: "697", debit: "RN", credit: "RN" },
    { prefix: "81", debit: "RO", credit: "RO" },
    { prefix: "83", debit: "RP", credit: "RP" },
    { prefix: "85", debit: "RP", credit: "RP" },
    { prefix: "87", debit: "RQ", credit: "RQ" },
    { prefix: "89", debit: "RS", credit: "RS" },

    // ── Classe 7 — Produits ─────────────────────────────────────────────────
    { prefix: "701", credit: "TA", debit: "TA" },
    { prefix: "702", credit: "TB", debit: "TB" },
    { prefix: "703", credit: "TB", debit: "TB" },
    { prefix: "704", credit: "TB", debit: "TB" },
    { prefix: "705", credit: "TC", debit: "TC" },
    { prefix: "706", credit: "TC", debit: "TC" },
    { prefix: "707", credit: "TD", debit: "TD" },
    { prefix: "70", credit: "TD", debit: "TD" },
    { prefix: "71", credit: "TG", debit: "TG" },
    { prefix: "72", credit: "TF", debit: "TF" },
    { prefix: "73", credit: "TE", debit: "TE" },
    { prefix: "75", credit: "TH", debit: "TH" },
    { prefix: "77", credit: "TK", debit: "TK" },
    { prefix: "78", credit: "TI", debit: "TI" },
    { prefix: "787", credit: "TM", debit: "TM" },
    { prefix: "79", credit: "TJ", debit: "TJ" },
    { prefix: "797", credit: "TL", debit: "TL" },
    { prefix: "82", credit: "TN", debit: "TN" },
    { prefix: "84", credit: "TO", debit: "TO" },
    { prefix: "86", credit: "TO", debit: "TO" },
    { prefix: "88", credit: "TO", debit: "TO" },
];

export const ALL_LINES: LineDef[] = [...ACTIF_LINES, ...PASSIF_LINES, ...RESULTAT_LINES];
