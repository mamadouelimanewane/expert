"use client";

import { useState } from "react";
import {
    Network,
    Database,
    Search,
    Link2,
    Share2,
    DatabaseZap,
    Cpu,
    Activity,
    CheckCircle2,
    AlertCircle,
    Info,
    RefreshCw,
    Download,
    Eye,
    Table,
    FileJson,
    Zap,
    Box,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataConnection {
    id: string;
    source: string;
    target: string;
    type: "ownership" | "residential" | "professional" | "financial";
    strength: number;
    discoveredDate: string;
}

interface DataInsight {
    label: string;
    value: string;
    confidence: number;
}

const MOCK_CONNECTIONS: DataConnection[] = [
    { id: "L-001", source: "Moussa Sarr", target: "Sarr & Co SARL", type: "ownership", strength: 100, discoveredDate: "2026-01-15" },
    { id: "L-002", source: "Sarr & Co SARL", target: "Immeuble Horizon, Dakar", type: "professional", strength: 95, discoveredDate: "2026-02-01" },
    { id: "L-003", source: "Moussa Sarr", target: "Villa 45, Almadies", type: "residential", strength: 80, discoveredDate: "2025-12-10" },
    { id: "L-004", source: "Villa 45, Almadies", target: "SCI Almadies Prestige", type: "ownership", strength: 70, discoveredDate: "2026-02-03" }
];

const MOCK_INSIGHTS: DataInsight[] = [
    { label: "Bénéficiaire Effectif", value: "Confirmé (Moussa Sarr)", confidence: 98 },
    { label: "Stabilité Professionnelle", value: "Élevée (12 ans)", confidence: 92 },
    { label: "Surface Patrimoniale Est.", value: "750M - 1.2B FCFA", confidence: 65 },
    { label: "Exposition PEP", value: "Nulle", confidence: 99 }
];

export default function DataLinkPage() {
    const [query, setQuery] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const [showGraph, setShowGraph] = useState(false);

    const handleLinkDiscovery = () => {
        if (!query.trim()) return;
        setIsLinking(true);
        setTimeout(() => {
            setIsLinking(false);
            setShowGraph(true);
        }, 3500);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Network className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                Big Data Engine (LinkID)
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-indigo-400">Data Link</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Reliez des milliards de données disparates pour identifier les bénéficiaires effectifs, les réseaux cachés et enrichir vos dossiers clients.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                            <div className="text-xl font-black text-indigo-400">85B+</div>
                            <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Records</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                            <div className="text-xl font-black text-emerald-400">99.9%</div>
                            <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Match</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Engine Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-indigo-400" /> Configuration du Moteur
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Entité à Analyser</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Nom, Adresse, Email, Tel..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Sources de Données</label>
                                {[
                                    { id: "reg", label: "Registres Commerciaux (RCCM)", checked: true },
                                    { id: "prop", label: "Cadastre & Propriétés", checked: true },
                                    { id: "tel", label: "Bases Télécom & Services", checked: true },
                                    { id: "soc", label: "Présence Digitale & Sociale", checked: false },
                                ].map(source => (
                                    <div key={source.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                                        <span className="text-xs text-slate-300 font-bold">{source.label}</span>
                                        <div className={cn(
                                            "w-6 h-3 rounded-full relative transition-all",
                                            source.checked ? "bg-indigo-600" : "bg-slate-700"
                                        )}>
                                            <div className={cn(
                                                "absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all",
                                                source.checked ? "right-0.5" : "left-0.5"
                                            )} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleLinkDiscovery}
                                disabled={isLinking || !query.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                            >
                                {isLinking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <DatabaseZap className="w-5 h-5" />}
                                {isLinking ? "Exécution Moteur LinkID..." : "Lancer Data Link"}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-[32px] bg-indigo-500/5 border border-indigo-500/20">
                        <div className="flex items-start gap-4 mb-4">
                            <Zap className="w-6 h-6 text-indigo-400" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Le moteur **Nexus LinkID** utilise des algorithmes de linking probabiliste pour identifier les mêmes individus à travers des sources disparates, même avec des fautes d'orthographe ou des données incomplètes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Analysis Results / Graph Area */}
                <div className="lg:col-span-8 space-y-6">
                    {isLinking ? (
                        <div className="h-[600px] glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-20 flex flex-col items-center justify-center text-center">
                            <div className="relative w-32 h-32 mb-8">
                                <Network className="w-32 h-32 text-indigo-500 animate-pulse" />
                                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Extraction en cours</h3>
                            <p className="text-slate-500 max-w-sm">Recherche de connexions via les registres OHADA, fonciers et fiscaux mondiaux...</p>
                        </div>
                    ) : showGraph ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {/* Visual Stats Bar */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: "Liens Détectés", value: "7", icon: Link2 },
                                    { label: "Nouveaux Attributs", value: "12", icon: Box },
                                    { label: "Juridictions", value: "3", icon: Globe },
                                    { label: "Qualité Donnée", value: "A+", icon: CheckCircle2 },
                                ].map((s, i) => (
                                    <div key={i} className="glass-card p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                                        <s.icon className="w-4 h-4 text-indigo-400 mb-2" />
                                        <div className="text-lg font-black text-white">{s.value}</div>
                                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Analysis Results */}
                            <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10">
                                <h3 className="text-xl font-black text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                                    Synthèse des Connexions Identifiées
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Insights Stratégiques</h4>
                                        <div className="space-y-3">
                                            {MOCK_INSIGHTS.map((insight, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{insight.label}</span>
                                                        <span className="text-[10px] text-emerald-400 font-black">{insight.confidence}% Confiance</span>
                                                    </div>
                                                    <div className="text-sm font-bold text-white">{insight.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">Graph de Relations</h4>
                                        <div className="space-y-3">
                                            {MOCK_CONNECTIONS.map(conn => (
                                                <div key={conn.id} className="flex items-center gap-4 group">
                                                    <div className="flex-1 text-right truncate">
                                                        <p className="text-xs font-bold text-slate-300">{conn.source}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                                        <div className="w-12 h-px bg-indigo-500/30 group-hover:bg-indigo-500 transition-all" />
                                                        <span className="text-[8px] font-black uppercase text-indigo-400">{conn.type}</span>
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="text-xs font-bold text-white">{conn.target}</p>
                                                        <p className="text-[9px] text-slate-600">Confiance: {conn.strength}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-4">
                                            Explorer Network Viz 360°
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Enrichment Table Mini */}
                            <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Enrichissement de Données</h4>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 bg-white/5 rounded-md text-slate-500 hover:text-white transition-all"><Table className="w-3.5 h-3.5" /></button>
                                        <button className="p-1.5 bg-white/5 rounded-md text-slate-500 hover:text-white transition-all"><FileJson className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-white/5">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Attribut</th>
                                                <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Origine</th>
                                                <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valeur LinkID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px]">
                                            <tr className="border-t border-white/5">
                                                <td className="px-4 py-3 text-slate-400 font-bold">Email Principal</td>
                                                <td className="px-4 py-3 text-slate-600 italic">Non fourni</td>
                                                <td className="px-4 py-3 text-emerald-400 font-black">m.sarr@dakartech.sn</td>
                                            </tr>
                                            <tr className="border-t border-white/5">
                                                <td className="px-4 py-3 text-slate-400 font-bold">Localisation</td>
                                                <td className="px-4 py-3 text-slate-600 italic">Dakar</td>
                                                <td className="px-4 py-3 text-emerald-400 font-black">Almadies, Villa 45, Dakar</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[600px] glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                <Share2 className="w-12 h-12 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2">Nexus Data Link Engine</h3>
                            <p className="text-slate-600 max-w-sm">
                                Entrez une entité pour découvrir les liens cachés et enrichir vos données via le réseau LinkID.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
