import { describe, it, expect } from "vitest";
import {
  initialiserAgents,
  routerEvenementVersAgents,
  validerActionAgent,
  calculerKpisAutomatisation,
  type EvenementOrchestrateur,
  type ActionProposeeAgent,
} from "../src/lib/ohada/agent-orchestrateur-cabinet";

describe("Hub Orchestrateur IA — Cabinet Expert OHADA 360", () => {
  it("initialise la flotte complète des 4 agents spécialisés en état de veille", () => {
    const agents = initialiserAgents();
    expect(agents).toHaveLength(4);

    const types = agents.map((a) => a.typeAgent);
    expect(types).toContain("AGENT_SENTINEL_CLOTURE");
    expect(types).toContain("AGENT_FISCAL_DEFENDER");
    expect(types).toContain("AGENT_WHATSAPP_COLLECTOR");
    expect(types).toContain("AGENT_CFO_STORYTELLING");

    for (const ag of agents) {
      expect(ag.statut).toBe("EN_VEILLE");
      expect(ag.tauxSucces_pct).toBeGreaterThan(90);
    }
  });

  it("route un événement de dépôt de balance vers Sentinel Clôture et Fiscal Defender", () => {
    const agents = initialiserAgents();
    const evt: EvenementOrchestrateur = {
      id: "EVT-001",
      timestamp: new Date().toISOString(),
      source: "DEPOT_BALANCE",
      clientNom: "AFRIQUE LOGISTIQUE SA",
      details: "Import de la balance générale N avant clôture",
      traitePar: [],
    };

    const res = routerEvenementVersAgents(evt, agents);
    expect(res.agentsDeclenches).toContain("AGENT_SENTINEL_CLOTURE");
    expect(res.agentsDeclenches).toContain("AGENT_FISCAL_DEFENDER");
    expect(res.actionsGenerees.length).toBeGreaterThanOrEqual(2);

    const actionSentinel = res.actionsGenerees.find((a) => a.typeAgent === "AGENT_SENTINEL_CLOTURE");
    expect(actionSentinel?.clientNom).toBe("AFRIQUE LOGISTIQUE SA");
    expect(actionSentinel?.statut).toBe("EN_ATTENTE_VALIDATION");
    expect(actionSentinel?.scoreConfiance_pct).toBeGreaterThanOrEqual(90);

    // Vérifie que l'agent Sentinel est passé à "ACTIONS_EN_ATTENTE"
    const agentSentinel = agents.find((a) => a.typeAgent === "AGENT_SENTINEL_CLOTURE");
    expect(agentSentinel?.statut).toBe("ACTIONS_EN_ATTENTE");
    expect(agentSentinel?.nbActionsEnAttente).toBeGreaterThan(0);
  });

  it("permet la validation Human-in-the-Loop avec approbation ou rejet d'une action", () => {
    const actions: ActionProposeeAgent[] = [
      {
        idAction: "ACT-TEST-01",
        typeAgent: "AGENT_FISCAL_DEFENDER",
        clientNom: "SAHARA ENERGIE SAS",
        exercice: 2024,
        intituleAction: "Provision pour risque fiscal DGID",
        descriptionDetaillee: "Passation d'écriture compte 699/195 suite à rejet amortissement excédentaire",
        scoreConfiance_pct: 94,
        impactFinancier_XOF: 5_000_000,
        dateCreation: "2024-11-20",
        statut: "EN_ATTENTE_VALIDATION",
        priorite: "CRITIQUE",
      },
    ];

    // Approbation
    const { actionsMisesAJour: apresApprobation, actionTraitee: traitee1 } = validerActionAgent(
      actions,
      "ACT-TEST-01",
      "APPROUVER"
    );
    expect(traitee1?.statut).toBe("APPROUVEE");
    expect(apresApprobation[0].statut).toBe("APPROUVEE");

    // Rejet
    const { actionsMisesAJour: apresRejet, actionTraitee: traitee2 } = validerActionAgent(
      actions,
      "ACT-TEST-01",
      "REJETER"
    );
    expect(traitee2?.statut).toBe("REJETEE");
    expect(apresRejet[0].statut).toBe("REJETEE");
  });

  it("calcule fidèlement les KPIs de gain de temps et le taux d'adhésion de l'expert", () => {
    const actions: ActionProposeeAgent[] = [
      {
        idAction: "1",
        typeAgent: "AGENT_SENTINEL_CLOTURE",
        clientNom: "A",
        exercice: 2024,
        intituleAction: "A1",
        descriptionDetaillee: "D1",
        scoreConfiance_pct: 95,
        dateCreation: "2024-11-20",
        statut: "APPROUVEE",
        priorite: "HAUTE",
      },
      {
        idAction: "2",
        typeAgent: "AGENT_WHATSAPP_COLLECTOR",
        clientNom: "B",
        exercice: 2024,
        intituleAction: "A2",
        descriptionDetaillee: "D2",
        scoreConfiance_pct: 90,
        dateCreation: "2024-11-20",
        statut: "APPROUVEE",
        priorite: "NORMALE",
      },
      {
        idAction: "3",
        typeAgent: "AGENT_FISCAL_DEFENDER",
        clientNom: "C",
        exercice: 2024,
        intituleAction: "A3",
        descriptionDetaillee: "D3",
        scoreConfiance_pct: 70,
        dateCreation: "2024-11-20",
        statut: "REJETEE",
        priorite: "CRITIQUE",
      },
      {
        idAction: "4",
        typeAgent: "AGENT_CFO_STORYTELLING",
        clientNom: "D",
        exercice: 2024,
        intituleAction: "A4",
        descriptionDetaillee: "D4",
        scoreConfiance_pct: 99,
        dateCreation: "2024-11-20",
        statut: "EN_ATTENTE_VALIDATION",
        priorite: "NORMALE",
      },
    ];

    const kpis = calculerKpisAutomatisation(actions);
    expect(kpis.totalActionsProposees).toBe(4);
    expect(kpis.totalActionsApprouvees).toBe(2);
    expect(kpis.tauxAdhesionExpert_pct).toBe(50);
    // 2 approuvées * 0.75h = 1.5h
    expect(kpis.heuresGagneesEstimees).toBe(1.5);
  });
});
