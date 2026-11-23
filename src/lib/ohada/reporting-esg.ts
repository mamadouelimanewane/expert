/**
 * Module RSE / ESG & Reporting Extra-Financier
 * Outil exploratoire d'indicateurs ESG. Les résultats ne constituent pas
 * une attestation IFRS S1/S2 ni une mesure d'émissions vérifiée.
 */

export type PilierESG = "ENVIRONNEMENTAL" | "SOCIAL" | "GOUVERNANCE";

export interface BilanCarbone {
  scope1Carburant_tCO2: number;
  scope2Electricite_tCO2: number;
  scope2Achats_tCO2: number;
  totalEmissions_tCO2: number;
  intensiteCarbone_tCO2parM_XOF: number; // tCO2 / million XOF de CA
}

export interface IndicateursSociaux {
  tauxContratsFormels_pct: number;
  tauxPariteHF_pct: number;
  tauxCouvertureSante_pct: number;
  accidentsWork: number;
  masseSalariale_XOF: number;
}

export interface IndicateursGouvernance {
  lcbftConforme: boolean;
  registreBeneficiairesEffectifs: boolean;
  administrateursIndependants_pct: number;
  comiteAudit: boolean;
  codeEthiqueAdopte: boolean;
}

export interface InputESG {
  raisonSociale: string;
  exercice: number;
  pays: string;
  ca_XOF: number;
  effectifTotal: number;
  consommationCarburantLitres: number;
  consommationElectriciteKWh: number;
  achatEnergieMWh?: number;
  nbContratsFormels: number;
  nbFemmes: number;
  nbAffiliesSante: number;
  accidentsWork: number;
  masseSalariale_XOF: number;
  lcbftConforme: boolean;
  registreBeneficiairesEffectifs: boolean;
  administrateursIndependants_pct: number;
  comiteAudit: boolean;
  codeEthiqueAdopte: boolean;
}

export interface ScoreESG {
  E: number;
  S: number;
  G: number;
  global: number;
}

export interface RapportESG {
  raisonSociale: string;
  exercice: number;
  pays: string;
  bilanCarbone: BilanCarbone;
  indicateursSociaux: IndicateursSociaux;
  indicateursGouvernance: IndicateursGouvernance;
  scoreESG: ScoreESG;
  niveauMaturite: "DEBUTANT" | "EN_PROGRESSION" | "AVANCE" | "LEADER";
  recommandations: string[];
  referentielIFRS: string;
}

/**
 * Coefficients génériques provisoires, à remplacer par un facteur documenté
 * et daté correspondant au pays, à l'énergie et à l'exercice déclarés.
 */
export function calculerBilanCarbone(input: InputESG): BilanCarbone {
  const scope1Carburant = Number(((input.consommationCarburantLitres * 2.68) / 1000).toFixed(2));
  // Purchased grid electricity is Scope 2 (location-based estimate), not Scope 1.
  const scope2Electricite = Number(((input.consommationElectriciteKWh * 0.45) / 1000).toFixed(2));
  const scope2Achats = Number(((input.achatEnergieMWh || 0) * 0.45).toFixed(2));
  const totalEmissions = Number((scope1Carburant + scope2Electricite + scope2Achats).toFixed(2));

  const caMillions = input.ca_XOF > 0 ? input.ca_XOF / 1_000_000 : 1;
  const intensiteCarbone = Number((totalEmissions / caMillions).toFixed(4));

  return {
    scope1Carburant_tCO2: scope1Carburant,
    scope2Electricite_tCO2: scope2Electricite,
    scope2Achats_tCO2: scope2Achats,
    totalEmissions_tCO2: totalEmissions,
    intensiteCarbone_tCO2parM_XOF: intensiteCarbone,
  };
}

