"use client";

import { useState } from "react";
import {
    Activity,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    Target,
    Zap,
    Flame,
    BarChart3,
    FileText,
    Search,
    Filter,
    Calendar,
    DollarSign,
    Timer,
    Award,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductionMetric {
    expert: string;
    avatar: string;
    missionsActives: number;
    heuresSaisies: number;
    tauxOccupation: number;
    dossiersBloques: number;
    performance: "excellent" | "good" | "warning";
}

interface MissionProgress {
    id: string;
    client: string;
    type: string;
    budget: number;
    consumed: number;
    deadline: string;
    status: "on-track" | "at-risk" | "critical";
    assignedTo: string;
}

const MOCK_TEAM: ProductionMetric[] = [
    { expert: "Moussa Sarr", avatar: "MS", missionsActives: 8, heuresSaisies: 32, tauxOccupation: 95, dossiersBloques: 0, performance: "excellent" },
    { expert: "Awa Diop", avatar: "AD", missionsActives: 6, heuresSaisies: 28, tauxOccupation: 88, dossiersBloques: 1, performance: "good" },
    { expert: "Jean-Paul Mendy", avatar: "JM", missionsActives: 10, heuresSaisies: 18, tauxOccupation: 58, dossiersBloques: 3, performance: "warning" },
    { expert: "Fatima Kouyaté", avatar: "FK", missionsActives: 7, heuresSaisies: 30, tauxOccupation: 92, dossiersBloques: 0, performance: "excellent" },
];

const MOCK_MISSIONS: MissionProgress[] = [
    { id: "M1", client: "SIB Senegal", type: "Révision Annuelle", budget: 120, consumed: 115, deadline: "2024-02-15", status: "critical", assignedTo: "MS" },
    { id: "M2", client: "Orange CI", type: "Audit Social", budget: 80, consumed: 52, deadline: "2024-02-28", status: "on-track", assignedTo: "AD" },
    { id: "M3", client: "Total Energies", type: "Commissariat", budget: 200, consumed: 180, deadline: "2024-02-20", status: "at-risk", assignedTo: "FK" },
    { id: "M4", client: "Bolloré Log.", type: "Conseil Fiscal", budget: 60, consumed: 24, deadline: "2024-03-10", status: "on-track", assignedTo: "JM" },
];

export default function ProductionDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("week");

    const totalMissions = MOCK_MISSIONS.length;
    const criticalMissions = MOCK_MISSIONS.filter(m => m.status === "critical").length;
    const totalHours = MOCK_TEAM.reduce((acc, t) => acc + t.heuresSaisies, 0);
    const avgOccupation = Math.round(MOCK_TEAM.reduce((acc, t) => acc + t.tauxOccupation, 0) / MOCK_TEAM.length);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Activity className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                Queoval Production Engine
                            </span>
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20 animate-pulse">
                                {criticalMissions} Missions Critiques
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Dashboard <span className="text-emerald-400">Production Cabinet</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Vue consolidée en temps réel de l'avancement de toutes les missions par équipe et par client.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-1.5 bg-slate-800 border border-white/5 rounded-2xl flex gap-1">
                            {["day", "week", "month"].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        selectedPeriod === period ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {period === "day" ? "Jour" : period === "week" ? "Semaine" : "Mois"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCard icon={FileText} label="Missions Actives" value={totalMissions.toString()} trend="+2" color="text-indigo-400" />
                <KpiCard icon={Clock} label="Heures Saisies" value={totalHours.toString()} trend="+8%" color="text-emerald-400" />
                <KpiCard icon={Target} label="Taux Occupation" value={`${avgOccupation}%`} trend="+3%" color="text-cyan-400" />
                <KpiCard icon={AlertTriangle} label="Dossiers Bloqués" value="4" trend="stable" color="text-rose-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Team Performance Matrix */}
                <div className="lg:col-span-7 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Users className="w-6 h-6 text-emerald-400" />
                            Performance Équipe (Temps Réel)
                        </h3>
                        <button className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:text-white transition-colors">
                            Exporter
                        </button>
                    </div>

                    <div className="space-y-6">
                        {MOCK_TEAM.map((expert) => (
                            <div key={expert.avatar} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xl border border-white/10 group-hover:scale-110 transition-transform">
                                            {expert.avatar}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">{expert.expert}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {expert.missionsActives} missions actives • {expert.heuresSaisies}h saisies
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Occupation</p>
                                            <div className={cn(
                                                "text-2xl font-black tabular-nums",
                                                expert.tauxOccupation >= 90 ? "text-emerald-400" :
                                                    expert.tauxOccupation >= 70 ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {expert.tauxOccupation}%
                                            </div>
                                        </div>
                                        {expert.performance === "excellent" && (
                                            <Award className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                                        )}
                                        {expert.dossiersBloques > 0 && (
                                            <div className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-black rounded-full border border-rose-500/20 animate-pulse">
                                                {expert.dossiersBloques} bloqué{expert.dossiersBloques > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Occupation Bar */}
                                <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 shadow-[0_0_15px]",
                                            expert.tauxOccupation >= 90 ? "bg-emerald-500 shadow-emerald-500/50" :
                                                expert.tauxOccupation >= 70 ? "bg-amber-500 shadow-amber-500/50" : "bg-rose-500 shadow-rose-500/50"
                                        )}
                                        style={{ width: `${expert.tauxOccupation}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-bold text-white">L'IA recommande de redistribuer 2 missions de Jean-Paul vers Awa.</span>
                        </div>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                            Appliquer
                        </button>
                    </div>
                </div>

                {/* Mission Critical List */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-900/60">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Flame className="w-6 h-6 text-rose-500" />
                                Missions à Surveiller
                            </h3>
                        </div>

                        <div className="divide-y divide-white/5">
                            {MOCK_MISSIONS.filter(m => m.status !== "on-track").map((mission) => (
                                <div key={mission.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{mission.client}</h4>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">{mission.type}</p>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                            mission.status === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" :
                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {mission.status === "critical" ? "Critique" : "À Risque"}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 font-bold">Budget: {mission.consumed}h / {mission.budget}h</span>
                                            <span className={cn(
                                                "font-black",
                                                mission.consumed / mission.budget > 0.9 ? "text-rose-400" : "text-amber-400"
                                            )}>
                                                {Math.round((mission.consumed / mission.budget) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full",
                                                    mission.consumed / mission.budget > 0.9 ? "bg-rose-500" : "bg-amber-500"
                                                )}
                                                style={{ width: `${Math.min((mission.consumed / mission.budget) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                <span className="font-bold">Deadline: {mission.deadline}</span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-600 uppercase">
                                                Assigné: {mission.assignedTo}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Production Velocity */}
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/20">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Vélocité Production (7 jours)</h3>

                        <div className="h-32 flex items-end gap-2">
                            {[65, 78, 72, 88, 95, 82, 90].map((value, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-lg relative cursor-pointer"
                                        style={{ height: `${value}%` }}
                                    >
                                        <div className="absolute -top-1 w-full h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                    </div>
                                    <span className="text-[8px] text-slate-600 font-bold">{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-white">+12% vs semaine précédente</span>
                            </div>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, trend, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase">{trend}</div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className={cn("text-3xl font-black mt-1 tracking-tighter", color)}>{value}</h3>
        </div>
    );
}
