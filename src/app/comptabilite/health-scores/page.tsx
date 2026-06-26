"use client";

import { useState } from "react";
import Link from "next/link";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { ScoreEvolutionChart } from "@/components/portal/ScoreEvolutionChart";
import {
  TrendingUp, Award, AlertTriangle, ArrowRight, Search, Download,
  Banknote, BarChart2, Bell, ChevronDown, ChevronUp
} from "lucide-react";

const ALL_CLIENTS = [
  {
    id: "c1", name: "PMI Dakar SARL", sector: "Commerce", country: "SN",
    score: 72, rating: "AA", lastUpdate: "2026-06-03", eligible: true,
    evolution: [
      { month: "Jan", score: 45 }, { month: "Fév", score: 50 }, { month: "Mar", score: 55 },
      { month: "Avr", score: 62 }, { month: "Mai", score: 68 }, { month: "Jun", score: 72 },
    ],
    trend: +4,
  },
  {
    id: "c2", name: "Tech Startup CI", sector: "Technologie", country: "CI",
    score: 88, rating: "AAA", lastUpdate: "2026-06-03", eligible: true,
    evolution: [
      { month: "Jan", score: 70 }, { month: "Fév", score: 74 }, { month: "Mar", score: 78 },
      { month: "Avr", score: 81 }, { month: "Mai", score: 85 }, { month: "Jun", score: 88 },
    ],
    trend: +3,
  },
  {
    id: "c3", name: "Chez Marie Traiteur", sector: "Restauration", country: "CI",
    score: 45, rating: "B", lastUpdate: "2026-06-02", eligible: false,
    evolution: [
      { month: "Jan", score: 52 }, { month: "Fév", score: 50 }, { month: "Mar", score: 48 },
      { month: "Avr", score: 47 }, { month: "Mai", score: 46 }, { month: "Jun", score: 45 },
    ],
    trend: -1,
  },
  {
    id: "c4", name: "Construction Bâtir SA", sector: "BTP", country: "CM",
    score: 91, rating: "AAA", lastUpdate: "2026-06-01", eligible: true,
    evolution: [
      { month: "Jan", score: 75 }, { month: "Fév", score: 80 }, { month: "Mar", score: 83 },
      { month: "Avr", score: 86 }, { month: "Mai", score: 89 }, { month: "Jun", score: 91 },
    ],
    trend: +2,
  },
  {
    id: "c5", name: "Agro-Export Konan", sector: "Agriculture", country: "CI",
    score: 33, rating: "C", lastUpdate: "2026-05-28", eligible: false,
    evolution: [
      { month: "Jan", score: 40 }, { month: "Fév", score: 38 }, { month: "Mar", score: 37 },
      { month: "Avr", score: 36 }, { month: "Mai", score: 35 }, { month: "Jun", score: 33 },
    ],
    trend: -2,
  },
  {
    id: "c6", name: "Transport Kaboré SARL", sector: "Transport", country: "BF",
    score: 61, rating: "A", lastUpdate: "2026-06-03", eligible: true,
    evolution: [
      { month: "Jan", score: 50 }, { month: "Fév", score: 53 }, { month: "Mar", score: 56 },
      { month: "Avr", score: 58 }, { month: "Mai", score: 60 }, { month: "Jun", score: 61 },
    ],
    trend: +1,
  },
];

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

