/**
 * SYSCOA → SYSCOHADA Migration Engine
 * Reclassement automatique des comptes de l'ancien plan SYSCOA (UEMOA avant 2001)
 * vers le SYSCOHADA révisé 2017.
 */

export interface CompteSYSCOA {
  numero: string;    // ex: "421" (SYSCOA)
  libelle: string;
  solde_XOF: number;
}

export interface ReclassementSYSCOHADA {
  compteSource: CompteSYSCOA;
  compteOHADA: string;        // numéro compte SYSCOHADA cible
  libelleOHADA: string;
  statutReclassement: "AUTOMATIQUE" | "MANUEL_REQUIS" | "COMPTE_SUPPRIME";
  observation: string;
}

export interface RapportMigration {
  totalComptes: number;
  comptesReclassesAuto: number;
  comptesManuelRequis: number;
  comptesSupprimesOuFusionnes: number;
  reclassements: ReclassementSYSCOHADA[];
  balanceOHADA: CompteSYSCOA[];  // balance retraitée aux numéros SYSCOHADA
  alertesMigration: string[];
}

// ---------------------------------------------------------------------------
// Table de mapping SYSCOA → SYSCOHADA révisé 2017
// Couvre les classes 1 à 7 : capital, immobilisations, stocks, tiers,
// trésorerie, charges, produits.
// ---------------------------------------------------------------------------

type StatutMapping = "AUTOMATIQUE" | "MANUEL_REQUIS" | "COMPTE_SUPPRIME";

interface MappingEntry {
  compteOHADA: string;
  libelleOHADA: string;
  statut: StatutMapping;
  observation: string;
}

