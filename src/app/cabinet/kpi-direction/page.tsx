"use client";

import { useState } from "react";
import Link from "next/link";
import {
  genererRapportDirection,
  type KPICabinet,
  type RapportDirectionCabinet,
} from "@/lib/ohada/kpi-direction-cabinet";

const KPIS_DEMO: KPICabinet = {
  periode: "Novembre 2024",
  factureEmises_XOF: 78_000_000,
  factureEncaissees_XOF: 64_000_000,
  enCoursRecouvrement_XOF: 14_000_000,
  tauxRecouvrement_pct: 82.05,
  wip_XOF: 18_500_000,
  wipParCollaborateur: [
    { nom: "Amadou SOW (Chef de mission)", wip_XOF: 7_200_000, objectif_XOF: 8_000_000 },
    { nom: "Fatou DIOP (Senior Audit)", wip_XOF: 5_100_000, objectif_XOF: 6_000_000 },
    { nom: "Ibrahima FALL (Senior Fiscal)", wip_XOF: 4_200_000, objectif_XOF: 5_000_000 },
    { nom: "Aissatou TOURE (Junior)", wip_XOF: 2_000_000, objectif_XOF: 3_000_000 },
  ],
  nbMissionsActives: 38,
  nbMissionsEnRetard: 3,
  margeGlobaleMissions_pct: 39.5,
  delaiMoyenRecouvrement_jours: 38,
  delaiMoyenProduction_jours: 21,
  alertes: [],
};

const KPIS_N1_DEMO: Partial<KPICabinet> = {
  tauxRecouvrement_pct: 75.0,
  factureEmises_XOF: 65_000_000,
};

export default function KpiDirectionPage() {
  const [cabinetNom, setCabinetNom] = useState("Cabinet EXPERTISE OHADA 360");
  const [kpis, setKpis] = useState<KPICabinet>(KPIS_DEMO);
  const [rapport, setRapport] = useState<RapportDirectionCabinet | null>(() => {
    return genererRapportDirection("Cabinet EXPERTISE OHADA 360", KPIS_DEMO, KPIS_N1_DEMO);
  });
  const [loading, setLoading] = useState(false);

  const handleRecalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/cabinet/kpi-direction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabinet: cabinetNom,
          kpis,
          kpisN1: KPIS_N1_DEMO,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererRapportDirection(cabinetNom, kpis, KPIS_N1_DEMO));
      }
    } catch {
      setRapport(genererRapportDirection(cabinetNom, kpis, KPIS_N1_DEMO));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 65) return "text-teal-400 border-teal-500/40 bg-teal-500/10";
    if (score >= 50) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-purple-400 font-semibold mb-1">
            <span>Pilotage Associés & Direction</span>
            <span>•</span>
            <span>Gouvernance Cabinet 360</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Tableau de Bord Direction Executive (KPIs Temps Réel)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervision stratégique : taux de recouvrement, suivi du WIP, rentabilité des missions et productivité
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cabinet/rentabilite"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Rentabilité Missions
          </Link>
          <Link
            href="/cabinet/partner"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Dashboard Associés →
          </Link>
        </div>
      </div>

      {rapport && (
        <>
          {/* Bannière Score Global & Tendance */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${getScoreColor(rapport.scorePerformanceGlobal)}`}>
                  <span className="text-3xl">{rapport.scorePerformanceGlobal}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider">Score Global</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{rapport.cabinet}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">Période : {rapport.kpis.periode}</span>
                    <span className="text-slate-600">•</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${
                      rapport.tendance === "HAUSSE"
                        ? "text-emerald-400"
                        : rapport.tendance === "BAISSE"
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}>
                      {rapport.tendance === "HAUSSE" ? "▲ En progression" : rapport.tendance === "BAISSE" ? "▼ En repli" : "▶ Stable"} vs N-1
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Recouvrement</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {rapport.kpis.tauxRecouvrement_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">WIP Total</span>
                  <span className="text-sm font-bold font-mono text-purple-400">
                    {rapport.kpis.wip_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Marge Moyenne</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    {rapport.kpis.margeGlobaleMissions_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Missions Retard</span>
                  <span className={`text-sm font-bold font-mono ${rapport.kpis.nbMissionsEnRetard > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {rapport.kpis.nbMissionsEnRetard} / {rapport.kpis.nbMissionsActives}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
              {rapport.narratifExecutif}
            </p>
          </div>

          {/* Alertes & Recommandations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alertes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Alertes de Pilotage ({rapport.kpis.alertes.length})
              </h3>
              {rapport.kpis.alertes.length === 0 ? (
                <p className="text-xs text-emerald-400">✓ Aucun point critique ou alerte d'exploitation.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {rapport.kpis.alertes.map((al, idx) => (
                    <li
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start gap-2 ${
                        al.niveau === "CRITICAL"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : al.niveau === "WARNING"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      }`}
                    >
                      <span>{al.niveau === "CRITICAL" ? "🔴" : al.niveau === "WARNING" ? "🟠" : "ℹ️"}</span>
                      <span>{al.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommandations */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Recommandations Stratégiques ({rapport.recommandationsDirection.length})
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {rapport.recommandationsDirection.map((rec, idx) => (
                  <li key={idx} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-start gap-2">
                    <span className="text-purple-400 font-bold">👉</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tableau WIP par collaborateur */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Suivi du Work In Progress (WIP) par Collaborateur
              </h3>
              <span className="text-xs text-slate-400">
                Objectif de facturation sous 30 jours
              </span>
            </div>

            <div className="space-y-3">
              {rapport.kpis.wipParCollaborateur.map((collab, idx) => {
                const pct = Math.round((collab.wip_XOF / (collab.objectif_XOF || 1)) * 100);
                return (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{collab.nom}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-purple-400 font-bold">{collab.wip_XOF.toLocaleString("fr-FR")} XOF</span>
                        <span className="text-slate-500">/ {collab.objectif_XOF.toLocaleString("fr-FR")} XOF</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pct > 100 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 100 ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Formulaire de simulation / saisie manuelle */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Paramètres du Simulateur de Pilotage
        </h3>
        <form onSubmit={handleRecalculer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Cabinet</label>
            <input
              type="text"
              value={cabinetNom}
              onChange={(e) => setCabinetNom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Période</label>
            <input
              type="text"
              value={kpis.periode}
              onChange={(e) => setKpis({ ...kpis, periode: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Factures Émises (XOF)</label>
            <input
              type="number"
              value={kpis.factureEmises_XOF}
              onChange={(e) => setKpis({ ...kpis, factureEmises_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Factures Encaissées (XOF)</label>
            <input
              type="number"
              value={kpis.factureEncaissees_XOF}
              onChange={(e) => {
                const enc = Number(e.target.value);
                const emises = kpis.factureEmises_XOF;
                const tx = emises > 0 ? (enc / emises) * 100 : 0;
                setKpis({
                  ...kpis,
                  factureEncaissees_XOF: enc,
                  enCoursRecouvrement_XOF: Math.max(0, emises - enc),
                  tauxRecouvrement_pct: tx,
                });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
            />
          </div>

          <div className="col-span-full flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-purple-950/50"
            >
              {loading ? "Calcul..." : "Recalculer les KPIs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