const STAT_PILL: Record<string, string> = {
  AAA: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  AA:  "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  A:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
  B:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  C:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function HealthScoreDashboard() {
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ALL_CLIENTS
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterRating === "ALL" || c.rating === filterRating);

  const eligible = ALL_CLIENTS.filter(c => c.eligible).length;
  const avgScore = Math.round(ALL_CLIENTS.reduce((s, c) => s + c.score, 0) / ALL_CLIENTS.length);
  const alerts = ALL_CLIENTS.filter(c => c.trend < 0).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            Scores de Santé Financière
          </h2>
          <p className="text-slate-400 mt-1">Vue globale · Évolution · Éligibilité Crédit</p>
        </div>
        <div className="flex gap-3">
          {alerts > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold">
              <Bell className="w-4 h-4" /> {alerts} score{alerts > 1 ? "s" : ""} en baisse
            </div>
          )}
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-bold text-xs transition-colors">
            <Download className="w-4 h-4" /> Rapport PDF
          </button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Score moyen cabinet", val: avgScore, unit: "/ 100", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Clients éligibles crédit", val: eligible, unit: `/ ${ALL_CLIENTS.length}`, icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Scores AAA / AA", val: ALL_CLIENTS.filter(c => ["AAA","AA"].includes(c.rating)).length, unit: "clients", icon: Award, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "Score C (Alertes)", val: ALL_CLIENTS.filter(c => c.rating === "C").length, unit: "clients", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-[20px] border ${s.bg} bg-slate-900/30`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className={`text-xl sm:text-2xl lg:text-3xl font-black tabular-nums ${s.color}`}>{s.val}</p>
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
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
            className="w-full bg-slate-800 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "AAA", "AA", "A", "B", "C"].map(r => (
            <button key={r} onClick={() => setFilterRating(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${filterRating === r ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}>
              {r === "ALL" ? "Tous" : r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(["cards", "table"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${viewMode === m ? "bg-slate-700 text-white border-white/10" : "bg-slate-800/50 text-slate-500 border-white/5"}`}>
              {m === "cards" ? "🔲 Cartes" : "📋 Tableau"}
            </button>
          ))}
        </div>
      </div>

      {/* Vue CARTES avec graphique d'évolution */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(client => (
            <div key={client.id} className="space-y-2">
              <FinancialHealthGauge score={client.score} rating={client.rating} clientName={client.name} />

              {/* Trend & Actions */}
              <div className="px-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {client.trend > 0
                    ? <span className="text-emerald-400 text-xs font-black flex items-center gap-0.5"><ChevronUp className="w-3 h-3" />+{client.trend} pts/mois</span>
                    : client.trend < 0
                    ? <span className="text-rose-400 text-xs font-black flex items-center gap-0.5"><ChevronDown className="w-3 h-3" />{client.trend} pts/mois</span>
                    : <span className="text-slate-500 text-xs font-bold">Stable</span>
                  }
                  <span className="text-[10px] text-slate-600">6 derniers mois</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                  {client.eligible && (
                    <Link href="/fintech/credit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg transition-colors">
                      <Banknote className="w-3 h-3" /> Crédit
                    </Link>
                  )}
                </div>
              </div>

              {/* Graphique d'évolution (expandable) */}
              {expandedId === client.id && (
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 animate-in slide-in-from-top-1 duration-200">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Évolution Score — 6 mois</p>
                  <ScoreEvolutionChart data={client.evolution} color={RATING_COLOR[client.rating]} height={110} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vue TABLEAU */}
      {viewMode === "table" && (
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/50">
                {["Client", "Score", "Rating", "Tendance", "Pays", "Crédit", "Action"].map(h => (
                  <th key={h} className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
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
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${client.score}%`, background: RATING_COLOR[client.rating] }} />
                      </div>
                      <span className="text-white font-black tabular-nums text-sm">{client.score}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${STAT_PILL[client.rating]}`}>{client.rating}</span>
                  </td>
                  <td className="p-4">
                    {client.trend > 0
                      ? <span className="text-emerald-400 text-xs font-black flex items-center gap-1"><ChevronUp className="w-3 h-3" />+{client.trend}</span>
                      : client.trend < 0
                      ? <span className="text-rose-400 text-xs font-black flex items-center gap-1"><ChevronDown className="w-3 h-3" />{client.trend}</span>
                      : <span className="text-slate-500 text-xs">Stable</span>
                    }
                  </td>
                  <td className="p-4 text-sm text-slate-400">{client.country}</td>
                  <td className="p-4">
                    {client.eligible
                      ? <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Award className="w-3 h-3" /> Oui</span>
                      : <span className="text-slate-600 text-xs">Non</span>
                    }
                  </td>
                  <td className="p-4">
                    {client.eligible && (
                      <Link href="/fintech/credit"
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-black transition-colors w-fit">
                        Dossier Crédit <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
