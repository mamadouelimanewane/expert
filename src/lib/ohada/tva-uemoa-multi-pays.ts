// ─────────────────────────────────────────────────────────────────────────────
// TVA UEMOA Multi-Pays — Référentiel, Cadrage & Comparateur
// Couvre les 8 États membres UEMOA : SN, CI, BJ, ML, BF, TG, GN, NE
// ─────────────────────────────────────────────────────────────────────────────

export interface RegimeTVA {
  pays: string;                          // Code ISO 2 : "SN", "CI", etc.
  nomPays: string;
  tauxNormal_pct: number;               // ex: 18 pour SN
  tauxReduit_pct?: number;              // ex: 9 pour certains pays
  seuilAssujettissement_XOF: number;    // CA annuel minimum pour être assujetti
  periodiciteDeclaration: "MENSUEL" | "TRIMESTRIEL";
  secteursTauxZero: string[];           // ex: ["exportation", "agriculture"]
  particularites: string;               // Notes spécifiques au pays
}

// ─────────────────────────────────────────────────────────────────────────────
// Référentiel officiel TVA par pays UEMOA
// Sources : CGI nationaux, Directives UEMOA n°02/2009/CM/UEMOA
// ─────────────────────────────────────────────────────────────────────────────
export const REFERENTIEL_TVA_UEMOA: Record<string, RegimeTVA> = {
  SN: {
    pays: "SN",
    nomPays: "Sénégal",
    tauxNormal_pct: 18,
    seuilAssujettissement_XOF: 50_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "agriculture",
      "pêche artisanale",
      "médicaments",
      "produits alimentaires de première nécessité",
    ],
    particularites:
      "Taux unique 18%. Remboursement crédit TVA possible sur justificatifs (art. 379 CGI). " +
      "Franchise TVA pour CA < 50M XOF. Régime simplifié entre 50M et 100M XOF.",
  },
  CI: {
    pays: "CI",
    nomPays: "Côte d'Ivoire",
    tauxNormal_pct: 18,
    tauxReduit_pct: 9,
    seuilAssujettissement_XOF: 200_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "agriculture vivrière",
      "eau potable",
      "médicaments essentiels",
      "intrants agricoles",
    ],
    particularites:
      "Taux réduit 9% sur produits de grande consommation. Seuil d'assujettissement 200M XOF. " +
      "Régime simplifié entre 50M et 200M XOF (art. 383 CGI-CI). Remboursement exportateurs : 30 jours.",
  },
  BJ: {
    pays: "BJ",
    nomPays: "Bénin",
    tauxNormal_pct: 18,
    seuilAssujettissement_XOF: 40_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "biens d'équipement importés",
      "médicaments",
      "produits pétroliers pour l'exportation",
      "agriculture",
    ],
    particularites:
      "Taux unique 18%. Seuil d'assujettissement 40M XOF. Remboursement crédit TVA exportateurs prioritaire. " +
      "Franchise TVA pour CA < 40M XOF.",
  },
  ML: {
    pays: "ML",
    nomPays: "Mali",
    tauxNormal_pct: 18,
    seuilAssujettissement_XOF: 50_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "agriculture",
      "élevage",
      "médicaments",
      "eau et électricité",
    ],
    particularites:
      "Taux unique 18%. Seuil 50M XOF. Régime simplifié pour artisans. " +
      "Exonérations étendues pour le secteur agropastoral. Déclaration sur CA HT.",
  },
  BF: {
    pays: "BF",
    nomPays: "Burkina Faso",
    tauxNormal_pct: 18,
    seuilAssujettissement_XOF: 50_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "coton fibre",
      "médicaments",
      "agriculture vivrière",
      "intrants agricoles",
    ],
    particularites:
      "Taux unique 18%. Seuil 50M XOF. Mécanisme de retenue à la source TVA pour marchés publics. " +
      "Exonération intrants agricoles et matériels d'élevage.",
  },
  TG: {
    pays: "TG",
    nomPays: "Togo",
    tauxNormal_pct: 18,
    seuilAssujettissement_XOF: 30_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "agriculture",
      "pêche",
      "médicaments",
      "eau potable",
    ],
    particularites:
      "Taux unique 18%. Seuil d'assujettissement 30M XOF (le plus bas de l'UEMOA). " +
      "Zone franche de Lomé : exonération totale TVA. Crédits TVA remboursables sous 60 jours.",
  },
  GN: {
    pays: "GN",
    nomPays: "Guinée",
    tauxNormal_pct: 18,
    tauxReduit_pct: 10,
    seuilAssujettissement_XOF: 400_000_000,
    periodiciteDeclaration: "TRIMESTRIEL",
    secteursTauxZero: [
      "exportation",
      "mines",
      "agriculture",
      "médicaments",
      "produits alimentaires de base",
    ],
    particularites:
      "Taux normal 18%, taux réduit 10% sur certains biens de consommation courante. " +
      "Seuil très élevé à 400M GNF équivalent XOF. Déclaration trimestrielle. " +
      "Exonération secteur minier sous convention.",
  },
  NE: {
    pays: "NE",
    nomPays: "Niger",
    tauxNormal_pct: 19,
    seuilAssujettissement_XOF: 50_000_000,
    periodiciteDeclaration: "MENSUEL",
    secteursTauxZero: [
      "exportation",
      "uranium (conventions particulières)",
      "agriculture",
      "médicaments",
      "eau et électricité",
    ],
    particularites:
      "Taux normal 19% (le plus élevé de l'UEMOA). Seuil 50M XOF. " +
      "Régime dérogatoire pour le secteur extractif (uranium, pétrole). " +
      "Franchise TVA en dessous du seuil d'assujettissement.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Résultat du cadrage TVA
// ─────────────────────────────────────────────────────────────────────────────
export interface ResultatCadrageTVA {
  soldeTVA_XOF: number;
  typePosition: "CREDIT_TVA" | "DEBIT_TVA";
  alerteConformite: string[];
  tauxEffectif_pct: number;
  regimePays: RegimeTVA;
  tvaTheorique_XOF: number;
  ecartTvaTheorique_XOF: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// calculerCadrageTVA
// Calcule le solde TVA net, identifie la position (crédit/débit)
// et génère des alertes de conformité selon le régime du pays.
// ─────────────────────────────────────────────────────────────────────────────
export function calculerCadrageTVA(
  pays: string,
  caHT_XOF: number,
  tvaCollectee_XOF: number,
  tvaDeductible_XOF: number,
): ResultatCadrageTVA {
  const code = pays.toUpperCase();
  const regime = REFERENTIEL_TVA_UEMOA[code];

  if (!regime) {
    throw new Error(`Pays inconnu dans le référentiel UEMOA : ${pays}`);
  }

  // Solde net = TVA collectée - TVA déductible
  const soldeTVA_XOF = tvaCollectee_XOF - tvaDeductible_XOF;
  const typePosition: "CREDIT_TVA" | "DEBIT_TVA" =
    soldeTVA_XOF < 0 ? "CREDIT_TVA" : "DEBIT_TVA";

  // TVA théorique sur le CA HT au taux normal
  const tvaTheorique_XOF = Math.round(caHT_XOF * (regime.tauxNormal_pct / 100));
  const ecartTvaTheorique_XOF = tvaCollectee_XOF - tvaTheorique_XOF;

  // Taux effectif réel (TVA collectée / CA HT)
  const tauxEffectif_pct =
    caHT_XOF > 0 ? Math.round((tvaCollectee_XOF / caHT_XOF) * 10000) / 100 : 0;

  // Génération des alertes de conformité
  const alerteConformite: string[] = [];

  // 1. Sous-seuil d'assujettissement
  if (caHT_XOF < regime.seuilAssujettissement_XOF) {
    alerteConformite.push(
      `⚠️ CA HT (${caHT_XOF.toLocaleString("fr-FR")} XOF) inférieur au seuil d'assujettissement TVA ` +
        `${regime.nomPays} : ${regime.seuilAssujettissement_XOF.toLocaleString("fr-FR")} XOF. ` +
        `Vérifier l'obligation déclarative.`,
    );
  }

  // 2. Écart significatif entre TVA collectée et TVA théorique (tolérance 5%)
  const ecartPct = tvaTheorique_XOF > 0
    ? Math.abs(ecartTvaTheorique_XOF) / tvaTheorique_XOF
    : 0;
  if (ecartPct > 0.05 && caHT_XOF > 0) {
    const sens = ecartTvaTheorique_XOF < 0 ? "sous-déclarée" : "sur-déclarée";
    alerteConformite.push(
      `⚠️ TVA collectée ${sens} : écart de ${Math.abs(ecartTvaTheorique_XOF).toLocaleString("fr-FR")} XOF ` +
        `par rapport à la TVA théorique (${tvaTheorique_XOF.toLocaleString("fr-FR")} XOF au taux ${regime.tauxNormal_pct}%). ` +
        `Risque de redressement.`,
    );
  }

  // 3. Taux effectif trop éloigné du taux nominal (< 50% ou > 110%)
  if (caHT_XOF > 0 && tauxEffectif_pct < regime.tauxNormal_pct * 0.5) {
    alerteConformite.push(
      `⚠️ Taux effectif TVA anormalement bas (${tauxEffectif_pct}% vs ${regime.tauxNormal_pct}% nominal). ` +
        `Vérifier les exonérations appliquées et les opérations hors champ.`,
    );
  }
  if (caHT_XOF > 0 && tauxEffectif_pct > regime.tauxNormal_pct * 1.1) {
    alerteConformite.push(
      `⚠️ Taux effectif TVA supérieur au taux nominal (${tauxEffectif_pct}% vs ${regime.tauxNormal_pct}%). ` +
        `Possible erreur de facturation ou mauvaise imputation.`,
    );
  }

  // 4. Crédit TVA : signaler la possibilité de remboursement
  if (typePosition === "CREDIT_TVA") {
    alerteConformite.push(
      `ℹ️ Position créditrice : ${Math.abs(soldeTVA_XOF).toLocaleString("fr-FR")} XOF de crédit TVA. ` +
        `Vérifier l'éligibilité au remboursement selon la législation ${regime.nomPays}.`,
    );
  }

  // 5. Débit TVA élevé (> 20% du CA HT)
  if (typePosition === "DEBIT_TVA" && caHT_XOF > 0 && soldeTVA_XOF / caHT_XOF > 0.2) {
    alerteConformite.push(
      `⚠️ Charge TVA nette élevée (${((soldeTVA_XOF / caHT_XOF) * 100).toFixed(1)}% du CA HT). ` +
        `Vérifier la déductibilité des achats et la bonne imputation des comptes 445.`,
    );
  }

  // 6. Alerte si TVA déductible > TVA collectée de plus de 50%
  if (tvaDeductible_XOF > tvaCollectee_XOF * 1.5 && tvaCollectee_XOF > 0) {
    alerteConformite.push(
      `⚠️ TVA déductible très supérieure à la TVA collectée (ratio ${(tvaDeductible_XOF / tvaCollectee_XOF).toFixed(2)}x). ` +
        `Anomalie possible : contrôler les pièces justificatives.`,
    );
  }

  return {
    soldeTVA_XOF,
    typePosition,
    alerteConformite,
    tauxEffectif_pct,
    regimePays: regime,
    tvaTheorique_XOF,
    ecartTvaTheorique_XOF,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Résultat de la comparaison multi-pays
// ─────────────────────────────────────────────────────────────────────────────
export interface ResultatComparaisonPays {
  pays: string;
  nomPays: string;
  tvaTheorique_XOF: number;
  tauxNormal_pct: number;
  tauxReduit_pct?: number;
  seuilAssujettissement_XOF: number;
  periodiciteDeclaration: string;
  economieVsPays: Record<string, number>; // delta TVA vs chaque autre pays
}

// ─────────────────────────────────────────────────────────────────────────────
// comparerTVAUEMOA
// Calcule la TVA théorique sur un CA HT pour chaque pays UEMOA
// et génère une matrice d'économies comparatives.
// ─────────────────────────────────────────────────────────────────────────────
export function comparerTVAUEMOA(
  caHT_XOF: number,
): Array<ResultatComparaisonPays> {
  const pays = Object.values(REFERENTIEL_TVA_UEMOA);

  // Calcul de la TVA théorique pour chaque pays
  const resultats = pays.map((regime) => ({
    pays: regime.pays,
    nomPays: regime.nomPays,
    tvaTheorique_XOF: Math.round(caHT_XOF * (regime.tauxNormal_pct / 100)),
    tauxNormal_pct: regime.tauxNormal_pct,
    tauxReduit_pct: regime.tauxReduit_pct,
    seuilAssujettissement_XOF: regime.seuilAssujettissement_XOF,
    periodiciteDeclaration: regime.periodiciteDeclaration,
    economieVsPays: {} as Record<string, number>,
  }));

  // Calcul des économies (différences) entre chaque paire de pays
  for (const ref of resultats) {
    for (const autre of resultats) {
      if (ref.pays !== autre.pays) {
        // Positif = économie (moins de TVA vs autre pays), Négatif = surcoût
        ref.economieVsPays[autre.pays] = autre.tvaTheorique_XOF - ref.tvaTheorique_XOF;
      }
    }
  }

  // Trier par taux normal croissant, puis par TVA théorique croissante
  resultats.sort((a, b) => {
    if (a.tauxNormal_pct !== b.tauxNormal_pct) {
      return a.tauxNormal_pct - b.tauxNormal_pct;
    }
    return a.tvaTheorique_XOF - b.tvaTheorique_XOF;
  });

  return resultats;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires exportés
// ─────────────────────────────────────────────────────────────────────────────

/** Retourne la liste de tous les pays UEMOA couverts */
export function getPaysList(): RegimeTVA[] {
  return Object.values(REFERENTIEL_TVA_UEMOA);
}

/** Retourne le régime TVA d'un pays (ou undefined si inconnu) */
export function getRegimeTVA(pays: string): RegimeTVA | undefined {
  return REFERENTIEL_TVA_UEMOA[pays.toUpperCase()];
}
