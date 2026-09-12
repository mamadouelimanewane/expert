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
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <RadarIcon className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                                Diagnostique Prédictif 360°
                            </span>
                        </div>
                        <h2 className="page-title">
                            Radar de <span className="text-primary">Santé Financière</span>
                        </h2>
                        <p className="page-subtitle">
                            Évaluation multidimensionnelle de la santé de vos clients. Détectez les signaux faibles d'insolvabilité et identifiez les leviers de croissance.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % (clients.length || 1))}
                            className="px-8 py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95">
                            <Zap className="w-5 h-5" /> Client Suivant (Réel)
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Radar Chart Section (Left) */}
                <div className="apix-card lg:col-span-7 flex flex-col items-center justify-center relative">
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
                                {/* Le polygone est calcule a partir des ratios reels du client
                                    selectionne (selectedClient.ratios) : il affichait auparavant une
                                    forme fixe identique quel que soit le client, alors meme que le
                                    reste de l'ecran (score, notation, ratios) provient de donnees reelles. */}
                                {(() => {
                                    const ratios = selectedClient.ratios || [];
                                    const n = ratios.length;
                                    const angleFor = (i: number) => (360 / n) * i - 90;
                                    const pointFor = (i: number, value: number) => {
                                        const rad = (angleFor(i) * Math.PI) / 180;
                                        const r = (Math.max(0, Math.min(100, value)) / 100) * 40;
                                        return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
                                    };
                                    const polygonPoints = ratios
                                        .map((ratio: any, i: number) => {
                                            const p = pointFor(i, ratio.value);
                                            return `${p.x},${p.y}`;
                                        })
                                        .join(" ");

                                    return (
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            {[20, 40, 60, 80, 100].map((r, i) => (
                                                <circle key={i} cx="50" cy="50" r={(r / 100) * 40} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                            ))}
                                            {n > 0 && ratios.map((_: any, i: number) => {
                                                const p = pointFor(i, 100);
                                                return (
                                                    <line
                                                        key={i}
                                                        x1="50" y1="50"
                                                        x2={p.x} y2={p.y}
                                                        stroke="rgba(255,255,255,0.05)"
                                                        strokeWidth="0.5"
                                                    />
                                                );
                                            })}
                                            {n > 0 && (
                                                <polygon
                                                    points={polygonPoints}
                                                    fill="rgba(0, 107, 63, 0.2)"
                                                    stroke="#006B3F"
                                                    strokeWidth="1"
                                                    className="transition-all duration-700"
                                                />
                                            )}
                                        </svg>
                                    );
                                })()}

                                {(selectedClient.ratios || []).map((ratio: any, i: number, arr: any[]) => {
                                    const angle = (360 / arr.length) * i - 90;
                                    const rad = (angle * Math.PI) / 180;
                                    // Libellés à 46 % du rayon, sur deux lignes si besoin : en
                                    // nowrap au bord du carré, « Conformité fiscale » sortait de
                                    // l'écran sur mobile.
                                    const x = 50 + 46 * Math.cos(rad);
                                    const y = 50 + 46 * Math.sin(rad);
                                    return (
                                        <div
                                            key={i}
                                            className="absolute font-black text-[9px] sm:text-[10px] text-white uppercase tracking-wide -translate-x-1/2 -translate-y-1/2 text-center leading-tight max-w-[32%]"
                                            style={{ left: `${x}%`, top: `${y}%` }}
                                        >
                                            {ratio.label}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-10 flex gap-4 sm:gap-6 lg:gap-10">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Health Index (Actual)</p>
                                    <div className="text-2xl sm:text-3xl lg:text-5xl font-black text-emerald-400 tracking-tighter">{selectedClient.score}%</div>
                                </div>
                                <div className="text-center border-l border-white/10 pl-10">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Rating OHADA</p>
                                    <div className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tighter">{selectedClient.rating}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Insights & Risks (Right) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="apix-card">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <BarChart3 className="w-6 h-6 text-primary" />
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

                    <div className="p-8 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 shadow-xl relative overflow-hidden">
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
            <p className="text-[11px] text-primary-foreground/70 leading-relaxed font-medium">{text}</p>
        </div>
    );
}
