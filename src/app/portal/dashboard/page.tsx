"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutGrid, Users, TrendingUp, AlertTriangle, Smartphone,
  CheckCircle2, Clock, MessageCircle, Star, ArrowUpRight,
  ArrowDownRight, FileText, Zap, Search, Filter, Building2,
  ChevronRight, Activity, BarChart3, PieChart, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

const MOCK_CLIENTS = [
  {
    id: "c1", name: "Entreprise Alpha SARL", sector: "BTP", country: "SN", score: 82, rating: "A",
    hasPortal: true, lastActivity: "Il y a 1h",
    alerts: [], tpe: false, revenue: 15_000_000, trend: +8,
    pendingDocs: 0, mission: "Révision Q2 2026"
  },
  {
    id: "c2", name: "Boutique Awa", sector: "Commerce", country: "SN", score: 87, rating: "A",
    hasPortal: true, lastActivity: "Il y a 2h",
    alerts: [], tpe: true, revenue: 1_800_000, trend: +12,
    pendingDocs: 3, mission: "BPO Mensuel"
  },
  {
    id: "c3", name: "Transport Ibra", sector: "Transport", country: "SN", score: 43, rating: "C",
    hasPortal: false, lastActivity: "Il y a 1j",
    alerts: ["Score en baisse", "Retard déclaration"], tpe: true, revenue: 380_000, trend: -15,
    pendingDocs: 8, mission: "Suivi informel"
  },
  {
    id: "c4", name: "Pharmacie Dior", sector: "Santé", country: "SN", score: 94, rating: "AAA",
    hasPortal: true, lastActivity: "Il y a 30min",
    alerts: [], tpe: true, revenue: 4_800_000, trend: +22,
    pendingDocs: 0, mission: "Bilan annuel"
  },
  {
    id: "c5", name: "Tech Solutions CI", sector: "IT", country: "CI", score: 71, rating: "A",
    hasPortal: true, lastActivity: "Il y a 3j",
    alerts: ["Facture impayée"], tpe: false, revenue: 22_000_000, trend: +5,
    pendingDocs: 2, mission: "Due Diligence"
  },
];

function ScorePill({ rating }: { rating: string }) {
  const color = RATING_COLOR[rating] || "#64748b";
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black border" style={{ color, background: color + "15", borderColor: color + "30" }}>
      {rating}
    </span>
  );
}

