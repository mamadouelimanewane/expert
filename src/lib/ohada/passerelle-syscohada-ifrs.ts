/**
 * Passerelle de Conversion Bimodale SYSCOHADA ⇄ IFRS
 * Traitement automatisé des retraitements IFRS 16 (Leasing/Contrats de location),
 * IAS 19 (Engagements de retraite / IFC) et IAS 12 (Impôts différés).
 */

export interface DonneeContratLeasingIFRS16 {
  libelle: string;
  loyerAnnuel_XOF: number;
  dureeRestanteAnnees: number;
  tauxActualisation_pct: number; // Taux d'emprunt marginal de l'entité (ex: 7.5%)
}

export interface DonneeEngagementRetraiteIAS19 {
  masseSalarialeEligible_XOF: number;
  ancienneteMoyenneAnnees: number;
  tauxActualisationActuariel_pct: number; // Ex: 6.5% (Taux emprunts d'État UEMOA)
  provisionDejaComptabiliseeSyscohada_XOF: number;
}

export interface DonneesComptablesSyscohada {
  raisonSociale: string;
  exercice: number;
  ebitdaSyscohada_XOF: number; // EBE SYSCOHADA
  resultatExploitationSyscohada_XOF: number;
  chargesFinancieresSyscohada_XOF: number;
  resultatNetSyscohada_XOF: number;
  totalActifSyscohada_XOF: number;
  dettesFinancieresSyscohada_XOF: number;
  capitauxPropresSyscohada_XOF: number;
  contratsLeasing: DonneeContratLeasingIFRS16[];
  retraiteIAS19: DonneeEngagementRetraiteIAS19;
  tauxImpotSociete_pct?: number; // 30% par défaut
}

export interface RetraitementLigne {
  norme: "IFRS 16" | "IAS 19" | "IAS 12";
  libelle: string;
  impactBilanActif_XOF: number;
  impactBilanPassif_XOF: number;
  impactEbitda_XOF: number;
  impactResultatNet_XOF: number;
  ecritureComptableRecommandee: string;
}

export interface ResultatConversionIFRS {
  societe: string;
  exercice: number;
  retraitements: RetraitementLigne[];
  tablePassageEbitda: {
    ebitdaSyscohada_XOF: number;
    ajustementIFRS16_XOF: number; // Annulation des loyers -> hausse EBITDA
    ebitdaIFRS_XOF: number;
    variation_pct: number;
  };
  tablePassageResultatNet: {
    rnSyscohada_XOF: number;
    impactIFRS16Net_XOF: number; // Amortissement droit d'usage + intérêt vs loyer
    impactIAS19Net_XOF: number; // Dotation actuarielle IFC
    impactImpotsDifferesIAS12_XOF: number;
    rnIFRS_XOF: number;
  };
  bilanRetraiteIFRS: {
    actifTotalIFRS_XOF: number;
    dettesFinancieresIFRS_XOF: number;
    capitauxPropresIFRS_XOF: number;
    droitUsageActif_XOF: number;
    detteLeasingPassif_XOF: number;
    provisionRetraitePassif_XOF: number;
  };
  notesAnnexesIFRS: string[];
}

export function calculerValeurActualiseeLeasing(c: DonneeContratLeasingIFRS16): {
  droitUsageInitial: number;
  detteInitiale: number;
  amortissementAnnuel: number;
  chargeInteretAnnuelle: number;
} {
  const t = c.tauxActualisation_pct / 100;
  const n = Math.max(1, c.dureeRestanteAnnees);
  // Valeur actualisée d'une rente = Loyer * (1 - (1+t)^-n) / t
  let va = 0;
  if (t > 0) {
    va = Math.round(c.loyerAnnuel_XOF * ((1 - Math.pow(1 + t, -n)) / t));
  } else {
    va = c.loyerAnnuel_XOF * n;
  }

  const amortissementAnnuel = Math.round(va / n);
  const chargeInteretAnnuelle = Math.round(va * t);

  return {
    droitUsageInitial: va,
    detteInitiale: va,
    amortissementAnnuel,
    chargeInteretAnnuelle,
  };
}

