/**
 * Cockpit DuPont & Cash Waterfall Storytelling (Fathom/Syft Standard)
 *
 * Décomposition ROE par arbre DuPont (Marge Nette × Rotation Actif × Levier),
 * Waterfall de trésorerie de l'EBE à la trésorerie nette,
 * et Cash Runway en mois de survie.
 * Calculs 100% SYSCOHADA (XOF), narratif en français.
 */

export interface InputDuPont {
  exercice: number;
  // Compte de résultat (XOF)
  resultatNet_XOF: number;
  chiffreAffaires_XOF: number;
  // Bilan (XOF)
  totalActif_XOF: number;
  capitauxPropres_XOF: number;
  // Optionnel N-1 pour comparaison
  exerciceN1?: number;
  resultatNetN1_XOF?: number;
  chiffreAffairesN1_XOF?: number;
  totalActifN1_XOF?: number;
  capitauxPropresN1_XOF?: number;
}

export interface DecompositionDuPont {
  exercice: number;
  // Composantes
  margeNette_pct: number;         // Résultat net / CA
  rotationActif: number;          // CA / Total actif
  levierFinancier: number;        // Total actif / Capitaux propres
  // ROE final
  roe_pct: number;                // Marge × Rotation × Levier
  // Comparaison N-1
  roeN1_pct?: number;
  deltaRoe_pts?: number;
  // Narratif
  diagnosticDuPont: string;
}

export interface EtapeWaterfall {
  libelle: string;
  montant_XOF: number;
  cumul_XOF: number;
  type: "POSITIF" | "NEGATIF" | "TOTAL";
  commentaire?: string;
}

export interface WaterfallTresorerie {
  etapes: EtapeWaterfall[];
  tresorerieNette_XOF: number;
  cashFlowOperationnel_XOF: number;
  cashFlowInvestissement_XOF: number;
  cashFlowFinancement_XOF: number;
}

export interface CashRunway {
  tresorerieActuelle_XOF: number;
  fluxMensuelNegatif_XOF: number;
  runwayMois: number;            // Nombre de mois de trésorerie restante
  runwayJours: number;
  alerteNiveau: "SECURISE" | "VIGILANCE" | "CRITIQUE" | "INSOLVABLE";
  narratifRunway: string;
}

