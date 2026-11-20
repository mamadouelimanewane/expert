// ─────────────────────────────────────────────────────────────────────────────
// Module de Rentabilité des Missions — Cabinet 360
// Suivi Budget vs Réalisé, Marge par Dossier, KPIs Cabinet
// ─────────────────────────────────────────────────────────────────────────────

export type StatutMission =
  | "EN_COURS"
  | "TERMINEE"
  | "SUSPENDUE"
  | "FACTUREE"
  | "ENCAISSEE";

export type TypeMissionCabinet =
  | "AUDIT_CAC"
  | "COMMISSARIAT_APPORTS"
  | "EXPERTISE_JUDICIAIRE"
  | "CONSEIL_FISCAL"
  | "TENUE_COMPTABLE"
  | "PAIE"
  | "JURIDIQUE"
  | "DUE_DILIGENCE"
  | "CONSOLIDATION"
  | "AUTRE";

export interface LigneBudget {
  collaborateur: string;
  gradeCollaborateur: "ASSOCIE" | "SENIOR" | "JUNIOR" | "STAGIAIRE";
  heuresBudgetisees: number;
  heuresRealisees: number;
  tauxHoraire: number; // FCFA / heure
}

export interface DossierMission {
  id: string;
  client: string;
  typeMission: TypeMissionCabinet;
  statut: StatutMission;
  dateDebut: string; // ISO
  dateFin?: string;
  honораiresContractuel: number; // FCFA HT
  factureEmise: number; // FCFA HT — 0 si pas encore facturé
  encaisse: number; // FCFA HT
  lignesBudget: LigneBudget[];
  debourses: number; // Frais de déplacement, copies, etc.
  chargesIndirectes?: number; // Loyer, logiciels — calculé si absent
}

export interface AnalyseRentabilite {
  id: string;
  client: string;
  typeMission: TypeMissionCabinet;
  statut: StatutMission;
  // Temps
  heuresBudgetisees: number;
  heuresRealisees: number;
  ecartHeures: number; // positif = dépassement
  tauxDepassement: number; // %
  // Coût
  coutRevientCollab: number; // Σ heures × taux
  debourses: number;
  chargesIndirectes: number;
  coutRevientTotal: number;
  // Revenus
  honораiresContractuel: number;
  factureEmise: number;
  encaisse: number;
  // Marges
  margeContractuelle: number; // honoraires - coutTotal
  tauxMargeContractuelle: number; // %
  margeReelle: number; // facture - coutTotal
  tauxMargeReelle: number; // %
  // Alertes
  alertes: AlerteRentabilite[];
  // Note de synthèse
  noteSynthese: string;
  scoreRentabilite: number; // 0-100
  niveauRentabilite: "EXCELLENT" | "BON" | "ACCEPTABLE" | "INSUFFISANT" | "DEFICITAIRE";
}

export interface AlerteRentabilite {
  code: string;
  severite: "INFO" | "AVERTISSEMENT" | "CRITIQUE";
  message: string;
}

// Taux de charges indirectes par défaut : 25% du coût collaborateur
const TAUX_CHARGES_INDIRECTES_DEFAUT = 0.25;

// Seuils d'alerte
const SEUIL_DEPASSEMENT_ALERTE = 10; // % dépassement → avertissement
const SEUIL_DEPASSEMENT_CRITIQUE = 25; // % dépassement → critique
const SEUIL_MARGE_MIN = 20; // % marge min acceptable
const SEUIL_ENCAISSEMENT = 0.8; // 80% facturé doit être encaissé

