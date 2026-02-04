"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Clock,
    DollarSign,
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CheckCircle2,
    AlertCircle,
    FileText,
    Settings,
    Play
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRACTICE_METRICS = [
    { label: "Chiffre d'Affaires Mensuel", value: "45M FCFA", trend: "+12%", trendUp: true, color: "text-indigo-400" },
    { label: "Marge Moyenne / Dossier", value: "32%", trend: "-1.5%", trendUp: false, color: "text-amber-400" },
    { label: "Taux de Charge Équipe", value: "85%", trend: "Optimal", trendUp: true, color: "text-emerald-400" },
    { label: "Encours de Production", value: "12M FCFA", trend: "+5%", trendUp: true, color: "text-sky-400" },
];

const MISSIONS_STATUS = [
    { client: "Groupe SIFCA", mission: "Tenue & Révision", budget: "1.2M", consumed: 85, profit: "High" },
    { client: "Orange CI", mission: "Audit Légal", budget: "4.5M", consumed: 40, profit: "High" },
    { client: "Pharmacie A.", mission: "Social & Paie", budget: "250K", consumed: 110, profit: "Low" },
    { client: "Boulangerie Moderne", mission: "Tenue Complète", budget: "350K", consumed: 60, profit: "Medium" },
];

export default function PracticeManagementPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Queoval Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Gestion Interne Cabinet
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Briefcase className="w-10 h-10 text-rose-500" />
                        Pilotage & Rentabilité
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        "Combien me rapporte chaque dossier ?" : Mesurez la rentabilité réelle de vos missions.
                        Gestion des temps, facturation et boni/mali.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2">
                        <Play className="w-4 h-4" /> Saisir Temps
                    </button>
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Facturer
                    </button>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRACTICE_METRICS.map((metric, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{metric.label}</p>
                        <div className="flex justify-between items-end">
                            <h3 className={cn("text-2xl font-black", metric.color)}>{metric.value}</h3>
                            <div className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                                metric.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                                {metric.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {metric.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Profitability Analysis Table */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-400" />
                            Analyse de Rentabilité par Mission (Boni/Mali)
                        </h3>
                        <Settings className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-4 pl-4">Client / Mission</th>
                                    <th className="pb-4">Budget (Honoraires)</th>
                                    <th className="pb-4">Conso. Temps</th>
                                    <th className="pb-4">Rentabilité</th>
                                    <th className="pb-4 text-right pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MISSIONS_STATUS.map((m, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="font-bold text-white">{m.client}</div>
                                            <div className="text-xs text-slate-500">{m.mission}</div>
                                        </td>
                                        <td className="py-4 font-mono font-bold text-slate-300">{m.budget}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", m.consumed > 100 ? "bg-rose-500" : "bg-emerald-500")}
                                                        style={{ width: `${Math.min(m.consumed, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={cn("text-xs font-bold", m.consumed > 100 ? "text-rose-400" : "text-emerald-400")}>
                                                    {m.consumed}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                                                m.profit === "High" ? "bg-emerald-500/10 text-emerald-400" :
                                                    m.profit === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                            )}>
                                                {m.profit === "High" ? "Elevée" : m.profit === "Medium" ? "Moyenne" : "Critique"}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <button className="text-xs font-bold text-indigo-400 hover:text-white transition-colors">Détail</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Team Workload */}
                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/40">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Users className="w-5 h-5 text-sky-400" />
                        Charge Équipe
                    </h3>
                    <div className="space-y-6">
                        {["Expert Principal", "Collaborateur Senior", "Assistant Comptable", "Juriste"].map((role, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-300">{role}</span>
                                    <span className="text-white">{[95, 80, 45, 60][i]}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 rounded-full"
                                        style={{ width: `${[95, 80, 45, 60][i]}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-sky-400 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-white mb-1">Attention Surcharge</p>
                            <p className="text-[10px] text-sky-200 leading-relaxed">
                                L'équipe Audit approche de la saturation (95%). Envisagez de déléguer ou de reporter la mission "Inventaire Stock".
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