export function calculerScoreESG(input: InputESG): ScoreESG {
  const bc = calculerBilanCarbone(input);

  // Pilier E : basé sur l'intensité carbone
  // Intensité ≤ 0.05 tCO2/M -> 100%, ≥ 0.5 tCO2/M -> dégressif
  let scoreE = 100;
  if (bc.intensiteCarbone_tCO2parM_XOF > 0.05) {
    const penalite = Math.min(100, ((bc.intensiteCarbone_tCO2parM_XOF - 0.05) / 0.5) * 80);
    scoreE = Math.max(10, Math.round(100 - penalite));
  }

  // Pilier S : Contrats formels, parité HF, couverture santé, accidents du travail
  const effectif = Math.max(1, input.effectifTotal);
  const tauxFormels = Math.min(100, Math.round((input.nbContratsFormels / effectif) * 100));
  const tauxParite = Math.min(100, Math.round((input.nbFemmes / effectif) * 100 * 2)); // 50% = 100pts
  const tauxSante = Math.min(100, Math.round((input.nbAffiliesSante / effectif) * 100));
  const penaliteAccidents = Math.min(60, input.accidentsWork * 15);
  const scoreS = Math.max(0, Math.round((tauxFormels * 0.35 + tauxParite * 0.25 + tauxSante * 0.4) - penaliteAccidents));

  // Pilier G : Gouvernance LCB-FT, registre bénéficiaires, comite audit, code éthique, administrateurs indép.
  let scoreG = 0;
  if (input.lcbftConforme) scoreG += 20;
  if (input.registreBeneficiairesEffectifs) scoreG += 20;
  if (input.comiteAudit) scoreG += 20;
  if (input.codeEthiqueAdopte) scoreG += 20;
  if (input.administrateursIndependants_pct >= 20) scoreG += 20;
  else scoreG += Math.round((input.administrateursIndependants_pct / 20) * 20);

  const global = Math.round((scoreE * 0.35 + scoreS * 0.35 + scoreG * 0.3));

  return {
    E: Math.min(100, Math.max(0, scoreE)),
    S: Math.min(100, Math.max(0, scoreS)),
    G: Math.min(100, Math.max(0, scoreG)),
    global: Math.min(100, Math.max(0, global)),
  };
}

export function determinerNiveauMaturite(scoreGlobal: number): "DEBUTANT" | "EN_PROGRESSION" | "AVANCE" | "LEADER" {
  if (scoreGlobal < 35) return "DEBUTANT";
  if (scoreGlobal < 60) return "EN_PROGRESSION";
  if (scoreGlobal < 80) return "AVANCE";
  return "LEADER";
}

export function genererRapportESG(input: InputESG): RapportESG {
  const bilanCarbone = calculerBilanCarbone(input);
  const effectif = Math.max(1, input.effectifTotal);
  const tauxContratsFormels = Math.round((input.nbContratsFormels / effectif) * 100);
  const tauxPariteHF = Math.round((input.nbFemmes / effectif) * 100);
  const tauxCouvertureSante = Math.round((input.nbAffiliesSante / effectif) * 100);

  const indicateursSociaux: IndicateursSociaux = {
    tauxContratsFormels_pct: tauxContratsFormels,
    tauxPariteHF_pct: tauxPariteHF,
    tauxCouvertureSante_pct: tauxCouvertureSante,
    accidentsWork: input.accidentsWork,
    masseSalariale_XOF: input.masseSalariale_XOF,
  };

  const indicateursGouvernance: IndicateursGouvernance = {
    lcbftConforme: input.lcbftConforme,
    registreBeneficiairesEffectifs: input.registreBeneficiairesEffectifs,
    administrateursIndependants_pct: input.administrateursIndependants_pct,
    comiteAudit: input.comiteAudit,
    codeEthiqueAdopte: input.codeEthiqueAdopte,
  };

  const scoreESG = calculerScoreESG(input);
  const niveauMaturite = determinerNiveauMaturite(scoreESG.global);

  const recommandations: string[] = [];

  if (tauxContratsFormels < 80) {
    recommandations.push("Vérifier le niveau de formalisation des contrats et les exigences du droit du travail du pays avec un conseil local.");
  }
  if (tauxCouvertureSante < 90) {
    recommandations.push("Comparer les affiliations sociales déclarées aux obligations applicables dans le pays et documenter les écarts.");
  }
  if (input.accidentsWork > 0) {
    recommandations.push("Analyser les accidents recensés, leurs causes et les mesures de prévention ; vérifier les exigences locales de santé et sécurité.");
  }
  if (!input.lcbftConforme) {
    recommandations.push("Faire évaluer le dispositif LCB-FT au regard des obligations applicables à l'entité et documenter les contrôles réalisés.");
  }
  if (!input.registreBeneficiairesEffectifs) {
    recommandations.push("Vérifier les obligations locales de déclaration des bénéficiaires effectifs et conserver la preuve des démarches.");
  }
  if (!input.comiteAudit) {
    recommandations.push("Évaluer les besoins de gouvernance et de contrôle interne en fonction de la taille, du secteur et du cadre juridique de l'entité.");
  }
  if (!input.codeEthiqueAdopte) {
    recommandations.push("Examiner l'adoption d'un dispositif éthique adapté aux risques et obligations applicables à l'entité.");
  }
  if (bilanCarbone.intensiteCarbone_tCO2parM_XOF > 0.1) {
    recommandations.push("Vérifier le facteur d'émission utilisé pour le pays et l'exercice, puis analyser les leviers de réduction énergétique pertinents.");
  }

  return {
    raisonSociale: input.raisonSociale,
    exercice: input.exercice,
    pays: input.pays,
    bilanCarbone,
    indicateursSociaux,
    indicateursGouvernance,
    scoreESG,
    niveauMaturite,
    recommandations,
    referentielIFRS: "Référence indicative IFRS S1/S2 — périmètre et applicabilité à confirmer selon la juridiction",
  };
}
