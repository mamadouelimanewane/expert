/**
 * Moteur de Scoring PME pour l'octroi de crédit bancaire
 * Selon les critères de la BCEAO et des banques commerciales UEMOA.
 *
 * Barème :
 *   - Ratios financiers : 60 pts
 *   - Ancienneté        : 15 pts
 *   - Garanties         : 15 pts
 *   - Historique crédit : 10 pts
 * Total : 100 pts
 *
 * Notation : A (80-100), B (65-79), C (50-64), D (35-49), E (<35)
 * Taux BCEAO de base 3,5 % + prime de risque selon notation
 */

export interface DossierCreditPME {
  raisonSociale: string;
  secteurActivite: string;
  paysUEMOA: string; // "SN", "CI", "BJ", "BF", "ML", "GW", "NE", "TG"
  // Données financières (XOF)
  chiffreAffaires_XOF: number;
  resultatNet_XOF: number;
  capitauxPropres_XOF: number;
  dettesFinancieres_XOF: number;
  tresorerie_XOF: number;
  ebe_XOF: number; // Excédent Brut d'Exploitation
  // Données qualitatives
  ancienneteAns: number;
  nombreEmployes: number;
  garantiesDisponibles_XOF: number;
  historiqueCredit: "BON" | "MOYEN" | "MAUVAIS" | "AUCUN";
}

