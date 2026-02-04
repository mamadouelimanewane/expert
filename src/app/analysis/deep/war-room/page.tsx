"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    TrendingUp,
    ShieldAlert,
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
    PieChart,
    BarChart3,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PartnerWarRoom() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header: War Room / Partner View */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                    <Target className="w-64 h-64 text-rose-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                Command Center (Associés)
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Strategic Deep Analysis
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            War Room <span className="text-rose-500">Stratégique</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Vision 360° sur la performance globale du cabinet. Croissance des honoraires, risques de conformité et opportunités d'Advisory IA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95">
                            <Flame className="w-5 h-5" /> Sprint de Clôture
                        </button>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <WarStatCard title="Budget Recovered" value="84" unit="%" trend="+4%" icon={DollarSign} color="text-indigo-400" />
                <WarStatCard title="KYC Compliance" value="92" unit="%" trend="stable" icon={ShieldAlert} color="text-emerald-400" />
                <WarStatCard title="Production Speed" value="x1.8" trend="+20%" icon={Zap} color="text-amber-400" />
                <WarStatCard title="Client Sentiment" value="4.8" unit="/5" trend="+0.2" icon={Users} color="text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Production Bottlenecks (Left) */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Briefcase className="w-48 h-48 text-white" />
                    </div>

                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Production Critique (Retards)</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase rounded-full border border-rose-500/20 animate-pulse">8 Dossiers Bloqués</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <BottleneckRow client="SOCIÉTÉ D'HOTELLERIE DU GABON" mission="Commissariat aux Comptes" delay="12 Jours" expert="Moussa S." status="Bloqué (Pièces)" progress={85} />
                        <BottleneckRow client="INDUSTRIE TEXTILE SENEGAL" mission="Bilan Annuel 2023" delay="5 Jours" expert="Awa D." status="En Révision" progress={45} color="bg-amber-500" />
                        <BottleneckRow client="TECH LOGISTICS IVOIRE" mission="Audit Social" delay="2 Jours" expert="Jean-Paul M." status="En Saisie" progress={12} color="bg-indigo-500" />
                    </div>

                    <button className="mt-10 w-full py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                        Voir tout le pipeline de production
                    </button>
                </div>

                {/* 2. AI Growth Opportunities (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-32 h-32 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                            Nexus Growth Leads
                        </h3>

                        <div className="space-y-6">
                            <LeadItem title="M&A Synergy" desc="TechLogistics & GlobalDev fusion potentielle détectée." value="350M FCFA" />
                            <LeadItem title="Optimisation Fiscale" desc="SOG GABON éligible crédit impôt R&D (OHADA)." value="12M FCFA" />
                            <LeadItem title="Financement" desc="Besoin de BFR critique sur Orange Sénégal (vague 5)." status="Urgent" />
                        </div>

                        <div className="mt-10 p-6 bg-indigo-600/20 border border-white/10 rounded-3xl text-center cursor-pointer hover:bg-indigo-600/30 transition-all">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Lancer les campagnes d'Advisory</p>
                            <ArrowUpRight className="w-5 h-5 text-indigo-400 mx-auto" />
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900/60 border border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Profitabilité Cabinet</p>
                            <h4 className="text-2xl font-black text-white">+14.2% <span className="text-xs text-emerald-400">YoY</span></h4>
                        </div>
                        <BarChart3 className="w-10 h-10 text-indigo-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Risk Management Floor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Cartographie des Risques Majeurs
                    </h3>
                    <div className="space-y-4">
                        <RiskAlert label="Risque de Churn Client" severity="High" clients="3 Dossiers" />
                        <RiskAlert label="Défaut de Conformité KYC" severity="Medium" clients="12 Dossiers" />
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/20 text-center flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <PieChart className="w-8 h-8 text-indigo-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                        Votre cabinet est configuré sur le modèle <br /><b className="text-white">Elite Pro 360 v2.4</b>
                    </p>
                    <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:underline">Accéder au paramétrage expert</button>
                </div>
            </div>
        </div>
    );
}

function WarStatCard({ title, value, unit, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase">{trend}</div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function BottleneckRow({ client, mission, delay, expert, status, progress, color = "bg-rose-500" }: any) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all gap-6">
            <div className="flex-1 w-full lg:w-auto">
                <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{client}</h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{mission}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {delay} de retard
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-8 w-full lg:w-auto">
                <div className="hidden sm:block text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Chargé de Mission</p>
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-white uppercase">{expert}</span>
                        <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center font-black text-[10px]">{expert[0]}</div>
                    </div>
                </div>
                <div className="w-24 text-center">
                    <div className="text-[10px] font-black text-white mb-2 uppercase">{progress}%</div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">{status}</span>
            </div>
        </div>
    );
}

function LeadItem({ title, desc, value, status }: any) {
    return (
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{title}</h4>
                {value ? <span className="text-[10px] font-black text-emerald-400">{value}</span> : <span className="text-[10px] font-black text-rose-400 animate-pulse uppercase">{status}</span>}
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function RiskAlert({ label, severity, clients }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-300">{label}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{clients}</span>
                <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                    severity === "High" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-amber-500 text-slate-900"
                )}>
                    {severity}
                </span>
            </div>
        </div>
    );
}
