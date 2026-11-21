/**
 * Hub Orchestrateur d'Agents IA Autonomes — Cabinet Expert OHADA 360
 * Coordonne la flotte des 4 agents spécialisés :
 * 1. Sentinel Clôture (Intégrité & CaseWare)
 * 2. Fiscal Defender (Contrôle DGID & Défense)
 * 3. WhatsApp Collector (Triage & Lettrage mobile)
 * 4. CFO Storytelling (Advisory & vulgarisation dirigeants)
 *
 * Implémente le pattern Human-in-the-Loop :
 * Les agents détectent, calculent et proposent des actions autonomes (avec score de confiance),
 * qui sont soumises à la validation de l'Expert-Comptable avant exécution définitive.
 */

export type TypeAgentIA =
  | "AGENT_SENTINEL_CLOTURE"
  | "AGENT_FISCAL_DEFENDER"
  | "AGENT_WHATSAPP_COLLECTOR"
  | "AGENT_CFO_STORYTELLING";

export type StatutAgent = "EN_VEILLE" | "ANALYSE_EN_COURS" | "ACTIONS_EN_ATTENTE" | "ERREUR";

export type StatutActionAgent = "EN_ATTENTE_VALIDATION" | "APPROUVEE" | "REJETEE" | "ACTIVEE_AUTOMATIQUEMENT";

export interface ActionProposeeAgent {
  idAction: string;
  typeAgent: TypeAgentIA;
  clientNom: string;
  exercice: number;
  intituleAction: string;
  descriptionDetaillee: string;
  scoreConfiance_pct: number;
  impactFinancier_XOF?: number;
  dateCreation: string;
  statut: StatutActionAgent;
  priorite: "CRITIQUE" | "HAUTE" | "NORMALE";
}

export interface FicheAgentIA {
  typeAgent: TypeAgentIA;
  nomVisible: string;
  role: string;
  statut: StatutAgent;
  dernierEvenementDate: string;
  nbActionsEnAttente: number;
  nbActionsExecutees: number;
  tauxSucces_pct: number;
}

export interface EvenementOrchestrateur {
  id: string;
  timestamp: string;
  source: string; // ex: "DEPOT_BALANCE", "MESSAGE_WHATSAPP", "CLOTURE_MENSUELLE"
  clientNom: string;
  details: string;
  traitePar: TypeAgentIA[];
}

export interface EtatOrchestrateurCabinet {
  cabinet: string;
  derniereSynchronisation: string;
  agents: FicheAgentIA[];
  actionsEnAttente: ActionProposeeAgent[];
  historiqueEvenements: EvenementOrchestrateur[];
  kpisAutomatisation: {
    totalActionsProposees: number;
    totalActionsApprouvees: number;
    heuresGagneesEstimees: number;
    tauxAdhesionExpert_pct: number;
  };
}

export function initialiserAgents(): FicheAgentIA[] {
  return [
    {
      typeAgent: "AGENT_SENTINEL_CLOTURE",
      nomVisible: "Sentinel Clôture",
      role: "Surveillance continue de l'équilibre des liasses & détection des altérations",
      statut: "EN_VEILLE",
      dernierEvenementDate: new Date().toISOString().slice(0, 10),
      nbActionsEnAttente: 0,
      nbActionsExecutees: 142,
      tauxSucces_pct: 98.5,
    },
    {
      typeAgent: "AGENT_FISCAL_DEFENDER",
      nomVisible: "Fiscal Defender",
      role: "Audit prédictif DGID, détection des risques fiscaux & rédaction des mémoires",
      statut: "EN_VEILLE",
      dernierEvenementDate: new Date().toISOString().slice(0, 10),
      nbActionsEnAttente: 0,
      nbActionsExecutees: 89,
      tauxSucces_pct: 96.0,
    },
    {
      typeAgent: "AGENT_WHATSAPP_COLLECTOR",
      nomVisible: "WhatsApp Collector",
      role: "Relance autonome des justificatifs, OCR mobile & lettrage automatique",
      statut: "EN_VEILLE",
      dernierEvenementDate: new Date().toISOString().slice(0, 10),
      nbActionsEnAttente: 0,
      nbActionsExecutees: 315,
      tauxSucces_pct: 94.2,
    },
    {
      typeAgent: "AGENT_CFO_STORYTELLING",
      nomVisible: "CFO Storytelling",
      role: "Génération de synthèses financières vulgarisées et alertes trésorerie pour DG",
      statut: "EN_VEILLE",
      dernierEvenementDate: new Date().toISOString().slice(0, 10),
      nbActionsEnAttente: 0,
      nbActionsExecutees: 64,
      tauxSucces_pct: 99.0,
    },
  ];
}

