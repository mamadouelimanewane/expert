"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { ScoreEvolutionChart } from "@/components/portal/ScoreEvolutionChart";
import {
  TrendingUp, Award, AlertTriangle, ArrowRight, Search, Download,
  Banknote, BarChart2, Bell, ChevronDown, ChevronUp
} from "lucide-react";

type ClientScore = {
  id: string;
  name: string;
  sector: string;
  country: string;
  score: number;
  rating: string;
  lastUpdate: string;
  eligible: boolean;
};

type Evolution = { month: string; score: number };

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

const STAT_PILL: Record<string, string> = {
  AAA: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  AA:  "text-primary bg-primary/10 border-primary/20",
  A:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
  B:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  C:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function HealthScoreDashboard() {
  const [clients, setClients] = useState<ClientScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<Record<string, Evolution[]>>({});

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(d => {
        const mapped: ClientScore[] = (d.clients || []).map((c: any) => ({
          id: c.id,
          name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
          sector: c.sector || "—",
          country: c.country || "—",
          score: c.healthScore ?? 0,
          rating: c.rating || "C",
          lastUpdate: c.updatedAt,
          eligible: (c.healthScore ?? 0) >= 60,
        }));
        setClients(mapped);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!evolutions[id]) {
      fetch(`/api/clients/${id}/health-score`)
        .then(res => res.json())
        .then(d => setEvolutions(prev => ({ ...prev, [id]: d.history || [] })));
    }
  };

  const filtered = clients
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterRating === "ALL" || c.rating === filterRating);

  const eligible = clients.filter(c => c.eligible).length;
  const avgScore = clients.length > 0 ? Math.round(clients.reduce((s, c) => s + c.score, 0) / clients.length) : 0;
  const trendOf = (id: string) => {
    const h = evolutions[id];
    if (!h || h.length < 2) return null;
    return h[h.length - 1].score - h[h.length - 2].score;
  };
  const alerts = clients.filter(c => {
    const t = trendOf(c.id);
    return t !== null && t < 0;
  }).length;

  if (loading) {
    return <div className="p-8 text-slate-400">Chargement des scores…</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Scores de Santé Financière
          </h2>
          <p className="page-subtitle">Vue globale · Évolution · Éligibilité Crédit</p>
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
          { label: "Score moyen cabinet", val: avgScore, unit: "/ 100", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          { label: "Clients éligibles crédit", val: eligible, unit: `/ ${clients.length}`, icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Scores AAA / AA", val: clients.filter(c => ["AAA","AA"].includes(c.rating)).length, unit: "clients", icon: Award, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "Score C (Alertes)", val: clients.filter(c => c.rating === "C").length, unit: "clients", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
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
            className="w-full bg-slate-800 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "AAA", "AA", "A", "B", "C"].map(r => (
            <button key={r} onClick={() => setFilterRating(r)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${filterRating === r ? "bg-primary text-white border-primary" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}>
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
                  {(() => {
                    const t = trendOf(client.id);
                    if (t === null) return <span className="text-slate-600 text-xs">Voir historique</span>;
                    return t > 0
                      ? <span className="text-emerald-400 text-xs font-black flex items-center gap-0.5"><ChevronUp className="w-3 h-3" />+{t} pts</span>
                      : t < 0
                      ? <span className="text-rose-400 text-xs font-black flex items-center gap-0.5"><ChevronDown className="w-3 h-3" />{t} pts</span>
                      : <span className="text-slate-500 text-xs font-bold">Stable</span>;
                  })()}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleExpand(client.id)}
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
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Historique des évaluations</p>
                  {evolutions[client.id] && evolutions[client.id].length > 0 ? (
                    <ScoreEvolutionChart data={evolutions[client.id]} color={RATING_COLOR[client.rating]} height={110} />
                  ) : (
                    <p className="text-xs text-slate-500">Aucune évaluation historique enregistrée pour ce client.</p>
                  )}
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
          <table className="apix-table text-left">
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
                    {(() => {
                      const t = trendOf(client.id);
                      if (t === null) return <span className="text-slate-600 text-xs">—</span>;
                      return t > 0
                        ? <span className="text-emerald-400 text-xs font-black flex items-center gap-1"><ChevronUp className="w-3 h-3" />+{t}</span>
                        : t < 0
                        ? <span className="text-rose-400 text-xs font-black flex items-center gap-1"><ChevronDown className="w-3 h-3" />{t}</span>
                        : <span className="text-slate-500 text-xs">Stable</span>;
                    })()}
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary/20 hover:brightness-110/30 border border-primary/20 text-primary rounded-xl text-xs font-black transition-colors w-fit">
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
