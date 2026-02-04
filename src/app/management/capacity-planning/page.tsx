"use client";

import { useState } from "react";
import {
    Users,
    Calendar,
    BarChart3,
    ArrowRight,
    Search,
    Filter,
    Clock,
    UserCheck,
    AlertCircle,
    Zap,
    TrendingUp,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_CAPACITY = [
    {
        id: "U1",
        name: "Sophie Diop",
        role: "Chef de Mission",
        avatar: "SD",
        capacity: 100, // %
        load: 115, // %
        projects: 12,
        status: "Overloaded",
        expertise: ["Audit", "Vérifiquation"],
        nextFreeSlot: "2 semaines"
    },
    {
        id: "U2",
        name: "Jean Kouassi",
        role: "Collaborateur Confirmé",
        avatar: "JK",
        capacity: 100,
        load: 85,
        projects: 18,
        status: "Optimal",
        expertise: ["Saisie", "Bilan", "Fiscal"],
        nextFreeSlot: "Demain"
    },
    {
        id: "U3",
        name: "Awa Koné",
        role: "Expert Stagiaire",
        avatar: "AK",
        capacity: 80, // Part-time ?
        load: 40,
        projects: 5,
        status: "Underutilized",
        expertise: ["Juridique", "Social"],
        nextFreeSlot: "Aujourd'hui"
    },
    {
        id: "U4",
        name: "Marc T.",
        role: "Manager Audit",
        avatar: "MT",
        capacity: 100,
        load: 95,
        projects: 4,
        status: "At Capacity",
        expertise: ["Commissariat", "Due Diligence"],
        nextFreeSlot: "1 mois"
    }
];

export default function CapacityPlanningPage() {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header: OctoVision / Beeye inspiration */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-indigo-500/20">
                        <Users className="w-3 h-3" /> Planification RH
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Plan de Charge Équipe
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Vision consolidée de la capacité du cabinet. Anticipez les goulots d'étranglement (ex: Période Fiscale) et équilibrez les portefeuilles.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-900/50 p-1 rounded-xl border border-white/10 flex">
                        {["week", "month", "quarter"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                    period === p ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Trimestre"}
                            </button>
                        ))}
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Assigner Tâches
                    </button>
                </div>
            </div>

            {/* Capacity KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CapacityKpi title="Taux de Charge Global" value="88%" status="warning" subtitle="Période Fiscale en approche" />
                <CapacityKpi title="Heures Disponibles" value="142 h" status="success" subtitle="Sur les 2 prochaines semaines" />
                <CapacityKpi title="Collaborateurs Surchargés" value="3" status="danger" subtitle="Risque Burnout / Retard" />
                <CapacityKpi title="Taux Facturable (Billable)" value="76%" status="neutral" subtitle="Objectif: 80%" />
            </div>

            {/* Team Load Visualization */}
            <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-xl flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        Répartition par Collaborateur
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                        <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="space-y-6">
                    {TEAM_CAPACITY.map((member) => (
                        <div key={member.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{member.name}</h4>
                                        <p className="text-xs text-slate-500">{member.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Expertise</p>
                                        <p className="text-xs text-slate-300">{member.expertise.join(", ")}</p>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <span className={cn(
                                            "text-lg font-black",
                                            member.load > 110 ? "text-rose-500" :
                                                member.load > 90 ? "text-amber-500" :
                                                    member.load < 50 ? "text-slate-500" : "text-emerald-500"
                                        )}>
                                            {member.load}%
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Charge</p>
                                    </div>
                                </div>
                            </div>

                            {/* Load Bar */}
                            <div className="relative h-8 bg-slate-950 rounded-lg overflow-hidden flex border border-white/5">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 grid grid-cols-5 pointer-events-none">
                                    <div className="border-r border-white/5 h-full" />
                                    <div className="border-r border-white/5 h-full" />
                                    <div className="border-r border-white/5 h-full" />
                                    <div className="border-r border-white/5 h-full" />
                                </div>

                                <div
                                    className={cn(
                                        "h-full flex items-center px-3 text-[10px] font-bold text-white/80 transition-all duration-1000",
                                        member.load > 100 ? "bg-rose-600" :
                                            member.load > 85 ? "bg-amber-600" :
                                                member.load < 50 ? "bg-slate-700" : "bg-emerald-600"
                                    )}
                                    style={{ width: `${Math.min(member.load, 100)}%` }}
                                >
                                    {member.projects} Dossiers Actifs
                                </div>

                                {/* Overflow Indicator */}
                                {member.load > 100 && (
                                    <div className="h-full bg-rose-500/20 w-full flex items-center justify-center relative pattern-diagonal-lines text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                        Surcharge (+{member.load - 100}%)
                                    </div>
                                )}
                            </div>

                            {/* Recommendation Action */}
                            {member.status === "Overloaded" && (
                                <div className="mt-2 text-xs flex items-center gap-2 text-rose-400 animate-pulse">
                                    <AlertCircle className="w-3 h-3" />
                                    Action requise : Réassigner 2 dossiers (Dossier SARL X, Dossier Y)
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

function CapacityKpi({ title, value, status, subtitle }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{title}</p>
            <h3 className={cn("text-3xl font-black mb-1",
                status === "warning" ? "text-amber-400" :
                    status === "danger" ? "text-rose-400" :
                        status === "success" ? "text-emerald-400" : "text-white"
            )}>{value}</h3>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
    );
}
