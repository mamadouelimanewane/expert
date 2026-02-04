"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    ShieldCheck,
    TrendingUp,
    Zap,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Radar as RadarIcon,
    Flame,
    PieChart,
    Target,
    BarChart3,
    CheckCircle2,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinancialHealthRadarPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analysis/financial/health")
            .then(res => res.json())
            .then(data => {
                setClients(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const selectedClient = clients[currentIndex] || {
        name: "Chargement...",
        sector: "Analyse en cours",
        score: 0,
        rating: "-",
        ratios: []
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Financial Command Center */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <RadarIcon className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Diagnostique Prédictif 360°
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Radar de <span className="text-indigo-400">Santé Financière</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Évaluation multidimensionnelle de la santé de vos clients. Détectez les signaux faibles d'insolvabilité et identifiez les leviers de croissance.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % (clients.length || 1))}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <Zap className="w-5 h-5" /> Client Suivant (Réel)
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Radar Chart Section (Left) */}
                <div className="lg:col-span-7 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col items-center justify-center shadow-2xl relative">
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-48 h-48 bg-white/5 rounded-full mb-8" />
                            <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                            <div className="h-4 w-24 bg-white/5 rounded" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute top-8 left-10">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedClient.name}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase">{selectedClient.sector}</p>
                            </div>

                            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-18">
                                    {[20, 40, 60, 80, 100].map((r, i) => (
                                        <circle key={i} cx="50" cy="50" r={r / 2} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                    ))}
                                    {[0, 72, 144, 216, 288].map((angle, i) => (
                                        <line
                                            key={i}
                                            x1="50" y1="50"
                                            x2={50 + 50 * Math.cos((angle * Math.PI) / 180)}
                                            y2={50 + 50 * Math.sin((angle * Math.PI) / 180)}
                                            stroke="rgba(255,255,255,0.05)"
                                            strokeWidth="0.5"
                                        />
                                    ))}
                                    <polygon
                                        points="50,15 85,40 65,80 30,75 15,45"
                                        fill="rgba(99, 102, 241, 0.2)"
                                        stroke="#6366f1"
                                        strokeWidth="1"
                                        className="animate-pulse"
                                    />
                                </svg>

                                <div className="absolute -top-4 font-black text-[10px] text-white uppercase tracking-widest">Liquidité</div>
                                <div className="absolute -right-4 top-1/3 font-black text-[10px] text-white uppercase tracking-widest">Solvabilité</div>
                                <div className="absolute -right-4 bottom-1/4 font-black text-[10px] text-white uppercase tracking-widest">Rentabilité</div>
                                <div className="absolute left-0 bottom-1/4 font-black text-[10px] text-white uppercase tracking-widest">Fiscalité</div>
                                <div className="absolute -left-6 top-1/3 font-black text-[10px] text-white uppercase tracking-widest">Social</div>
                            </div>

                            <div className="mt-10 flex gap-10">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Health Index (Actual)</p>
                                    <div className="text-5xl font-black text-emerald-400 tracking-tighter">{selectedClient.score}%</div>
                                </div>
                                <div className="text-center border-l border-white/10 pl-10">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Rating OHADA</p>
                                    <div className="text-5xl font-black text-white tracking-tighter">{selectedClient.rating}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Insights & Risks (Right) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <BarChart3 className="w-6 h-6 text-indigo-400" />
                            Ratios Calculés (DB)
                        </h3>
                        <div className="space-y-6">
                            {(selectedClient.ratios || []).map((ratio: any, i: number) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-300">{ratio.label}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className={cn("text-lg font-black", ratio.color)}>{ratio.value}%</span>
                                            <span className="text-[8px] text-slate-600 font-bold uppercase">Objectif {ratio.ideal}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", ratio.color.replace('text-', 'bg-'))}
                                            style={{ width: `${ratio.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[48px] bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <Sparkles className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Opportunités Conseil Réelles</h4>
                        <div className="space-y-4">
                            <OpportunityItem text={`Optimisation BFR pour ${selectedClient.name}.`} />
                            {selectedClient.score > 80 && <OpportunityItem text="Capacité d'endettement confirmée pour expansion." />}
                            {selectedClient.score < 60 && <OpportunityItem text="Alerte : Besoin de fonds de roulement imminent." />}
                        </div>
                        <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                            Voir Simulation Financement
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpportunityItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_#10b981]" />
            <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">{text}</p>
        </div>
    );
}
