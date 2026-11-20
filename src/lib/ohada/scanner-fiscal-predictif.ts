/**
 * Scanner Prédictif de Contrôle Fiscal DGID / DGI
 * Algorithmes d'inspection fiscale automatisée calqués sur les filtres de ciblage
 * des administrations fiscales d'Afrique de l'Ouest et Centrale (DGID Sénégal, DGI Côte d'Ivoire, etc.)
 */

export interface DonneeControleFiscal {
  exercice: number;
  pays: string; // "SN", "CI", "CM", "BJ", "TG", "BF", etc.
  chiffreAffairesComptable_XOF: number; // Compte 70
  totalCaDeclareTva_XOF: number; // Somme des 12 déclarations mensuelles
  tvaCollecteeComptabilisee_XOF: number;
  tvaCollecteeDeclaree_XOF: number;
  dettesFournisseursDormantesPlus4Ans_XOF: number; // Compte 401 créditeur inactif > 4 ans
  amortissementsComptabilises_XOF: number;
  plafondAmortissementsFiscaux_XOF: number;
  honorairesEtCommissionsComptabilises_XOF: number;
  honorairesDeclaresSurEtatRecapitulatif_XOF: number; // Déclaration 2483 / DAS
  chargesSousTraitance_XOF: number;
  justificatifsSousTraitanceValides: boolean;
  ecartInventaireStock_XOF: number; // Compte 31 vs inventaire physique
  tauxIsApplicable?: number; // Défaut 30%
  tauxTvaApplicable?: number; // Défaut 18%
}

export type SeveriteAnomalie = "CRITIQUE" | "ELEVEE" | "MOYENNE" | "FAIBLE";

export interface ChefRedressementPredictif {
  id: string;
  intitule: string;
  articleLegal: string;
  baseRedressement_XOF: number;
  rappelImpotPrincipal_XOF: number;
  natureImpot: "IS" | "TVA" | "AMENDE" | "RETENUE_SOURCE";
  penaliteEstimee_XOF: number; // 40% par défaut en cas de manquement constaté
  interetsRetardEstimes_XOF: number; // ~12 mois de retard moyen à 0.5% ou 1% / mois
  expositionTotale_XOF: number;
  severite: SeveriteAnomalie;
  explicationFiscale: string;
  actionRegularisation: string;
}

export interface RapportScannerFiscal {
  exercice: number;
  pays: string;
  scoreConformiteFiscale: number; // 0 à 100 (100 = risque nul)
  niveauRisqueGlobal: "FAIBLE" | "MODERE" | "ELEVE" | "ALERTE_MAXIMALE";
  totalRedressementPrincipal_XOF: number;
  totalPenalitesEtInterets_XOF: number;
  expositionFinanciereTotale_XOF: number;
  chefsDeRedressement: ChefRedressementPredictif[];
  recommandationsPrioritaires: string[];
}

