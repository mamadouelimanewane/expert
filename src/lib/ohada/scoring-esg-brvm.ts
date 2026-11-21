/**
 * Moteur de Scoring ESG / RSE BRVM & Financement Vert
 * Inspiré de Sustainalytics & S&P Global ESG pour les marchés financiers de l'UEMOA (BRVM).
 *
 * Évalue une société cotée ou candidate à l'emprunt obligataire vert (Green Bonds BOAD/BAD) :
 * - Pilier E (Environnemental - 35 pts) : Bilan carbone (Scope 1+2), consommation énergétique, eau, gestion déchets
 * - Pilier S (Social - 35 pts) : Parité genre & gouvernance féminine, sécurité & taux accidents, formation, emplois locaux
 * - Pilier G (Gouvernance - 30 pts) : Indépendance administrateurs, comité d'audit, politique LCB-FT, transparence rémunérations
 */

export interface CriteresEnvironnement {
  emissionsGES_tCO2e: number;
  partEnergieRenouvelable_pct: number;
  consommationEau_m3: number;
  tauxRecyclageDechets_pct: number;
  certificationsVertes: string[]; // ex: ["ISO 14001", "ISO 50001"]
}

export interface CriteresSocial {
  effectifTotal: number;
  tauxFeminisation_pct: number;
  tauxFeminisationCadres_pct: number;
  tauxAccidentTravail_pct: number;
  heuresFormationParSalarie: number;
  tauxEmploiNationalLocal_pct: number;
}

export interface CriteresGouvernance {
  nombreAdministrateurs: number;
  partAdministrateursIndependants_pct: number;
  presenceComiteAudit: boolean;
  presenceComiteRSE: boolean;
  politiqueAntiCorruptionLCBFT: boolean;
  publicationTransparenteRemuneration: boolean;
  separationPresidentEtDG: boolean;
}

export interface InputScoringESGBRVM {
  societeRaisonSociale: string;
  secteur: string;
  exercice: number;
  environnement: CriteresEnvironnement;
  social: CriteresSocial;
  gouvernance: CriteresGouvernance;
}

export interface ScorePilier {
  score: number; // sur le max
  scoreMax: number;
  pourcentage: number;
  appreciation: "EXCELLENT" | "SATISFAISANT" | "A_AMELIORER" | "CRITIQUE";
  pointsCles: string[];
}

export interface RapportScoringESGBRVM {
  societeRaisonSociale: string;
  secteur: string;
  exercice: number;
  scoreGlobal_100: number;
  notationBRVM: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
  eligibiliteGreenBondBOAD: boolean;
  pilierEnvironnement: ScorePilier;
  pilierSocial: ScorePilier;
  pilierGouvernance: ScorePilier;
  recommandationsESG: string[];
  syntheseInvestisseurs: string;
}

export function evaluerPilierEnvironnement(env: CriteresEnvironnement): ScorePilier {
  let score = 0;
  const pointsCles: string[] = [];

  // 1. Part d'énergie renouvelable (10 pts)
  if (env.partEnergieRenouvelable_pct >= 40) {
    score += 10;
    pointsCles.push("Excellente part d'énergies renouvelables (>= 40%)");
  } else if (env.partEnergieRenouvelable_pct >= 20) {
    score += 6;
    pointsCles.push("Transition énergétique amorcée (20-40%)");
  } else {
    score += 2;
    pointsCles.push("Faible intégration des énergies renouvelables (< 20%)");
  }

  // 2. Taux de recyclage des déchets (10 pts)
  if (env.tauxRecyclageDechets_pct >= 60) {
    score += 10;
    pointsCles.push("Économie circulaire avancée (recyclage >= 60%)");
  } else if (env.tauxRecyclageDechets_pct >= 30) {
    score += 6;
  } else {
    score += 2;
  }

  // 3. Certifications environnementales (10 pts)
  if (env.certificationsVertes.length >= 2) {
    score += 10;
    pointsCles.push(`Certifications multiples (${env.certificationsVertes.join(", ")})`);
  } else if (env.certificationsVertes.length === 1) {
    score += 6;
  }

  // 4. Intensité carbone et gestion de l'eau (5 pts)
  if (env.emissionsGES_tCO2e < 5000 && env.consommationEau_m3 < 50000) {
    score += 5;
    pointsCles.push("Intensité carbone et hydrique maîtrisée");
  } else {
    score += 2;
  }

  const pourcentage = Math.round((score / 35) * 100);
  const appreciation =
    pourcentage >= 80 ? "EXCELLENT" : pourcentage >= 60 ? "SATISFAISANT" : pourcentage >= 40 ? "A_AMELIORER" : "CRITIQUE";

  return { score, scoreMax: 35, pourcentage, appreciation, pointsCles };
}

