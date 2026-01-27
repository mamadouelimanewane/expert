"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Briefcase,
    Clock,
    DollarSign,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreVertical,
    BarChart,
    PieChart,
    Layers,
    UserCheck,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerKPI {
    id: string;
    collaborator: string;
    role: string;
    billedAmount: string;
    targetAmount: string;
    productivity: number;
    tasksCompleted: number;
    status: "Top" | "Moyen" | "Alerte";
}

const MOCK_KPI: PartnerKPI[] = [
    { id: "1", collaborator: "K. Touré", role: "Chef de Mission", billedAmount: "4.2M", targetAmount: "5M", productivity: 94, tasksCompleted: 28, status: "Top" },
    { id: "2", collaborator: "A. Koné", role: "Sénior", billedAmount: "2.8M", targetAmount: "3.5M", productivity: 82, tasksCompleted: 22, status: "Moyen" },
    { id: "3", collaborator: "M. Ndiaye", role: "Junior", billedAmount: "1.1M", targetAmount: "2M", productivity: 55, tasksCompleted: 15, status: "Alerte" },
    { id: "4", collaborator: "E. Diop", role: "Juriste", billedAmount: "3.5M", targetAmount: "3.5M", productivity: 100, tasksCompleted: 34, status: "Top" },
];

export default function PartnerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <TrendingUp className="w-56 h-56 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/40">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        Pilotage Associé
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg italic">
                        "Prenez des décisions éclairées grâce à l'analyse de rentabilité en temps réel."
                    </p>
                </div>

                <div className="flex flex-col items-end relative z-10">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Chiffre d'Affaires Cabinet (Trimestre)</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black text-white">42.8M</span>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-3 h-3" /> +14.2%
                        </span>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StrategicCard title="Marge Brute Moyenne" value="68%" trend="+4%" subtext="Optimisée par l'IA" icon={DollarSign} color="text-emerald-400" bgColor="bg-emerald-500/10" />
                <StrategicCard title="Dossiers en retard" value="08" trend="-12%" subtext="vs mois dernier" icon={AlertTriangle} color="text-rose-400" bgColor="bg-rose-500/10" />
                <StrategicCard title="Efficacité Saisie" value="x4.2" trend="+120%" subtext="Grâce à l'OCR" icon={Activity} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                <StrategicCard title="Nouveaux Clients" value="15" trend="+3" subtext="Depuis Janvier" icon={UserPlus} color="text-indigo-400" bgColor="bg-indigo-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Collaborateurs */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Performance de l'Équipe
                        </h3>
                        <button className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors">Exporter les KPI</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Collaborateur</th>
                                    <th className="px-6 py-6">Prod. (%)</th>
                                    <th className="px-6 py-6 text-right">Facturé / Objs</th>
                                    <th className="px-6 py-6">Statut</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_KPI.map((kpi) => (
                                    <tr key={kpi.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {kpi.collaborator[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{kpi.collaborator}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{kpi.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[80px]">
                                                    <div className={cn(
                                                        "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px]",
                                                        kpi.productivity > 90 ? "bg-emerald-500 shadow-emerald-500/40" :
                                                            kpi.productivity > 70 ? "bg-amber-500 shadow-amber-500/40" : "bg-rose-500 shadow-rose-500/40"
                                                    )} style={{ width: `${kpi.productivity}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-300">{kpi.productivity}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono font-black text-white">{kpi.billedAmount} FCFA</span>
                                                <span className="text-[10px] text-slate-600 font-medium">Objectif: {kpi.targetAmount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                                kpi.status === "Top" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    kpi.status === "Moyen" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            )}>
                                                {kpi.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Répartition Portefeuille */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-bold mb-8 flex items-center gap-3 uppercase text-xs tracking-widest">
                            <PieChart className="w-4 h-4 text-cyan-400" />
                            Répartition Honoraires
                        </h3>
                        <div className="space-y-6">
                            <DistributionRow label="Comptabilité" value="12M" color="bg-indigo-500" percentage={45} />
                            <DistributionRow label="Commissariat aux Comptes" value="8.5M" color="bg-emerald-500" percentage={30} />
                            <DistributionRow label="Conseil & Stratégie" value="5M" color="bg-amber-500" percentage={15} />
                            <DistributionRow label="Juridique" value="3.1M" color="bg-rose-500" percentage={10} />
                        </div>
                    </div>

                    <div className="glass-card rounded-[40px] p-10 bg-indigo-600 shadow-2xl shadow-indigo-600/30 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform">
                            <Activity className="w-20 h-20" />
                        </div>
                        <h4 className="text-white font-black text-2xl tracking-tighter mb-2">Simuler une Croissance</h4>
                        <p className="text-indigo-100 text-sm opacity-80 mb-6">Prévoyez l'impact d'un nouveau gros compte sur votre trésorerie annuelle.</p>
                        <button className="w-full py-4 bg-white text-indigo-600 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all">
                            Lancer "Imagine: Simulator"
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StrategicCard({ title, value, trend, subtext, icon: Icon, color, bgColor }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl shadow-xl transition-transform group-hover:scale-110", bgColor, color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full border shadow-sm",
                    trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                    {trend}
                </span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
            <p className="text-[10px] text-slate-600 font-medium mt-2">{subtext}</p>
        </div>
    );
}

function DistributionRow({ label, value, color, percentage }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                <span className="text-xs font-black text-white">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px]", color)} style={{ width: `${percentage}%`, opacity: 0.8 }} />
            </div>
        </div>
    );
}

function UserPlus({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="16" x2="22" y1="11" y2="11" />
        </svg>
    )
}
