/**
 * Module RSE / ESG & Reporting Extra-Financier
 * Conforme aux normes IFRS S1 (exigences générales) et IFRS S2 (climat)
 * Intégrant les spécificités OHADA / UEMOA (GIABA/GAFI LCB-FT, IPRES/CNPS, mix énergétique UEMOA)
 */

export type PilierESG = "ENVIRONNEMENTAL" | "SOCIAL" | "GOUVERNANCE";

export interface BilanCarbone {
  scope1Carburant_tCO2: number;
  scope1Electricite_tCO2: number;
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
 * Facteurs d'émission :
 * - Carburant (Gasoil/Essence moyen): 2.68 kg CO2 / Litre = 0.00268 tCO2 / L
 * - Électricité Réseau UEMOA: 0.45 kg CO2 / kWh = 0.00045 tCO2 / kWh
 * - Énergie achetée (MWh): 0.45 tCO2 / MWh
 */
export function calculerBilanCarbone(input: InputESG): BilanCarbone {
  const scope1Carburant = Number(((input.consommationCarburantLitres * 2.68) / 1000).toFixed(2));
  const scope1Electricite = Number(((input.consommationElectriciteKWh * 0.45) / 1000).toFixed(2));
  const scope2Achats = Number(((input.achatEnergieMWh || 0) * 0.45).toFixed(2));
  const totalEmissions = Number((scope1Carburant + scope1Electricite + scope2Achats).toFixed(2));

  const caMillions = input.ca_XOF > 0 ? input.ca_XOF / 1_000_000 : 1;
  const intensiteCarbone = Number((totalEmissions / caMillions).toFixed(4));

  return {
    scope1Carburant_tCO2: scope1Carburant,
    scope1Electricite_tCO2: scope1Electricite,
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
    recommandations.push("Formaliser 100% des contrats de travail (Art. 14 Code Travail OHADA) pour résorber l'informel.");
  }
  if (tauxCouvertureSante < 90) {
    recommandations.push("Régulariser les affiliations aux caisses de prévoyance obligatoire (IPRES / CSS / CNPS).");
  }
  if (input.accidentsWork > 0) {
    recommandations.push("Instaurer un Comité Hygiène, Sécurité et Conditions de Travail (CHSCT) et un registre des risques.");
  }
  if (!input.lcbftConforme) {
    recommandations.push("Mettre en place d'urgence le dispositif LCB-FT et cartographie des risques (Directive GIABA / GAFI 2023).");
  }
  if (!input.registreBeneficiairesEffectifs) {
    recommandations.push("Déclarer et tenir à jour le registre des Bénéficiaires Effectifs (AUSCGIE révisé & Loi LCB-FT).");
  }
  if (!input.comiteAudit) {
    recommandations.push("Créer un comité d'audit ou désigner un administrateur référent pour le contrôle interne.");
  }
  if (!input.codeEthiqueAdopte) {
    recommandations.push("Adopter une charte éthique et anti-corruption (Loi anti-corruption UEMOA).");
  }
  if (bilanCarbone.intensiteCarbone_tCO2parM_XOF > 0.1) {
    recommandations.push("Planifier un audit d'efficacité énergétique et étudier le solaire photovoltaïque en toiture (IFRS S2 Climat).");
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
    referentielIFRS: "IFRS S1 / IFRS S2 - Normes Internationales de Durabilité (ISSB 2024)",
  };
}
