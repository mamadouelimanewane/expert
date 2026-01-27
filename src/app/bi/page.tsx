"use client";

import { useState } from "react";
import {
    BarChart3,
    PieChart,
    LineChart,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Zap,
    Download,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    BrainCircuit,
    Layers,
    MousePointerClick,
    Eye
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
                            Visualisation avancée et analytique prédictive pour le pilotage de performance du cabinet.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Score Santé IA</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-emerald-400">94/100</span>
                                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Prévision T4</p>
                            <h3 className="text-3xl font-black text-indigo-400">+18%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* BI Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 p-1.5 bg-slate-900 border border-white/10 rounded-[30px] shadow-2xl">
                    <button
                        onClick={() => setActiveView("finance")}
                        className={cn(
                            "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            activeView === "finance" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <TrendingUp className="w-4 h-4" /> Finance
                    </button>
                    <button
                        onClick={() => setActiveView("client")}
                        className={cn(
                            "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            activeView === "client" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <PieChart className="w-4 h-4" /> Portefeuille
                    </button>
                    <button
                        onClick={() => setActiveView("ops")}
                        className={cn(
                            "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            activeView === "ops" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Zap className="w-4 h-4" /> Opérations
                    </button>
                </div>

                <div className="flex gap-3">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-2 flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-slate-500 ml-2" />
                        <span className="text-xs font-bold text-slate-300 pr-4">Janv 2024 - Déc 2024</span>
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
                    <BiMetricCard label="Marge Opérationnelle" value="74.2%" trend="+4.1%" trendDir="up" color="text-emerald-400" />
                    <BiMetricCard label="Retention Client" value="98.5%" trend="+0.5%" trendDir="up" color="text-indigo-400" />
                    <BiMetricCard label="Délai de Paiement (DSO)" value="24 jours" trend="-5j" trendDir="down" color="text-amber-400" />

                    <div className="glass-card p-10 rounded-[50px] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform">
                            <BrainCircuit className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-white font-black text-2xl mb-4 tracking-tighter">Insights IA</h4>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                            L'IA a détecté une opportunité d'optimisation fiscale sur 12 dossiers.
                        </p>
                        <button className="w-full py-4 bg-white text-indigo-900 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                            Voir le rapport complet
                        </button>
                    </div>
                </div>

                {/* Main Visualizations */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Revenue Curve - Fake Visual Components */}
                        <div className="glass-card p-10 rounded-[60px] bg-slate-900/40 border border-white/5 h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-white font-black uppercase text-xs tracking-widest">Évolution du CA (MTD)</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                </div>
                            </div>
                            <div className="flex-1 flex items-end gap-3 px-4">
                                {[30, 45, 35, 60, 55, 80, 75, 95, 85, 110].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div
                                            className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all rounded-t-lg relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-1 w-full h-1 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                                        </div>
                                        <span className="text-[8px] text-slate-600 font-bold">{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Mix */}
                        <div className="glass-card p-10 rounded-[60px] bg-slate-900/40 border border-white/5 h-[400px] flex flex-col">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-10">Mix de Services</h3>
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="w-48 h-48 rounded-full border-[12px] border-slate-800 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-white">12.5M</p>
                                        <p className="text-[8px] text-slate-500 font-black uppercase">Honoraires</p>
                                    </div>
                                    {/* Abstract Dots for Pie Segments */}
                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <div className="absolute bottom-10 left-1/3 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                    <div className="absolute top-1/2 right-10 w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-6">
                                <Label value="55%" color="bg-indigo-500" text="Compta" />
                                <Label value="30%" color="bg-emerald-500" text="Audit" />
                                <Label value="15%" color="bg-rose-500" text="Conseil" />
                            </div>
                        </div>
                    </div>

                    {/* Operational Benchmarking */}
                    <div className="glass-card p-10 rounded-[60px] bg-slate-900/40 border border-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest">Benchmarking Efficacité (IA)</h3>
                            <button className="text-[10px] text-indigo-400 font-black uppercase flex items-center gap-2 hover:text-white transition-colors">
                                Détails Performance <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-8">
                            <BenchRow label="Vitesse de saisie OCR" user={98} market={65} color="bg-cyan-400" />
                            <BenchRow label="Temps de clôture mensuelle" user={88} market={40} color="bg-indigo-400" />
                            <BenchRow label="Réponse Assistant Juridique" user={95} market={30} color="bg-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BiMetricCard({ label, value, trend, trendDir, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-center mb-2">
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
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
                <div className="flex gap-4">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Cabinet: {user}%</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Marché: {market}%</span>
                </div>
            </div>
            <div className="h-3 w-full bg-slate-800/50 rounded-full relative overflow-hidden p-0.5">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_15px]", color.replace("text-", "bg-"))}
                    style={{ width: `${user}%`, opacity: 0.8 }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/20" style={{ left: `${market}%` }} />
            </div>
        </div>
    );
}
