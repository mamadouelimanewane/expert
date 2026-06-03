"use client";

import { useState } from "react";
import {
    BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
    Activity, Target, Zap, Download, Filter, Calendar,
    ArrowUpRight, ArrowDownRight, Search, BrainCircuit,
    Layers, MousePointerClick, Eye, Users, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BusinessIntelligencePage() {
    const [activeView, setActiveView] = useState<"finance" | "client" | "ops">("finance");

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            {/* Header BI - High Tech Look */}
            <div className="relative p-12 rounded-[60px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="p-4 bg-indigo-600 rounded-[28px] shadow-[0_0_40px_rgba(79,70,229,0.4)]">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Business Intelligence</h2>
                        </div>
                        <p className="text-slate-400 text-xl max-w-2xl font-medium leading-relaxed">
                            Visualisation avancée et analytique prédictive pour le pilotage stratégique de votre cabinet.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Score Santé Cabinet</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-emerald-400">94/100</span>
                                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Prévision MRR T4</p>
                            <h3 className="text-3xl font-black text-indigo-400">+18%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* BI Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 p-1.5 bg-slate-900 border border-white/10 rounded-[30px] shadow-2xl overflow-x-auto w-full md:w-auto">
                    {[
                        { id: "finance", label: "Finance & Revenus", icon: TrendingUp },
                        { id: "client", label: "Portefeuille Clients", icon: Users },
                        { id: "ops", label: "Opérations & RH", icon: Zap }
                    ].map((view) => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as any)}
                            className={cn(
                                "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap",
                                activeView === view.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <view.icon className="w-4 h-4" /> {view.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-2 flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-slate-500 ml-2" />
                        <span className="text-xs font-bold text-slate-300 pr-4">Année Fiscale 2024</span>
                    </div>
                    <button className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Interactive BI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Side Metrics */}
                <div className="lg:col-span-1 space-y-6">
                    <BiMetricCard label="Chiffre d'Affaires (YTD)" value="1.2B FCFA" trend="+12.4%" trendDir="up" color="text-white" />
                    <BiMetricCard label="Marge Opérationnelle" value="38.2%" trend="+4.1%" trendDir="up" color="text-emerald-400" />
                    <BiMetricCard label="Taux d'Attrition (Churn)" value="1.5%" trend="-0.5%" trendDir="down" color="text-indigo-400" />
                    <BiMetricCard label="Délai de Recouvrement" value="24 jours" trend="+5j" trendDir="down" color="text-rose-400" />

                    <div className="glass-card p-10 rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform">
                            <BrainCircuit className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-white font-black text-xl mb-4 tracking-tighter">Nexus Insights</h4>
                        <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                            L'IA a identifié que le pôle "Social/Paie" présente une marge sous-optimale (18%). Une automatisation via le module BPO est recommandée.
                        </p>
                        <button className="w-full py-4 bg-white text-indigo-900 font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl hover:shadow-2xl transition-all">
                            Voir l'analyse détaillée
                        </button>
                    </div>
                </div>

                {/* Main Visualizations */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Revenue Curve */}
                        <div className="glass-card p-10 rounded-[50px] bg-slate-900/40 border border-white/5 h-[420px] flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-white font-black uppercase text-xs tracking-widest">Croissance du CA (Mensuel)</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                </div>
                            </div>
                            <div className="flex-1 flex items-end gap-3 px-4">
                                {[45, 52, 48, 60, 65, 80, 75, 95, 85, 110, 105, 125].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div
                                            className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all rounded-t-lg relative"
                                            style={{ height: `${(h/125)*100}%` }}
                                        >
                                            <div className="absolute -top-1 w-full h-1 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                                        </div>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Mix */}
                        <div className="glass-card p-10 rounded-[50px] bg-slate-900/40 border border-white/5 h-[420px] flex flex-col">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8">Rentabilité par Pôle</h3>
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="w-56 h-56 rounded-full border-[16px] border-slate-800 flex items-center justify-center relative">
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-white">38%</p>
                                        <p className="text-[8px] text-slate-500 font-black uppercase">Marge Nette Moyenne</p>
                                    </div>
                                    {/* Abstract Segments */}
                                    <div className="absolute -top-4 -right-4 w-6 h-6 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                                    <div className="absolute bottom-2 left-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                                    <div className="absolute top-1/2 -left-6 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-8">
                                <Label value="45% (Marge)" color="bg-indigo-500" text="Expertise" />
                                <Label value="62% (Marge)" color="bg-emerald-500" text="Audit Légal" />
                                <Label value="18% (Marge)" color="bg-amber-500" text="Social / Paie" />
                            </div>
                        </div>
                    </div>

                    {/* Operational Benchmarking */}
                    <div className="glass-card p-10 rounded-[50px] bg-slate-900/40 border border-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest">Productivité & Temps non facturé</h3>
                            <button className="text-[10px] text-indigo-400 font-black uppercase flex items-center gap-2 hover:text-white transition-colors">
                                Détails par collaborateur <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-8">
                            <BenchRow label="Taux de Facturabilité (Associés)" user={65} market={55} color="bg-cyan-400" />
                            <BenchRow label="Taux de Facturabilité (Collaborateurs)" user={82} market={85} color="bg-indigo-400" />
                            <BenchRow label="Automatisation (Scan/Banque)" user={92} market={40} color="bg-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BiMetricCard({ label, value, trend, trendDir, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[32px] bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all group shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border",
                    trendDir === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                    {trendDir === "up" ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {trend}
                </div>
            </div>
            <h3 className={cn("text-3xl font-black tracking-tighter", color)}>{value}</h3>
        </div>
    );
}

function Label({ value, color, text }: any) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                <span className="text-[10px] font-black text-white">{value}</span>
            </div>
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{text}</p>
        </div>
    );
}

function BenchRow({ label, user, market, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{label}</span>
                <div className="flex gap-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Cabinet: {user}%</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Marché: {market}%</span>
                </div>
            </div>
            <div className="h-3 w-full bg-slate-800/50 rounded-full relative overflow-hidden p-0.5">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_15px]", color.replace("text-", "bg-"))}
                    style={{ width: `${user}%`, opacity: 0.9 }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/20" style={{ left: `${market}%` }} />
            </div>
        </div>
    );
}