export function scannerRisquesFiscaux(data: DonneeControleFiscal): RapportScannerFiscal {
  const tauxIs = data.tauxIsApplicable ?? 0.30;
  const tauxTva = data.tauxTvaApplicable ?? 0.18;
  const chefs: ChefRedressementPredictif[] = [];

  // 1. Cadrage CA TVA vs CA Liasse (Minoration de recettes présumée)
  const ecartCaTva = data.chiffreAffairesComptable_XOF - data.totalCaDeclareTva_XOF;
  if (ecartCaTva > 500_000) {
    const rappelTva = Math.round(ecartCaTva * tauxTva);
    const penalite = Math.round(rappelTva * 0.40);
    const interets = Math.round(rappelTva * 0.10); // ~10% annuel
    chefs.push({
      id: "CADRAGE_CA_TVA",
      intitule: "Écart de chiffre d'affaires entre la Liasse et les déclarations de TVA",
      articleLegal: "Art. 352 et suivants du CGI / LPF - Présomption de recettes dissimulées",
      baseRedressement_XOF: ecartCaTva,
      rappelImpotPrincipal_XOF: rappelTva,
      natureImpot: "TVA",
      penaliteEstimee_XOF: penalite,
      interetsRetardEstimes_XOF: interets,
      expositionTotale_XOF: rappelTva + penalite + interets,
      severite: "CRITIQUE",
      explicationFiscale: `Le CA comptabilisé excède de ${ecartCaTva.toLocaleString("fr-FR")} XOF les bases déclarées en TVA mensuelle. L'Administration effectue une reconstitution d'office de la TVA éludée.`,
      actionRegularisation: "Déposer une déclaration rectificative de TVA avec paiement spontané avant toute notification d'avis de vérification.",
    });
  }

  // 2. Dettes fournisseurs prescrites (Prescription quadriennale)
  if (data.dettesFournisseursDormantesPlus4Ans_XOF > 0) {
    const baseDette = data.dettesFournisseursDormantesPlus4Ans_XOF;
    const rappelIs = Math.round(baseDette * tauxIs);
    const penalite = Math.round(rappelIs * 0.40);
    const interets = Math.round(rappelIs * 0.10);
    chefs.push({
      id: "PRESCRIPTION_FOURNISSEURS",
      intitule: "Dettes fournisseurs éteintes non réintégrées (Prescription quadriennale)",
      articleLegal: "Art. 18 & 24 CGI / Règle de la prescription quadriennale des dettes",
      baseRedressement_XOF: baseDette,
      rappelImpotPrincipal_XOF: rappelIs,
      natureImpot: "IS",
      penaliteEstimee_XOF: penalite,
      interetsRetardEstimes_XOF: interets,
      expositionTotale_XOF: rappelIs + penalite + interets,
      severite: "ELEVEE",
      explicationFiscale: `Les soldes créditeurs fournisseurs dormants depuis plus de 4 ans (${baseDette.toLocaleString("fr-FR")} XOF) sont considérés par le fisc comme des passifs injustifiés ou éteints devant être rapportés au résultat imposable.`,
      actionRegularisation: "Justifier par des relances formelles de créance ou constater l'abandon/extinction au compte 84 (HAO) en régularisant le résultat.",
    });
  }

  // 3. Amortissements excédentaires non déductibles
  if (data.amortissementsComptabilises_XOF > data.plafondAmortissementsFiscaux_XOF) {
    const excesAmortissement = data.amortissementsComptabilises_XOF - data.plafondAmortissementsFiscaux_XOF;
    const rappelIs = Math.round(excesAmortissement * tauxIs);
    const penalite = Math.round(rappelIs * 0.25);
    const interets = Math.round(rappelIs * 0.08);
    chefs.push({
      id: "AMORTISSEMENT_EXCEDENTAIRE",
      intitule: "Dépassement des plafonds d'amortissement fiscalement admis",
      articleLegal: "Art. 9 CGI / Barème des taux d'amortissement maximum",
      baseRedressement_XOF: excesAmortissement,
      rappelImpotPrincipal_XOF: rappelIs,
      natureImpot: "IS",
      penaliteEstimee_XOF: penalite,
      interetsRetardEstimes_XOF: interets,
      expositionTotale_XOF: rappelIs + penalite + interets,
      severite: "MOYENNE",
      explicationFiscale: `Dotations comptables supérieures au barème fiscal pour un montant de ${excesAmortissement.toLocaleString("fr-FR")} XOF. Réintégration fiscale requise au tableau 2058.`,
      actionRegularisation: "Réintégrer l'excédent au tableau 13 de la liasse SYSCOHADA (Réintégrations fiscales).",
    });
  }

  // 4. Honoraires et commissions non déclarés sur l'état récapitulatif
  if (data.honorairesEtCommissionsComptabilises_XOF > data.honorairesDeclaresSurEtatRecapitulatif_XOF) {
    const honorairesOublies = data.honorairesEtCommissionsComptabilises_XOF - data.honorairesDeclaresSurEtatRecapitulatif_XOF;
    // Amende légale de rejet de charge : réintégration fiscale à l'IS + amende forfaitaire (25%)
    const rappelIs = Math.round(honorairesOublies * tauxIs);
    const amendeRejet = Math.round(honorairesOublies * 0.25);
    chefs.push({
      id: "HONORAIRES_NON_DECLARES",
      intitule: "Honoraires et commissions non reportés sur l'état récapitulatif annuel",
      articleLegal: "Art. 200 CGI / Déclaration annuelle des tiers (DAS / État 2483)",
      baseRedressement_XOF: honorairesOublies,
      rappelImpotPrincipal_XOF: rappelIs,
      natureImpot: "AMENDE",
      penaliteEstimee_XOF: amendeRejet,
      interetsRetardEstimes_XOF: 0,
      expositionTotale_XOF: rappelIs + amendeRejet,
      severite: "ELEVEE",
      explicationFiscale: `Défaut de déclaration nominative pour ${honorairesOublies.toLocaleString("fr-FR")} XOF d'honoraires. Sanctionné par la perte du droit à déduction et amende de 25%.`,
      actionRegularisation: "Déposer d'urgence un état récapitulatif rectificatif auprès de la Direction des Grandes Entreprises ou du centre des impôts.",
    });
  }

  // 5. Charges de sous-traitance suspectes
  if (data.chargesSousTraitance_XOF > 0 && !data.justificatifsSousTraitanceValides) {
    const rappelIs = Math.round(data.chargesSousTraitance_XOF * tauxIs);
    const penalite = Math.round(rappelIs * 0.40);
    const interets = Math.round(rappelIs * 0.10);
    chefs.push({
      id: "SOUS_TRAITANCE_INJUSTIFIEE",
      intitule: "Sous-traitance sans contrat probant ou preuve de matérialité",
      articleLegal: "Art. 8 CGI / Actes anormaux de gestion et factures de complaisance",
      baseRedressement_XOF: data.chargesSousTraitance_XOF,
      rappelImpotPrincipal_XOF: rappelIs,
      natureImpot: "IS",
      penaliteEstimee_XOF: penalite,
      interetsRetardEstimes_XOF: interets,
      expositionTotale_XOF: rappelIs + penalite + interets,
      severite: "CRITIQUE",
      explicationFiscale: "Factures de sous-traitance dépourvues de livrables matériels, fiches d'attachement ou contrats écrits. Risque de rejet pour facture fictive.",
      actionRegularisation: "Constituer immédiatement le dossier de justificatifs de matérialité (rapports d'intervention, échanges d'emails, PV de réception).",
    });
  }

  // 6. Écarts d'inventaire de stocks non justifiés
  if (data.ecartInventaireStock_XOF > 0) {
    const ecartStock = data.ecartInventaireStock_XOF;
    const rappelIs = Math.round(ecartStock * tauxIs);
    const penalite = Math.round(rappelIs * 0.25);
    chefs.push({
      id: "ECART_STOCK",
      intitule: "Écart inexpliqué entre inventaire physique et inventaire permanent",
      articleLegal: "Art. 13 CGI / Valorisation obligatoire des stocks SYSCOHADA",
      baseRedressement_XOF: ecartStock,
      rappelImpotPrincipal_XOF: rappelIs,
      natureImpot: "IS",
      penaliteEstimee_XOF: penalite,
      interetsRetardEstimes_XOF: 0,
      expositionTotale_XOF: rappelIs + penalite,
      severite: "MOYENNE",
      explicationFiscale: `Écart de stock de ${ecartStock.toLocaleString("fr-FR")} XOF. Présomption de ventes occultes non déclarées ou de minoration de stock final.`,
      actionRegularisation: "Établir un procès-verbal de mise au rebut ou de démarque inconnue validé par la direction.",
    });
  }

  // Totaux
  const totalPrincipal = chefs.reduce((acc, c) => acc + c.rappelImpotPrincipal_XOF, 0);
  const totalPenalites = chefs.reduce((acc, c) => acc + c.penaliteEstimee_XOF + c.interetsRetardEstimes_XOF, 0);
  const expositionTotale = totalPrincipal + totalPenalites;

  // Calcul du score de conformité fiscale (100 - pénalités selon gravité)
  let score = 100;
  for (const chef of chefs) {
    if (chef.severite === "CRITIQUE") score -= 30;
    else if (chef.severite === "ELEVEE") score -= 20;
    else if (chef.severite === "MOYENNE") score -= 10;
    else score -= 5;
  }
  const scoreFinal = Math.max(0, score);

  let niveauRisque: RapportScannerFiscal["niveauRisqueGlobal"] = "FAIBLE";
  if (scoreFinal < 40) niveauRisque = "ALERTE_MAXIMALE";
  else if (scoreFinal < 65) niveauRisque = "ELEVE";
  else if (scoreFinal < 85) niveauRisque = "MODERE";

  const recommandations: string[] = [];
  if (chefs.some((c) => c.id === "CADRAGE_CA_TVA")) {
    recommandations.push("URGENT : Régulariser l'écart TVA/Liasse par déclaration rectificative spontanée pour éviter la qualification de manœuvres frauduleuses.");
  }
  if (chefs.some((c) => c.id === "PRESCRIPTION_FOURNISSEURS")) {
    recommandations.push("Procéder à l'apurement juridique des comptes 401 dormants de plus de 4 ans pour neutraliser le risque de redressement sur dette éteinte.");
  }
  if (chefs.some((c) => c.id === "HONORAIRES_NON_DECLARES")) {
    recommandations.push("Déposer l'état récapitulatif des honoraires (DAS) sous huitaine pour éviter l'amende de 25% et le rejet de charge.");
  }
  if (recommandations.length === 0) {
    recommandations.push("Dossier fiscal exemplaire : aucun risque de redressement majeur détecté sur les 6 algorithmes de contrôle DGID.");
  }

  return {
    exercice: data.exercice,
    pays: data.pays,
    scoreConformiteFiscale: scoreFinal,
    niveauRisqueGlobal: niveauRisque,
    totalRedressementPrincipal_XOF: totalPrincipal,
    totalPenalitesEtInterets_XOF: totalPenalites,
    expositionFinanciereTotale_XOF: expositionTotale,
    chefsDeRedressement: chefs,
    recommandationsPrioritaires: recommandations,
  };
}
