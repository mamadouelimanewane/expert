"use client";

import { useState } from "react";
import Link from "next/link";
import {
  genererStorytellingFinancier,
  type InputFinancierCFO,
  type RapportCFOStorytelling,
} from "@/lib/ohada/agent-cfo-storytelling";

const DONNEES_DEMO: InputFinancierCFO = {
  societeNom: "AGRO-INDUSTRIES DU SÉNÉGAL SA",
  secteurActivite: "Agroalimentaire & Transformation",
  exercice: 2024,
  chiffreAffairesN_XOF: 1_250_000_000,
  chiffreAffairesN1_XOF: 1_050_000_000,
  margeBruteN_XOF: 500_000_000,
  margeBruteN1_XOF: 410_000_000,
  ebeN_XOF: 195_000_000,
  ebeN1_XOF: 155_000_000,
  resultatNetN_XOF: 105_000_000,
  resultatNetN1_XOF: 78_000_000,
  bfrJoursCA: 48,
  dsoClientsJours: 56,
  dpoFournisseursJours: 45,
  tresorerieNette_XOF: 145_000_000,
  cashBurnMensuelMoyen_XOF: 18_000_000,
};

export default function AgentCfoStorytellingPage() {
  const [input, setInput] = useState<InputFinancierCFO>(DONNEES_DEMO);
  const [rapport, setRapport] = useState<RapportCFOStorytelling | null>(() => {
    return genererStorytellingFinancier(DONNEES_DEMO);
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleGenerer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/agents/cfo-storytelling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererStorytellingFinancier(input));
      }
    } catch {
      setRapport(genererStorytellingFinancier(input));
    } finally {
      setLoading(false);
    }
  };

  const copierNote = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.noteSyntheseConseilAdministration);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête avec retour */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/agents/orchestrateur"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              ← Hub Orchestrateur
            </Link>
            <span className="text-slate-600">|</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              AGENT CFO STORYTELLING
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              FATHOM & SYFT STANDARDS
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Storytelling Financier & Synthèse Décisionnelle
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Traduction vulgarisée des chiffres comptables SYSCOHADA en récits stratégiques pour Directeurs Généraux et Conseils
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerer}
            disabled={loading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Génération..." : "Régénérer le récit financier ⚡"}
          </button>
        </div>
      </div>

      {/* Cartes KPI Direction */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Croissance Chiffre d&apos;Affaires</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.kpis.croissanceCA_pct >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {rapport.kpis.croissanceCA_pct > 0 ? "+" : ""}
              {rapport.kpis.croissanceCA_pct} %
            </p>
            <p className="text-xs text-slate-500 mt-1">Comparatif vs N-1</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Marge Opérationnelle (EBE/CA)</p>
            <p className="text-3xl font-extrabold text-cyan-400 mt-2">{rapport.kpis.tauxMargeEBE_pct} %</p>
            <p className="text-xs text-slate-500 mt-1">Marge brute : {rapport.kpis.tauxMargeBrute_pct}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Visibilité Cash Runway</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.kpis.cashRunwayMois >= 6
                  ? "text-emerald-400"
                  : rapport.kpis.cashRunwayMois >= 3
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.kpis.cashRunwayMois} mois
            </p>
            <p className="text-xs text-slate-500 mt-1">{rapport.kpis.statutTresorerie.replace(/_/g, " ")}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">BFR d&apos;Exploitation</p>
            <p className="text-3xl font-extrabold text-violet-400 mt-2">{input.bfrJoursCA} jours</p>
            <p className="text-xs text-slate-500 mt-1">Clients : {input.dsoClientsJours}j | Frn : {input.dpoFournisseursJours}j</p>
          </div>
        </div>
      )}

      {/* Executive Summary Dirigeant */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯 L&apos;Essentiel pour le Directeur Général (Executive Summary)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {rapport.executiveSummary.map((point, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Point Clé {idx + 1}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Récits Explicatifs : Rentabilité & Cash */}
      {rapport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📈 Récit de la Rentabilité</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
              {rapport.recitRentabilite}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>💧 Diagnostic Cash & Cycle d&apos;Exploitation</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
              {rapport.recitTresorerieEtBFR}
            </p>
          </div>
        </div>
      )}

      {/* Plan d'Actions Stratégiques */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🚀 Plan d&apos;Actions Stratégiques Prioritaires</span>
          </h2>

          <div className="space-y-3">
            {rapport.planActionStrategique.map((action, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        action.priorite === "IMMEDIATE"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : action.priorite === "COURT_TERME"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {action.priorite.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-sm font-bold text-white">{action.levier}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{action.description}</p>
                </div>

                {action.gainEstime_XOF && action.gainEstime_XOF > 0 && (
                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs text-slate-400 block">Gain Cash Estimé</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      +{action.gainEstime_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note pour le Conseil d'Administration */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋 Note de Synthèse pour le Conseil d&apos;Administration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rapport officiel prêt pour distribution aux administrateurs et actionnaires
              </p>
            </div>
            <button
              onClick={copierNote}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Note copiée !" : "Copier la note de synthèse 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.noteSyntheseConseilAdministration}
          </pre>
        </div>
      )}
    </div>
  );
}
