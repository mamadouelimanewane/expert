"use client";

import { useState } from "react";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Globe,
    FileText,
    Target,
    Zap,
    Scale,
    ShieldCheck,
    Coins,
    RefreshCw,
    Download,
    Eye,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard,
    Briefcase,
    Calendar,
    Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceKPI {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
    status: "on-track" | "at-risk" | "warning";
}

const MOCK_KPIS: PerformanceKPI[] = [
    { label: "Marge Nette (Groupe)", value: "24.5%", change: "+2.1%", trend: "up", status: "on-track" },
    { label: "Trésorerie Libre", value: "850M FCFA", change: "-50M", trend: "down", status: "warning" },
    { label: "Score ESG (ESG-25)", value: "88/100", change: "+12 pts", trend: "up", status: "on-track" },
    { label: "Exposition Fiscale (Pillar Two)", value: "14.2%", change: "+0.2%", trend: "up", status: "at-risk" },
];

export default function NexusPerformancePage() {
    const [view, setView] = useState<"cpm" | "esg" | "tax">("cpm");

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Nexus Performance CPB */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BarChart3 className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Corporate Performance Management
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-emerald-400">Performance</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Consolidation statutaire, planification financière et reporting ESG. Pilotez votre stratégie avec une précision millimétrée.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 active:scale-95">
                            <Zap className="w-5 h-5" /> Lancer Consolidation
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-2 bg-slate-900/40 rounded-[32px] border border-white/5 w-fit mx-auto shadow-xl">
                {[
                    { id: "cpm", label: "CPM & Consolidation", icon: LayoutDashboard },
                    { id: "esg", label: "Sustainability (ESG)", icon: Globe },
                    { id: "tax", label: "Global Tax Integrity", icon: Scale },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as any)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            view === tab.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: KPIs & Graphs */}
                <div className="lg:col-span-8 space-y-8">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {MOCK_KPIS.map((kpi, i) => (
                            <div key={i} className="glass-card p-6 rounded-3xl bg-slate-900/40 border border-white/5 group hover:border-emerald-500/20 transition-all">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-black text-white">{kpi.value}</span>
                                    <span className={cn("text-[10px] font-bold", kpi.trend === "up" ? "text-emerald-400" : "text-rose-400")}>
                                        {kpi.change}
                                    </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full", kpi.status === "on-track" ? "bg-emerald-500" : kpi.status === "warning" ? "bg-amber-500" : "bg-rose-500")}
                                        style={{ width: "70%" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Chart Card */}
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Analyse de Performance Prédictive</h3>
                                <p className="text-xs text-slate-500">Projection basée sur les données consolidées Q1-Q4 2025</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white"><Settings2 className="w-4 h-4" /></button>
                                <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Simulated Chart Visual */}
                        <div className="h-80 flex items-end gap-3 px-4 relative">
                            {[40, 65, 45, 90, 55, 75, 85, 60, 95, 80, 70, 88].map((val, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-emerald-600/20 to-emerald-400/40 border-t border-emerald-400/50 rounded-t-lg transition-all hover:to-emerald-300/80 cursor-pointer"
                                        style={{ height: `${val}%` }}
                                    />
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                        <div className="px-2 py-1 bg-white text-emerald-900 text-[10px] font-black rounded-md shadow-xl">
                                            {val}M
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Baseline */}
                            <div className="absolute bottom-0 left-0 w-full h-px bg-white/10" />
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] text-slate-600 font-black uppercase">
                            <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Déc</span>
                        </div>
                    </div>
                </div>

                {/* Right: Insights & Actions */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Strategy Card */}
                    <div className="glass-card rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-6 h-6 text-emerald-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Target Insights</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs text-white font-bold mb-1">Optimisation Pillar Two</p>
                                <p className="text-[10px] text-slate-400">Le taux effectif d'impôt au Sénégal approche de 15%. Analyse requise.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs text-white font-bold mb-1">Impact IFRS 16</p>
                                <p className="text-[10px] text-slate-400">Nouveaux contrats de lease détectés. Impact EBITDA +4.2%.</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                        <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Rapports Statutaires</h4>
                        <div className="space-y-2">
                            {[
                                { name: "Rapport Annuel 2025 (Final)", date: "Il y a 2j" },
                                { name: "Liasse Fiscale OHADA Q3", date: "Il y a 1sem" },
                                { name: "Déclaration ESG (GRI Standards)", date: "Il y a 2sem" },
                            ].map((doc, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <p className="text-xs text-slate-300 font-bold">{doc.name}</p>
                                            <p className="text-[9px] text-slate-600">{doc.date}</p>
                                        </div>
                                    </div>
                                    <Download className="w-3 h-3 text-slate-600" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Certification Banner */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-gradient-to-br from-indigo-900/40 to-emerald-900/40 p-1 p-px">
                        <div className="bg-slate-950/80 rounded-[31px] p-6 flex flex-col items-center text-center">
                            <ShieldCheck className="w-10 h-10 text-indigo-400 mb-3" />
                            <h5 className="text-xs font-black text-white uppercase mb-1">Conformité Certifiée</h5>
                            <p className="text-[9px] text-slate-500 px-4">Toutes les données sont auditées et conformes aux normes IFRS et OHADA.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
