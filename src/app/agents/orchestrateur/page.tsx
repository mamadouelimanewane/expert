"use client";

import { useState } from "react";
import Link from "next/link";
import {
  initialiserAgents,
  routerEvenementVersAgents,
  validerActionAgent,
  calculerKpisAutomatisation,
  type FicheAgentIA,
  type ActionProposeeAgent,
  type EvenementOrchestrateur,
  type TypeAgentIA,
} from "@/lib/ohada/agent-orchestrateur-cabinet";

const ACTIONS_INITIALES: ActionProposeeAgent[] = [
  {
    idAction: "ACT-001",
    typeAgent: "AGENT_SENTINEL_CLOTURE",
    clientNom: "AFRIQUE TRANSIT LOGISTIQUE SA",
    exercice: 2024,
    intituleAction: "Contrôle automatique de bouclage de liasse",
    descriptionDetaillee: "Écart de 1 200 000 XOF détecté sur les comptes de tiers non reclassés (Clients créditeurs au 411).",
    scoreConfiance_pct: 96,
    impactFinancier_XOF: 1_200_000,
    dateCreation: "2024-11-20",
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "HAUTE",
  },
  {
    idAction: "ACT-002",
    typeAgent: "AGENT_FISCAL_DEFENDER",
    clientNom: "SOCIÉTÉ COMMERCIALE DAKAROISE SAS",
    exercice: 2024,
    intituleAction: "Revue prédictive DGID & Déductibilité des charges",
    descriptionDetaillee: "Amortissement véhicule de tourisme au-delà du plafond fiscal de 20M XOF (Réintégration fiscale suggérée : 4 500 000 XOF).",
    scoreConfiance_pct: 92,
    impactFinancier_XOF: 4_500_000,
    dateCreation: "2024-11-20",
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "CRITIQUE",
  },
  {
    idAction: "ACT-003",
    typeAgent: "AGENT_WHATSAPP_COLLECTOR",
    clientNom: "BAOBAB TECH DISTRIBUTION SARL",
    exercice: 2024,
    intituleAction: "Triage OCR et proposition de lettrage Wave",
    descriptionDetaillee: "Quittance Wave n° WV-88912 rapprochée de la facture FAC-2024-0391 (Client KOUAME SARL).",
    scoreConfiance_pct: 89,
    impactFinancier_XOF: 850_000,
    dateCreation: "2024-11-20",
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "NORMALE",
  },
  {
    idAction: "ACT-004",
    typeAgent: "AGENT_CFO_STORYTELLING",
    clientNom: "AGRO-INDUSTRIES DU SÉNÉGAL SA",
    exercice: 2024,
    intituleAction: "Synthèse financière mensuelle pour la Direction Générale",
    descriptionDetaillee: "Génération de la note de trésorerie 13 semaines et explication vulgarisée du BFR pour le Conseil d'Administration.",
    scoreConfiance_pct: 98,
    dateCreation: "2024-11-20",
    statut: "EN_ATTENTE_VALIDATION",
    priorite: "NORMALE",
  },
];

const HISTORIQUE_INIT: EvenementOrchestrateur[] = [
  {
    id: "EVT-101",
    timestamp: "2024-11-20 09:30",
    source: "DEPOT_BALANCE",
    clientNom: "AFRIQUE TRANSIT LOGISTIQUE SA",
    details: "Dépôt balance générale N - 418 comptes importés",
    traitePar: ["AGENT_SENTINEL_CLOTURE", "AGENT_CFO_STORYTELLING"],
  },
  {
    id: "EVT-102",
    timestamp: "2024-11-20 10:15",
    source: "DECLARATION_FISCALE",
    clientNom: "SOCIÉTÉ COMMERCIALE DAKAROISE SAS",
    details: "Préparation déclaration IS exercice 2024",
    traitePar: ["AGENT_FISCAL_DEFENDER"],
  },
  {
    id: "EVT-103",
    timestamp: "2024-11-20 11:05",
    source: "MESSAGE_WHATSAPP",
    clientNom: "BAOBAB TECH DISTRIBUTION SARL",
    details: "Réception quittance Wave justificatif de paiement",
    traitePar: ["AGENT_WHATSAPP_COLLECTOR"],
  },
];

