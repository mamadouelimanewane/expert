"use client";

import { useState, useEffect } from "react";
import {
    Zap,
    TrendingUp,
    TrendingDown,
    Target,
    Lightbulb,
    Play,
    RotateCcw,
    Boxes,
    LineChart,
    BarChart,
    Layers,
    Sparkles,
    ArrowRight,
    Gem
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StrategySimulatorPage() {
    const [revenueGrowth, setRevenueGrowth] = useState(10);
    const [costReduction, setCostReduction] = useState(5);
    const [hiringCount, setHiringCount] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);

    // Computed values
    const currentCash = 24500000;
    const simulatedCash = currentCash * (1 + (revenueGrowth / 100) - (hiringCount * 0.05) + (costReduction / 100));
    const healthScore = Math.min(100, 75 + (revenueGrowth / 5) + (costReduction / 2) - (hiringCount * 2));

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Gem className="w-8 h-8 text-indigo-400" />
                        Digital Twin & Simulateur Stratégique
                    </h2>
                    <p className="text-slate-400 mt-1">Projetez l'avenir de l'entreprise et simulez l'impact de vos décisions en temps réel.</p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Réinitialiser
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                        <Layers className="w-4 h-4" /> Sauvegarder Scénario
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50 space-y-8">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-indigo-400" />
                            Leviers Stratégiques
                        </h3>

                        <div className="space-y-6">
                            <SliderControl
                                label="Croissance du Chiffre d'Affaires (%)"
                                value={revenueGrowth}
                                min={-20}
                                max={50}
                                onChange={setRevenueGrowth}
                                color="indigo"
                            />
                            <SliderControl
                                label="Optimisation des Charges (%)"
                                value={costReduction}
                                min={0}
                                max={20}
                                onChange={setCostReduction}
                                color="emerald"
                            />
                            <SliderControl
                                label="Nouveaux Recrutements (Tête)"
                                value={hiringCount}
                                min={0}
                                max={10}
                                onChange={setHiringCount}
                                color="amber"
                            />
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                            <button
                                onClick={() => { setIsSimulating(true); setTimeout(() => setIsSimulating(false), 2000); }}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Générer Projection IA
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5">
                        <h4 className="flex items-center gap-2 font-bold text-indigo-400 mb-4 text-sm">
                            <Lightbulb className="w-4 h-4" />
                            Conseil de l'IA (Expert Mode)
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            "Avec une croissance de {revenueGrowth}%, votre BFR risque de saturer. Prévoyez une ligne de crédit court terme de 5M FCFA pour maintenir la liquidité."
                        </p>
                    </div>
                </div>

                {/* Visualisation Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Twin Health Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 flex items-center gap-6 bg-slate-900/30">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className={cn("transition-all duration-1000", healthScore > 70 ? "text-emerald-500" : "text-amber-500")}
                                        strokeDasharray={251}
                                        strokeDashoffset={251 - (251 * healthScore) / 100}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                                    {Math.round(healthScore)}%
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Score de Santé Projeté</h3>
                                <p className="text-xs text-slate-500 mt-1">Basé sur la solvabilité et la rentabilité finale.</p>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trésorerie Provisoirement Estimée</p>
                            <div className="text-3xl font-bold text-white flex items-center gap-3">
                                {Math.round(simulatedCash).toLocaleString()} <span className="text-sm text-slate-600">FCFA</span>
                                <TrendingUp className="text-emerald-500 w-6 h-6" />
                            </div>
                            <p className="text-[10px] text-emerald-400 font-bold mt-2">+{Math.round(simulatedCash - currentCash).toLocaleString()} FCFA vs Réel</p>
                        </div>
                    </div>

                    {/* Chart Projection (Simulation) */}
                    <div className="glass-card p-8 rounded-3xl border border-slate-700/50 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Boxes className="w-40 h-40 text-indigo-400" />
                        </div>

                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-bold text-white text-lg">Trajectoire de Croissance Projetée (12 mois)</h3>
                            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 bg-slate-800 rounded-full" /> Historique</span>
                                <span className="flex items-center gap-1.5 text-indigo-400"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> Simulation IA</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end gap-2 px-2 h-64">
                            {[30, 35, 32, 45, 40, 55, 65, 75, 85, 80, 95, 100].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className={cn(
                                            "w-full rounded-t-xl transition-all duration-700",
                                            i < 6 ? "bg-slate-800" : "bg-gradient-to-t from-indigo-700 to-indigo-400 shadow-lg shadow-indigo-500/20"
                                        )}
                                        style={{ height: `${h * (isSimulating ? 0.2 : 1)}%` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none">
                                        {(h * 0.5).toFixed(1)}M
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
                            <span className="text-indigo-400">Juil</span><span className="text-indigo-400">Août</span><span className="text-indigo-400">Sept</span><span className="text-indigo-400">Oct</span><span className="text-indigo-400">Nov</span><span className="text-indigo-400">Déc</span>
                        </div>
                    </div>

                    {/* Strategic Roadmap */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Feuille de Route Stratégique (Roadmap)
                        </h3>
                        <div className="space-y-4">
                            {[
                                { t: "M+1", label: "Lancement de l'audit de productivité fiscale", status: "priority" },
                                { t: "M+3", label: "Objectif SEUIL : 35M de trésorerie nette", status: "target" },
                                { t: "M+6", label: "Extension du parc matériel (Immos)", status: "pending" }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-2xl transition-all group">
                                    <span className="text-xs font-mono font-bold text-indigo-400 w-10">{step.t}</span>
                                    <div className="flex-1 flex items-center justify-between">
                                        <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{step.label}</p>
                                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SliderControl({ label, value, min, max, onChange, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className={cn("font-mono", `text-${color}-400`)}>{value > 0 ? "+" : ""}{value}{label.includes("%") ? "%" : ""}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={cn(
                    "w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500",
                )}
            />
        </div>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
