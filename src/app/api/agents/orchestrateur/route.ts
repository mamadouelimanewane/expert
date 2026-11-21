import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  initialiserAgents,
  routerEvenementVersAgents,
  validerActionAgent,
  calculerKpisAutomatisation,
  type EvenementOrchestrateur,
  type ActionProposeeAgent,
  type FicheAgentIA,
} from "@/lib/ohada/agent-orchestrateur-cabinet";

const ACTIONS_INITIALES: ActionProposeeAgent[] = [
  {
    idAction: "ACT-INIT-01",
    typeAgent: "AGENT_SENTINEL_CLOTURE",
    clientNom: "AFRIQUE TRANSIT LOGISTIQUE SA",
    exercice: 2024,
    intituleAction: "Contrôle automatique de bouclage de liasse",
    descriptionDetaillee: "Écart de 1 200 000 XOF détecté sur les comptes de tiers non reclassés (Clients créditeurs au 411).",
    scoreConfiance_pct: 96,
    impactFinancier_XOF: 1_200_000,
    dateCreation: new Date().toISOString().slice(0, 10),
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "HAUTE",
  },
  {
    idAction: "ACT-INIT-02",
    typeAgent: "AGENT_FISCAL_DEFENDER",
    clientNom: "SOCIÉTÉ COMMERCIALE DAKAROISE SAS",
    exercice: 2024,
    intituleAction: "Revue prédictive DGID & Déductibilité des charges",
    descriptionDetaillee: "Amortissement véhicule de tourisme au-delà du plafond fiscal de 20M XOF (Réintégration fiscale suggérée : 4 500 000 XOF).",
    scoreConfiance_pct: 92,
    impactFinancier_XOF: 4_500_000,
    dateCreation: new Date().toISOString().slice(0, 10),
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "CRITIQUE",
  },
  {
    idAction: "ACT-INIT-03",
    typeAgent: "AGENT_WHATSAPP_COLLECTOR",
    clientNom: "BAOBAB TECH DISTRIBUTION SARL",
    exercice: 2024,
    intituleAction: "Triage OCR et proposition de lettrage Wave",
    descriptionDetaillee: "Quittance Wave n° WV-88912 rapprochée de la facture FAC-2024-0391 (Client KOUAME SARL).",
    scoreConfiance_pct: 89,
    impactFinancier_XOF: 850_000,
    dateCreation: new Date().toISOString().slice(0, 10),
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "NORMALE",
  },
  {
    idAction: "ACT-INIT-04",
    typeAgent: "AGENT_CFO_STORYTELLING",
    clientNom: "AGRO-INDUSTRIES DU SÉNÉGAL SA",
    exercice: 2024,
    intituleAction: "Synthèse financière mensuelle pour la Direction Générale",
    descriptionDetaillee: "Génération de la note de trésorerie 13 semaines et explication vulgarisée du BFR pour le Conseil d'Administration.",
    scoreConfiance_pct: 98,
    dateCreation: new Date().toISOString().slice(0, 10),
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "NORMALE",
  },
];

export async function GET() {
  const denied = await requireStaff();
  if (denied) return denied;

  const agents = initialiserAgents();
  // Mise à jour initiale des compteurs
  agents[0].nbActionsEnAttente = 1;
  agents[0].statut = "ACTIONS_EN_ATTENTE";
  agents[1].nbActionsEnAttente = 1;
  agents[1].statut = "ACTIONS_EN_ATTENTE";
  agents[2].nbActionsEnAttente = 1;
  agents[2].statut = "ACTIONS_EN_ATTENTE";
  agents[3].nbActionsEnAttente = 1;
  agents[3].statut = "ACTIONS_EN_ATTENTE";

  const kpis = calculerKpisAutomatisation(ACTIONS_INITIALES);

  return NextResponse.json({
    agents,
    actionsEnAttente: ACTIONS_INITIALES,
    kpisAutomatisation: kpis,
  });
}

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      typeAction: "ROUTER_EVENEMENT" | "VALIDER_ACTION";
      evenement?: EvenementOrchestrateur;
      agents?: FicheAgentIA[];
      actions?: ActionProposeeAgent[];
      idAction?: string;
      decision?: "APPROUVER" | "REJETER";
    };

    if (body.typeAction === "ROUTER_EVENEMENT" && body.evenement) {
      const agents = body.agents || initialiserAgents();
      const resultat = routerEvenementVersAgents(body.evenement, agents);
      const toutesActions = [...(body.actions || ACTIONS_INITIALES), ...resultat.actionsGenerees];
      const kpis = calculerKpisAutomatisation(toutesActions);
      return NextResponse.json({
        ...resultat,
        agents,
        actionsMisesAJour: toutesActions,
        kpisAutomatisation: kpis,
      });
    }

    if (body.typeAction === "VALIDER_ACTION" && body.idAction && body.decision) {
      const actions = body.actions || ACTIONS_INITIALES;
      const { actionsMisesAJour, actionTraitee } = validerActionAgent(
        actions,
        body.idAction,
        body.decision
      );
      const kpis = calculerKpisAutomatisation(actionsMisesAJour);
      return NextResponse.json({
        actionsMisesAJour,
        actionTraitee,
        kpisAutomatisation: kpis,
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
