"use client";

import { useState } from "react";
import {
    Gem,
    TrendingUp,
    ShieldCheck,
    Coins,
    Home,
    Briefcase,
    PieChart,
    ArrowRight,
    Calculator,
    Lock,
    Users,
    ChevronRight,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const WEALTH_ASSETS = [
    { label: "Parts Sociales (Valorisation)", value: "450 000 000", cat: "Pro", color: "text-amber-400" },
    { label: "Immobilier", value: "280 000 000", cat: "Privé", color: "text-sky-400" },
    { label: "Placements & Cash", value: "85 000 000", cat: "Privé", color: "text-emerald-400" },
    { label: "Retraite & Prévoyance", value: "42 000 000", cat: "Social", color: "text-violet-400" }
];

export default function WealthOptimizerPage() {
    const [optimizationMode, setOptimizationMode] = useState<"rem" | "trans">("rem");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Ultra-Premium Private Banking Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-12 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-amber-500/5 via-transparent to-transparent rounded-[32px] px-8 border-l-4 border-l-amber-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <Gem className="w-3 h-3" /> Stratégie Patrimoniale & Dirigeant
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        Wealth Optimizer
                    </h1>
                    <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
                        Le Cabinet 360 ne gère pas seulement votre entreprise, il optimise votre <span className="text-amber-500 font-bold">patrimoine personnel</span>.
                        Arbitrages Rémunération vs Dividendes, Immobilier et Transmission.
                    </p>
                </div>

                <div className="flex gap-4 z-10">
                    <button className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2">
                        <Calculator className="w-4 h-4" /> Bilan Patrimonial 2026
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Wealth Breakdown Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-amber-500" /> Répartition Actifs
                        </h3>

                        <div className="space-y-6">
                            {WEALTH_ASSETS.map((asset, i) => (
                                <div key={i} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{asset.label}</p>
                                            <p className="text-xl font-black text-white">{asset.value} <span className="text-[10px] text-slate-500">FCFA</span></p>
                                        </div>
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded bg-white/5", asset.color)}>
                                            {asset.cat}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", asset.color.replace('text', 'bg'))}
                                            style={{ width: `${Math.random() * 40 + 20}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Patrimoine Net</p>
                            <div className="text-4xl font-black text-white tabular-nums">857 000 000 <span className="text-sm font-medium text-amber-500">FCFA</span></div>
                        </div>
                    </div>

                    {/* Quick Advice Card */}
                    <div className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-white text-sm">Protection Sociale OK</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Votre prévoyance couvre actuellement 100% de vos revenus en cas d'arrêt. Aucune action requise.
                        </p>
                    </div>
                </div>

                {/* Simulation & Optimization Panel */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Mode Toggle */}
                    <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2">
                        <button
                            onClick={() => setOptimizationMode("rem")}
                            className={cn(
                                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                optimizationMode === "rem" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <Coins className="w-4 h-4" /> Optimisation Rémunération
                        </button>
                        <button
                            onClick={() => setOptimizationMode("trans")}
                            className={cn(
                                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                optimizationMode === "trans" ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <Building2 className="w-4 h-4" /> Transmission (Holding)
                        </button>
                    </div>

                    <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-950/50 min-h-[400px] flex flex-col justify-between">
                        {optimizationMode === "rem" ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-black text-white mb-8">Salaire vs Dividendes</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Scenario A */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5">
                                            <span className="text-sm font-bold text-slate-400">100% Salaire</span>
                                            <span className="text-rose-400 font-black">Coût Élevé</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-500"><span>Net en poche</span> <span>6.5M FCFA</span></div>
                                            <div className="w-full h-8 bg-slate-800 rounded flex overflow-hidden">
                                                <div className="w-[65%] bg-sky-500 h-full" />
                                                <div className="w-[35%] bg-rose-500/30 h-full flex items-center justify-center text-[10px] font-black">Taxe</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed italic">
                                            "Maximise vos droits à la retraite mais coûte +35% en charges sociales."
                                        </p>
                                    </div>

                                    {/* Scenario B - Optimized */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                            <span className="text-sm font-bold text-emerald-400">Mix Optimisé 360</span>
                                            <span className="text-emerald-400 font-black animate-pulse">RECOMMANDÉ</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-300"><span>Net en poche</span> <span className="text-emerald-400">8.2M FCFA</span></div>
                                            <div className="w-full h-8 bg-slate-800 rounded flex overflow-hidden">
                                                <div className="w-[82%] bg-emerald-500 h-full" />
                                                <div className="w-[18%] bg-rose-500/30 h-full flex items-center justify-center text-[10px] font-black">Taxe</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed font-bold">
                                            Gain annuel estimé : <span className="text-emerald-400">+20.4M FCFA</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-10">
                                <Lock className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-50" />
                                <h3 className="text-2xl font-black text-white mb-4">Montage Holding & SCI</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8">
                                    Analysez l'impact de l'apport de vos titres à une société holding pour réinvestir vos dividendes sans fiscalité immédiate (Système Mère-Fille).
                                </p>
                                <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-slate-700 transition-all">
                                    Générer Simulation de Montage
                                </button>
                            </div>
                        )}

                        {/* Bottom Disclaimer/Contact */}
                        <div className="mt-12 flex items-center justify-between p-6 bg-slate-900/40 rounded-[32px] border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Besoin d'un arbitrage personnalisé ?</p>
                                    <p className="text-xs text-slate-500">Contactez votre consultant en gestion privée.</p>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <ChevronRight className="w-5 h-5 text-amber-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
