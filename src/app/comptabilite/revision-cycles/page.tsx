"use client";

import { useState } from "react";
import {
    CircleDashed,
    CheckCircle2,
    AlertCircle,
    PlayCircle,
    ArrowRight,
    Users,
    ShoppingCart,
    Wallet,
    Building2,
    HardHat,
    Scale,
    Landmark,
    FileSearch,
    ChevronRight,
    Filter,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const CYCLES = [
    {
        id: "achats",
        label: "Cycle Achats & Fournisseurs",
        icon: ShoppingCart,
        progress: 85,
        status: "review",
        anomalies: 2,
        reviewer: "M. Diop"
    },
    {
        id: "ventes",
        label: "Cycle Ventes & Clients",
        icon: Users,
        progress: 100,
        status: "validated",
        anomalies: 0,
        reviewer: "S. Koné"
    },
    {
        id: "tresorerie",
        label: "Cycle Trésorerie & Financement",
        icon: Wallet,
        progress: 45,
        status: "in-progress",
        anomalies: 5,
        reviewer: "A. Touré"
    },
    {
        id: "immo",
        label: "Cycle Immobilisations",
        icon: Building2,
        progress: 10,
        status: "todo",
        anomalies: 0,
        reviewer: "Non assigné"
    },
    {
        id: "social",
        label: "Cycle Personnel & Social",
        icon: HardHat,
        progress: 92,
        status: "review",
        anomalies: 1,
        reviewer: "RH Externe"
    },
    {
        id: "fiscal",
        label: "Cycle État & Fiscalité",
        icon: Scale,
        progress: 60,
        status: "in-progress",
        anomalies: 3,
        reviewer: "M. Diop"
    },
    {
        id: "capitaux",
        label: "Cycle Capitaux Propres",
        icon: Landmark,
        progress: 0,
        status: "todo",
        anomalies: 0,
        reviewer: "Expert"
    }
];

export default function RevisionCyclesPage() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header MyUnisoft Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Production Comptable
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <FileSearch className="w-10 h-10 text-violet-500" />
                        Cycles de Révision
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Pilotage par cycle pour une révision structurée et collaborative.
                        Vue d'ensemble de l'avancement du dossier <span className="text-white font-bold">Société Ivoirienne de Banque</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0c10] bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                EP
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-[#0a0c10] bg-slate-900 flex items-center justify-center text-xs text-slate-500 font-bold">+2</div>
                    </div>
                    <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Valider le Dossier
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard label="Avancement Global" value="65%" color="text-violet-400" />
                <MetricCard label="Cycles Validés" value="1/7" color="text-emerald-400" />
                <MetricCard label="Points en Suspens" value="11" color="text-amber-400" warning />
                <MetricCard label="Documents Manquants" value="4" color="text-rose-400" />
            </div>

            {/* Content Area */}
            <div className="space-y-6">

                {/* Filters */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {["Tous", "A faire", "En cours", "Validés"].map((f) => (
                            <button
                                key={f}
                                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Rechercher un cycle..." className="w-full bg-slate-900 border border-white/5 rounded-lg pl-10 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
                    </div>
                </div>

                {/* Cycles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {CYCLES.map((cycle) => (
                        <div key={cycle.id} className="group glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all hover:border-violet-500/30">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                                    <cycle.icon className="w-6 h-6 text-slate-400 group-hover:text-violet-400 transition-colors" />
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                                    cycle.status === "validated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        cycle.status === "review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            cycle.status === "in-progress" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                                "bg-slate-800 text-slate-500 border-slate-700"
                                )}>
                                    {cycle.status === "validated" ? "Validé" :
                                        cycle.status === "review" ? "En Revue" :
                                            cycle.status === "in-progress" ? "En Cours" : "À Faire"}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{cycle.label}</h3>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                                <Users className="w-3 h-3" />
                                Révisé par : <span className="text-slate-300">{cycle.reviewer}</span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Progression</span>
                                    <span>{cycle.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000",
                                            cycle.progress === 100 ? "bg-emerald-500" : "bg-violet-500"
                                        )}
                                        style={{ width: `${cycle.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                {cycle.anomalies > 0 ? (
                                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4" />
                                        {cycle.anomalies} Anomalies
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        RAS
                                    </span>
                                )}

                                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

function MetricCard({ label, value, color, warning }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className={cn("text-3xl font-black", color)}>{value}</div>
            {warning && <div className="mt-2 h-1 w-full bg-amber-500/20 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-1/2 animate-pulse" /></div>}
        </div>
    );
}