export interface ScoreBanquePME {
  scoreTotal: number; // 0 à 100
  notation: "A" | "B" | "C" | "D" | "E"; // A=excellent, E=refus
  ratiosFinanciers: {
    ratioEndettement_pct: number; // Dettes / CP
    ratioSolvabilite_pct: number; // CP / Total actif approx
    ratioLiquidite_pct: number; // Tréso / Dettes CT
    ratioRentabilite_pct: number; // RN / CA
    ratioServiceDette_pct: number; // EBE / Dettes financières
  };
  capaciteRemboursement_XOF: number; // EBE utilisable pour service de la dette
  montantCreditRecommande_XOF: number;
  dureeCreditRecommandee_mois: number;
  tauxInteret_pct: number; // taux indicatif BCEAO + prime risque
  pointsForts: string[];
  pointsFaibles: string[];
  conditionsRequises: string[];
  avisCredit: "FAVORABLE" | "FAVORABLE_SOUS_CONDITIONS" | "DEFAVORABLE";
  narratifBanquier: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function arrondir2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Score des ratios financiers (0 à 60 pts)
 * Chaque ratio contribue proportionnellement.
 */
function scorerRatiosFinanciers(
  ratioEndettement_pct: number,
  ratioSolvabilite_pct: number,
  ratioLiquidite_pct: number,
  ratioRentabilite_pct: number,
  ratioServiceDette_pct: number
): number {
  // 1. Ratio d'endettement (Dettes / CP) → idéal < 100%, mauvais > 300%
  //    Max 15 pts
  let ptEndett = 0;
  if (ratioEndettement_pct <= 50) ptEndett = 15;
  else if (ratioEndettement_pct <= 100) ptEndett = 12;
  else if (ratioEndettement_pct <= 150) ptEndett = 9;
  else if (ratioEndettement_pct <= 200) ptEndett = 6;
  else if (ratioEndettement_pct <= 300) ptEndett = 3;
  else ptEndett = 0;

  // 2. Ratio de solvabilité (CP / Total actif approx) → idéal > 30%
  //    Max 10 pts
  let ptSolvab = 0;
  if (ratioSolvabilite_pct >= 40) ptSolvab = 10;
  else if (ratioSolvabilite_pct >= 30) ptSolvab = 8;
  else if (ratioSolvabilite_pct >= 20) ptSolvab = 5;
  else if (ratioSolvabilite_pct >= 10) ptSolvab = 2;
  else ptSolvab = 0;

  // 3. Ratio de liquidité (Tréso / Dettes CT) → idéal > 20%
  //    Max 10 pts (estimation dettes CT = 40% de dettes financières)
  let ptLiquid = 0;
  if (ratioLiquidite_pct >= 50) ptLiquid = 10;
  else if (ratioLiquidite_pct >= 30) ptLiquid = 8;
  else if (ratioLiquidite_pct >= 20) ptLiquid = 6;
  else if (ratioLiquidite_pct >= 10) ptLiquid = 3;
  else if (ratioLiquidite_pct >= 0) ptLiquid = 1;
  else ptLiquid = 0;

  // 4. Ratio de rentabilité (RN / CA) → idéal > 5%
  //    Max 10 pts
  let ptRentab = 0;
  if (ratioRentabilite_pct >= 10) ptRentab = 10;
  else if (ratioRentabilite_pct >= 5) ptRentab = 8;
  else if (ratioRentabilite_pct >= 2) ptRentab = 5;
  else if (ratioRentabilite_pct >= 0) ptRentab = 2;
  else ptRentab = 0;

  // 5. Ratio de service de la dette (EBE / Dettes financières) → idéal > 30%
  //    Max 15 pts
  let ptService = 0;
  if (ratioServiceDette_pct >= 50) ptService = 15;
  else if (ratioServiceDette_pct >= 30) ptService = 12;
  else if (ratioServiceDette_pct >= 20) ptService = 8;
  else if (ratioServiceDette_pct >= 10) ptService = 4;
  else ptService = 0;

  return ptEndett + ptSolvab + ptLiquid + ptRentab + ptService; // 0-60
}

/** Score ancienneté (0 à 15 pts) */
function scorerAnciennete(ancienneteAns: number): number {
  if (ancienneteAns >= 10) return 15;
  if (ancienneteAns >= 7) return 12;
  if (ancienneteAns >= 5) return 9;
  if (ancienneteAns >= 3) return 6;
  if (ancienneteAns >= 1) return 3;
  return 0;
}

/**
 * Score garanties (0 à 15 pts)
 * Couverture = garanties / montant crédit recommandé ≈ 3×EBE
 * On mesure la couverture par rapport au CA comme proxy.
 */
function scorerGaranties(garanties_XOF: number, ca_XOF: number): number {
  if (ca_XOF <= 0) return 0;
  const couverture_pct = (garanties_XOF / ca_XOF) * 100;
  if (couverture_pct >= 100) return 15;
  if (couverture_pct >= 75) return 12;
  if (couverture_pct >= 50) return 9;
  if (couverture_pct >= 25) return 5;
  if (couverture_pct > 0) return 2;
  return 0;
}

/** Score historique crédit (0 à 10 pts) */
function scorerHistoriqueCredit(historique: DossierCreditPME["historiqueCredit"]): number {
  switch (historique) {
    case "BON":
      return 10;
    case "MOYEN":
      return 6;
    case "AUCUN":
      return 4;
    case "MAUVAIS":
      return 0;
  }
}

/** Notation lettre selon le score total */
function determinerNotation(score: number): ScoreBanquePME["notation"] {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "E";
}

/** Taux d'intérêt indicatif BCEAO (base 3,5%) + prime de risque selon notation */
function calculerTauxInteret(notation: ScoreBanquePME["notation"]): number {
  const primesRisque: Record<ScoreBanquePME["notation"], number> = {
    A: 1.5,
    B: 2.5,
    C: 3.5,
    D: 5.0,
    E: 7.0,
  };
  return arrondir2(3.5 + primesRisque[notation]);
}

/** Durée de crédit recommandée en mois selon notation */
function calculerDureeCredit(notation: ScoreBanquePME["notation"]): number {
  switch (notation) {
    case "A":
      return 84; // 7 ans
    case "B":
      return 60; // 5 ans
    case "C":
      return 48; // 4 ans
    case "D":
      return 24; // 2 ans
    case "E":
      return 12; // 1 an (si tout de même accordé sous conditions très strictes)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fonction principale
// ─────────────────────────────────────────────────────────────────────────────

export function evaluerDossierCreditPME(dossier: DossierCreditPME): ScoreBanquePME {
  const {
    chiffreAffaires_XOF: ca,
    resultatNet_XOF: rn,
    capitauxPropres_XOF: cp,
    dettesFinancieres_XOF: dettes,
    tresorerie_XOF: treso,
    ebe_XOF: ebe,
    ancienneteAns,
    garantiesDisponibles_XOF: garanties,
    historiqueCredit,
    raisonSociale,
  } = dossier;

  // ── Calcul des ratios ────────────────────────────────────────────────────
  // Total actif approx = CP + Dettes financières
  const totalActifApprox = cp + dettes;

  const ratioEndettement_pct = cp > 0 ? arrondir2((dettes / cp) * 100) : 999;
  const ratioSolvabilite_pct =
    totalActifApprox > 0 ? arrondir2((cp / totalActifApprox) * 100) : 0;
  // Dettes court terme estimées à 40 % des dettes financières totales
  const dettesCT = dettes * 0.4;
  const ratioLiquidite_pct =
    dettesCT > 0 ? arrondir2((treso / dettesCT) * 100) : treso > 0 ? 100 : 0;
  const ratioRentabilite_pct = ca > 0 ? arrondir2((rn / ca) * 100) : 0;
  const ratioServiceDette_pct =
    dettes > 0 ? arrondir2((ebe / dettes) * 100) : ebe > 0 ? 100 : 0;

  // ── Scoring ──────────────────────────────────────────────────────────────
  const scoreRatios = scorerRatiosFinanciers(
    ratioEndettement_pct,
    ratioSolvabilite_pct,
    ratioLiquidite_pct,
    ratioRentabilite_pct,
    ratioServiceDette_pct
  );
  const scoreAnciennete = scorerAnciennete(ancienneteAns);
  const scoreGaranties = scorerGaranties(garanties, ca);
  const scoreHistorique = scorerHistoriqueCredit(historiqueCredit);

  const scoreTotal = clamp(
    Math.round(scoreRatios + scoreAnciennete + scoreGaranties + scoreHistorique),
    0,
    100
  );

  const notation = determinerNotation(scoreTotal);
  const tauxInteret_pct = calculerTauxInteret(notation);
  const dureeCreditRecommandee_mois = calculerDureeCredit(notation);

  // ── Capacité de remboursement et montant recommandé ─────────────────────
  // Capacité = 70 % de l'EBE (réserve prudentielle de 30 %)
  const capaciteRemboursement_XOF = Math.round(ebe * 0.7);
  // Montant crédit ≤ 3 × EBE annuel
  const montantCreditMax_XOF = ebe * 3;
  // Selon notation, on accorde une fraction de ce maximum
  const fractionSelonNotation: Record<ScoreBanquePME["notation"], number> = {
    A: 1.0,
    B: 0.8,
    C: 0.6,
    D: 0.4,
    E: 0.2,
  };
  const montantCreditRecommande_XOF = Math.round(
    montantCreditMax_XOF * fractionSelonNotation[notation]
  );

  // ── Points forts / faibles ───────────────────────────────────────────────
  const pointsForts: string[] = [];
  const pointsFaibles: string[] = [];

  if (ratioEndettement_pct <= 100) pointsForts.push("Niveau d'endettement maîtrisé (ratio < 100 %)");
  else if (ratioEndettement_pct > 200) pointsFaibles.push(`Surndettement critique : ratio d'endettement à ${ratioEndettement_pct.toFixed(1)} %`);
  else pointsFaibles.push(`Endettement élevé : ratio à ${ratioEndettement_pct.toFixed(1)} %`);

  if (ratioSolvabilite_pct >= 30) pointsForts.push("Bonne solvabilité (fonds propres > 30 % du bilan)");
  else pointsFaibles.push(`Solvabilité insuffisante : capitaux propres à ${ratioSolvabilite_pct.toFixed(1)} % du bilan`);

  if (ratioLiquidite_pct >= 30) pointsForts.push("Liquidité satisfaisante");
  else if (ratioLiquidite_pct < 10) pointsFaibles.push("Trésorerie insuffisante par rapport aux dettes à court terme");

  if (ratioRentabilite_pct >= 5) pointsForts.push(`Bonne rentabilité nette (${ratioRentabilite_pct.toFixed(1)} % du CA)`);
  else if (ratioRentabilite_pct < 0) pointsFaibles.push("Résultat net négatif : activité déficitaire");
  else pointsFaibles.push(`Rentabilité nette faible (${ratioRentabilite_pct.toFixed(1)} % du CA)`);

  if (ratioServiceDette_pct >= 30) pointsForts.push("Capacité de service de la dette confortable (EBE/Dettes > 30 %)");
  else if (ratioServiceDette_pct < 10) pointsFaibles.push("Capacité de remboursement critique : EBE insuffisant face aux dettes");

  if (ancienneteAns >= 5) pointsForts.push(`Entreprise ancienne et établie (${ancienneteAns} ans d'activité)`);
  else if (ancienneteAns < 2) pointsFaibles.push(`Entreprise récente (${ancienneteAns} an(s) d'existence)`);

  if (historiqueCredit === "BON") pointsForts.push("Historique de crédit excellent");
  else if (historiqueCredit === "MAUVAIS") pointsFaibles.push("Historique de crédit défavorable – incidents de paiement signalés");

  if (garanties >= montantCreditRecommande_XOF) pointsForts.push("Garanties couvrant intégralement le crédit sollicité");
  else if (garanties < montantCreditRecommande_XOF * 0.5) pointsFaibles.push("Garanties insuffisantes par rapport au crédit recommandé");

  // ── Conditions requises ──────────────────────────────────────────────────
  const conditionsRequises: string[] = [];
  if (notation === "B" || notation === "C") {
    conditionsRequises.push("Apport personnel minimum de 20 % du montant du crédit");
    conditionsRequises.push("Garantie réelle (hypothèque ou nantissement) sur les actifs financés");
  }
  if (notation === "C" || notation === "D") {
    conditionsRequises.push("Caution solidaire du(des) dirigeant(s)");
    conditionsRequises.push("Domiciliation du chiffre d'affaires dans la banque prêteuse");
    conditionsRequises.push("Présentation d'un plan d'affaires sur 3 ans");
  }
  if (notation === "D") {
    conditionsRequises.push("Garantie complémentaire via un fonds de garantie (FAGACE, FSA, etc.)");
    conditionsRequises.push("Révision de la situation financière dans 12 mois");
  }
  if (historiqueCredit === "MAUVAIS") {
    conditionsRequises.push("Régularisation préalable de tout incident de paiement antérieur");
  }
  if (ratioEndettement_pct > 200) {
    conditionsRequises.push("Plan de désendettement formalisé avant octroi du crédit");
  }

  // ── Avis de crédit ───────────────────────────────────────────────────────
  let avisCredit: ScoreBanquePME["avisCredit"];
  if (notation === "A" || notation === "B") {
    avisCredit = "FAVORABLE";
  } else if (notation === "C") {
    avisCredit = "FAVORABLE_SOUS_CONDITIONS";
  } else if (notation === "D") {
    // Défavorable si ratio service de dette critique
    avisCredit =
      ratioServiceDette_pct < 10 || historiqueCredit === "MAUVAIS"
        ? "DEFAVORABLE"
        : "FAVORABLE_SOUS_CONDITIONS";
  } else {
    avisCredit = "DEFAVORABLE";
  }

  // ── Narratif banquier ────────────────────────────────────────────────────
  const avisTexte =
    avisCredit === "FAVORABLE"
      ? "favorablement"
      : avisCredit === "FAVORABLE_SOUS_CONDITIONS"
      ? "favorablement, sous conditions"
      : "défavorablement";

  const narratifBanquier =
    `Le dossier de ${raisonSociale} a été analysé selon les normes prudentielles BCEAO/UEMOA. ` +
    `La PME obtient un score global de ${scoreTotal}/100, lui conférant la notation **${notation}**. ` +
    `Le comité d'analyse se prononce **${avisTexte}** sur la demande de financement. ` +
    (montantCreditRecommande_XOF > 0
      ? `Le montant de crédit recommandé est de ${montantCreditRecommande_XOF.toLocaleString("fr-FR")} XOF ` +
        `sur ${dureeCreditRecommandee_mois} mois au taux indicatif de ${tauxInteret_pct} %. `
      : "") +
    (conditionsRequises.length > 0
      ? `Des conditions préalables sont nécessaires avant tout décaissement.`
      : "Aucune condition suspensive majeure identifiée.");

  return {
    scoreTotal,
    notation,
    ratiosFinanciers: {
      ratioEndettement_pct,
      ratioSolvabilite_pct,
      ratioLiquidite_pct,
      ratioRentabilite_pct,
      ratioServiceDette_pct,
    },
    capaciteRemboursement_XOF,
    montantCreditRecommande_XOF,
    dureeCreditRecommandee_mois,
    tauxInteret_pct,
    pointsForts,
    pointsFaibles,
    conditionsRequises,
    avisCredit,
    narratifBanquier,
  };
}
