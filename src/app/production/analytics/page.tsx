"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    Search,
    Filter,
    Clock,
    Briefcase,
    DollarSign,
    AlertTriangle,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionBudget {
    id: string;
    client: string;
    name: string;
    expert: string;
    estimatedHours: number;
    consumedHours: number;
    budget: number;
    status: "SAIN" | "ATTENTION" | "DÉPASSEMENT";
}

interface BudgetData {
    stats: { sain: number; alertes: number; totalBudget: number };
    missions: MissionBudget[];
}

export default function MissionBudgetPage() {
    const [data, setData] = useState<BudgetData | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/missions/budget")
            .then((r) => r.json())
            .then(setData)
            .catch(() => setData({ stats: { sain: 0, alertes: 0, totalBudget: 0 }, missions: [] }));
    }, []);

    if (!data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const filtered = data.missions.filter(
        (m) => m.client.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalMissions = data.missions.length;
    const avgConsumption = totalMissions > 0
        ? Math.round(data.missions.reduce((s, m) => s + (m.estimatedHours > 0 ? (m.consumedHours / m.estimatedHours) * 100 : 0), 0) / totalMissions)
        : null;

    // Répartition réelle des heures consommées par expert
    const expertUsage = Object.values(
        data.missions.reduce((acc: Record<string, { name: string; hours: number }>, m) => {
            if (!acc[m.expert]) acc[m.expert] = { name: m.expert, hours: 0 };
            acc[m.expert].hours += m.consumedHours;
            return acc;
        }, {})
    ).sort((a, b) => b.hours - a.hours).slice(0, 5);
    const maxExpertHours = Math.max(1, ...expertUsage.map((e) => e.hours));

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BarChart3 className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                                GPAO & Analyse de Rentabilité
                            </span>
                        </div>
                        <h2 className="page-title leading-tight">
                            Pilotage <span className="text-indigo-400">Budget vs Réalisé</span>
                        </h2>
                        <p className="page-subtitle">
                            Visualisez la rentabilité de chaque mission en temps réel. Détectez les dépassements de temps avant qu'ils ne deviennent critiques.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Consommation Moyenne</p>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-400">{avgConsumption !== null ? `${avgConsumption}%` : "—"}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AnalyticStat icon={Briefcase} label="Missions Budgétées" value={totalMissions} color="text-indigo-400" />
                <AnalyticStat icon={Clock} label="Consommation Moyenne" value={avgConsumption !== null ? `${avgConsumption}%` : "—"} color="text-amber-400" />
                <AnalyticStat icon={DollarSign} label="Budget Total Missions" value={`${(data.stats.totalBudget / 1_000_000).toFixed(1)}M FCFA`} color="text-emerald-400" />
                <AnalyticStat icon={AlertTriangle} label="Missions en Alerte" value={data.stats.alertes} color="text-rose-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Main Budget Table (Left) */}
                <div className="lg:col-span-8 glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 p-4 sm:p-6 lg:p-10 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Analyse par Mission</h3>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-slate-800/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64"
                                />
                            </div>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all border border-white/5">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-10">Aucune mission budgétée ne correspond.</p>
                        )}
                        {filtered.map((budget) => {
                            const pct = budget.estimatedHours > 0 ? Math.round((budget.consumedHours / budget.estimatedHours) * 100) : 0;
                            return (
                                <div key={budget.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                        <div className="col-span-1 md:col-span-1">
                                            <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate uppercase">{budget.client}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold truncate uppercase">{budget.name}</p>
                                            <p className="text-[9px] text-slate-600 font-bold truncate uppercase mt-0.5">{budget.expert}</p>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Progrès Temps: {budget.consumedHours}h / {budget.estimatedHours}h</span>
                                                <span className={cn(
                                                    "text-[10px] font-black",
                                                    budget.status === "SAIN" ? "text-emerald-400" :
                                                        budget.status === "ATTENTION" ? "text-amber-400" : "text-rose-400"
                                                )}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        budget.status === "SAIN" ? "bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]" :
                                                            budget.status === "ATTENTION" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                                    )}
                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-6 text-right">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Budget</p>
                                                <p className="text-lg font-black text-white">
                                                    {budget.budget > 0 ? `${(budget.budget / 1000).toFixed(0)}k F` : "—"}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-all translate-x-0 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Side Analytics (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Distribution Chart — répartition réelle des heures par expert */}
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Heures Consommées par Expert</h3>
                        <div className="space-y-4">
                            {expertUsage.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">Aucune heure enregistrée sur des missions budgétées.</p>
                            )}
                            {expertUsage.map((e) => (
                                <ExpertUsage key={e.name} name={e.name} hours={e.hours} maxHours={maxExpertHours} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticStat({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 tracking-tighter")}>{value}</h3>
        </div>
    );
}

function ExpertUsage({ name, hours, maxHours }: { name: string; hours: number; maxHours: number }) {
    const pct = Math.round((hours / maxHours) * 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] items-center">
                <span className="font-bold text-slate-400 uppercase tracking-widest">{name}</span>
                <span className="font-black text-white">{hours}h</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px]">
                <div
                    className="h-full rounded-full transition-all duration-1000 bg-indigo-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
