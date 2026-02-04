"use client";

import { useState, useMemo } from "react";
import {
    TrendingUp,
    TrendingDown,
    Zap,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Activity,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Sparkles,
    BarChart3,
    PieChart,
    Target,
    Briefcase,
    Globe2,
    Coins,
    SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CashFlowStressSimulatorPage() {
    const [investment, setInvestment] = useState(50000000); // 50M FCFA
    const [recruitment, setRecruitment] = useState(5); // 5 employees
    const [revenueGrowth, setRevenueGrowth] = useState(15); // 15% growth

    // Basic simulation logic
    const results = useMemo(() => {
        const initialCash = 120000000; // 120M
        const recruitmentCost = recruitment * 800000; // 800k per month per employee
        const monthlyRevenue = 45000000; // 45M
        const growthImpact = 1 + (revenueGrowth / 100);

        const projection = Array.from({ length: 6 }).map((_, i) => {
            const monthsPassed = i + 1;
            const rev = monthlyRevenue * Math.pow(growthImpact, monthsPassed / 12);
            const expense = 30000000 + (monthsPassed === 1 ? investment : 0) + (recruitmentCost * monthsPassed);
            return {
                month: `Mois ${monthsPassed}`,
                cash: Math.max(0, initialCash + (rev * monthsPassed) - expense)
            };
        });

        const finalCash = projection[5].cash;
        const roi = ((finalCash - initialCash) / initialCash) * 100;
        const riskLevel = finalCash < 20000000 ? "CRITIQUE" : finalCash < 50000000 ? "MODÉRÉ" : "FAIBLE";

        return { projection, finalCash, roi, riskLevel };
    }, [investment, recruitment, revenueGrowth]);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Simulation Command Center */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Activity className="w-64 h-64 text-cyan-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-cyan-500/20">
                                Analyse de Scénarios "What-If"
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Simulateur de <span className="text-cyan-400">Stress Trésorerie</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Simulez l'impact de vos décisions stratégiques sur le cash-flow à 6 mois. Modélisation basée sur les taux réels de la BCEAO et conditions OHADA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-cyan-600/30 active:scale-95">
                            <Sparkles className="w-5 h-5" /> Optimiser par l'IA
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Control Panel (Left) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-tighter">
                            <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
                            Variables Stratégiques
                        </h3>

                        <div className="space-y-10">
                            <SliderControl
                                label="Investissement Initial"
                                value={investment}
                                min={0}
                                max={200000000}
                                step={10000000}
                                unit="FCFA"
                                onChange={setInvestment}
                                color="bg-indigo-500"
                            />
                            <SliderControl
                                label="Recrutements (Effectifs)"
                                value={recruitment}
                                min={0}
                                max={50}
                                step={1}
                                unit="Nouveaux"
                                onChange={setRecruitment}
                                color="bg-cyan-500"
                            />
                            <SliderControl
                                label="Croissance CA Annuelle"
                                value={revenueGrowth}
                                min={-20}
                                max={100}
                                step={5}
                                unit="%"
                                onChange={setRevenueGrowth}
                                color="bg-emerald-500"
                            />
                        </div>

                        <div className="mt-12 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl">
                            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-2">Note de l'IA Nexus</p>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                "À ce niveau d'embauche, votre seuil de rentabilité recule de 4 mois. Veillez à négocier des lignes de crédit de campagne."
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Visual Results (Right) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ResultCard label="Trésorerie à 6 Mois" value={results.finalCash.toLocaleString()} unit="FCFA" icon={Coins} color="text-white" />
                        <ResultCard label="Variation de Cash" value={`${results.roi.toFixed(1)}%`} unit="ROI" icon={TrendingUp} color={results.roi >= 0 ? "text-emerald-400" : "text-rose-400"} />
                        <ResultCard label="Niveau de Risque" value={results.riskLevel} unit="Stress Test" icon={Activity} color={results.riskLevel === "CRITIQUE" ? "text-rose-400" : results.riskLevel === "MODÉRÉ" ? "text-amber-400" : "text-emerald-400"} />
                    </div>

                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Évolution Projective du Cash-Flow</h3>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Prévisionnel</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 border-b border-white/5">
                            {results.projection.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="w-full relative flex items-end justify-center min-h-[50px]">
                                        <div
                                            className="w-full max-w-[40px] bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125 shadow-lg shadow-cyan-900/20"
                                            style={{ height: `${Math.max(10, (item.cash / 300000000) * 200)}px` }}
                                        />
                                        <span className="absolute -top-8 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {(item.cash / 1000000).toFixed(1)}M
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20">
                            <h4 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-400" /> Recommandations OHADA
                            </h4>
                            <ul className="space-y-3">
                                <RecommendationItem text="Vérifier la quotité cessible en cas de recours à l'emprunt." />
                                <RecommendationItem text="Provisionner pour les charges sociales UEMOA (18-20%)." />
                            </ul>
                        </div>
                        <div className="p-8 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20">
                            <h4 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Opportunités Fiscales
                            </h4>
                            <ul className="space-y-3">
                                <RecommendationItem text="Investissement éligible au crédit d'impôt recherche (Sénégal)." />
                                <RecommendationItem text="Exonération TVA possible sur biens d'équipement neufs." />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SliderControl({ label, value, min, max, step, unit, onChange, color }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-white text-base font-black tracking-tighter">
                    {value.toLocaleString()} <span className="text-slate-600 text-[10px]">{unit}</span>
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={cn("w-full h-1.5 rounded-full appearance-none cursor-pointer", color, "bg-slate-800")}
            />
        </div>
    );
}

function ResultCard({ label, value, unit, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <Icon className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-4" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black tracking-tighter", color)}>{value}</span>
                <span className="text-[10px] font-bold text-slate-600">{unit}</span>
            </div>
        </div>
    );
}

function RecommendationItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{text}</p>
        </li>
    );
}