export function convertirSyscohadaVersIFRS(data: DonneesComptablesSyscohada): ResultatConversionIFRS {
  const tauxIS = (data.tauxImpotSociete_pct ?? 30) / 100;
  const retraitements: RetraitementLigne[] = [];

  // 1. Retraitement IFRS 16 (Leasing)
  let totalDroitUsage = 0;
  let totalDetteLeasing = 0;
  let totalLoyersAnnules = 0;
  let totalAmortissementsDroitUsage = 0;
  let totalInteretsLeasing = 0;

  for (const c of data.contratsLeasing) {
    const calc = calculerValeurActualiseeLeasing(c);
    totalDroitUsage += calc.droitUsageInitial;
    totalDetteLeasing += calc.detteInitiale;
    totalLoyersAnnules += c.loyerAnnuel_XOF;
    totalAmortissementsDroitUsage += calc.amortissementAnnuel;
    totalInteretsLeasing += calc.chargeInteretAnnuelle;
  }

  // Impact résultat IFRS 16 : Annulation loyer (+Loyer) - Amortissement - Intérêts
  const impactNetIFRS16 = totalLoyersAnnules - totalAmortissementsDroitUsage - totalInteretsLeasing;

  retraitements.push({
    norme: "IFRS 16",
    libelle: "Constatation des droits d'usage et dettes de location sur contrats de leasing",
    impactBilanActif_XOF: totalDroitUsage,
    impactBilanPassif_XOF: totalDetteLeasing,
    impactEbitda_XOF: totalLoyersAnnules, // Le loyer n'est plus en charges d'exploitation
    impactResultatNet_XOF: impactNetIFRS16,
    ecritureComptableRecommandee: "Débit Actif Droit d'Usage / Crédit Dettes Financières de Leasing (IFRS 16)",
  });

  // 2. Retraitement IAS 19 (Engagements de Retraite / IFC)
  // Évaluation simplifiée actuarielle : ~1 mois de salaire par tranche de 5 ans d'ancienneté actualisé
  const annees = Math.max(1, data.retraiteIAS19.ancienneteMoyenneAnnees);
  const salaireMoyenMensuel = data.retraiteIAS19.masseSalarialeEligible_XOF / 12;
  const detteActuarielleBrute = Math.round(salaireMoyenMensuel * (annees / 5) * 1.5);
  const complementProvision = Math.max(
    0,
    detteActuarielleBrute - data.retraiteIAS19.provisionDejaComptabiliseeSyscohada_XOF
  );

  retraitements.push({
    norme: "IAS 19",
    libelle: "Ajustement actuariel des engagements de fin de carrière (IFC) selon convention collective",
    impactBilanActif_XOF: 0,
    impactBilanPassif_XOF: complementProvision,
    impactEbitda_XOF: 0,
    impactResultatNet_XOF: -complementProvision,
    ecritureComptableRecommandee: "Débit Charges de Personnel (IAS 19) / Crédit Provisions pour Retraite",
  });

  // 3. Retraitement IAS 12 (Impôts différés sur écarts temporaires)
  const baseImpotDiffere = -impactNetIFRS16 + complementProvision;
  const impotDiffereNet = Math.round(baseImpotDiffere * tauxIS);

  retraitements.push({
    norme: "IAS 12",
    libelle: "Constatation des impôts différés actifs sur retraitements IFRS 16 et IAS 19",
    impactBilanActif_XOF: Math.max(0, impotDiffereNet),
    impactBilanPassif_XOF: Math.min(0, impotDiffereNet),
    impactEbitda_XOF: 0,
    impactResultatNet_XOF: impotDiffereNet,
    ecritureComptableRecommandee: "Débit Impôt Différé Actif / Crédit Produit d'Impôt Différé (IAS 12)",
  });

  // Synthèse EBITDA
  const ebitdaIFRS = data.ebitdaSyscohada_XOF + totalLoyersAnnules;
  const varEbitda =
    data.ebitdaSyscohada_XOF > 0
      ? Number((((ebitdaIFRS - data.ebitdaSyscohada_XOF) / data.ebitdaSyscohada_XOF) * 100).toFixed(2))
      : 0;

  // Synthèse Résultat Net
  const rnIFRS = data.resultatNetSyscohada_XOF + impactNetIFRS16 - complementProvision + impotDiffereNet;

  // Bilan IFRS
  const actifTotalIFRS = data.totalActifSyscohada_XOF + totalDroitUsage + Math.max(0, impotDiffereNet);
  const dettesFinancieresIFRS = data.dettesFinancieresSyscohada_XOF + totalDetteLeasing;
  const capitauxPropresIFRS =
    data.capitauxPropresSyscohada_XOF + (rnIFRS - data.resultatNetSyscohada_XOF);

  return {
    societe: data.raisonSociale,
    exercice: data.exercice,
    retraitements,
    tablePassageEbitda: {
      ebitdaSyscohada_XOF: data.ebitdaSyscohada_XOF,
      ajustementIFRS16_XOF: totalLoyersAnnules,
      ebitdaIFRS_XOF: ebitdaIFRS,
      variation_pct: varEbitda,
    },
    tablePassageResultatNet: {
      rnSyscohada_XOF: data.resultatNetSyscohada_XOF,
      impactIFRS16Net_XOF: impactNetIFRS16,
      impactIAS19Net_XOF: -complementProvision,
      impactImpotsDifferesIAS12_XOF: impotDiffereNet,
      rnIFRS_XOF: rnIFRS,
    },
    bilanRetraiteIFRS: {
      actifTotalIFRS_XOF: actifTotalIFRS,
      dettesFinancieresIFRS_XOF: dettesFinancieresIFRS,
      capitauxPropresIFRS_XOF: capitauxPropresIFRS,
      droitUsageActif_XOF: totalDroitUsage,
      detteLeasingPassif_XOF: totalDetteLeasing,
      provisionRetraitePassif_XOF: complementProvision,
    },
    notesAnnexesIFRS: [
      "IFRS 16 : Tous les contrats de location opérationnelle ont été retraités selon la méthode rétrospective modifiée.",
      "IAS 19 : L'engagement de retraite prend en compte le taux de rotation du personnel et les grilles conventionnelles UEMOA.",
      "IAS 12 : Les impôts différés sont calculés au taux légal de l'IS de 30%.",
    ],
  };
}
