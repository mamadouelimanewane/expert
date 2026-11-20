// ─────────────────────────────────────────────────────────────────────────────
// Module Dashboard Associé & Collège des Associés — Cabinet 360
// Pilotage Stratégique, Performance Commerciale, Taux d'Occupation & DSO
// ─────────────────────────────────────────────────────────────────────────────

export type SpecialiteAssocie =
  | "AUDIT_COMMISSARIAT"
  | "FISCALITE_ET_DROIT"
  | "EXPERTISE_COMPTABLE"
  | "TRANSACTION_ET_CONSEIL";

export interface AssocieCabinet {
  id: string;
  nom: string;
  email: string;
  specialite: SpecialiteAssocie;
  objectifCAAnnuel: number; // FCFA
  tauxOccupationCible: number; // % (ex: 70%)
}

export interface DossierAssocie {
  id: string;
  associeId: string;
  clientNom: string;
  statut: "EN_COURS" | "CLOTURE" | "SUSPENDU";
  honораiresContractuels: number;
  honораiresFactures: number;
  honораiresEncaisses: number;
  heuresFacturablesPassees: number;
  heuresBudgetisees: number;
  dsoMoyenJours: number; // Délai moyen de règlement client
}

export interface OpportuniteCommerciale {
  id: string;
  associeId: string;
  prospectNom: string;
  typeMission: string;
  montantEstime: number; // FCFA
  probabilite: number; // % (ex: 20, 50, 80)
  stade: "PROSPECTION" | "OFFRE_EMISE" | "NEGOCIATION" | "SIGNE" | "PERDU";
}

export interface PerformanceAssocie {
  associe: AssocieCabinet;
  caContractuel: number;
  caFacture: number;
  caEncaisse: number;
  tauxAtteinteObjectif: number; // %
  dsoPondere: number; // jours
  heuresFacturables: number;
  heuresBudgetisees: number;
  ecartHeures: number;
  pipelinePondere: number; // Σ (montantEstime × proba)
  nbDossiersActifs: number;
  scorePerformance: number; // 0-100
  alertes: string[];
}

export interface SyntheseCollegeAssocies {
  caTotalContractuel: number;
  caTotalFacture: number;
  caTotalEncaisse: number;
  objectifGlobalCabinet: number;
  tauxAtteinteGlobal: number; // %
  pipelineCommercialTotal: number;
  dsoMoyenCabinet: number;
  associesPerformances: PerformanceAssocie[];
  classementAssocies: { nom: string; caFacture: number; score: number }[];
}

export function evaluerPerformanceAssocie(
  associe: AssocieCabinet,
  dossiers: DossierAssocie[],
  opportunites: OpportuniteCommerciale[]
): PerformanceAssocie {
  const alertes: string[] = [];

  const mesDossiers = dossiers.filter((d) => d.associeId === associe.id);
  const mesOpportunites = opportunites.filter((o) => o.associeId === associe.id && o.stade !== "PERDU");

  let caContractuel = 0;
  let caFacture = 0;
  let caEncaisse = 0;
  let heuresFacturables = 0;
  let heuresBudgetisees = 0;
  let sommeDsoPondere = 0;

  for (const d of mesDossiers) {
    caContractuel += d.honораiresContractuels;
    caFacture += d.honораiresFactures;
    caEncaisse += d.honораiresEncaisses;
    heuresFacturables += d.heuresFacturablesPassees;
    heuresBudgetisees += d.heuresBudgetisees;
    sommeDsoPondere += d.dsoMoyenJours * d.honораiresFactures;
  }

  const dsoPondere =
    caFacture > 0 ? Math.round(sommeDsoPondere / caFacture) : 0;

  const ecartHeures = heuresFacturables - heuresBudgetisees;

  const tauxAtteinteObjectif =
    associe.objectifCAAnnuel > 0
      ? Math.round((caFacture / associe.objectifCAAnnuel) * 100)
      : 0;

  let pipelinePondere = 0;
  for (const opp of mesOpportunites) {
    if (opp.stade === "SIGNE") {
      pipelinePondere += opp.montantEstime;
    } else {
      pipelinePondere += Math.round((opp.montantEstime * opp.probabilite) / 100);
    }
  }

  // Détection des alertes
  if (tauxAtteinteObjectif < 50) {
    alertes.push(
      `Retard sur l'objectif annuel de facturation (${tauxAtteinteObjectif}% réalisé vs cible).`
    );
  }

  if (dsoPondere > 75) {
    alertes.push(
      `DSO moyen élevé (${dsoPondere} jours) — action de recouvrement prioritaire requise.`
    );
  }

  if (caFacture > 0 && caEncaisse < caFacture * 0.7) {
    alertes.push("Taux d'encaissement inférieur à 70% des honoraires facturés.");
  }

  // Score de performance globale (0-100)
  let score = 50;
  score += Math.min(25, Math.max(-20, (tauxAtteinteObjectif - 70) * 0.5));
  if (dsoPondere <= 45) score += 15;
  else if (dsoPondere <= 60) score += 5;
  else score -= 15;

  if (caFacture > 0 && caEncaisse / caFacture >= 0.85) score += 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    associe,
    caContractuel,
    caFacture,
    caEncaisse,
    tauxAtteinteObjectif,
    dsoPondere,
    heuresFacturables,
    heuresBudgetisees,
    ecartHeures,
    pipelinePondere,
    nbDossiersActifs: mesDossiers.filter((d) => d.statut === "EN_COURS").length,
    scorePerformance: score,
    alertes,
  };
}

export function analyserCollegeAssocies(
  associes: AssocieCabinet[],
  dossiers: DossierAssocie[],
  opportunites: OpportuniteCommerciale[]
): SyntheseCollegeAssocies {
  const perfs = associes.map((a) =>
    evaluerPerformanceAssocie(a, dossiers, opportunites)
  );

  const caTotalContractuel = perfs.reduce((s, p) => s + p.caContractuel, 0);
  const caTotalFacture = perfs.reduce((s, p) => s + p.caFacture, 0);
  const caTotalEncaisse = perfs.reduce((s, p) => s + p.caEncaisse, 0);
  const objectifGlobal = associes.reduce((s, a) => s + a.objectifCAAnnuel, 0);

  const tauxAtteinteGlobal =
    objectifGlobal > 0 ? Math.round((caTotalFacture / objectifGlobal) * 100) : 0;

  const pipelineCommercialTotal = perfs.reduce((s, p) => s + p.pipelinePondere, 0);

  const totalDsoFacture = perfs.reduce(
    (s, p) => s + p.dsoPondere * p.caFacture,
    0
  );
  const dsoMoyenCabinet =
    caTotalFacture > 0 ? Math.round(totalDsoFacture / caTotalFacture) : 0;

  const classement = [...perfs]
    .sort((a, b) => b.caFacture - a.caFacture)
    .map((p) => ({
      nom: p.associe.nom,
      caFacture: p.caFacture,
      score: p.scorePerformance,
    }));

  return {
    caTotalContractuel,
    caTotalFacture,
    caTotalEncaisse,
    objectifGlobalCabinet: objectifGlobal,
    tauxAtteinteGlobal,
    pipelineCommercialTotal,
    dsoMoyenCabinet,
    associesPerformances: perfs,
    classementAssocies: classement,
  };
}
