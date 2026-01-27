"use client";

import { useState } from "react";
import {
    Rocket,
    TrendingUp,
    PieChart,
    BarChart3,
    ArrowRight,
    Plus,
    Target,
    Zap,
    Scale,
    ShieldCheck,
    Briefcase,
    Globe,
    LineChart,
    Calculator,
    Layers,
    History,
    FileText,
    Percent,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvestmentPage() {
    const [simType, setSimType] = useState<"ma" | "bp" | "valuation">("ma");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Massive Premium Header */}
            <div className="relative p-12 rounded-[50px] bg-slate-900/60 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl bg-indigo-500 rounded-full animate-pulse" />
                <div className="absolute -bottom-20 -left-20 p-20 opacity-5 bg-cyan-500 rounded-full" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-500/40">
                                <Rocket className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Valorisation & M&A IA</h2>
                        </div>
                        <p className="text-slate-400 text-xl max-w-2xl font-medium leading-relaxed italic">
                            "Modélisez l'avenir de vos clients. Simulez des fusions, des acquisitions et des levées de fonds avec une précision institutionnelle."
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Capital Valorisés</p>
                                <h3 className="text-3xl font-black text-white mt-1">14.8B <span className="text-xs text-slate-600">FCFA</span></h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-4 p-1.5 bg-slate-900 border border-white/10 rounded-[30px] w-fit shadow-2xl">
                <button
                    onClick={() => setSimType("ma")}
                    className={cn(
                        "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                        simType === "ma" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                    )}
                >
                    <Layers className="w-4 h-4" /> Fusion & Acquisition
                </button>
                <button
                    onClick={() => setSimType("bp")}
                    className={cn(
                        "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                        simType === "bp" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                    )}
                >
                    <LineChart className="w-4 h-4" /> Business Plan 5 Ans
                </button>
                <button
                    onClick={() => setSimType("valuation")}
                    className={cn(
                        "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                        simType === "valuation" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                    )}
                >
                    <Calculator className="w-4 h-4" /> Scoring & Valo
                </button>
            </div>

            {simType === "ma" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Synergies & Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card rounded-[40px] p-8 bg-slate-900/40 border border-white/5">
                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                                <Target className="w-5 h-5 text-indigo-400" /> Paramètres M&A
                            </h3>
                            <div className="space-y-6">
                                <SimInput label="Cible (Dénomination)" value="Société Agro-Industrielle X" />
                                <SimSlider label="Prime d'Acquisition (%)" value={25} />
                                <SimSlider label="Synergies de Coût (FCFA)" value={150} unit="M" />
                                <SimSlider label="Coût de la Dette (%)" value={6.5} />
                                <div className="pt-6">
                                    <button className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        <Zap className="w-4 h-4" /> Recalculer l'impact
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-[40px] p-8 bg-emerald-500/5 border border-emerald-500/10">
                            <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">Accrétion / Dilution</h4>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-white">+12.4%</h3>
                                <span className="text-emerald-500 text-xs font-bold font-mono">EPS Accretion</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mt-2 leading-relaxed">
                                L'opération est fortement accrétive dès la première année grâce aux synergies opérationnelles identifiées.
                            </p>
                        </div>
                    </div>

                    {/* Dashboard & Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResultCard title="Valeur de l'Entité Fusionnée" value="8.4B" trend="+2.1B" icon={Briefcase} />
                            <ResultCard title="Multiple EV/EBITDA Post-Op" value="7.2x" trend="-0.8x" icon={PieChart} />
                        </div>

                        <div className="glass-card rounded-[40px] p-10 bg-slate-900/40 border border-white/5 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter">Projections EBITDA (Post-Acquisition)</h3>
                                    <p className="text-xs text-slate-500 mt-1">Comparaison Basile vs Consolidé (Simulé)</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Avant</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Après Fusion</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fake Chart bars */}
                            <div className="flex-1 flex items-end gap-6 px-10">
                                <ChartBar height="40%" label="An 1" active />
                                <ChartBar height="55%" label="An 2" active />
                                <ChartBar height="75%" label="An 3" active />
                                <ChartBar height="90%" label="An 4" active />
                                <ChartBar height="100%" label="An 5" active />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all">
                                <Download className="w-4 h-4" /> Télécharger l'Infomémorandum
                            </button>
                            <button className="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all">
                                <FileText className="w-4 h-4" /> Rapport de Valorisation
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-[50px] p-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10">
                    <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8">
                        <LineChart className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Module en de Préparation</h3>
                    <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                        Le moteur de modélisation dynamique de Business Plan 5 ans arrive.
                        Importez vos balances et laissez l'IA générer vos prévisionnels de trésorerie.
                    </p>
                </div>
            )}
        </div>
    );
}

function SimInput({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
            <input
                type="text"
                defaultValue={value}
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-4 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
        </div>
    );
}

function SimSlider({ label, value, unit }: { label: string, value: number, unit?: string }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
                <span className="text-xs font-black text-white">{value}{unit || "%"}</span>
            </div>
            <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" style={{ width: `${(value / 50) * 100}%` }} />
            </div>
        </div>
    );
}

function ResultCard({ title, value, trend, icon: Icon }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-400">
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {trend}
                </span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
                <span className="text-xs font-bold text-slate-600 italic">FCFA</span>
            </div>
        </div>
    );
}

function ChartBar({ height, label, active }: { height: string, label: string, active?: boolean }) {
    return (
        <div className="flex-1 flex flex-col items-center gap-4">
            <div className="w-full flex gap-2 items-end justify-center">
                <div className="w-8 bg-slate-800 rounded-t-xl" style={{ height: `calc(${height} * 0.7)` }} />
                <div className={cn("w-8 rounded-t-xl transition-all duration-1000", active ? "bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "bg-slate-700")} style={{ height: height }} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
    );
}
