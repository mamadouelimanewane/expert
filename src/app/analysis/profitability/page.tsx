"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    DollarSign,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientProfit {
    id: string;
    company: string;
    annualRevenue: number;
    hoursSpent: number;
    effectiveHourlyRate: number;
    margin: number;
    status: "Rentable" | "À Surveiller" | "Sous-facturé";
    trend: "up" | "down" | "stable";
}

const MOCK_PROFIT: ClientProfit[] = [
    { id: "1", company: "Société Ivoirienne de Banque", annualRevenue: 12000000, hoursSpent: 480, effectiveHourlyRate: 25000, margin: 42, status: "Rentable", trend: "up" },
    { id: "2", company: "Traoré Import-Export", annualRevenue: 4500000, hoursSpent: 280, effectiveHourlyRate: 16071, margin: 15, status: "Sous-facturé", trend: "down" },
    { id: "3", company: "Boulangerie du Plateau", annualRevenue: 2400000, hoursSpent: 80, effectiveHourlyRate: 30000, margin: 55, status: "Rentable", trend: "stable" },
    { id: "4", company: "Telecom Afrique SA", annualRevenue: 18000000, hoursSpent: 900, effectiveHourlyRate: 20000, margin: 28, status: "À Surveiller", trend: "down" },
];

export default function ClientProfitabilityPage() {
    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <TrendingUp className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                        <div className="p-4 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-600/30">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                        Rentabilité Clients & Pilotage
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                        Analyse comparative entre honoraires perçus et temps réel passé. Optimisez votre marge par dossier.
                    </p>
                </div>

                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 relative z-10">
                    <Download className="w-4 h-4" /> Exporter Rapport Associés
                </button>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlobalKPICard title="Taux Horaire Moyen" value="22 500" unit="FCFA" trend="+5%" icon={DollarSign} color="text-indigo-400" />
                <GlobalKPICard title="Marge Brute Globale" value="38" unit="%" trend="+2.4%" icon={Activity} color="text-emerald-400" />
                <GlobalKPICard title="Dossiers Sous-facturés" value="12" unit="" trend="-2" icon={AlertCircle} color="text-rose-400" />
                <GlobalKPICard title="Productivité Équipe" value="84" unit="%" trend="+3%" icon={Clock} color="text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Table */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            Performances par Dossier
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Filtrer client..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Client</th>
                                    <th className="px-4 py-6 text-right">CA annuel</th>
                                    <th className="px-4 py-6 text-right">Taux Horaire</th>
                                    <th className="px-4 py-6 text-right">Marge</th>
                                    <th className="px-6 py-6">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_PROFIT.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-white">
                                                    {client.company[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block truncate max-w-[180px]">{client.company}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{client.hoursSpent}h passées</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-right font-mono font-bold text-slate-300">
                                            {(client.annualRevenue / 1000000).toFixed(1)}M
                                        </td>
                                        <td className="px-4 py-6 text-right font-mono font-bold">
                                            <span className={cn(
                                                client.effectiveHourlyRate >= 25000 ? "text-emerald-400" :
                                                    client.effectiveHourlyRate < 18000 ? "text-rose-400" : "text-amber-400"
                                            )}>
                                                {client.effectiveHourlyRate.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-bold text-white">{client.margin}%</span>
                                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", client.margin > 40 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${client.margin}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={cn(
                                                "flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1 rounded-full border w-fit",
                                                client.status === "Rentable" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    client.status === "Sous-facturé" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>
                                                {client.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-indigo-500/5 border-t-2 border-indigo-500/20">
                                    <td colSpan={5} className="px-8 py-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter">Optimisation Prioritaire par Nexus AI</h4>
                                                    <p className="text-xs text-indigo-200/60 font-medium italic">"Une augmentation de 12% des honoraires sur le segment 'Services' alignerait votre cabinet sur les standards OHADA."</p>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                                                Appliquer à 12 clients
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panels */}
                <div className="space-y-8">
                    {/* Insights Card */}
                    <div className="glass-card p-10 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                            <PieChart className="w-40 h-40 text-white" />
                        </div>
                        <h4 className="text-white font-black text-xl mb-4 relative z-10 flex items-center gap-2">
                            Insights IA
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <InsightItem text="Le dossier Traoré consomme trop de temps en 'Saisie'. Automatisation OCR suggérée." status="danger" />
                            <InsightItem text="Le taux horaire moyen a bondi de 8% suite à l'adoption de Nexus AI." status="success" />
                            <InsightItem text="Potentiel de réévaluation sur 3 dossiers majeurs." status="warning" />
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-800/30">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Plan de Correction
                        </h4>
                        <div className="space-y-3">
                            <ActionButton label="Ajuster Lettres de Mission" count={4} />
                            <ActionButton label="Relancer Budget d'Heures" count={12} />
                            <ActionButton label="Former Équipe (Efficacité)" count={2} />
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-indigo-600/10 border border-indigo-500/20">
                        <h4 className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-6">Répartition par Associé</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                                <span>M. Kane (Senior)</span>
                                <span className="text-emerald-400 font-black">45% Marge</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                                <span>A. Fall (Associé)</span>
                                <span className="text-emerald-400 font-black">52% Marge</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-white">
                                <span>K. Diop (Manager)</span>
                                <span className="text-rose-400 font-black">28% Marge</span>
                            </div>
                            <button className="w-full mt-4 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all">
                                Analyse Détallée Performance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GlobalKPICard({ title, value, unit, trend, icon: Icon, color }: any) {
    const isPositive = trend.startsWith("+");
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={cn("text-xs font-black flex items-center gap-1", isPositive ? "text-emerald-400" : "text-rose-400")}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className="text-xs font-bold text-slate-600">{unit}</span>
            </div>
        </div>
    );
}

function InsightItem({ text, status }: { text: string, status: "success" | "warning" | "danger" }) {
    const color = status === "success" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-rose-500";
    return (
        <div className="flex gap-3 items-start">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", color)} />
            <p className="text-[11px] text-slate-300 leading-relaxed">{text}</p>
        </div>
    );
}

function ActionButton({ label, count }: { label: string, count: number }) {
    return (
        <button className="w-full flex justify-between items-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left">
            <span className="text-xs font-bold text-slate-200">{label}</span>
            <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-black">{count}</span>
        </button>
    );
}