export function evaluerPilierSocial(soc: CriteresSocial): ScorePilier {
  let score = 0;
  const pointsCles: string[] = [];

  // 1. Parité et féminisation cadres (10 pts)
  if (soc.tauxFeminisationCadres_pct >= 35) {
    score += 10;
    pointsCles.push("Excellente représentation féminine dans l'encadrement (>= 35%)");
  } else if (soc.tauxFeminisationCadres_pct >= 20) {
    score += 6;
  } else {
    score += 2;
    pointsCles.push("Sous-représentation féminine dans le management (< 20%)");
  }

  // 2. Sécurité au travail (10 pts)
  if (soc.tauxAccidentTravail_pct === 0) {
    score += 10;
    pointsCles.push("Zéro accident du travail constaté");
  } else if (soc.tauxAccidentTravail_pct < 2) {
    score += 7;
  } else {
    score += 2;
    pointsCles.push("Taux d'accidents du travail à surveiller");
  }

  // 3. Formation continue (8 pts)
  if (soc.heuresFormationParSalarie >= 25) {
    score += 8;
    pointsCles.push("Investissement massif dans la formation du capital humain");
  } else if (soc.heuresFormationParSalarie >= 12) {
    score += 5;
  } else {
    score += 2;
  }

  // 4. Emploi local national (7 pts)
  if (soc.tauxEmploiNationalLocal_pct >= 85) {
    score += 7;
    pointsCles.push("Forte valorisation de l'emploi local (>= 85%)");
  } else if (soc.tauxEmploiNationalLocal_pct >= 70) {
    score += 4;
  } else {
    score += 2;
  }

  const pourcentage = Math.round((score / 35) * 100);
  const appreciation =
    pourcentage >= 80 ? "EXCELLENT" : pourcentage >= 60 ? "SATISFAISANT" : pourcentage >= 40 ? "A_AMELIORER" : "CRITIQUE";

  return { score, scoreMax: 35, pourcentage, appreciation, pointsCles };
}

export function evaluerPilierGouvernance(gouv: CriteresGouvernance): ScorePilier {
  let score = 0;
  const pointsCles: string[] = [];

  // 1. Indépendance du Conseil (8 pts)
  if (gouv.partAdministrateursIndependants_pct >= 33) {
    score += 8;
    pointsCles.push("Indépendance du Conseil conforme aux meilleures pratiques (>= 33%)");
  } else if (gouv.partAdministrateursIndependants_pct >= 20) {
    score += 5;
  } else {
    score += 1;
    pointsCles.push("Faible part d'administrateurs indépendants");
  }

  // 2. Comités spécialisés (8 pts : Audit + RSE)
  if (gouv.presenceComiteAudit) {
    score += 4;
    pointsCles.push("Comité d'Audit formellement constitué");
  }
  if (gouv.presenceComiteRSE) {
    score += 4;
    pointsCles.push("Comité RSE actif au sein du Conseil");
  }

  // 3. Conformité LCB-FT & Anti-Corruption (7 pts)
  if (gouv.politiqueAntiCorruptionLCBFT) {
    score += 7;
    pointsCles.push("Dispositif LCB-FT / Anti-corruption formalisé");
  } else {
    pointsCles.push("Absence de charte anti-corruption formelle");
  }

  // 4. Transparence et équilibre des pouvoirs (7 pts)
  if (gouv.separationPresidentEtDG) {
    score += 4;
    pointsCles.push("Séparation des fonctions de PCA et de Directeur Général");
  }
  if (gouv.publicationTransparenteRemuneration) {
    score += 3;
    pointsCles.push("Publication transparente de la politique de rémunération des mandataires");
  }

  const pourcentage = Math.round((score / 30) * 100);
  const appreciation =
    pourcentage >= 80 ? "EXCELLENT" : pourcentage >= 60 ? "SATISFAISANT" : pourcentage >= 40 ? "A_AMELIORER" : "CRITIQUE";

  return { score, scoreMax: 30, pourcentage, appreciation, pointsCles };
}

