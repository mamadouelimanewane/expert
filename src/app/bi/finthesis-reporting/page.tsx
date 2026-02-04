"use client";

import { useState } from "react";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Share2,
    Palette,
    Layers,
    DollarSign,
    Target,
    Activity,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const DATA_WIDGETS = [
    {
        id: "ca",
        title: "Chiffre d'Affaires",
        value: "450M FCFA",
        trend: "+12%",
        trendUp: true,
        type: "bar",
        color: "bg-indigo-500",
        colSpan: 2
    },
    {
        id: "marge",
        title: "Marge Brute",
        value: "68%",
        trend: "-2.5%",
        trendUp: false,
        type: "circle",
        color: "bg-emerald-500",
        colSpan: 1
    },
    {
        id: "ebe",
        title: "EBE",
        value: "125M FCFA",
        trend: "+8%",
        trendUp: true,
        type: "line",
        color: "bg-violet-500",
        colSpan: 1
    },
    {
        id: "treso",
        title: "Trésorerie Nette",
        value: "45M FCFA",
        trend: "Stable",
        trendUp: true,
        type: "wave",
        color: "bg-amber-400",
        colSpan: 2
    }
];

export default function FinthesisReportingPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Finthesis Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-lg shadow-indigo-500/20">
                        Business Intelligence 2.0
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        <BarChart3 className="w-12 h-12 text-indigo-500" />
                        Reporting Visuel Interactif
                    </h1>
                    <p className="text-slate-400 mt-3 text-lg max-w-2xl leading-relaxed">
                        Transformez vos balances comptables en récits financiers captivants.
                        Visualisation dynamique pour <span className="text-white font-bold">Global Tech Solutions</span>.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Personnaliser
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/25 flex items-center gap-2 active:scale-95">
                        <Share2 className="w-4 h-4" /> Partager au Client
                    </button>
                </div>
            </div>

            {/* Smart Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Main KPIs */}
                {DATA_WIDGETS.map((widget) => (
                    <div
                        key={widget.id}
                        className={cn(
                            "glass-card p-8 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group relative overflow-hidden",
                            widget.colSpan === 2 ? "md:col-span-2" : "col-span-1"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                            <ArrowUpRight className="w-16 h-16 text-white" />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{widget.title}</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">{widget.value}</h3>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                                widget.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                                {widget.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {widget.trend}
                            </div>
                        </div>

                        {/* Pseudo-Chart Visualizations */}
                        <div className="h-24 flex items-end gap-2 mt-4 opacity-80">
                            {widget.type === "bar" && [40, 65, 45, 80, 55, 90, 70, 100].map((h, i) => (
                                <div key={i} className={cn("w-full rounded-t-xl transition-all hover:opacity-100", widget.color)} style={{ height: `${h}%` }} />
                            ))}

                            {widget.type === "wave" && (
                                <div className="w-full h-full bg-gradient-to-t from-amber-500/20 to-transparent rounded-xl flex items-end p-2 border border-amber-500/20">
                                    <div className="w-full h-1/2 bg-amber-400/20 blur-xl rounded-full" />
                                </div>
                            )}

                            {widget.type === "circle" && (
                                <div className="w-full flex items-center justify-center">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                                            <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 * (1 - 0.68)} className="text-emerald-500" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {widget.type === "line" && (
                                <div className="w-full h-full flex items-end justify-between">
                                    {[20, 40, 30, 70, 50, 80].map((h, i) => (
                                        <div key={i} className="w-2 rounded-full bg-violet-500" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Cash Flow Bridge */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/40">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-amber-400" />
                            Pont de Trésorerie
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-white">Mensuel</button>
                            <button className="px-4 py-2 bg-transparent rounded-xl text-xs font-bold text-slate-500 hover:text-white">Cumulé</button>
                        </div>
                    </div>

                    {/* Waterfall Chart Simulation */}
                    <div className="flex items-end justify-between h-64 gap-4 px-4 pb-4 border-b border-white/5">
                        <WaterfallBar label="Début" value={100} color="bg-slate-500" start={0} />
                        <WaterfallBar label="EBITDA" value={40} color="bg-emerald-500" start={100} positive />
                        <WaterfallBar label="WCR" value={-15} color="bg-rose-500" start={125} positive={false} />
                        <WaterfallBar label="CAPEX" value={-30} color="bg-rose-500" start={110} positive={false} />
                        <WaterfallBar label="Impôts" value={-10} color="bg-rose-500" start={80} positive={false} />
                        <WaterfallBar label="Fin" value={85} color="bg-indigo-500" start={0} isTotal />
                    </div>
                </div>

                {/* AI Commentary */}
                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <Target className="w-6 h-6 text-indigo-400" />
                        L'avis de l'Expert
                    </h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                "La performance opérationnelle reste solide avec un EBE en hausse de 8%. Attention toutefois à l'augmentation du BFR qui consomme une part importante de la trésorerie générée."
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">EP</div>
                                <div>
                                    <p className="text-xs font-bold text-white">Expert Principal</p>
                                    <p className="text-[10px] text-slate-500">Ajouté le 03/02/2026</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 text-sm">
                            Générer Rapport PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WaterfallBar({ label, value, color, start, positive, isTotal }: any) {
    const height = Math.abs(value);
    const bottom = isTotal || start === 0 ? 0 : start - (positive === false ? height : 0);

    return (
        <div className="flex flex-col items-center gap-2 w-full group relative">
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">
                {value}
            </div>
            <div
                className={cn("w-full rounded-lg transition-all hover:brightness-110 cursor-pointer", color)}
                style={{ height: `${height}%`, marginBottom: `${bottom}%` }}
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate w-full text-center">{label}</span>
        </div>
    );
}
