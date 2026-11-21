/**
 * Agent IA CFO Storytelling — Cabinet Expert OHADA 360
 * Traduction vulgarisée des chiffres comptables en récits stratégiques pour DG & Conseil
 * Inspiré de Fathom & Syft Analytics
 */

export interface InputFinancierCFO {
  societeNom: string;
  secteurActivite: string;
  exercice: number;
  chiffreAffairesN_XOF: number;
  chiffreAffairesN1_XOF: number;
  margeBruteN_XOF: number;
  margeBruteN1_XOF: number;
  ebeN_XOF: number; // Excédent Brut d'Exploitation
  ebeN1_XOF: number;
  resultatNetN_XOF: number;
  resultatNetN1_XOF: number;
  bfrJoursCA: number;
  dsoClientsJours: number;
  dpoFournisseursJours: number;
  tresorerieNette_XOF: number;
  cashBurnMensuelMoyen_XOF: number;
}

export interface KpisCFOStorytelling {
  croissanceCA_pct: number;
  croissanceEBE_pct: number;
  tauxMargeBrute_pct: number;
  tauxMargeEBE_pct: number;
  tauxMargeNette_pct: number;
  cashRunwayMois: number;
  statutTresorerie: "TRESORERIE_SAINE" | "VIGILANCE_BFR" | "ALERTE_LIQUIDITE_CRITIQUE";
}

export interface RapportCFOStorytelling {
  societeNom: string;
  exercice: number;
  dateGeneration: string;
  kpis: KpisCFOStorytelling;
  executiveSummary: string[];
  recitRentabilite: string;
  recitTresorerieEtBFR: string;
  planActionStrategique: {
    priorite: "IMMEDIATE" | "COURT_TERME" | "MOYEN_TERME";
    levier: string;
    description: string;
    gainEstime_XOF?: number;
  }[];
  noteSyntheseConseilAdministration: string;
}

