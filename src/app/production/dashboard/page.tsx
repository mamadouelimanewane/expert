"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Users,
    Clock,
    AlertTriangle,
    FileText,
    Target,
    Flame,
    Award,
    Loader2,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    expert: string;
    missionsActives: number;
    heuresSaisies: number;
    avancement: number | null;
    dossiersBloques: number;
}

interface ActiveMission {
    id: string;
    client: string;
    type: string;
    title: string;
    estimatedHours: number;
    consumedHours: number;
    deadline: string | null;
    status: "on-track" | "at-risk" | "critical";
    assignedTo: string;
}

interface BudgetData {
    stats: { sain: number; alertes: number; totalBudget: number };
    activeMissions: ActiveMission[];
    team: TeamMember[];
}

function initials(name: string) {
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "—";
}

export default function ProductionDashboard() {
    const [data, setData] = useState<BudgetData | null>(null);

    useEffect(() => {
        fetch("/api/missions/budget")
            .then((r) => r.json())
            .then(setData)
            .catch(() => setData({ stats: { sain: 0, alertes: 0, totalBudget: 0 }, activeMissions: [], team: [] }));
    }, []);

    if (!data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const totalMissions = data.activeMissions.length;
    const criticalMissions = data.activeMissions.filter((m) => m.status === "critical").length;
    const totalHours = data.team.reduce((acc, t) => acc + t.heuresSaisies, 0);
    const withAvancement = data.team.filter((t) => t.avancement !== null);
    const avgAvancement = withAvancement.length > 0
        ? Math.round(withAvancement.reduce((acc, t) => acc + (t.avancement as number), 0) / withAvancement.length)
        : null;
    const totalBlocked = data.team.reduce((acc, t) => acc + t.dossiersBloques, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Activity className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                Production Cabinet
                            </span>
                            {criticalMissions > 0 && (
                                <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20 animate-pulse">
                                    {criticalMissions} Missions Critiques
                                </span>
                            )}
                        </div>
                        <h2 className="page-title leading-tight">
                            Dashboard <span className="text-emerald-400">Production Cabinet</span>
                        </h2>
                        <p className="page-subtitle">
                            Vue consolidée en temps réel de l'avancement de toutes les missions par équipe et par client.
                        </p>
                    </div>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCard icon={FileText} label="Missions Actives" value={totalMissions.toString()} color="text-primary" />
                <KpiCard icon={Clock} label="Heures Saisies (Équipe)" value={totalHours.toString()} color="text-emerald-400" />
                <KpiCard icon={Target} label="Avancement Budgétaire Moyen" value={avgAvancement !== null ? `${avgAvancement}%` : "—"} color="text-cyan-400" />
                <KpiCard icon={AlertTriangle} label="Dossiers Bloqués" value={totalBlocked.toString()} color="text-rose-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Team Performance Matrix */}
                <div className="lg:col-span-7 apix-card">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Users className="w-6 h-6 text-emerald-400" />
                            Performance Équipe
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {data.team.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-10">Aucun collaborateur avec des missions actives.</p>
                        )}
                        {data.team.map((expert) => (
                            <div key={expert.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xl border border-white/10 group-hover:scale-110 transition-transform">
                                            {initials(expert.expert)}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">{expert.expert}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {expert.missionsActives} mission{expert.missionsActives > 1 ? "s" : ""} active{expert.missionsActives > 1 ? "s" : ""} • {expert.heuresSaisies}h saisies
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Avancement</p>
                                            <div className={cn(
                                                "text-2xl font-black tabular-nums",
                                                expert.avancement === null ? "text-slate-500" :
                                                    expert.avancement >= 90 ? "text-emerald-400" :
                                                        expert.avancement >= 70 ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {expert.avancement !== null ? `${expert.avancement}%` : "—"}
                                            </div>
                                        </div>
                                        {expert.avancement !== null && expert.avancement >= 90 && expert.dossiersBloques === 0 && (
                                            <Award className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                                        )}
                                        {expert.dossiersBloques > 0 && (
                                            <div className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-black rounded-full border border-rose-500/20 animate-pulse">
                                                {expert.dossiersBloques} bloqué{expert.dossiersBloques > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Avancement Bar */}
                                <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 shadow-[0_0_15px]",
                                            expert.avancement === null ? "bg-slate-700" :
                                                expert.avancement >= 90 ? "bg-emerald-500 shadow-emerald-500/50" :
                                                    expert.avancement >= 70 ? "bg-amber-500 shadow-amber-500/50" : "bg-rose-500 shadow-rose-500/50"
                                        )}
                                        style={{ width: `${expert.avancement !== null ? Math.min(expert.avancement, 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Critical List */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-900/60">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Flame className="w-6 h-6 text-rose-500" />
                                Missions à Surveiller
                            </h3>
                        </div>

                        <div className="divide-y divide-white/5">
                            {data.activeMissions.filter((m) => m.status !== "on-track").length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-10">Aucune mission à risque actuellement.</p>
                            )}
                            {data.activeMissions.filter((m) => m.status !== "on-track").map((mission) => {
                                const pct = mission.estimatedHours > 0
                                    ? Math.round((mission.consumedHours / mission.estimatedHours) * 100)
                                    : null;
                                return (
                                    <div key={mission.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{mission.client}</h4>
                                                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">{mission.title}</p>
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
                                                <span className="text-slate-500 font-bold">
                                                    Budget: {mission.consumedHours}h{mission.estimatedHours > 0 ? ` / ${mission.estimatedHours}h` : ""}
                                                </span>
                                                <span className={cn(
                                                    "font-black",
                                                    mission.status === "critical" ? "text-rose-400" : "text-amber-400"
                                                )}>
                                                    {pct !== null ? `${pct}%` : "—"}
                                                </span>
                                            </div>
                                            {pct !== null && (
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            mission.status === "critical" ? "bg-rose-500" : "bg-amber-500"
                                                        )}
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="font-bold">
                                                        Deadline: {mission.deadline ? new Date(mission.deadline).toLocaleDateString("fr-FR") : "—"}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase">
                                                    Assigné: {mission.assignedTo}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="apix-card group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-black mt-1 tracking-tighter", color)}>{value}</h3>
        </div>
    );
}
