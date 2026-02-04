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
    Search,
    Radar,
    Activity,
    PieChart,
    Layers,
    MoveUpRight,
    SearchCode,
    Cpu,
    Briefcase,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClients } from "@/data/mock-clients";

interface BenchData {
    indicator: string;
    clientValue: string | number;
    sectorAvg: string | number;
    deviation: number;
    insight: string;
    category: "Rentabilité" | "Liquidité" | "Structure";
}

const MOCK_BENCHMARK: BenchData[] = [
    { indicator: "Marge Commerciale", clientValue: "32%", sectorAvg: "38%", deviation: -15.7, category: "Rentabilité", insight: "Votre marge est inférieure de 6 points à la moyenne du secteur Distribution CI." },
    { indicator: "Délai Paiement Clients (DSO)", clientValue: "75j", sectorAvg: "60j", deviation: -25, category: "Liquidité", insight: "Vos clients paient 15 jours plus tard que la norme. Impact BFR : 12M FCFA." },
    { indicator: "Poids de la Masse Salariale", clientValue: "18%", sectorAvg: "22%", deviation: 18.1, category: "Structure", insight: "Excellente maîtrise de la charge salariale par rapport au CA." },
    { indicator: "Taux d'Endettement", clientValue: "45%", sectorAvg: "30%", deviation: -50, category: "Structure", insight: "Levier financier important. Attention à la capacité de remboursement." },
];

export default function NexusMarketIntelligencePage() {
    const [selectedClient, setSelectedClient] = useState(mockClients[0]);
    const [sector, setSector] = useState("Commerce / Distribution");
    const [region, setRegion] = useState("Côte d'Ivoire (UEMOA)");

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Globe className="w-64 h-64 text-cyan-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-cyan-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Market Intelligence
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-cyan-400">Market Intelligence</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Positionnement concurrentiel et benchmarking sectoriel haute fidélité pour l'espace OHADA & UEMOA.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedClient.id}
                            onChange={(e) => setSelectedClient(mockClients.find(c => c.id === e.target.value) || mockClients[0])}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all hover:bg-white/10 shadow-xl"
                        >
                            {mockClients.map(client => (
                                <option key={client.id} value={client.id} className="bg-slate-900">{client.name}</option>
                            ))}
                        </select>
                        <div className="bg-cyan-600 px-8 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-cyan-600/30">
                            <Activity className="w-5 h-5" /> En Direct du Marché
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 p-2 bg-slate-900/50 border border-white/5 rounded-[24px] w-fit">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 group hover:border-cyan-500/30 transition-all">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    >
                        <option className="bg-slate-900 uppercase">Commerce / Distribution</option>
                        <option className="bg-slate-900 uppercase">Industrie / Manufacture</option>
                        <option className="bg-slate-900 uppercase">Services / BTP</option>
                        <option className="bg-slate-900 uppercase">Agriculture / Agro</option>
                    </select>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 group hover:border-cyan-500/30 transition-all">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    >
                        <option className="bg-slate-900 uppercase">Côte d'Ivoire (UEMOA)</option>
                        <option className="bg-slate-900 uppercase">Sénégal (UEMOA)</option>
                        <option className="bg-slate-900 uppercase">Cameroun (CEMAC)</option>
                        <option className="bg-slate-900 uppercase">Bénin (UEMOA)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Benchmark Table */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Analyse Comparative</h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">{selectedClient.name} vs Normes Sectorielles</p>
                            </div>
                            <button className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
                                <Zap className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-12">
                            {MOCK_BENCHMARK.map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.category}</p>
                                            </div>
                                            <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.indicator}</h4>
                                        </div>
                                        <div className="flex items-end gap-8">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Cible Secteur</p>
                                                <p className="text-lg font-black text-slate-400">{item.sectorAvg}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-cyan-500 uppercase mb-1">Votre Valeur</p>
                                                <p className="text-3xl font-black text-white">{item.clientValue}</p>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 mb-1",
                                                item.deviation > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            )}>
                                                {item.deviation > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {Math.abs(item.deviation)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                        {/* Sector Marker */}
                                        <div className="absolute top-0 bottom-0 w-[2px] bg-slate-700 z-10" style={{ left: '60%' }} />
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", item.deviation > 0 ? "bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]")}
                                            style={{ width: `${60 + item.deviation}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed italic group-hover:text-slate-300 transition-colors max-w-3xl">
                                        "{item.insight}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strategic Intelligence Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-900/30">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Marché IA Nexus</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-black/20 rounded-[28px] border border-white/5 relative group hover:border-cyan-500/30 transition-all">
                                <SearchCode className="w-8 h-8 text-cyan-400/20 absolute bottom-4 right-4 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Opportunité de Croissance</p>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    Vos coûts de logistique sont 12% plus bas que la moyenne UEMOA. C'est votre principal levier d'optimisation pour le déploiement à Abidjan.
                                </p>
                            </div>

                            <div className="p-5 bg-black/20 rounded-[28px] border border-white/5 relative group hover:border-rose-500/30 transition-all">
                                <AlertCircle className="w-8 h-8 text-rose-400/20 absolute bottom-4 right-4 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Vigilance Stratégique</p>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    Délai de rotation des stocks atypique (45j vs 30j norme secteur). Risque d'immobilisation de cash de 18M FCFA.
                                </p>
                            </div>
                        </div>

                        <button className="w-full mt-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <Download className="w-5 h-5" /> Rapport Stratégique Complet
                        </button>
                    </div>

                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Score Radar Global</h4>
                            <Layers className="w-4 h-4 text-slate-600" />
                        </div>

                        <div className="relative h-48 flex items-center justify-center mb-8">
                            {/* Visual Radar simulation with SVG */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="20%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <circle cx="50%" cy="50%" r="60%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <path d="M96,48 L72,80 L24,80 L10,48 L24,16 L72,16 Z" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.5)" strokeWidth="2" transform="translate(10, 10) scale(0.8)" />
                                <circle cx="82" cy="74" r="4" fill="#22d3ee" className="animate-pulse shadow-lg" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">82<span className="text-xs text-slate-500">/100</span></p>
                                    <p className="text-[8px] text-cyan-400 font-black uppercase">Elite Tier</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Performance</span>
                                <span className="text-[9px] font-black text-emerald-400 uppercase">Top 5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Liquidité</span>
                                <span className="text-[9px] font-black text-rose-400 uppercase">Alerte</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Risque</span>
                                <span className="text-[9px] font-black text-cyan-400 uppercase">Maîtrisé</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