export default function AgentOrchestrateurPage() {
  const [agents, setAgents] = useState<FicheAgentIA[]>(() => {
    const list = initialiserAgents();
    list[0].nbActionsEnAttente = 1;
    list[0].statut = "ACTIONS_EN_ATTENTE";
    list[1].nbActionsEnAttente = 1;
    list[1].statut = "ACTIONS_EN_ATTENTE";
    list[2].nbActionsEnAttente = 1;
    list[2].statut = "ACTIONS_EN_ATTENTE";
    list[3].nbActionsEnAttente = 1;
    list[3].statut = "ACTIONS_EN_ATTENTE";
    return list;
  });

  const [actions, setActions] = useState<ActionProposeeAgent[]>(ACTIONS_INITIALES);
  const [historique, setHistorique] = useState<EvenementOrchestrateur[]>(HISTORIQUE_INIT);
  const [nouveauClient, setNouveauClient] = useState("COUD TRANSIT SA");
  const [nouvelleSource, setNouvelleSource] = useState<string>("DEPOT_BALANCE");
  const [loading, setLoading] = useState(false);

  const kpis = calculerKpisAutomatisation(actions);

  const handleDecision = async (idAction: string, decision: "APPROUVER" | "REJETER") => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/orchestrateur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeAction: "VALIDER_ACTION",
          idAction,
          decision,
          actions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActions(data.actionsMisesAJour);
      } else {
        const { actionsMisesAJour } = validerActionAgent(actions, idAction, decision);
        setActions(actionsMisesAJour);
      }
    } catch {
      const { actionsMisesAJour } = validerActionAgent(actions, idAction, decision);
      setActions(actionsMisesAJour);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclencherEvenement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const evt: EvenementOrchestrateur = {
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      source: nouvelleSource,
      clientNom: nouveauClient,
      details: `Événement ${nouvelleSource} déclenché manuellement pour ${nouveauClient}`,
      traitePar: [],
    };

    try {
      const res = await fetch("/api/agents/orchestrateur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeAction: "ROUTER_EVENEMENT",
          evenement: evt,
          agents,
          actions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
        setActions(data.actionsMisesAJour);
        evt.traitePar = data.agentsDeclenches;
        setHistorique([evt, ...historique]);
      } else {
        const resultat = routerEvenementVersAgents(evt, [...agents]);
        setAgents([...agents]);
        setActions([...actions, ...resultat.actionsGenerees]);
        evt.traitePar = resultat.agentsDeclenches;
        setHistorique([evt, ...historique]);
      }
    } catch {
      const resultat = routerEvenementVersAgents(evt, [...agents]);
      setAgents([...agents]);
      setActions([...actions, ...resultat.actionsGenerees]);
      evt.traitePar = resultat.agentsDeclenches;
      setHistorique([evt, ...historique]);
    } finally {
      setLoading(false);
    }
  };

  const getAgentLink = (type: TypeAgentIA) => {
    switch (type) {
      case "AGENT_SENTINEL_CLOTURE":
        return "/agents/sentinel-cloture";
      case "AGENT_FISCAL_DEFENDER":
        return "/agents/fiscal-defender";
      case "AGENT_WHATSAPP_COLLECTOR":
        return "/agents/whatsapp-collector";
      case "AGENT_CFO_STORYTELLING":
        return "/agents/cfo-storytelling";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              AGENTIC CABINET 360
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              HUMAN-IN-THE-LOOP
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Tour de Contrôle des Agents IA Autonomes
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Supervision de la flotte d&apos;agents spécialisés OHADA • Prise de décision assistée et validation par l&apos;Expert-Comptable
          </p>
        </div>
      </div>

      {/* Cartes KPI Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Actions Proposées</p>
          <p className="text-3xl font-extrabold text-white mt-2">{kpis.totalActionsProposees}</p>
          <p className="text-xs text-slate-500 mt-1">Flotte active 24/7</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Actions Approuvées</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{kpis.totalActionsApprouvees}</p>
          <p className="text-xs text-emerald-500/80 mt-1">Validées par l&apos;Expert</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Heures Économisées</p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-2">{kpis.heuresGagneesEstimees} h</p>
          <p className="text-xs text-slate-500 mt-1">Productivité décuplée</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Taux d&apos;Adhésion Expert</p>
          <p className="text-3xl font-extrabold text-violet-400 mt-2">{kpis.tauxAdhesionExpert_pct} %</p>
          <p className="text-xs text-slate-500 mt-1">Fiabilité prédictive</p>
        </div>
      </div>

      {/* Flotte des 4 Agents Spécialisés */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🤖 Flotte des 4 Agents IA Spécialisés</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.typeAgent}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-violet-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {agent.statut === "ACTIONS_EN_ATTENTE" ? "⚠️ Requiert Revue" : "🟢 En Veille"}
                  </span>
                  <span className="text-xs text-slate-500">{agent.tauxSucces_pct}% succès</span>
                </div>
                <h3 className="text-lg font-bold text-white">{agent.nomVisible}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.role}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">En attente : </span>
                  <span className="font-bold text-amber-400">{agent.nbActionsEnAttente}</span>
                </div>
                <Link
                  href={getAgentLink(agent.typeAgent)}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 underline underline-offset-2"
                >
                  Ouvrir l&apos;agent →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulateur d'événement pour le Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-2">⚡ Déclencher un Événement Cabinet</h2>
        <p className="text-xs text-slate-400 mb-4">
          Simulez l&apos;arrivée d&apos;une balance, d&apos;une pièce comptable WhatsApp ou d&apos;une clôture pour tester le routage autonome.
        </p>
        <form onSubmit={handleDeclencherEvenement} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dossier / Client</label>
            <input
              type="text"
              value={nouveauClient}
              onChange={(e) => setNouveauClient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source d&apos;événement</label>
            <select
              value={nouvelleSource}
              onChange={(e) => setNouvelleSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="DEPOT_BALANCE">Dépôt Balance Générale N</option>
              <option value="MESSAGE_WHATSAPP">Message Justificatif WhatsApp</option>
              <option value="DECLARATION_FISCALE">Déclaration Fiscale Mensuelle / IS</option>
              <option value="CLOTURE_MENSUELLE">Clôture Périodique Automatisée</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Routage en cours..." : "Simuler l'événement →"}
            </button>
          </div>
        </form>
      </div>

      {/* File d'attente Human-in-the-Loop */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🛡️ File de Revue & Validation Human-in-the-Loop</span>
          </h2>
          <span className="text-xs text-slate-400">
            {actions.filter((a) => a.statut === "EN_ATTENTE_VALIDATION").length} action(s) requérant décision
          </span>
        </div>

        <div className="space-y-3">
          {actions.map((act) => (
            <div
              key={act.idAction}
              className={`border rounded-lg p-4 transition-all ${
                act.statut === "APPROUVEE"
                  ? "bg-emerald-950/20 border-emerald-800/40 opacity-75"
                  : act.statut === "REJETEE"
                  ? "bg-rose-950/20 border-rose-800/40 opacity-60"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      act.priorite === "CRITIQUE"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : act.priorite === "HAUTE"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {act.priorite}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">[{act.typeAgent.replace("AGENT_", "")}]</span>
                  <span className="text-sm font-bold text-white">{act.clientNom}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Confiance IA :</span>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                    {act.scoreConfiance_pct}%
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white mb-1">{act.intituleAction}</h4>
              <p className="text-xs text-slate-400 mb-3">{act.descriptionDetaillee}</p>

              {act.impactFinancier_XOF && (
                <div className="text-xs text-slate-300 font-medium mb-3">
                  Impact financier :{" "}
                  <span className="font-mono text-emerald-400 font-bold">
                    {act.impactFinancier_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
              )}

              {/* Actions d'approbation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-xs">
                  Statut :{" "}
                  <span
                    className={`font-semibold ${
                      act.statut === "APPROUVEE"
                        ? "text-emerald-400"
                        : act.statut === "REJETEE"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  >
                    {act.statut.replace(/_/g, " ")}
                  </span>
                </div>

                {act.statut === "EN_ATTENTE_VALIDATION" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(act.idAction, "REJETER")}
                      disabled={loading}
                      className="px-3 py-1 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs rounded transition-colors"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleDecision(act.idAction, "APPROUVER")}
                      disabled={loading}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded shadow transition-colors"
                    >
                      ✓ Approuver & Exécuter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal d'audit des événements */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-4">📜 Journal des Événements & Télémétrie Flotte</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2.5 px-3">Date / Heure</th>
                <th className="py-2.5 px-3">Dossier</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Détails</th>
                <th className="py-2.5 px-3">Agents Mobilisés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {historique.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{evt.timestamp}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{evt.clientNom}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {evt.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{evt.details}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {evt.traitePar.map((ag) => (
                        <span
                          key={ag}
                          className="px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/60 text-[10px]"
                        >
                          {ag.replace("AGENT_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