export function calculerRentabilite(dossier: DossierMission): AnalyseRentabilite {
  const alertes: AlerteRentabilite[] = [];

  // Agrégats temps et coût collaborateurs
  let heuresBudg = 0;
  let heuresReal = 0;
  let coutRevientCollab = 0;

  for (const ligne of dossier.lignesBudget) {
    heuresBudg += ligne.heuresBudgetisees;
    heuresReal += ligne.heuresRealisees;
    coutRevientCollab += ligne.heuresRealisees * ligne.tauxHoraire;
  }

  const chargesIndirectes =
    dossier.chargesIndirectes !== undefined
      ? dossier.chargesIndirectes
      : Math.round(coutRevientCollab * TAUX_CHARGES_INDIRECTES_DEFAUT);

  const coutRevientTotal = coutRevientCollab + dossier.debourses + chargesIndirectes;

  const ecartHeures = heuresReal - heuresBudg;
  const tauxDepassement =
    heuresBudg > 0 ? Math.round((ecartHeures / heuresBudg) * 100) : 0;

  // Marges
  const margeContractuelle = dossier.honораiresContractuel - coutRevientTotal;
  const tauxMargeContractuelle =
    dossier.honораiresContractuel > 0
      ? Math.round((margeContractuelle / dossier.honораiresContractuel) * 100)
      : 0;

  const margeReelle = dossier.factureEmise - coutRevientTotal;
  const tauxMargeReelle =
    dossier.factureEmise > 0
      ? Math.round((margeReelle / dossier.factureEmise) * 100)
      : tauxMargeContractuelle;

  // Alertes — dépassement heures
  if (tauxDepassement >= SEUIL_DEPASSEMENT_CRITIQUE) {
    alertes.push({
      code: "DEPASSEMENT_CRITIQUE",
      severite: "CRITIQUE",
      message: `Dépassement heures de ${tauxDepassement}% (${ecartHeures}h) — risque de déficit`,
    });
  } else if (tauxDepassement >= SEUIL_DEPASSEMENT_ALERTE) {
    alertes.push({
      code: "DEPASSEMENT_MODEREE",
      severite: "AVERTISSEMENT",
      message: `Dépassement heures de ${tauxDepassement}% (${ecartHeures}h)`,
    });
  }

  // Alerte marge insuffisante
  if (tauxMargeContractuelle < SEUIL_MARGE_MIN) {
    alertes.push({
      code: "MARGE_INSUFFISANTE",
      severite: tauxMargeContractuelle < 0 ? "CRITIQUE" : "AVERTISSEMENT",
      message: `Marge contractuelle ${tauxMargeContractuelle}% — inférieure au seuil de ${SEUIL_MARGE_MIN}%`,
    });
  }

  // Alerte encaissement
  if (
    dossier.factureEmise > 0 &&
    dossier.encaisse < dossier.factureEmise * SEUIL_ENCAISSEMENT
  ) {
    const tauxEnc = Math.round((dossier.encaisse / dossier.factureEmise) * 100);
    alertes.push({
      code: "ENCAISSEMENT_FAIBLE",
      severite: "AVERTISSEMENT",
      message: `Taux d'encaissement ${tauxEnc}% — recouvrement insuffisant`,
    });
  }

  // Mission non facturée terminée
  if (dossier.statut === "TERMINEE" && dossier.factureEmise === 0) {
    alertes.push({
      code: "MISSION_TERMINEE_NON_FACTUREE",
      severite: "CRITIQUE",
      message: "Mission terminée mais aucune facture émise — facturer sans délai",
    });
  }

  // Score rentabilité (0-100)
  let score = 60; // base neutre
  score += Math.min(20, Math.max(-20, tauxMargeContractuelle - SEUIL_MARGE_MIN));
  score -= Math.min(30, Math.max(0, tauxDepassement));
  if (dossier.encaisse >= dossier.factureEmise && dossier.factureEmise > 0) score += 10;
  score = Math.max(0, Math.min(100, score));

  const niveauRentabilite: AnalyseRentabilite["niveauRentabilite"] =
    score >= 85
      ? "EXCELLENT"
      : score >= 70
      ? "BON"
      : score >= 50
      ? "ACCEPTABLE"
      : score >= 30
      ? "INSUFFISANT"
      : "DEFICITAIRE";

  // Note de synthèse
  const noteSynthese =
    `Mission "${dossier.client}" (${dossier.typeMission}) — ` +
    `${heuresReal}h réalisées / ${heuresBudg}h budgétisées. ` +
    `Coût de revient : ${coutRevientTotal.toLocaleString("fr-FR")} FCFA. ` +
    `Honoraires contractuels : ${dossier.honораiresContractuel.toLocaleString("fr-FR")} FCFA. ` +
    `Marge : ${tauxMargeContractuelle}% — Rentabilité : ${niveauRentabilite}.`;

  return {
    id: dossier.id,
    client: dossier.client,
    typeMission: dossier.typeMission,
    statut: dossier.statut,
    heuresBudgetisees: heuresBudg,
    heuresRealisees: heuresReal,
    ecartHeures,
    tauxDepassement,
    coutRevientCollab,
    debourses: dossier.debourses,
    chargesIndirectes,
    coutRevientTotal,
    honораiresContractuel: dossier.honораiresContractuel,
    factureEmise: dossier.factureEmise,
    encaisse: dossier.encaisse,
    margeContractuelle,
    tauxMargeContractuelle,
    margeReelle,
    tauxMargeReelle,
    alertes,
    noteSynthese,
    scoreRentabilite: score,
    niveauRentabilite,
  };
}

