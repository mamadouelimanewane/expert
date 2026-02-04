"use client";

import { useState } from "react";
import {
    Activity,
    ShieldCheck,
    TrendingUp,
    TrendingDown,
    Zap,
    Users,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    ShieldAlert,
    Target,
    Briefcase,
    HeartPulse,
    Eye,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Radar,
    Flame,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientHealth {
    id: string;
    name: string;
    score: number;
    trend: "up" | "down" | "stable";
    riskLevel: "low" | "medium" | "high";
    lastInteraction: string;
    nextAction: string;
    interactionSentiment: number; // 0-100
    billingHealth: number; // 0-100
    productionSpeed: number; // 0-100
}

const MOCK_CLIENTS_HEALTH: ClientHealth[] = [
    { id: "C1", name: "Société Ivoirienne de Banque", score: 92, trend: "up", riskLevel: "low", lastInteraction: "Hier", nextAction: "Réunion Trimestrielle", interactionSentiment: 95, billingHealth: 98, productionSpeed: 88 },
    { id: "C2", name: "Dakar Digital SA", score: 65, trend: "down", riskLevel: "medium", lastInteraction: "3 jours", nextAction: "Relance documents TVA", interactionSentiment: 55, billingHealth: 70, productionSpeed: 45 },
    { id: "C3", name: "Logistics Express", score: 42, trend: "down", riskLevel: "high", lastInteraction: "12 jours", nextAction: "Alerte Churn Associé", interactionSentiment: 30, billingHealth: 50, productionSpeed: 30 },
    { id: "C4", name: "Pharmacie Touba", score: 88, trend: "stable", riskLevel: "low", lastInteraction: "2 jours", nextAction: "Signature PV AG", interactionSentiment: 90, billingHealth: 85, productionSpeed: 92 },
];

export default function ClientSuccessRadar() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header: Client Success Command Center */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Radar className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                Client Success Engine v2.0
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Radar de <span className="text-emerald-400">Réussite Client</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Intelligence prédictive sur la santé de votre portefeuille. Anticipez les départs, détectez les opportunités d'upsell et mesurez le NPS en temps réel.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 active:scale-95">
                            <Flame className="w-5 h-5" /> Sprint de Fidélisation
                        </button>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <HealthStat icon={HeartPulse} label="Score Moyen Portfolio" value="78" unit="/100" trend="+4%" color="text-indigo-400" />
                <HealthStat icon={ShieldAlert} label="Clients à Haut Risque" value="3" trend="-1" color="text-rose-400" />
                <HealthStat icon={Users} label="Prospects Qualifiés" value="12" trend="+5" color="text-emerald-400" />
                <HealthStat icon={Zap} label="Potentiel Upsell IA" value="142M" unit="F" trend="+8%" color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Client Health Registry (Left) */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Registre de Santé Client</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input placeholder="Filtrer un client..." className="bg-slate-800/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {MOCK_CLIENTS_HEALTH.map((client) => (
                            <div key={client.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full",
                                    client.riskLevel === "low" ? "bg-emerald-500" :
                                        client.riskLevel === "medium" ? "bg-amber-500" : "bg-rose-500"
                                )} />

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{client.name}</h4>
                                            {client.trend === "up" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> interaction: {client.lastInteraction}</span>
                                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                            <span className="text-indigo-400">Next: {client.nextAction}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Health Score</p>
                                            <div className={cn(
                                                "text-2xl font-black tracking-tighter",
                                                client.score >= 80 ? "text-emerald-400" :
                                                    client.score >= 60 ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {client.score}%
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/5">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/5">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Stats Accordion/Static for Demo */}
                                <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <MiniIndicator label="Sentiment Interactiv." value={client.interactionSentiment} />
                                    <MiniIndicator label="Santé Facturation" value={client.billingHealth} />
                                    <MiniIndicator label="Vitesse Production" value={client.productionSpeed} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                        Exporter le Rapport NPS & Santé Portfolio
                    </button>
                </div>

                {/* 2. AI Intelligence (Right) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Churn Alert Card */}
                    <div className="glass-card p-10 rounded-[48px] border border-rose-500/20 bg-rose-500/5 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldAlert className="w-32 h-32 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Activity className="w-6 h-6 text-rose-500" />
                            Alerte Churn Immédiate
                        </h3>

                        <div className="space-y-4">
                            <RiskItem client="Logistics Express" reason="Silence radio + Baisse d'activité billing." risk="High" />
                            <RiskItem client="Dakar Digital SA" reason="Incertitude sur le renouvellement mission 2024." risk="Medium" />
                        </div>

                        <button className="mt-10 w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-900/40 transition-all active:scale-95">
                            Lancer Plan de Fidélisation
                        </button>
                    </div>

                    {/* Interaction Sentiment Card */}
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-2">Sentiment Moyen</h4>
                        <div className="text-4xl font-black text-white tracking-widest uppercase">Positif</div>
                        <p className="text-[10px] text-slate-500 font-bold mt-4 leading-relaxed uppercase">
                            Basé sur l'analyse NLP de Nexux <br /> sur vos 150 derniers échanges.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthStat({ icon: Icon, label, value, unit, trend, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                        trend.startsWith('+') ? "text-emerald-400" : "text-rose-400"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function MiniIndicator({ label, value }: { label: string, value: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-white">{value}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full",
                        value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function RiskItem({ client, reason, risk }: any) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-white uppercase">{client}</h4>
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase",
                    risk === "High" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                )}>{risk} Risk</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{reason}</p>
        </div>
    );
}