export function calculerScoringESGBRVM(input: InputScoringESGBRVM): RapportScoringESGBRVM {
  const pilierE = evaluerPilierEnvironnement(input.environnement);
  const pilierS = evaluerPilierSocial(input.social);
  const pilierG = evaluerPilierGouvernance(input.gouvernance);

  const scoreGlobal_100 = pilierE.score + pilierS.score + pilierG.score;

  let notationBRVM: RapportScoringESGBRVM["notationBRVM"];
  if (scoreGlobal_100 >= 85) notationBRVM = "AAA";
  else if (scoreGlobal_100 >= 75) notationBRVM = "AA";
  else if (scoreGlobal_100 >= 65) notationBRVM = "A";
  else if (scoreGlobal_100 >= 55) notationBRVM = "BBB";
  else if (scoreGlobal_100 >= 45) notationBRVM = "BB";
  else if (scoreGlobal_100 >= 35) notationBRVM = "B";
  else notationBRVM = "CCC";

  // Éligibilité Green Bonds BOAD / BAD : score >= 65 et pilier E >= 20/35
  const eligibiliteGreenBondBOAD = scoreGlobal_100 >= 65 && pilierE.score >= 20;

  const recommandationsESG: string[] = [];
  if (pilierE.score < 20) {
    recommandationsESG.push("Initier un bilan carbone certifié Scope 1-3 et accroître la part d'énergie solaire.");
  }
  if (pilierS.score < 20) {
    recommandationsESG.push("Renforcer la politique de mixité dans les comités de direction et le plan de formation.");
  }
  if (!input.gouvernance.politiqueAntiCorruptionLCBFT) {
    recommandationsESG.push("Adopter d'urgence un code de conduite LCB-FT conforme aux standards GIABA/UEMOA.");
  }
  if (!input.gouvernance.presenceComiteAudit) {
    recommandationsESG.push("Instituer un Comité d'Audit indépendant au sein du Conseil d'Administration.");
  }
  if (recommandationsESG.length === 0) {
    recommandationsESG.push("Poursuivre la communication extra-financière alignée sur les standards IFRS S1/S2 et GRI.");
  }

  const syntheseInvestisseurs =
    `La société ${input.societeRaisonSociale} (${input.secteur}) obtient un score ESG global de ${scoreGlobal_100}/100, ` +
    `soit une notation extra-financière BRVM de ${notationBRVM}. ` +
    (eligibiliteGreenBondBOAD
      ? "Le profil est ÉLIGIBLE aux émissions obligataires vertes et durables (Green Bonds) selon le cadre BOAD / BIDC."
      : "Le profil nécessite des ajustements ciblés avant éligibilité aux financements concessionnels verts.");

  return {
    societeRaisonSociale: input.societeRaisonSociale,
    secteur: input.secteur,
    exercice: input.exercice,
    scoreGlobal_100,
    notationBRVM,
    eligibiliteGreenBondBOAD,
    pilierEnvironnement: pilierE,
    pilierSocial: pilierS,
    pilierGouvernance: pilierG,
    recommandationsESG,
    syntheseInvestisseurs,
  };
}
