"use client";

import { useState } from "react";
import {
    PieChart,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Zap,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Activity,
    Clock,
    Flame,
    Briefcase,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    Calendar,
    ChevronRight,
    MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionBudget {
    id: string;
    client: string;
    mission: string;
    budgetHours: number;
    consumedHours: number;
    budgetAmount: number;
    consumedAmount: number; // calculated from hours * rate
    expert: string;
    status: "on-track" | "warning" | "over-budget";
}

const MOCK_BUDGETS: MissionBudget[] = [
    { id: "B1", client: "Dakar Digital SA", mission: "Révision Annuelle 2023", budgetHours: 80, consumedHours: 62, budgetAmount: 1200000, consumedAmount: 930000, expert: "Awa D.", status: "on-track" },
    { id: "B2", client: "Pharmacie Touba", mission: "Audit Social", budgetHours: 40, consumedHours: 38, budgetAmount: 600000, consumedAmount: 570000, expert: "Moussa S.", status: "warning" },
    { id: "B3", client: "Logistics Express", mission: "Conseil Juridique", budgetHours: 20, consumedHours: 25, budgetAmount: 450000, consumedAmount: 562500, expert: "Jean-Paul M.", status: "over-budget" },
    { id: "B4", client: "Groupe Teranga", mission: "Commissariat", budgetHours: 150, consumedHours: 45, budgetAmount: 3500000, consumedAmount: 1050000, expert: "Awa D.", status: "on-track" },
];

export default function MissionBudgetPage() {
    const totalBudget = MOCK_BUDGETS.reduce((acc, b) => acc + b.budgetAmount, 0);
    const totalConsumed = MOCK_BUDGETS.reduce((acc, b) => acc + b.consumedAmount, 0);
    const avgConsumption = Math.round((totalConsumed / totalBudget) * 100);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header: Queoval GPAO View */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
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
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Pilotage <span className="text-indigo-400">Budget vs Réalisé</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Visualisez la rentabilité de chaque mission en temps réel. Détectez les dépassements de temps avant qu'ils ne deviennent critiques.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rentabilité Globale</p>
                            <h3 className="text-4xl font-black text-emerald-400">{(100 - (avgConsumption - 50)).toFixed(1)}%</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black rounded uppercase">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AnalyticStat icon={Briefcase} label="Missions Analysées" value="24" color="text-indigo-400" trend="stable" />
                <AnalyticStat icon={Clock} label="Consommation Temps" value={`${avgConsumption}%`} color="text-amber-400" trend="+4%" />
                <AnalyticStat icon={DollarSign} label="Marge brute prévisionnelle" value="42%" color="text-emerald-400" trend="+2%" />
                <AnalyticStat icon={AlertTriangle} label="Dépassements détectés" value="3" color="text-rose-400" trend="+1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Main Budget Table (Left) */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Analyse par Mission</h3>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input placeholder="Rechercher..." className="bg-slate-800/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64" />
                            </div>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all border border-white/5">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {MOCK_BUDGETS.map((budget) => (
                            <div key={budget.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                    <div className="col-span-1 md:col-span-1">
                                        <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate uppercase">{budget.client}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold truncate uppercase">{budget.mission}</p>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Progrès Temps: {budget.consumedHours}h / {budget.budgetHours}h</span>
                                            <span className={cn(
                                                "text-[10px] font-black",
                                                budget.status === "on-track" ? "text-emerald-400" :
                                                    budget.status === "warning" ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {Math.round((budget.consumedHours / budget.budgetHours) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    budget.status === "on-track" ? "bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]" :
                                                        budget.status === "warning" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                                )}
                                                style={{ width: `${Math.min((budget.consumedHours / budget.budgetHours) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-6 text-right">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Marge Est.</p>
                                            <p className={cn(
                                                "text-lg font-black",
                                                budget.consumedAmount > budget.budgetAmount ? "text-rose-400" : "text-emerald-400"
                                            )}>
                                                {((1 - budget.consumedAmount / budget.budgetAmount) * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-all translate-x-0 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 py-5 border border-dashed border-white/5 rounded-3xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 hover:bg-white/5 transition-all">
                        Voir toutes les missions et historiques GPAO
                    </button>
                </div>

                {/* 2. Side Analytics (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Insights Card */}
                    <div className="glass-card p-10 rounded-[48px] border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-32 h-32 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                            Nexus Financial Insights
                        </h3>

                        <div className="space-y-6">
                            <InsightRow
                                title="Alerte Rentabilité"
                                desc="La mission 'Conseil Juridique' de Logistics Express a dépassé le budget de 25%."
                                status="critical"
                            />
                            <InsightRow
                                title="Optimisation Suggérée"
                                desc="Déléguer la saisie sur 'Dakar Digital' à un profil junior pour restaurer 15% de marge."
                                status="info"
                            />
                            <InsightRow
                                title="Vigilance Deadline"
                                desc="3 missions de révision sont à 90% budget avec 15 jours de travail restants."
                                status="warning"
                            />
                        </div>

                        <button className="mt-10 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-900/40">
                            Générer Rapport de Rentabilité
                        </button>
                    </div>

                    {/* Distribution Chart (Placeholder/Abstract) */}
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Répartition par Expert</h3>
                        <div className="space-y-4">
                            <ExpertUsage name="Awa Diop" usage={92} color="bg-indigo-500" />
                            <ExpertUsage name="Moussa Sarr" usage={74} color="bg-emerald-500" />
                            <ExpertUsage name="Jean-Paul Mendy" usage={45} color="bg-amber-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticStat({ icon: Icon, label, value, color, trend }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" :
                            trend.startsWith('-') ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-500"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className={cn("text-3xl font-black text-white mt-1 tracking-tighter")}>{value}</h3>
        </div>
    );
}

function InsightRow({ title, desc, status }: any) {
    const statusColors = {
        critical: "bg-rose-500 text-rose-500",
        warning: "bg-amber-500 text-amber-500",
        info: "bg-indigo-500 text-indigo-500",
    } as any;

    return (
        <div className="space-y-2 group/row">
            <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", statusColors[status].split(' ')[0])} />
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", statusColors[status].split(' ')[1])}>{title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium pl-5 group-hover/row:text-slate-200 transition-colors">
                {desc}
            </p>
        </div>
    );
}

function ExpertUsage({ name, usage, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] items-center">
                <span className="font-bold text-slate-400 uppercase tracking-widest">{name}</span>
                <span className="font-black text-white">{usage}% Capacity</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px]">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                    style={{ width: `${usage}%` }}
                />
            </div>
        </div>
    );
}