export default function PortalDashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "tpe" | "pmi" | "alerts">("all");
  const [selected, setSelected] = useState(MOCK_CLIENTS[0]);

  const filtered = MOCK_CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.sector.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "tpe" ? c.tpe :
      filter === "pmi" ? !c.tpe :
      filter === "alerts" ? c.alerts.length > 0 : true;
    return matchSearch && matchFilter;
  });

  const totalCA = MOCK_CLIENTS.reduce((a, c) => a + c.revenue, 0);
  const alertCount = MOCK_CLIENTS.filter(c => c.alerts.length > 0).length;
  const tpeCount = MOCK_CLIENTS.filter(c => c.tpe).length;
  const avgScore = Math.round(MOCK_CLIENTS.reduce((a, c) => a + c.score, 0) / MOCK_CLIENTS.length);

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-500/10">
            <LayoutGrid className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Portail Cabinet — PMI & BPO</h2>
            <p className="text-slate-400 mt-1">Vision 360° de tous vos clients. TPE informels, PMI, et grands comptes dans un seul écran.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/comptabilite/tpe-processing" className="px-5 py-3 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-black text-xs transition-all flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Usine BPO
          </Link>
          <Link href="/comptabilite/tpe-dashboard" className="px-5 py-3 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 text-violet-400 rounded-xl font-black text-xs transition-all flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Scores TPE
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Clients Actifs", val: MOCK_CLIENTS.length, sub: `${tpeCount} TPE · ${MOCK_CLIENTS.length - tpeCount} PMI`, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { icon: TrendingUp, label: "CA Clients Géré", val: (totalCA / 1_000_000).toFixed(1) + " M FCFA", sub: "+12% vs mois préc.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: Star, label: "Score Santé Moyen", val: avgScore + " / 100", sub: "Portefeuille Cabinet", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { icon: AlertTriangle, label: "Clients en Alerte", val: alertCount, sub: "Nécessitent attention", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
        ].map((k, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", k.color)}>
            <k.icon className="w-5 h-5 mb-4" />
            <p className="text-2xl font-black tabular-nums">{k.val}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{k.label}</p>
            <p className="text-[10px] mt-1 opacity-50">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* Liste Clients */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recherche & Filtres */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "pmi", "tpe", "alerts"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                    filter === f ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-800/50 text-slate-500 border-transparent hover:text-white"
                  )}
                >
                  {f === "all" ? "Tous" : f === "pmi" ? "PMI / PME" : f === "tpe" ? "TPE / Informel" : "🚨 Alertes"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto custom-scrollbar">
            {filtered.map(client => {
              const isSelected = selected.id === client.id;
              const color = RATING_COLOR[client.rating] || "#64748b";
              return (
                <div
                  key={client.id}
                  onClick={() => setSelected(client)}
                  className={cn(
                    "cursor-pointer p-4 rounded-2xl border transition-all",
                    isSelected ? "bg-indigo-600/10 border-indigo-500/30" : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border"
                        style={{ background: color + "15", borderColor: color + "30", color }}
                      >
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-bold text-sm truncate", isSelected ? "text-indigo-300" : "text-white")}>{client.name}</p>
                          {client.tpe && <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-black uppercase shrink-0">TPE</span>}
                        </div>
                        <p className="text-[10px] text-slate-500">{client.sector} · {client.country}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ScorePill rating={client.rating} />
                      {client.alerts.length > 0 && (
                        <span className="text-[8px] text-rose-400 font-black flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> {client.alerts.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500">{client.lastActivity}</p>
                    <div className={cn("flex items-center gap-1 text-[10px] font-black", client.trend > 0 ? "text-emerald-400" : "text-rose-400")}>
                      {client.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(client.trend)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fiche Client */}
        <div className="lg:col-span-7 space-y-5">
          {selected && (
            <>
              {/* Identité + Score */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border"
                      style={{ background: RATING_COLOR[selected.rating] + "15", borderColor: RATING_COLOR[selected.rating] + "30", color: RATING_COLOR[selected.rating] }}
                    >
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-white">{selected.name}</h3>
                        {selected.tpe && <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-black uppercase">TPE</span>}
                      </div>
                      <p className="text-sm text-slate-400">{selected.sector} · {selected.country === "SN" ? "Sénégal 🇸🇳" : "Côte d'Ivoire 🇨🇮"}</p>
                      <p className="text-xs text-slate-500 mt-1">Mission : {selected.mission}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selected.hasPortal && (
                      <Link href={`/portal/saisie`} className="px-4 py-2.5 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400 rounded-xl font-black text-xs flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> Portail Client
                      </Link>
                    )}
                    <Link href="/payroll" className="px-4 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl font-black text-xs flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Paie
                    </Link>
                  </div>
                </div>

                {/* Score + alertes */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 p-5 rounded-2xl border" style={{ background: RATING_COLOR[selected.rating] + "08", borderColor: RATING_COLOR[selected.rating] + "25" }}>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Score Santé Financière</p>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl sm:text-3xl lg:text-5xl font-black tabular-nums" style={{ color: RATING_COLOR[selected.rating] }}>{selected.score}</p>
                      <div>
                        <ScorePill rating={selected.rating} />
                        <p className="text-[10px] text-slate-500 mt-2">
                          {selected.score >= 80 ? "✅ Excellent — Éligible financement" :
                           selected.score >= 60 ? "⚡ Bon — Quelques axes d'amélioration" :
                           "⚠️ À surveiller — Plan de redressement"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${selected.score}%`, backgroundColor: RATING_COLOR[selected.rating] }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">CA</p>
                        <p className="text-sm font-black text-white">{(selected.revenue / 1_000_000).toFixed(1)} M F</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Activité</p>
                        <p className="text-sm font-black text-white">{selected.lastActivity}</p>
                      </div>
                    </div>
                    <div className={cn("p-3 rounded-xl border flex items-center gap-3", selected.pendingDocs > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-800/40 border-white/5")}>
                      <FileText className={cn("w-4 h-4 shrink-0", selected.pendingDocs > 0 ? "text-amber-400" : "text-slate-500")} />
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">En attente</p>
                        <p className={cn("text-sm font-black", selected.pendingDocs > 0 ? "text-amber-400" : "text-white")}>{selected.pendingDocs} pièces</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes */}
              {selected.alerts.length > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-[24px] p-5 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Alertes Détectées
                  </p>
                  {selected.alerts.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-rose-500/10 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <p className="text-sm font-bold text-rose-300">{a}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions rapides */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Générer Liasse", icon: FileText, href: "/documents/generation", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                  { label: "Traiter Paie", icon: BarChart3, href: "/payroll", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { label: "Score & Attestation", icon: ShieldCheck, href: "/comptabilite/tpe-dashboard", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                ].map((a, i) => (
                  <Link key={i} href={a.href} className={cn("p-5 rounded-2xl border transition-all hover:scale-[1.02] group flex items-center gap-3", a.color)}>
                    <a.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs">{a.label}</p>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