// ─── Dashboard Cabinet ───────────────────────────────────────────────────────

export interface KpiCabinet {
  nbMissions: number;
  heuresTotales: number;
  coutRevientTotal: number;
  chiffreAffairesContractuel: number;
  chiffreAffairesFacture: number;
  encaissementTotal: number;
  margeGlobale: number;
  tauxMargeGlobal: number;
  tauxEncaissement: number;
  tauxOccupation: number; // heures réalisées / capacité théorique
  missionsMargeFaible: number; // nb missions marge < 20%
  missionsDeficitaires: number;
  topMissions: { client: string; margeReelle: number }[];
  flop3Missions: { client: string; margeReelle: number }[];
}

export function calculerKpiCabinet(
  dossiers: DossierMission[],
  capaciteHeuresMois = 1200 // ex: 10 collab × 120h/mois
): KpiCabinet {
  const analyses = dossiers.map(calculerRentabilite);

  const heuresTotales = analyses.reduce((s, a) => s + a.heuresRealisees, 0);
  const coutRevientTotal = analyses.reduce((s, a) => s + a.coutRevientTotal, 0);
  const caContractuel = analyses.reduce((s, a) => s + a.honораiresContractuel, 0);
  const caFacture = analyses.reduce((s, a) => s + a.factureEmise, 0);
  const encaissement = analyses.reduce((s, a) => s + a.encaisse, 0);
  const margeGlobale = caContractuel - coutRevientTotal;
  const tauxMargeGlobal =
    caContractuel > 0 ? Math.round((margeGlobale / caContractuel) * 100) : 0;
  const tauxEncaissement =
    caFacture > 0 ? Math.round((encaissement / caFacture) * 100) : 0;
  const tauxOccupation =
    capaciteHeuresMois > 0
      ? Math.round((heuresTotales / capaciteHeuresMois) * 100)
      : 0;

  const missionsTriees = [...analyses].sort((a, b) => b.margeReelle - a.margeReelle);
  const topMissions = missionsTriees.slice(0, 3).map((a) => ({
    client: a.client,
    margeReelle: a.margeReelle,
  }));
  const flop3Missions = missionsTriees.slice(-3).map((a) => ({
    client: a.client,
    margeReelle: a.margeReelle,
  }));

  return {
    nbMissions: dossiers.length,
    heuresTotales,
    coutRevientTotal,
    chiffreAffairesContractuel: caContractuel,
    chiffreAffairesFacture: caFacture,
    encaissementTotal: encaissement,
    margeGlobale,
    tauxMargeGlobal,
    tauxEncaissement,
    tauxOccupation,
    missionsMargeFaible: analyses.filter((a) => a.tauxMargeContractuelle < 20).length,
    missionsDeficitaires: analyses.filter((a) => a.margeContractuelle < 0).length,
    topMissions,
    flop3Missions,
  };
}
