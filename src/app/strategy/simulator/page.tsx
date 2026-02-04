"use client";

import { useState } from "react";
import {
    LineChart,
    TrendingUp,
    Zap,
    AlertTriangle,
    ShieldCheck,
    ArrowRight,
    Play,
    RefreshCw,
    Sliders,
    BrainCircuit,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Scenario Data
const SCENARIOS = [
    { id: "inflation", label: "Choc Inflationniste", icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/10" },
    { id: "growth", label: "Hyper-Croissance", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "churn", label: "Perte Client Majeur", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
    { id: "resilience", label: "Stress Test Bancaire", icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10" }
];

export default function StrategySimulatorPage() {
    const [selectedScenario, setSelectedScenario] = useState("inflation");
    const [variables, setVariables] = useState({
        revenue: 0, // % change
        costs: 15, // % change
        cash: -5, // % change
        staff: 0 // % change
    });

    // Simulated impact calculation
    const resilienceScore = Math.max(0, 100 - (variables.costs * 1.5) + (variables.revenue * 1.2));
    const cashBurn = variables.costs > variables.revenue ? "Accéléré" : "Stable";

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Futuristic */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-violet-500/20">
                        <BrainCircuit className="w-3 h-3" /> Intelligence Prédictive
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Simulateur de Stratégie IA
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Ne subissez plus l'avenir. Simulez l'impact des crises et opportunités sur votre trésorerie et votre rentabilité <span className="text-violet-400 font-bold">avant qu'elles n'arrivent</span>.
                    </p>
                </div>

                {/* Visual Eye Candy */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-0" />

                <div className="flex gap-3 z-10">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2 group">
                        <Play className="w-4 h-4 group-hover:fill-current" /> Lancer Simulation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Scenario Selector */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-slate-400" /> Scénario de Base
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {SCENARIOS.map((scenario) => (
                                <button
                                    key={scenario.id}
                                    onClick={() => setSelectedScenario(scenario.id)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                                        selectedScenario === scenario.id
                                            ? "bg-slate-800 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                                            : "bg-slate-950/30 border-white/5 hover:bg-slate-900"
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", scenario.bg, scenario.color)}>
                                        <scenario.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{scenario.label}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Modèle IA v2.4</p>
                                    </div>
                                    {selectedScenario === scenario.id && <div className="ml-auto w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Variables Sliders */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-slate-400" /> Variables Clés
                        </h3>

                        <div className="space-y-6">
                            <VariableSlider
                                label="Impact Chiffre d'Affaires"
                                value={variables.revenue}
                                onChange={(v: number) => setVariables({ ...variables, revenue: v })}
                                min={-50} max={50} unit="%"
                            />
                            <VariableSlider
                                label="Inflation Coûts (Achats/Externes)"
                                value={variables.costs}
                                onChange={(v: number) => setVariables({ ...variables, costs: v })}
                                min={0} max={100} unit="%" alert={variables.costs > 20}
                            />
                            <VariableSlider
                                label="Variation Masse Salariale"
                                value={variables.staff}
                                onChange={(v: number) => setVariables({ ...variables, staff: v })}
                                min={-20} max={50} unit="%"
                            />
                        </div>
                    </div>

                </div>

                {/* Right: Simulation Output */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Main Prediction Graph Area */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/50 relative overflow-hidden min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-start mb-8 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white">Projection Trésorerie N+1</h2>
                                <p className="text-slate-400 text-sm mt-1">Comparaison : Trajectoire Actuelle vs Scénario Simulé</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <div className="w-3 h-3 rounded-full bg-slate-700" /> Actuel
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                                    <div className="w-3 h-3 rounded-full bg-violet-500" /> Simulé
                                </div>
                            </div>
                        </div>

                        {/* Visual graph placeholder - using CSS for a sleek curve */}
                        <div className="flex-1 relative w-full h-full flex items-end gap-1 px-4 pb-8">
                            {[40, 42, 45, 48, 46, 42, 38, 35, 30, 25, 20, 15].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group h-full relative">
                                    {/* Simulated Bar */}
                                    <div
                                        className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-violet-900/50 to-violet-500 transition-all duration-500 relative"
                                        style={{ height: `${Math.max(10, h - (variables.costs * 0.5) + (variables.revenue * 0.5))}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 whitespace-nowrap z-20 pointer-events-none">
                                            {(h - (variables.costs * 0.5) + (variables.revenue * 0.5)).toFixed(1)}M FCFA
                                        </div>
                                    </div>

                                    {/* Baseline marker (ghost) */}
                                    <div className="w-full absolute bottom-0 max-w-[40px] border-t-2 border-dashed border-slate-600/30" style={{ height: `${h}%`, borderTopWidth: '2px' }} />

                                    <span className="text-[10px] text-slate-600 font-bold mt-2 font-mono">M+{i + 1}</span>
                                </div>
                            ))}

                            {/* Forecast Line overlay */}
                            <svg className="absolute inset-0 w-full h-[calc(100%-32px)] pointer-events-none opacity-30" preserveAspectRatio="none">
                                <path d="M0,200 C100,180 200,150 300,250 S500,300 800,100" stroke="currentColor" fill="none" strokeWidth="2" className="text-violet-400" />
                            </svg>
                        </div>
                    </div>

                    {/* AI Insights Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-default">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <BrainCircuit className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h4 className="font-bold text-white text-lg">Analyse IA</h4>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Avec <span className="font-bold text-white">+{variables.costs}%</span> de coûts, votre point mort augmente de <span className="text-rose-400 font-bold">12MF</span>.
                                </p>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    <span className="text-emerald-400 font-bold">Recommandation :</span> Augmenter vos prix de vente de <span className="font-bold text-white">{(variables.costs * 0.6).toFixed(1)}%</span> pour maintenir votre EBITDA actuel.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-default relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <ShieldCheck className="w-24 h-24 text-white" />
                            </div>
                            <h4 className="font-bold text-white text-lg mb-2">Score de Résilience</h4>
                            <div className="flex items-end gap-2 mb-4">
                                <span className={cn("text-5xl font-black",
                                    resilienceScore > 75 ? "text-emerald-400" :
                                        resilienceScore > 50 ? "text-amber-400" : "text-rose-400"
                                )}>{resilienceScore.toFixed(0)}/100</span>
                                <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Indice Solvab.</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-700",
                                        resilienceScore > 75 ? "bg-emerald-500" :
                                            resilienceScore > 50 ? "bg-amber-500" : "bg-rose-500"
                                    )}
                                    style={{ width: `${resilienceScore}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-medium">
                                Cash Burn : <span className={cn("font-bold", cashBurn === "Accéléré" ? "text-rose-400" : "text-emerald-400")}>{cashBurn}</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function VariableSlider({ label, value, onChange, min, max, unit, alert }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    {label}
                    {alert && <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />}
                </label>
                <span className={cn("text-lg font-black font-mono", value > 0 ? "text-emerald-400" : value < 0 ? "text-rose-400" : "text-slate-500")}>
                    {value > 0 ? "+" : ""}{value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={cn(
                    "w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800",
                    "accent-violet-500 focus:accent-violet-400"
                )}
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
}