export interface RapportDuPontCashflow {
  societeRaisonSociale: string;
  exercice: number;
  decompositionDuPont: DecompositionDuPont;
  waterfall: WaterfallTresorerie;
  cashRunway: CashRunway;
  syntheseStrategique: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calcul arbre DuPont
// ─────────────────────────────────────────────────────────────────────────────

export function calculerDuPont(input: InputDuPont): DecompositionDuPont {
  const margeNette = input.chiffreAffaires_XOF !== 0
    ? (input.resultatNet_XOF / input.chiffreAffaires_XOF) * 100
    : 0;
  const rotationActif = input.totalActif_XOF !== 0
    ? input.chiffreAffaires_XOF / input.totalActif_XOF
    : 0;
  const levier = input.capitauxPropres_XOF !== 0
    ? input.totalActif_XOF / input.capitauxPropres_XOF
    : 0;
  const roe = (margeNette / 100) * rotationActif * levier * 100;

  let roeN1: number | undefined;
  let deltaRoe: number | undefined;
  if (
    input.resultatNetN1_XOF !== undefined &&
    input.chiffreAffairesN1_XOF !== undefined &&
    input.totalActifN1_XOF !== undefined &&
    input.capitauxPropresN1_XOF !== undefined &&
    input.chiffreAffairesN1_XOF !== 0 &&
    input.totalActifN1_XOF !== 0 &&
    input.capitauxPropresN1_XOF !== 0
  ) {
    const mN1 = (input.resultatNetN1_XOF / input.chiffreAffairesN1_XOF) * 100;
    const rN1 = input.chiffreAffairesN1_XOF / input.totalActifN1_XOF;
    const lN1 = input.totalActifN1_XOF / input.capitauxPropresN1_XOF;
    roeN1 = (mN1 / 100) * rN1 * lN1 * 100;
    deltaRoe = roe - roeN1;
  }

  // Narratif diagnostique
  let diagnostic = "";
  if (roe >= 15) {
    diagnostic = `ROE de ${roe.toFixed(1)}% — Performance excellente. La rentabilité des capitaux propres dépasse le seuil de référence de 15%. `;
  } else if (roe >= 8) {
    diagnostic = `ROE de ${roe.toFixed(1)}% — Performance correcte mais améliorable. `;
  } else if (roe >= 0) {
    diagnostic = `ROE de ${roe.toFixed(1)}% — Faible rendement des capitaux propres. Axes d'amélioration prioritaires : `;
  } else {
    diagnostic = `ROE négatif (${roe.toFixed(1)}%) — Destruction de valeur. `;
  }

  if (margeNette < 3) diagnostic += `Marge nette insuffisante (${margeNette.toFixed(1)}%) : réduire les charges d'exploitation. `;
  if (rotationActif < 0.5) diagnostic += `Rotation de l'actif faible (${rotationActif.toFixed(2)}x) : optimiser l'utilisation des immobilisations. `;
  if (levier > 4) diagnostic += `Effet de levier élevé (${levier.toFixed(1)}x) : surveiller l'endettement et le ratio de couverture. `;
  if (deltaRoe !== undefined) {
    diagnostic += deltaRoe > 0
      ? `Progression du ROE de +${deltaRoe.toFixed(1)} pts par rapport à N-1.`
      : `Dégradation du ROE de ${deltaRoe.toFixed(1)} pts par rapport à N-1.`;
  }

  return {
    exercice: input.exercice,
    margeNette_pct: parseFloat(margeNette.toFixed(2)),
    rotationActif: parseFloat(rotationActif.toFixed(3)),
    levierFinancier: parseFloat(levier.toFixed(2)),
    roe_pct: parseFloat(roe.toFixed(2)),
    roeN1_pct: roeN1 !== undefined ? parseFloat(roeN1.toFixed(2)) : undefined,
    deltaRoe_pts: deltaRoe !== undefined ? parseFloat(deltaRoe.toFixed(2)) : undefined,
    diagnosticDuPont: diagnostic.trim(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Waterfall de trésorerie
// ─────────────────────────────────────────────────────────────────────────────

export function genererWaterfallTresorerie(
  ebe_XOF: number,
  variationBFR_XOF: number,        // négatif = dégradation du BFR
  investissements_XOF: number,      // toujours positif (capex)
  remboursementsEmprunts_XOF: number,
  impots_XOF: number
): WaterfallTresorerie {
  const etapes: EtapeWaterfall[] = [];
  let cumul = 0;

  const ajouter = (libelle: string, montant: number, commentaire?: string) => {
    cumul += montant;
    etapes.push({
      libelle,
      montant_XOF: montant,
      cumul_XOF: cumul,
      type: montant >= 0 ? "POSITIF" : "NEGATIF",
      commentaire,
    });
  };

  ajouter("Excédent Brut d'Exploitation (EBE)", ebe_XOF, "Point de départ SYSCOHADA");
  ajouter("Variation du Besoin en Fonds de Roulement", variationBFR_XOF,
    variationBFR_XOF < 0 ? "Dégradation du BFR — stocks/créances en hausse" : "Amélioration du BFR");
  const cashFlowOp = cumul;

  ajouter("Investissements (Capex)", -Math.abs(investissements_XOF), "Acquisition d'immobilisations corporelles/incorporelles");
  const cashFlowInv = -Math.abs(investissements_XOF);

  ajouter("Remboursements d'emprunts", -Math.abs(remboursementsEmprunts_XOF), "Capital remboursé sur dettes financières");
  const cashFlowFin = -Math.abs(remboursementsEmprunts_XOF);

  ajouter("Impôts sur les bénéfices (IS/IMF)", -Math.abs(impots_XOF), "IS ou IMF selon résultat fiscal");

  etapes.push({
    libelle: "Trésorerie Nette Générée",
    montant_XOF: cumul,
    cumul_XOF: cumul,
    type: "TOTAL",
    commentaire: "Flux de trésorerie net disponible sur la période",
  });

  return {
    etapes,
    tresorerieNette_XOF: cumul,
    cashFlowOperationnel_XOF: cashFlowOp,
    cashFlowInvestissement_XOF: cashFlowInv,
    cashFlowFinancement_XOF: cashFlowFin,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cash Runway
// ─────────────────────────────────────────────────────────────────────────────

export function calculerCashRunway(
  tresorerieActuelle_XOF: number,
  fluxMensuelNegatif_XOF: number   // toujours positif (burn mensuel)
): CashRunway {
  const burn = Math.abs(fluxMensuelNegatif_XOF);
  const runwayMois = burn > 0 ? tresorerieActuelle_XOF / burn : Infinity;
  const runwayJours = runwayMois * 30;

  let alerteNiveau: CashRunway["alerteNiveau"];
  if (tresorerieActuelle_XOF <= 0) alerteNiveau = "INSOLVABLE";
  else if (runwayMois < 1) alerteNiveau = "CRITIQUE";
  else if (runwayMois < 3) alerteNiveau = "VIGILANCE";
  else alerteNiveau = "SECURISE";

  const tresStr = tresorerieActuelle_XOF.toLocaleString("fr-FR");
  const burnStr = burn.toLocaleString("fr-FR");

  const narratif =
    alerteNiveau === "INSOLVABLE"
      ? `🔴 INSOLVABILITÉ — Trésorerie épuisée. Dépôt de bilan à risque immédiat. Activer le plan AUPCAP.`
      : alerteNiveau === "CRITIQUE"
      ? `🔴 CRITIQUE — Runway de ${Math.round(runwayJours)} jours seulement (${tresStr} XOF / ${burnStr} XOF/mois). Levée de fonds ou réduction drastique des charges requise en urgence.`
      : alerteNiveau === "VIGILANCE"
      ? `🟠 VIGILANCE — Runway de ${runwayMois.toFixed(1)} mois (${tresStr} XOF). Accélérer le recouvrement des créances et réviser le plan de trésorerie prévisionnel.`
      : `🟢 SÉCURISÉ — Runway de ${runwayMois.toFixed(0)} mois de trésorerie (${tresStr} XOF). Situation confortable. Surveiller le BFR trimestriellement.`;

  return {
    tresorerieActuelle_XOF,
    fluxMensuelNegatif_XOF: burn,
    runwayMois: parseFloat(runwayMois.toFixed(1)),
    runwayJours: Math.round(runwayJours),
    alerteNiveau,
    narratifRunway: narratif,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rapport complet
// ─────────────────────────────────────────────────────────────────────────────

export function genererRapportDuPontCashflow(
  societeRaisonSociale: string,
  inputDuPont: InputDuPont,
  ebe_XOF: number,
  variationBFR_XOF: number,
  investissements_XOF: number,
  remboursementsEmprunts_XOF: number,
  impots_XOF: number,
  tresorerieActuelle_XOF: number,
  burnMensuel_XOF: number
): RapportDuPontCashflow {
  const decompositionDuPont = calculerDuPont(inputDuPont);
  const waterfall = genererWaterfallTresorerie(
    ebe_XOF, variationBFR_XOF, investissements_XOF, remboursementsEmprunts_XOF, impots_XOF
  );
  const cashRunway = calculerCashRunway(tresorerieActuelle_XOF, burnMensuel_XOF);

  const synthese = [
    `Analyse stratégique ${societeRaisonSociale} — Exercice ${inputDuPont.exercice}.`,
    decompositionDuPont.diagnosticDuPont,
    `Cash Flow opérationnel : ${waterfall.cashFlowOperationnel_XOF.toLocaleString("fr-FR")} XOF.`,
    cashRunway.narratifRunway,
  ].join(" ");

  return {
    societeRaisonSociale,
    exercice: inputDuPont.exercice,
    decompositionDuPont,
    waterfall,
    cashRunway,
    syntheseStrategique: synthese,
  };
}