export function routerEvenementVersAgents(
  evenement: EvenementOrchestrateur,
  agents: FicheAgentIA[]
): { agentsDeclenches: TypeAgentIA[]; actionsGenerees: ActionProposeeAgent[] } {
  const agentsDeclenches: TypeAgentIA[] = [];
  const actionsGenerees: ActionProposeeAgent[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // Router selon le type d'événement
  if (evenement.source === "DEPOT_BALANCE" || evenement.source === "CLOTURE_MENSUELLE") {
    agentsDeclenches.push("AGENT_SENTINEL_CLOTURE", "AGENT_CFO_STORYTELLING");
    actionsGenerees.push({
      idAction: `ACT-${Date.now()}-1`,
      typeAgent: "AGENT_SENTINEL_CLOTURE",
      clientNom: evenement.clientNom,
      exercice: new Date().getFullYear(),
      intituleAction: "Contrôle automatique de bouclage de liasse",
      descriptionDetaillee: `Vérification des 12 contrôles CaseWare et du Tie-Out suite au dépôt de balance (${evenement.clientNom}).`,
      scoreConfiance_pct: 95,
      dateCreation: today,
      statut: "EN_ATTENTE_VALIDATION",
      priorite: "HAUTE",
    });
  }

  if (evenement.source === "DEPOT_BALANCE" || evenement.source === "DECLARATION_FISCALE") {
    agentsDeclenches.push("AGENT_FISCAL_DEFENDER");
    actionsGenerees.push({
      idAction: `ACT-${Date.now()}-2`,
      typeAgent: "AGENT_FISCAL_DEFENDER",
      clientNom: evenement.clientNom,
      exercice: new Date().getFullYear(),
      intituleAction: "Scan prédictif des redressements DGID",
      descriptionDetaillee: `Revue de déductibilité des charges et calcul de la provision pour risque fiscal (${evenement.clientNom}).`,
      scoreConfiance_pct: 92,
      impactFinancier_XOF: 4_500_000,
      dateCreation: today,
      statut: "EN_ATTENTE_VALIDATION",
      priorite: "CRITIQUE",
    });
  }

  if (evenement.source === "MESSAGE_WHATSAPP" || evenement.source === "PIECE_MANQUANTE") {
    agentsDeclenches.push("AGENT_WHATSAPP_COLLECTOR");
    actionsGenerees.push({
      idAction: `ACT-${Date.now()}-3`,
      typeAgent: "AGENT_WHATSAPP_COLLECTOR",
      clientNom: evenement.clientNom,
      exercice: new Date().getFullYear(),
      intituleAction: "Triage et lettrage de quittance Wave / Orange Money",
      descriptionDetaillee: `Traitement OCR et proposition de lettrage au compte 401/411 pour ${evenement.clientNom}.`,
      scoreConfiance_pct: 88,
      dateCreation: today,
      statut: "EN_ATTENTE_VALIDATION",
      priorite: "NORMALE",
    });
  }

  // Mettre à jour les fiches agents
  for (const agent of agents) {
    if (agentsDeclenches.includes(agent.typeAgent)) {
      agent.statut = "ACTIONS_EN_ATTENTE";
      agent.dernierEvenementDate = today;
      agent.nbActionsEnAttente += actionsGenerees.filter((a) => a.typeAgent === agent.typeAgent).length;
    }
  }

  return { agentsDeclenches, actionsGenerees };
}

export function validerActionAgent(
  actions: ActionProposeeAgent[],
  idAction: string,
  decision: "APPROUVER" | "REJETER"
): { actionsMisesAJour: ActionProposeeAgent[]; actionTraitee?: ActionProposeeAgent } {
  let actionTraitee: ActionProposeeAgent | undefined;

  const actionsMisesAJour = actions.map((act) => {
    if (act.idAction === idAction) {
      actionTraitee = {
        ...act,
        statut: decision === "APPROUVER" ? "APPROUVEE" : "REJETEE",
      };
      return actionTraitee;
    }
    return act;
  });

  return { actionsMisesAJour, actionTraitee };
}

export function calculerKpisAutomatisation(
  actions: ActionProposeeAgent[]
): EtatOrchestrateurCabinet["kpisAutomatisation"] {
  const total = actions.length;
  const approuvees = actions.filter((a) => a.statut === "APPROUVEE" || a.statut === "ACTIVEE_AUTOMATIQUEMENT").length;
  const taux = total > 0 ? Math.round((approuvees / total) * 100) : 100;

  // Estimation : chaque action automatisée validée fait gagner en moyenne 45 minutes (0.75h)
  const heuresGagnees = Math.round(approuvees * 0.75 * 10) / 10;

  return {
    totalActionsProposees: total,
    totalActionsApprouvees: approuvees,
    heuresGagneesEstimees: heuresGagnees,
    tauxAdhesionExpert_pct: taux,
  };
}
