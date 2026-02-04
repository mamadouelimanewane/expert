"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Users,
    AlertCircle,
    CheckCircle2,
    PieChart,
    BarChart3,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoniMali {
    id: string;
    client: string;
    budgetTemps: number; // en heures
    tempsPasse: number; // en heures
    budgetHonoraires: number; // en FCFA
    coutInterne: number; // en FCFA
    status: "Boni" | "Mali" | "Equilibre";
}

const DATA: BoniMali[] = [
    { id: "1", client: "Société Ivoirienne de Banque", budgetTemps: 120, tempsPasse: 105, budgetHonoraires: 4500000, coutInterne: 3200000, status: "Boni" },
    { id: "2", client: "Orange Sénégal", budgetTemps: 80, tempsPasse: 95, budgetHonoraires: 3200000, coutInterne: 3400000, status: "Mali" },
    { id: "3", client: "Traoré Import-Export", budgetTemps: 60, tempsPasse: 58, budgetHonoraires: 1800000, coutInterne: 1500000, status: "Equilibre" },
    { id: "4", client: "BIDC", budgetTemps: 200, tempsPasse: 240, budgetHonoraires: 8500000, coutInterne: 9200000, status: "Mali" },
];

export default function BoniMaliPage() {
    const [filter, setFilter] = useState("tous");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Tempolia Inspired */}
            <div className="bg-slate-900/60 p-10 rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Gestion Interne & Boni-Mali
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Analyse de <span className="text-indigo-400">Rentabilité Dossier</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Maîtrisez vos marges en temps réel. Comparez le temps passé et le budget prévisionnel pour optimiser vos forfaits de tenue.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Marge Globale Cabine</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-emerald-400">+24.5%</span>
                                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Heures Productives" value="1,240h" trend="+5%" icon={Clock} color="text-indigo-400" />
                <KpiCard title="Boni Total" value="12.5M" trend="+1.2M" icon={TrendingUp} color="text-emerald-400" />
                <KpiCard title="Dossiers en Mali" value="4" trend="-1" icon={AlertCircle} color="text-rose-400" />
                <KpiCard title="Objectif Temps 2024" value="92%" icon={Target} color="text-amber-400" />
            </div>

            {/* Main Rentability Table */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Performance par Dossier
                        </h3>
                        <div className="flex gap-2">
                            {["Tous", "Boni", "Mali"].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setFilter(tag.toLowerCase())}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === tag.toLowerCase() ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 hover:text-white"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Filtrer client ou collaborateur..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Client / Exercice</th>
                                <th className="px-6 py-6 text-center">Budget Temps</th>
                                <th className="px-6 py-6 text-center">Temps Passé</th>
                                <th className="px-6 py-6 text-right">CAO (Honoraires)</th>
                                <th className="px-6 py-6 text-right">Rentabilité</th>
                                <th className="px-6 py-6 text-center">Statut</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {DATA.filter(d => filter === "tous" || d.status.toLowerCase() === filter).map((d) => (
                                <tr key={d.id} className="hover:bg-indigo-600/5 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div>
                                            <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">{d.client}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audit Légal 2024</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-xs font-mono font-bold text-slate-400">{d.budgetTemps}h</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={cn(
                                                "text-xs font-mono font-bold",
                                                d.tempsPasse > d.budgetTemps ? "text-rose-400" : "text-emerald-400"
                                            )}>{d.tempsPasse}h</span>
                                            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full transition-all",
                                                    d.tempsPasse > d.budgetTemps ? "bg-rose-500" : "bg-emerald-500"
                                                )} style={{ width: `${Math.min(100, (d.tempsPasse / d.budgetTemps) * 100)}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="font-bold text-white font-mono">{d.budgetHonoraires.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "font-black text-sm",
                                                d.budgetHonoraires > d.coutInterne ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {d.budgetHonoraires > d.coutInterne ? "+" : ""}
                                                {(((d.budgetHonoraires - d.coutInterne) / d.budgetHonoraires) * 100).toFixed(1)}%
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Marge de Contribution</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                            d.status === "Boni" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                d.status === "Mali" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        )}>
                                            {d.status === "Boni" ? <TrendingUp className="w-3 h-3" /> : d.status === "Mali" ? <TrendingDown className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full bg-indigo-500" />}
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                                            Analyser
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 relative overflow-hidden group">
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                        Alerte Productivité (Mali)
                    </h3>
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            Le dossier <span className="text-white font-bold">Orange Sénégal</span> présente un Mali de 200 000 FCFA ce mois-ci. Les travaux de révision ont pris 15h de plus que prévu.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Voir le détail du temps</button>
                            <button className="px-6 py-2.5 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Ignorer</button>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-950/40">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <PieChart className="w-6 h-6 text-indigo-400" />
                        Répartition du CA par Mission
                    </h3>
                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Visualisation BI Peeramid Connecté</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-full",
                        trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
        </div>
    );
}