export function genererStorytellingFinancier(input: InputFinancierCFO): RapportCFOStorytelling {
  const diffCA = input.chiffreAffairesN_XOF - input.chiffreAffairesN1_XOF;
  const croissanceCA =
    input.chiffreAffairesN1_XOF > 0
      ? Math.round((diffCA / input.chiffreAffairesN1_XOF) * 1000) / 10
      : 0;

  const diffEBE = input.ebeN_XOF - input.ebeN1_XOF;
  const croissanceEBE =
    input.ebeN1_XOF > 0
      ? Math.round((diffEBE / input.ebeN1_XOF) * 1000) / 10
      : 0;

  const margeBrutePct =
    input.chiffreAffairesN_XOF > 0
      ? Math.round((input.margeBruteN_XOF / input.chiffreAffairesN_XOF) * 1000) / 10
      : 0;

  const margeEbePct =
    input.chiffreAffairesN_XOF > 0
      ? Math.round((input.ebeN_XOF / input.chiffreAffairesN_XOF) * 1000) / 10
      : 0;

  const margeNettePct =
    input.chiffreAffairesN_XOF > 0
      ? Math.round((input.resultatNetN_XOF / input.chiffreAffairesN_XOF) * 1000) / 10
      : 0;

  // Calcul du Cash Runway en mois
  let runwayMois = 999;
  if (input.cashBurnMensuelMoyen_XOF > 0) {
    runwayMois =
      Math.round((input.tresorerieNette_XOF / input.cashBurnMensuelMoyen_XOF) * 10) / 10;
  }

  let statut: KpisCFOStorytelling["statutTresorerie"] = "TRESORERIE_SAINE";
  if (runwayMois < 3 || input.tresorerieNette_XOF < 0) {
    statut = "ALERTE_LIQUIDITE_CRITIQUE";
  } else if (runwayMois < 6 || input.bfrJoursCA > 75) {
    statut = "VIGILANCE_BFR";
  }

  const kpis: KpisCFOStorytelling = {
    croissanceCA_pct: croissanceCA,
    croissanceEBE_pct: croissanceEBE,
    tauxMargeBrute_pct: margeBrutePct,
    tauxMargeEBE_pct: margeEbePct,
    tauxMargeNette_pct: margeNettePct,
    cashRunwayMois: runwayMois,
    statutTresorerie: statut,
  };

  // 1. Executive Summary
  const executiveSummary = [
    `Chiffre d'affaires de ${(input.chiffreAffairesN_XOF / 1_000_000).toFixed(1)} M XOF, en ${croissanceCA >= 0 ? "hausse" : "recul"} de ${Math.abs(croissanceCA)}% par rapport à l'exercice précédent.`,
    `Performance opérationnelle solide : EBE à ${(input.ebeN_XOF / 1_000_000).toFixed(1)} M XOF (${margeEbePct}% de marge opérationnelle), dégageant un résultat net de ${(input.resultatNetN_XOF / 1_000_000).toFixed(1)} M XOF.`,
    `Autonomie financière : Visibilité de trésorerie estimée à ${runwayMois > 50 ? "> 24" : runwayMois} mois de dépenses au rythme actuel de cash burn.`,
  ];

  // 2. Récit Rentabilité
  const recitRentabilite = `L'exercice ${input.exercice} confirme la rentabilité du modèle économique de ${input.societeNom}. Avec un taux de marge brute de ${margeBrutePct}%, l'entreprise génère une valeur ajoutée robuste permettant de couvrir ses frais fixes d'exploitation. Le ratio EBE/CA de ${margeEbePct}% positionne la société dans le quartile supérieur des standards régionaux OHADA du secteur ${input.secteurActivite}.`;

  // 3. Diagnostic Cash & BFR
  const recitTresorerieEtBFR = `Le cycle d'exploitation mobilise actuellement ${input.bfrJoursCA} jours de chiffre d'affaires. Le délai de règlement clients (DSO) s'établit à ${input.dsoClientsJours} jours, tandis que le crédit fournisseurs (DPO) atteint ${input.dpoFournisseursJours} jours. ${input.dsoClientsJours > input.dpoFournisseursJours ? "Attention : Le décalage défavorable entre encaissements clients et décaissements fournisseurs crée une pression structurelle sur la trésorerie." : "L'équilibre des délais de paiement est favorable à l'autofinancement."}`;

  // 4. Plan d'actions stratégiques
  const planActionStrategique: RapportCFOStorytelling["planActionStrategique"] = [
    {
      priorite: "IMMEDIATE",
      levier: "Optimisation du recouvrement clients (DSO)",
      description: `Ramener le délai client de ${input.dsoClientsJours} jours à 45 jours via des relances automatisées et des escomptes pour paiement comptant Wave/OM.`,
      gainEstime_XOF: Math.round((input.chiffreAffairesN_XOF / 360) * Math.max(0, input.dsoClientsJours - 45)),
    },
    {
      priorite: "COURT_TERME",
      levier: "Renégociation des conditions d'achats fournisseurs",
      description: "Négocier des délais de règlement à 60 jours auprès des 5 principaux fournisseurs stratégiques.",
    },
    {
      priorite: "MOYEN_TERME",
      levier: "Politique de réinvestissement et distribution de dividendes",
      description: `Affecter au moins 50% du résultat net (${(input.resultatNetN_XOF / 1_000_000).toFixed(1)} M XOF) en réserves statutaires pour renforcer les fonds propres.`,
    },
  ];

  // 5. Note intégrale pour le Conseil d'Administration
  const noteConseil = `================================================================================
NOTE DE SYNTHÈSE STRATÉGIQUE — DIRECTION GÉNÉRALE & CONSEIL D'ADMINISTRATION
SOCIÉTÉ : ${input.societeNom.toUpperCase()}
EXERCICE : ${input.exercice} | SECTEUR : ${input.secteurActivite.toUpperCase()}
PRÉSENTÉ PAR : AGENT CFO STORYTELLING (CABINET EXPERT OHADA 360)
================================================================================

1. TRAJECTOIRE DE CROISSANCE ET PERFORMANCE ÉCONOMIQUE
Au cours de l'exercice ${input.exercice}, ${input.societeNom} a réalisé un chiffre d'affaires de
${input.chiffreAffairesN_XOF.toLocaleString("fr-FR")} XOF, matérialisant une dynamique de ${croissanceCA >= 0 ? "+" : ""}${croissanceCA}%
par rapport à l'exercice N-1. L'EBE ressort à ${input.ebeN_XOF.toLocaleString("fr-FR")} XOF (${margeEbePct}% du CA).

2. DIAGNOSTIC DE TRÉSORERIE ET CASH RUNWAY
La trésorerie nette s'élève à ${input.tresorerieNette_XOF.toLocaleString("fr-FR")} XOF.
- Statut : ${statut.replace(/_/g, " ")}
- Runway estimé : ${runwayMois > 50 ? "> 24" : runwayMois} mois d'exploitation
- BFR : ${input.bfrJoursCA} jours de CA (DSO Clients : ${input.dsoClientsJours} j / DPO Fournisseurs : ${input.dpoFournisseursJours} j)

3. DÉCISIONS STRATÉGIQUES SOUMISES À L'APPROBATION DU CONSEIL
- Priorité 1 : Validation du plan d'accélération du recouvrement clients.
- Priorité 2 : Affectation prudente du résultat net (${input.resultatNetN_XOF.toLocaleString("fr-FR")} XOF) en réserves pour consolider la notation bancaire BCEAO.
================================================================================`;

  return {
    societeNom: input.societeNom,
    exercice: input.exercice,
    dateGeneration: new Date().toISOString().slice(0, 10),
    kpis,
    executiveSummary,
    recitRentabilite,
    recitTresorerieEtBFR,
    planActionStrategique,
    noteSyntheseConseilAdministration: noteConseil,
  };
}
