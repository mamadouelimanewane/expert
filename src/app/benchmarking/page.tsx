"use client";

import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Globe,
    Compass,
    Target,
    AlertCircle,
    CheckCircle2,
    Zap,
    Sparkles,
    LayoutGrid,
    BarChart,
    LineChart,
    ArrowRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BenchData {
    indicator: string;
    clientValue: string;
    sectorAvg: string;
    deviation: number; // positive = better? depend on indicator
    insight: string;
}

const MOCK_BENCHMARK: BenchData[] = [
    { indicator: "Marge Commerciale", clientValue: "32%", sectorAvg: "38%", deviation: -15.7, insight: "Votre marge est inférieure de 6 points à la moyenne du secteur Distribution CI." },
    { indicator: "Délai Paiement Clients (DSO)", clientValue: "75j", sectorAvg: "60j", deviation: -25, insight: "Vos clients paient 15 jours plus tard que la norme. Impact BFR : 12M FCFA." },
    { indicator: "Poids de la Masse Salariale", clientValue: "18%", sectorAvg: "22%", deviation: 18.1, insight: "Excellente maîtrise de la charge salariale par rapport au CA." },
    { indicator: "Taux d'Endettement", clientValue: "45%", sectorAvg: "30%", deviation: -50, insight: "Levier financier important. Attention à la capacité de remboursement." },
];

export default function BenchmarkingPage() {
    const [sector, setSector] = useState("Commerce / Distribution");
    const [region, setRegion] = useState("Côte d'Ivoire (UEMOA)");

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Benchmarking & Intelligence
                        </h2>
                        <p className="text-slate-400 mt-1 text-sm sm:text-base">Comparez les performances avec les moyennes du marché OHADA.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-cyan-400" />
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer flex-1"
                        >
                            <option>Commerce / Distribution</option>
                            <option>Industrie / Manufacture</option>
                            <option>Services / BTP</option>
                            <option>Agriculture / Agro</option>
                        </select>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-500" />
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer flex-1"
                        >
                            <option>Côte d'Ivoire (UEMOA)</option>
                            <option>Sénégal (UEMOA)</option>
                            <option>Cameroun (CEMAC)</option>
                            <option>Gabon (CEMAC)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-700/50 bg-slate-900/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-3">
                            <h3 className="font-bold text-white text-base sm:text-lg">Indicateurs de Performance Comparés</h3>
                            <button className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-2 whitespace-nowrap">
                                <Zap className="w-3 h-3" /> <span className="hidden sm:inline">Mettre à jour les données</span><span className="sm:hidden">MAJ</span>
                            </button>
                        </div>

                        <div className="space-y-6 sm:space-y-8">
                            {MOCK_BENCHMARK.map((item, i) => (
                                <div key={i} className="space-y-2 sm:space-y-3 group cursor-pointer">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                                        <div className="flex-1">
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{item.indicator}</p>
                                            <div className="flex items-center gap-3 sm:gap-4 mt-1">
                                                <span className="text-xl sm:text-2xl font-bold text-white">{item.clientValue}</span>
                                                <span className="text-[10px] sm:text-xs text-slate-500">vs {item.sectorAvg} (Secteur)</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1",
                                            item.deviation > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                        )}>
                                            {item.deviation > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {Math.abs(item.deviation)}%
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", item.deviation > 0 ? "bg-emerald-500" : "bg-rose-500")}
                                            style={{ width: `${Math.abs(item.deviation) + 50}%`, maxWidth: '100%' }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 italic group-hover:text-slate-200 transition-colors">
                                        "{item.insight}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Strategic Intelligence Panel */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-900/20">
                        <h3 className="text-white font-bold flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            Intelligence Marché (IA)
                        </h3>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-bold text-cyan-400 uppercase">Alerte Opportunité</p>
                                <p className="text-xs text-slate-300">
                                    Vos coûts de logistique sont 12% plus bas que la moyenne. C'est votre principal avantage compétitif à Abidjan.
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-bold text-rose-400 uppercase">Point Critique</p>
                                <p className="text-xs text-slate-300">
                                    Délai de rotation des stocks trop lent (45j vs 30j). Risque d'obsolescence sur 15% du stock.
                                </p>
                            </div>
                        </div>

                        <button className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2">
                            Générer Rapport de Benchmarking
                        </button>
                    </div>

                    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-900/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Positionnement Global
                        </h4>
                        <div className="relative h-48 flex items-center justify-center">
                            {/* Visual Radar simulation */}
                            <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
                            <div className="absolute inset-4 border border-slate-800 rounded-full" />
                            <div className="absolute inset-10 border border-slate-800 rounded-full" />
                            <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10" />
                            <p className="absolute bottom-4 text-[10px] text-slate-500 font-bold">TOP 20% DU SECTEUR</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
