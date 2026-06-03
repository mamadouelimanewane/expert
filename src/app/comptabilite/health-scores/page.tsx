"use client";

import { useState } from "react";
import Link from "next/link";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { TrendingUp, Award, AlertTriangle, ArrowRight, Filter, Search, Download } from "lucide-react";

// Données de démo — en production: appel API /api/clients?include=healthScore
const ALL_CLIENTS = [
  { id: "c1", name: "PMI Dakar SARL", sector: "Commerce", country: "SN", score: 72, rating: "AA", lastUpdate: "2026-06-03", eligible: true },
  { id: "c2", name: "Tech Startup CI", sector: "Technologie", country: "CI", score: 88, rating: "AAA", lastUpdate: "2026-06-03", eligible: true },
  { id: "c3", name: "Chez Marie Traiteur", sector: "Restauration", country: "CI", score: 45, rating: "B", lastUpdate: "2026-06-02", eligible: false },
  { id: "c4", name: "Construction Bâtir SA", sector: "BTP", country: "CM", score: 91, rating: "AAA", lastUpdate: "2026-06-01", eligible: true },
  { id: "c5", name: "Agro-Export Konan", sector: "Agriculture", country: "CI", score: 33, rating: "C", lastUpdate: "2026-05-28", eligible: false },
  { id: "c6", name: "Transport Kaboré SARL", sector: "Transport", country: "BF", score: 61, rating: "A", lastUpdate: "2026-06-03", eligible: true },
];

const STAT_COLORS: Record<string, string> = {
  AAA: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  AA: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  A: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  B: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  C: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function HealthScoreDashboard() {
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filtered = ALL_CLIENTS
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterRating === "ALL" || c.rating === filterRating);

  const eligible = ALL_CLIENTS.filter(c => c.eligible).length;
  const avgScore = Math.round(ALL_CLIENTS.reduce((s, c) => s + c.score, 0) / ALL_CLIENTS.length);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            Scores de Santé Financière
          </h2>
          <p className="text-slate-400 mt-1">Vue globale de la santé financière de tous vos clients TPE/PMI</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-bold text-xs transition-colors">
          <Download className="w-4 h-4" /> Exporter rapport
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Score moyen cabinet", val: avgScore, unit: "/ 100", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Clients éligibles crédit", val: eligible, unit: `/ ${ALL_CLIENTS.length}`, icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Score AAA / AA", val: ALL_CLIENTS.filter(c => ["AAA","AA"].includes(c.rating)).length, unit: "clients", icon: Award, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "Score C (À risque)", val: ALL_CLIENTS.filter(c => c.rating === "C").length, unit: "clients", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-[20px] border ${s.bg} bg-slate-900/30`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{s.unit}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
            className="w-full bg-slate-800 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "AAA", "AA", "A", "B", "C"].map(r => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                filterRating === r
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"
              }`}
            >
              {r === "ALL" ? "Tous" : r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {["cards", "table"].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${viewMode === m ? "bg-slate-700 text-white border-white/10" : "bg-slate-800/50 text-slate-500 border-white/5"}`}
            >
              {m === "cards" ? "🔲 Cartes" : "📋 Tableau"}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de scores */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(client => (
            <div key={client.id} className="group relative">
              <FinancialHealthGauge score={client.score} rating={client.rating} clientName={client.name} />
              <div className="mt-3 px-2 flex items-center justify-between">
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-lg">{client.sector}</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded-lg">{client.country}</span>
                </div>
                {client.eligible && (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Éligible crédit
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rating</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Pays</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Crédit</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Dernière MàJ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{client.name}</p>
                    <p className="text-xs text-slate-500">{client.sector}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${client.score}%` }} />
                      </div>
                      <span className="text-white font-black tabular-nums text-sm">{client.score}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${STAT_COLORS[client.rating]}`}>{client.rating}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{client.country}</td>
                  <td className="p-4">
                    {client.eligible
                      ? <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Award className="w-3 h-3" /> Oui</span>
                      : <span className="text-slate-600 text-xs">Non</span>
                    }
                  </td>
                  <td className="p-4 text-xs text-slate-500">{client.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
