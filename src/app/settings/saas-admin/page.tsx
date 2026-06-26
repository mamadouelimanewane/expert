"use client";

import { useState } from "react";
import {
  Lock, TrendingUp, Users, Building2, Receipt, BarChart3,
  CheckCircle2, XCircle, Eye, ShieldOff, Crown, Zap, Star,
  Globe, ArrowUpRight, MoreHorizontal, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const MRR_DATA = [
  { month: "Jan", value: 1850000, height: 30 },
  { month: "Fév", value: 2400000, height: 40 },
  { month: "Mar", value: 2900000, height: 50 },
  { month: "Avr", value: 3500000, height: 60 },
  { month: "Mai", value: 4100000, height: 70 },
  { month: "Jun", value: 4750000, height: 82 },
];

const CABINETS = [
  { name: "Cabinet Ndiaye & Associés", country: "🇸🇳 Dakar, Sénégal", plan: "Enterprise", users: 8, invoices: 342, mrr: 150000, status: "ACTIF" },
  { name: "Cabinet Koffi Expertise", country: "🇨🇮 Abidjan, CI", plan: "Pro", users: 5, invoices: 218, mrr: 65000, status: "ACTIF" },
  { name: "Fiduciaire Douala Partners", country: "🇨🇲 Douala, Cameroun", plan: "Basic", users: 2, invoices: 74, mrr: 25000, status: "TRIAL" },
  { name: "Audit & Conseil Bamako", country: "🇲🇱 Bamako, Mali", plan: "Pro", users: 4, invoices: 156, mrr: 65000, status: "ACTIF" },
  { name: "Expert-Comptable Lomé", country: "🇹🇬 Lomé, Togo", plan: "Basic", users: 2, invoices: 89, mrr: 25000, status: "ACTIF" },
  { name: "BKG Expertise Ouagadougou", country: "🇧🇫 Ouagadougou, BF", plan: "Pro", users: 6, invoices: 201, mrr: 65000, status: "ACTIF" },
  { name: "Cabinet Zinsou & Partners", country: "🇧🇯 Cotonou, Bénin", plan: "Enterprise", users: 10, invoices: 412, mrr: 150000, status: "ACTIF" },
  { name: "Comptabilité Libreville", country: "🇬🇦 Libreville, Gabon", plan: "Basic", users: 1, invoices: 32, mrr: 25000, status: "SUSPENDU" },
];

const PLANS = [
  {
    name: "Basic", price: "25 000", icon: Zap, color: "slate",
    features: ["1-2 utilisateurs", "Jusqu'à 100 clients", "Facturation", "Support email"],
    subscribers: 5, accentClass: "border-slate-500/30 bg-slate-500/5"
  },
  {
    name: "Pro", price: "65 000", icon: Star, color: "indigo",
    features: ["Jusqu'à 6 utilisateurs", "Clients illimités", "Audit IA", "Scanner OCR", "Support prioritaire"],
    subscribers: 14, accentClass: "border-indigo-500/30 bg-indigo-500/10"
  },
  {
    name: "Enterprise", price: "150 000", icon: Crown, color: "amber",
    features: ["Utilisateurs illimités", "API Access", "SLA 99.9%", "Manager dédié", "White-label"],
    subscribers: 4, accentClass: "border-amber-500/30 bg-amber-500/10"
  },
];

export default function SaasAdminPage() {
  const [cabinets, setCabinets] = useState(CABINETS);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleSuspend = (name: string) => {
    setCabinets(prev => prev.map(c =>
      c.name === name ? { ...c, status: c.status === "SUSPENDU" ? "ACTIF" : "SUSPENDU" } : c
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-16">

      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-rose-950/60 to-slate-900/80 border border-rose-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(244,63,94,0.15),_transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Mission Control</h1>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-slate-400 font-medium">Vue globale de tous les cabinets abonnés à la plateforme.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dernière sync</p>
            <p className="text-emerald-400 font-bold text-sm">Il y a 2 minutes</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "MRR", value: "4 750 000 F", trend: "+18%", icon: TrendingUp, color: "emerald" },
          { label: "Cabinets actifs", value: "23", trend: "+3 ce mois", icon: Building2, color: "blue" },
          { label: "Utilisateurs totaux", value: "87", trend: "+11 ce mois", icon: Users, color: "violet" },
          { label: "Rétention", value: "96.4%", trend: "↑ excellent", icon: CheckCircle2, color: "indigo" },
          { label: "Factures globales", value: "1 284", trend: "+204 ce mois", icon: Receipt, color: "amber" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card rounded-[24px] p-5 border border-white/5 bg-slate-900/40 flex flex-col gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
              kpi.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
              kpi.color === "blue" && "bg-blue-500/10 text-blue-400",
              kpi.color === "violet" && "bg-violet-500/10 text-violet-400",
              kpi.color === "indigo" && "bg-indigo-500/10 text-indigo-400",
              kpi.color === "amber" && "bg-amber-500/10 text-amber-400",
            )}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none mb-1">{kpi.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-xs text-emerald-400 font-bold mt-1">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MRR Bar Chart */}
      <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-400" /> Évolution du MRR (6 mois)
          </h2>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            +157% sur 6 mois
          </span>
        </div>
        <div className="flex items-end gap-4 h-48">
          {MRR_DATA.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-slate-500">
                {(bar.value / 1000000).toFixed(1)}M
              </p>
              <div className="w-full rounded-t-xl bg-gradient-to-t from-rose-600 to-rose-400 shadow-lg shadow-rose-500/20 transition-all duration-700"
                style={{ height: `${bar.height}%` }} />
              <p className="text-xs font-bold text-slate-400">{bar.month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cabinets Table */}
      <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" /> Tous les Cabinets Abonnés
          </h2>
          <span className="text-xs font-bold text-slate-500">{cabinets.length} cabinets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Cabinet", "Plan", "Utilisateurs", "Factures", "MRR", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cabinets.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.country}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      c.plan === "Enterprise" ? "bg-amber-500/10 text-amber-400" :
                      c.plan === "Pro" ? "bg-indigo-500/10 text-indigo-400" :
                      "bg-slate-700 text-slate-400"
                    )}>
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-bold">{c.users}</td>
                  <td className="px-6 py-4 text-white font-bold">{c.invoices}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{c.mrr.toLocaleString("fr-FR")} F</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-black uppercase",
                      c.status === "ACTIF" ? "bg-emerald-500/10 text-emerald-400" :
                      c.status === "TRIAL" ? "bg-blue-500/10 text-blue-400" :
                      "bg-rose-500/10 text-rose-400"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSuspend(c.name)}
                        className={cn("p-1.5 rounded-lg text-xs font-bold transition-all",
                          c.status === "SUSPENDU"
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        )}
                        title={c.status === "SUSPENDU" ? "Réactiver" : "Suspendre"}
                      >
                        {c.status === "SUSPENDU" ? <CheckCircle2 className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all" title="Voir Détails">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" /> Plans & Abonnements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <div key={i} className={cn("rounded-[28px] p-7 border glass-card", plan.accentClass)}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{plan.name}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{plan.price} <span className="text-sm font-medium text-slate-400">FCFA/mois</span></p>
                </div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                  plan.color === "slate" ? "bg-slate-700 text-slate-300" :
                  plan.color === "indigo" ? "bg-indigo-500/20 text-indigo-400" :
                  "bg-amber-500/20 text-amber-400"
                )}>
                  <plan.icon className="w-6 h-6" />
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{plan.subscribers} cabinets abonnés</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
