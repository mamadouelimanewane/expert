/**
 * Moteur de Notation Bancaire & Montage de Dossier de Crédit BCEAO / COBAC
 * Analyse de solvabilité prudentielle, tableau d'amortissement,
 * et éligibilité au dispositif BCEAO de soutien au financement des PME/PMI.
 */

export interface DemandeCredit {
  montant_XOF: number;
  dureeMois: number;
  differeMois: number;
  tauxInteretAnnuel_pct: number; // Ex: 8.5%
  objetFinancement: "EQUIPEMENT_MATERIEL" | "BFR_CAMPAGNE" | "IMMOBILIER_PRO" | "EXPANSION_REGIONALE";
  valeurGaranties_XOF: number;
  typeGarantie: "HYPOTHEQUE" | "NANTISSEMENT_MATERIEL" | "CAUTION_DIRIGEANT" | "GAGE_STOCKS";
}

export interface DonneesFinancieresBancaires {
  raisonSociale: string;
  secteur: string;
  exercice: number;
  chiffreAffaires_XOF: number;
  ebe_XOF: number;
  rex_XOF: number;
  resultatNet_XOF: number;
  caf_XOF: number; // Capacité d'autofinancement
  dettesFinancieresActuelles_XOF: number;
  tresorerieNette_XOF: number;
  capitauxPropres_XOF: number;
  totalBilan_XOF: number;
}

export interface EcheanceAmortissementAnnuelle {
  annee: number;
  capitalDebut_XOF: number;
  annuite_XOF: number;
  amortissementCapital_XOF: number;
  interets_XOF: number;
  capitalFin_XOF: number;
}

export interface RatioBancaire {
  code: string;
  libelle: string;
  valeur: number;
  normePrudentielle: string;
  conforme: boolean;
  score: number; // 0-20
}

export interface DossierCreditComplet {
  financier: DonneesFinancieresBancaires;
  demande: DemandeCredit;
  annuitePrevisionnelle_XOF: number;
  ratiosBancaires: RatioBancaire[];
  scoreGlobal: number; // 0 à 100
  classeRisqueBceao: "A_PRIME" | "A" | "B" | "C" | "D_DEGRADE";
  avisComiteCredit: "ACCORD_RECOMMANDE" | "ACCORD_SOUS_CONDITIONS" | "REFUS_PROBABLE";
  eligibiliteDispositifBceaoPme: {
    eligible: boolean;
    criteresValides: string[];
    criteresManquants: string[];
    avantageTauxRefinancement: string;
  };
  tableauAmortissement: EcheanceAmortissementAnnuelle[];
  syntheseComite: string;
}

export function calculerAmortissementAnnuel(demande: DemandeCredit): {
  annuiteMoyenne: number;
  tableau: EcheanceAmortissementAnnuelle[];
} {
  const dureeAnnees = Math.max(1, Math.ceil(demande.dureeMois / 12));
  const taux = demande.tauxInteretAnnuel_pct / 100;
  const montant = demande.montant_XOF;

  // Calcul annuité constante standard = C * t / (1 - (1+t)^-n)
  let annuiteConstante = 0;
  if (taux > 0) {
    annuiteConstante = Math.round((montant * taux) / (1 - Math.pow(1 + taux, -dureeAnnees)));
  } else {
    annuiteConstante = Math.round(montant / dureeAnnees);
  }

  const tableau: EcheanceAmortissementAnnuelle[] = [];
  let capitalRestant = montant;

  for (let an = 1; an <= dureeAnnees; an++) {
    const interets = Math.round(capitalRestant * taux);
    let amortissement = annuiteConstante - interets;
    if (an === dureeAnnees || amortissement > capitalRestant) {
      amortissement = capitalRestant;
    }
    const annuiteReelle = amortissement + interets;
    const capitalFin = Math.max(0, capitalRestant - amortissement);

    tableau.push({
      annee: an,
      capitalDebut_XOF: capitalRestant,
      annuite_XOF: annuiteReelle,
      amortissementCapital_XOF: amortissement,
      interets_XOF: interets,
      capitalFin_XOF: capitalFin,
    });

    capitalRestant = capitalFin;
  }

  return {
    annuiteMoyenne: annuiteConstante,
    tableau,
  };
}

