"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Zap,
    Target,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    BarChart3,
    PieChart,
    Layers,
    ArrowRight,
    RefreshCw,
    ShieldAlert,
    BrainCircuit,
    LineChart,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CashFlowPredictivePage() {
    const [scenario, setScenario] = useState("Nominal");
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header Premium - Nexus AI Flow */}
            <div className="bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <BrainCircuit className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Trésorerie Prédictive IA
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Temps Réel
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Nexus <span className="text-indigo-400">Cash-Flow Pro</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Anticipez vos besoins de financement à 6 mois. L'IA Nexus analyse vos flux historiques pour simuler vos futurs soldes bancaires.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Solde Actuel (Consolidé)</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-white">42.500.000 <span className="text-xs text-slate-500">FCFA</span></span>
                                <Wallet className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ForecastCard
                    title="Solde J+30 (Est.)"
                    value="38.2M"
                    trend="-10%"
                    icon={TrendingDown}
                    status="warning"
                    desc="Basé sur les échéances fiscales"
                />
                <ForecastCard
                    title="Cushion Financement"
                    value="4.2 Mois"
                    trend="+0.5"
                    icon={ShieldAlert}
                    status="success"
                    desc="Autonomie de trésorerie"
                />
                <ForecastCard
                    title="Cash Burn Mensuel"
                    value="12.4M"
                    trend="-2%"
                    icon={Zap}
                    status="neutral"
                    desc="Moyenne glissante 3 mois"
                />
                <ForecastCard
                    title="DSO (Délai Client)"
                    value="42 J"
                    trend="-5 J"
                    icon={Target}
                    status="success"
                    desc="Optimisation du recouvrement"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Prediction Graph */}
                <div className="lg:col-span-8 glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <LineChart className="w-6 h-6 text-indigo-400" />
                            Courbe de Trésorerie Prévisionnelle
                        </h3>
                        <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5">
                            {["Mensuel", "Hebdomadaire", "Quotidien"].map(t => (
                                <button key={t} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", t === "Mensuel" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart Mockup */}
                    <div className="flex-1 border-2 border-dashed border-white/5 rounded-[32px] flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-center space-y-4">
                            <Layers className="w-16 h-16 text-indigo-200/20 mx-auto" />
                            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Graphique Dynamique IA Nexus Connecté</p>
                        </div>

                        {/* Interactive Data Point Mockup */}
                        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/50 border border-white/20 animate-bounce cursor-pointer">
                            <div className="flex flex-col text-center">
                                <span className="text-[8px] font-black text-indigo-200 uppercase">15 Juin 2024</span>
                                <span className="text-sm font-black text-white">28.4M FCFA</span>
                                <span className="text-[8px] text-rose-300 font-bold">Risque de découvert</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center text-slate-500">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Réalisé</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-0.5 bg-indigo-300 border-t-2 border-dashed border-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Prévisionnel (IA)</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold italic">Source : Nexus Intelligence v4.0</p>
                    </div>
                </div>

                {/* What-If Scenarios */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-amber-400" />
                            Scénarios "What-If"
                        </h3>

                        <div className="space-y-6">
                            <ScenarioItem
                                label="Paiement Retardé (Orange)"
                                impact="-12.5M"
                                risk="Moyen"
                                active={scenario === "Delayed"}
                                onClick={() => setScenario("Delayed")}
                            />
                            <ScenarioItem
                                label="Recrutement 2 Seniors"
                                impact="-3.2M / mois"
                                risk="Modéré"
                                active={scenario === "Hiring"}
                                onClick={() => setScenario("Hiring")}
                            />
                            <ScenarioItem
                                label="Optimisation Fiscale OHADA"
                                impact="+4.8M"
                                risk="Opportunité"
                                color="emerald"
                                active={scenario === "Optim"}
                                onClick={() => setScenario("Optim")}
                            />
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 group disabled:opacity-50"
                        >
                            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <RefreshCw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform" />}
                            Recalculer les Prévisions
                        </button>
                    </div>

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <BrainCircuit className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Insights IA Nexus</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                            "L'IA a détecté une cyclicité anormale sur vos encaissements de Mai. Le scénario d'optimisation suggère un affacturage de 15% de vos factures SIB pour sécuriser le BFR du T3."
                        </p>
                        <button className="mt-6 flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:underline">
                            Appliquer le conseil <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inflows & Outflows Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CashDetailList title="Entrées Prévues (Dashboard Inflows)" type="in" />
                <CashDetailList title="Sorties Prévues (Dashboard Outflows)" type="out" />
            </div>
        </div>
    );
}

function ForecastCard({ title, value, trend, icon: Icon, status, desc }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn(
                    "p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110",
                    status === "warning" ? "text-rose-400" : status === "success" ? "text-emerald-400" : "text-indigo-400"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
                    trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                    {trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend.replace(/[+-]/, '')}
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}</h3>
            <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest">{desc}</p>
        </div>
    );
}

function ScenarioItem({ label, impact, risk, color = "indigo", active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-5 rounded-3xl border transition-all cursor-pointer group",
                active ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20" : "bg-white/5 border-white/5 hover:border-white/20"
            )}
        >
            <div className="flex justify-between items-center mb-2">
                <span className={cn("text-xs font-bold", active ? "text-white" : "text-slate-300")}>{label}</span>
                <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                    active ? "bg-white/20 border-white/20 text-white" :
                        color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"
                )}>
                    {risk}
                </span>
            </div>
            <div className="flex justify-between items-end">
                <span className={cn("text-xs font-black", active ? "text-indigo-100" : "text-indigo-400")}>{impact}</span>
                <div className={cn("w-4 h-4 rounded-full border-2 border-white/20 flex items-center justify-center", active && "bg-white")}>
                    {active && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                </div>
            </div>
        </div>
    );
}

function CashDetailList({ title, type }: { title: string, type: "in" | "out" }) {
    const data = type === "in" ? [
        { label: "SOCIETE IVOIRIENNE BANQUE", date: "15 Juin", amount: "15.000.000", prob: "95%" },
        { label: "TECHSTART INNOVATION", date: "22 Juin", amount: "2.800.000", prob: "70%" },
        { label: "ORANGE SENEGAL (RECAP)", date: "30 Juin", amount: "24.500.000", prob: "85%" },
    ] : [
        { label: "MASSAR & CO (LOCATIONS)", date: "05 Juin", amount: "1.200.000", prob: "Fixe" },
        { label: "TRAORE IMPORT (ACHATS)", date: "12 Juin", amount: "8.500.000", prob: "90%" },
        { label: "SALAIRES ET CHARGES", date: "28 Juin", amount: "12.400.000", prob: "Prévu" },
    ];

    return (
        <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                {type === "in" ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
                {title}
            </h3>
            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div key={idx} className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-2 h-2 rounded-full", type === "in" ? "bg-emerald-500" : "bg-rose-500")} />
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.label}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.date} • Probabilité: {item.prob}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-white">{item.amount}</span>
                            <span className="text-[8px] text-slate-600 block font-black">FCFA</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                Voir tout le Ledger {type === "in" ? "Entrées" : "Sorties"}
            </button>
        </div>
    );
}