export const MAPPING_SYSCOA_VERS_SYSCOHADA: Record<string, MappingEntry> = {
  // CLASSE 1 — Ressources durables
  "101": {
    compteOHADA: "101",
    libelleOHADA: "Capital social",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe SYSCOA → SYSCOHADA révisé.",
  },
  "104": {
    compteOHADA: "104",
    libelleOHADA: "Primes liées au capital social",
    statut: "AUTOMATIQUE",
    observation: "Libellé élargi dans SYSCOHADA pour inclure prime d'émission et fusion.",
  },
  "111": {
    compteOHADA: "111",
    libelleOHADA: "Réserve légale",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "118": {
    compteOHADA: "118",
    libelleOHADA: "Autres réserves",
    statut: "AUTOMATIQUE",
    observation: "Regroupement possible ; vérifier la décomposition interne.",
  },
  "129": {
    compteOHADA: "129",
    libelleOHADA: "Report à nouveau (solde débiteur)",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "16": {
    compteOHADA: "16",
    libelleOHADA: "Emprunts et dettes financières",
    statut: "AUTOMATIQUE",
    observation: "La classe 16 SYSCOA correspond directement à la classe 16 SYSCOHADA.",
  },
  "19": {
    compteOHADA: "19",
    libelleOHADA: "Provisions financières pour risques et charges",
    statut: "AUTOMATIQUE",
    observation: "Reclassement direct ; contrôler les sous-comptes.",
  },

  // CLASSE 2 — Actif immobilisé
  "211": {
    compteOHADA: "211",
    libelleOHADA: "Frais de développement",
    statut: "AUTOMATIQUE",
    observation: "SYSCOHADA révisé 2017 maintient ce compte.",
  },
  "213": {
    compteOHADA: "213",
    libelleOHADA: "Logiciels",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "221": {
    compteOHADA: "221",
    libelleOHADA: "Terrains agricoles et forestiers",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "231": {
    compteOHADA: "231",
    libelleOHADA: "Bâtiments sur sol propre",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "244": {
    compteOHADA: "244",
    libelleOHADA: "Matériel et outillage",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "281": {
    compteOHADA: "281",
    libelleOHADA: "Amortissements des immobilisations incorporelles",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },

  // CLASSE 3 — Actif circulant (stocks)
  "31": {
    compteOHADA: "31",
    libelleOHADA: "Marchandises",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "32": {
    compteOHADA: "32",
    libelleOHADA: "Matières premières et fournitures liées",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "35": {
    compteOHADA: "35",
    libelleOHADA: "Stocks de produits",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },

  // CLASSE 4 — Tiers
  "401": {
    compteOHADA: "401",
    libelleOHADA: "Fournisseurs, dettes en compte",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "411": {
    compteOHADA: "411",
    libelleOHADA: "Clients",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "421": {
    compteOHADA: "421",
    libelleOHADA: "Personnel, avances et acomptes",
    statut: "AUTOMATIQUE",
    observation: "SYSCOA 421 correspond à SYSCOHADA 421.",
  },
  "431": {
    compteOHADA: "431",
    libelleOHADA: "Sécurité sociale",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "441": {
    compteOHADA: "441",
    libelleOHADA: "État, impôts et taxes sur le chiffre d'affaires",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  // Compte SYSCOA disparu dans SYSCOHADA : 48X Comptes de régularisation passif
  "481": {
    compteOHADA: "476",
    libelleOHADA: "Charges constatées d'avance",
    statut: "COMPTE_SUPPRIME",
    observation:
      "Le compte 481 SYSCOA (charges à répartir) est supprimé/fusionné dans SYSCOHADA : " +
      "reclasser en 476 (charges constatées d'avance) ou en 471 selon la nature.",
  },

  // CLASSE 5 — Trésorerie
  "521": {
    compteOHADA: "521",
    libelleOHADA: "Banques locales",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "571": {
    compteOHADA: "571",
    libelleOHADA: "Caisses",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "581": {
    compteOHADA: "581",
    libelleOHADA: "Virements de fonds",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },

  // CLASSE 6 — Charges
  "601": {
    compteOHADA: "601",
    libelleOHADA: "Achats de marchandises",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "611": {
    compteOHADA: "611",
    libelleOHADA: "Transports sur achats",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "621": {
    compteOHADA: "621",
    libelleOHADA: "Sous-traitance générale",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "641": {
    compteOHADA: "641",
    libelleOHADA: "Charges de personnel — rémunérations directes",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "681": {
    compteOHADA: "681",
    libelleOHADA: "Dotations aux amortissements",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  // Compte SYSCOA particulier : 65 Autres charges
  "65": {
    compteOHADA: "65",
    libelleOHADA: "Autres charges",
    statut: "MANUEL_REQUIS",
    observation:
      "Le compte 65 SYSCOA doit être décomposé manuellement selon la nature des charges " +
      "(651 pertes sur créances, 659 charges diverses) en SYSCOHADA révisé.",
  },

  // CLASSE 7 — Produits
  "701": {
    compteOHADA: "701",
    libelleOHADA: "Ventes de marchandises",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "706": {
    compteOHADA: "706",
    libelleOHADA: "Services vendus",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  "781": {
    compteOHADA: "781",
    libelleOHADA: "Reprises d'amortissements et de provisions",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe.",
  },
  // Compte SYSCOA 77 — Produits hors activités ordinaires
  "77": {
    compteOHADA: "77",
    libelleOHADA: "Revenus et produits hors activités ordinaires",
    statut: "AUTOMATIQUE",
    observation: "Correspondance directe avec SYSCOHADA révisé classe 77.",
  },
};

// ---------------------------------------------------------------------------
// Fonction principale de migration
// ---------------------------------------------------------------------------

/**
 * Cherche le mapping le plus précis pour un numéro de compte donné.
 * Essaie d'abord le numéro exact, puis les préfixes de 3, 2 et 1 chiffres.
 */
function trouverMapping(numero: string): MappingEntry | null {
  // Correspondance exacte
  if (MAPPING_SYSCOA_VERS_SYSCOHADA[numero]) {
    return MAPPING_SYSCOA_VERS_SYSCOHADA[numero];
  }
  // Préfixes décroissants (3 → 2 → 1 caractère)
  for (let len = Math.min(3, numero.length - 1); len >= 1; len--) {
    const prefix = numero.substring(0, len);
    if (MAPPING_SYSCOA_VERS_SYSCOHADA[prefix]) {
      return MAPPING_SYSCOA_VERS_SYSCOHADA[prefix];
    }
  }
  return null;
}

export function migrerBalanceSYSCOA(comptes: CompteSYSCOA[]): RapportMigration {
  const reclassements: ReclassementSYSCOHADA[] = [];
  const alertesMigration: string[] = [];
  let comptesReclassesAuto = 0;
  let comptesManuelRequis = 0;
  let comptesSupprimesOuFusionnes = 0;

  // Map des comptes OHADA résultants (pour la balance retraitée)
  const balanceMap: Map<string, CompteSYSCOA> = new Map();

  for (const compte of comptes) {
    const mapping = trouverMapping(compte.numero);

    let reclassement: ReclassementSYSCOHADA;

    if (!mapping) {
      // Compte inconnu dans la table de mapping → reclassement manuel requis
      reclassement = {
        compteSource: compte,
        compteOHADA: compte.numero,
        libelleOHADA: compte.libelle,
        statutReclassement: "MANUEL_REQUIS",
        observation:
          `Le compte SYSCOA ${compte.numero} n'a pas de correspondance directe dans la table ` +
          "de mapping. Une analyse manuelle est requise pour l'identifier dans le SYSCOHADA révisé 2017.",
      };
      comptesManuelRequis++;
      alertesMigration.push(
        `Compte ${compte.numero} (${compte.libelle}) : aucune correspondance SYSCOHADA — reclassement manuel requis.`
      );
    } else {
      reclassement = {
        compteSource: compte,
        compteOHADA: mapping.compteOHADA,
        libelleOHADA: mapping.libelleOHADA,
        statutReclassement: mapping.statut,
        observation: mapping.observation,
      };

      if (mapping.statut === "AUTOMATIQUE") {
        comptesReclassesAuto++;
      } else if (mapping.statut === "MANUEL_REQUIS") {
        comptesManuelRequis++;
        alertesMigration.push(
          `Compte ${compte.numero} (${compte.libelle}) → ${mapping.compteOHADA} : ${mapping.observation}`
        );
      } else if (mapping.statut === "COMPTE_SUPPRIME") {
        comptesSupprimesOuFusionnes++;
        alertesMigration.push(
          `⚠ Compte supprimé/fusionné : ${compte.numero} (${compte.libelle}) → ${mapping.observation}`
        );
      }
    }

    reclassements.push(reclassement);

    // Alimenter la balance retraitée (fusion des soldes si même compte OHADA cible)
    if (reclassement.statutReclassement === "AUTOMATIQUE") {
      const key = reclassement.compteOHADA;
      if (balanceMap.has(key)) {
        const existing = balanceMap.get(key)!;
        balanceMap.set(key, {
          ...existing,
          solde_XOF: existing.solde_XOF + compte.solde_XOF,
        });
      } else {
        balanceMap.set(key, {
          numero: reclassement.compteOHADA,
          libelle: reclassement.libelleOHADA,
          solde_XOF: compte.solde_XOF,
        });
      }
    }
  }

  // Alertes globales
  if (comptesSupprimesOuFusionnes > 0) {
    alertesMigration.unshift(
      `${comptesSupprimesOuFusionnes} compte(s) SYSCOA supprimé(s) ou fusionné(s) dans SYSCOHADA — ` +
        "une révision manuelle de la balance est obligatoire avant dépôt."
    );
  }

  const totalComptes = comptes.length;
  const taux = totalComptes > 0 ? Math.round((comptesReclassesAuto / totalComptes) * 100) : 0;
  if (taux < 80 && totalComptes > 0) {
    alertesMigration.unshift(
      `Taux de reclassement automatique faible (${taux}%). Vérifier la cohérence de la balance source SYSCOA.`
    );
  }

  return {
    totalComptes,
    comptesReclassesAuto,
    comptesManuelRequis,
    comptesSupprimesOuFusionnes,
    reclassements,
    balanceOHADA: Array.from(balanceMap.values()),
    alertesMigration,
  };
}