export function evaluerDossierCreditBceao(
  financier: DonneesFinancieresBancaires,
  demande: DemandeCredit
): DossierCreditComplet {
  const { annuiteMoyenne, tableau } = calculerAmortissementAnnuel(demande);

  // 1. Ratio Capacité de Remboursement Annuelle (CAF / Annuité totale future)
  const annuiteTotale = annuiteMoyenne + (financier.dettesFinancieresActuelles_XOF * 0.25);
  const ratioCapacite = annuiteTotale > 0 ? Number((financier.caf_XOF / annuiteTotale).toFixed(2)) : 0;
  const scoreCapacite = ratioCapacite >= 2.0 ? 25 : ratioCapacite >= 1.3 ? 20 : ratioCapacite >= 1.0 ? 10 : 0;

  // 2. Ratio de Levier Financier (Dette totale / EBE)
  const detteTotale = financier.dettesFinancieresActuelles_XOF + demande.montant_XOF;
  const ratioLevier = financier.ebe_XOF > 0 ? Number((detteTotale / financier.ebe_XOF).toFixed(2)) : 99;
  const scoreLevier = ratioLevier <= 2.5 ? 25 : ratioLevier <= 3.5 ? 18 : ratioLevier <= 4.5 ? 10 : 0;

  // 3. Ratio d'Autonomie Financière (Capitaux Propres / Total Bilan)
  const ratioAutonomie = financier.totalBilan_XOF > 0
    ? Number(((financier.capitauxPropres_XOF / financier.totalBilan_XOF) * 100).toFixed(2))
    : 0;
  const scoreAutonomie = ratioAutonomie >= 30 ? 20 : ratioAutonomie >= 20 ? 15 : ratioAutonomie >= 10 ? 8 : 0;

  // 4. Ratio de Couverture des Intérêts (REX / Intérêts annuels)
  const interetsAnnuels = Math.round(demande.montant_XOF * (demande.tauxInteretAnnuel_pct / 100));
  const ratioCouvertureInterets = interetsAnnuels > 0 ? Number((financier.rex_XOF / interetsAnnuels).toFixed(2)) : 10;
  const scoreCouverture = ratioCouvertureInterets >= 3.0 ? 15 : ratioCouvertureInterets >= 1.5 ? 10 : 0;

  // 5. Ratio de Couverture des Garanties (Valeur Garanties / Montant Crédit)
  const ratioGaranties = demande.montant_XOF > 0
    ? Number(((demande.valeurGaranties_XOF / demande.montant_XOF) * 100).toFixed(2))
    : 0;
  const scoreGaranties = ratioGaranties >= 120 ? 15 : ratioGaranties >= 100 ? 10 : ratioGaranties >= 70 ? 5 : 0;

  const scoreGlobal = scoreCapacite + scoreLevier + scoreAutonomie + scoreCouverture + scoreGaranties;

  const ratiosBancaires: RatioBancaire[] = [
    {
      code: "CAPACITE_REMBOURSEMENT",
      libelle: "Capacité de Remboursement (CAF / Annuité)",
      valeur: ratioCapacite,
      normePrudentielle: "≥ 1.30 (Idéal ≥ 2.0)",
      conforme: ratioCapacite >= 1.3,
      score: scoreCapacite,
    },
    {
      code: "LEVIER_DETTE",
      libelle: "Levier d'Endettement (Dette Nette / EBE)",
      valeur: ratioLevier,
      normePrudentielle: "< 3.50 années d'EBE",
      conforme: ratioLevier < 3.5,
      score: scoreLevier,
    },
    {
      code: "AUTONOMIE_FINANCIERE",
      libelle: "Autonomie Financière (Fonds Propres / Bilan)",
      valeur: ratioAutonomie,
      normePrudentielle: "≥ 20.0%",
      conforme: ratioAutonomie >= 20,
      score: scoreAutonomie,
    },
    {
      code: "COUVERTURE_INTERETS",
      libelle: "Couverture des Frais Financiers (REX / Intérêts)",
      valeur: ratioCouvertureInterets,
      normePrudentielle: "≥ 2.50",
      conforme: ratioCouvertureInterets >= 2.5,
      score: scoreCouverture,
    },
    {
      code: "COUVERTURE_GARANTIES",
      libelle: "Quotité de Garantie Réelle",
      valeur: ratioGaranties,
      normePrudentielle: "≥ 100% du nominal",
      conforme: ratioGaranties >= 100,
      score: scoreGaranties,
    },
  ];

  // Classement de Risque BCEAO
  let classeRisque: DossierCreditComplet["classeRisqueBceao"] = "C";
  let avis: DossierCreditComplet["avisComiteCredit"] = "ACCORD_SOUS_CONDITIONS";

  if (scoreGlobal >= 85) {
    classeRisque = "A_PRIME";
    avis = "ACCORD_RECOMMANDE";
  } else if (scoreGlobal >= 70) {
    classeRisque = "A";
    avis = "ACCORD_RECOMMANDE";
  } else if (scoreGlobal >= 55) {
    classeRisque = "B";
    avis = "ACCORD_SOUS_CONDITIONS";
  } else if (scoreGlobal >= 40) {
    classeRisque = "C";
    avis = "ACCORD_SOUS_CONDITIONS";
  } else {
    classeRisque = "D_DEGRADE";
    avis = "REFUS_PROBABLE";
  }

  // Éligibilité Dispositif BCEAO PME (Circulaire BCEAO de soutien au financement)
  const criteresValides: string[] = [];
  const criteresManquants: string[] = [];

  if (financier.chiffreAffaires_XOF <= 1_000_000_000) {
    criteresValides.push("Chiffre d'affaires ≤ 1 milliard XOF (Seuil PME BCEAO)");
  } else {
    criteresManquants.push("Chiffre d'affaires excède le plafond PME de 1 Md XOF");
  }

  if (ratioAutonomie >= 15) {
    criteresValides.push("Fonds propres supérieurs au seuil minimal de 15% du total bilan");
  } else {
    criteresManquants.push("Sous-capitalisation : Fonds propres < 15% du bilan");
  }

  if (financier.resultatNet_XOF > 0) {
    criteresValides.push("Exercice bénéficiaire avec capacité d'autofinancement positive");
  } else {
    criteresManquants.push("Résultat net déficitaire");
  }

  const eligibleBceao = criteresManquants.length === 0;

  const syntheseComite = `La société ${financier.raisonSociale} présente un profil financier noté ${classeRisque} (Score : ${scoreGlobal}/100). La capacité de remboursement prévisionnelle ressort à ${ratioCapacite}x l'annuité d'emprunt. Avis du Comité des Risques : ${avis.replace(/_/g, " ")}.`;

  return {
    financier,
    demande,
    annuitePrevisionnelle_XOF: annuiteMoyenne,
    ratiosBancaires,
    scoreGlobal,
    classeRisqueBceao: classeRisque,
    avisComiteCredit: avis,
    eligibiliteDispositifBceaoPme: {
      eligible: eligibleBceao,
      criteresValides,
      criteresManquants,
      avantageTauxRefinancement: eligibleBceao
        ? "Éligible au refinancement bonifié au guichet spécial PME de la BCEAO (Bonification de taux d'intérêt de 150 à 200 bps)."
        : "Non éligible en l'état : renforcement des capitaux propres requis.",
    },
    tableauAmortissement: tableau,
    syntheseComite,
  };
}
