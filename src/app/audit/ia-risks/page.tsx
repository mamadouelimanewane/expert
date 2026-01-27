"use client";

import { useState } from "react";
import {
    ShieldAlert,
    BarChart,
    Target,
    Zap,
    Search,
    FileText,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Fingerprint,
    TrendingDown,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskPoint {
    id: string;
    category: string;
    score: number;
    label: string;
    observations: string;
}

const MOCK_RISKS: RiskPoint[] = [
    { id: "1", category: "Opérationnel", score: 85, label: "Cycle Ventes-Clients", observations: "Concentration de 40% du CA sur un seul client (Risque de dépendance)." },
    { id: "2", category: "Conformité", score: 62, label: "TVA & Retenues", observations: "Écarts récurrents sur les retenues à la source (AIR)." },
    { id: "3", category: "Fraude", score: 35, label: "Caisse & Espèces", observations: "Volume de retraits espèces supérieur à la moyenne du secteur." },
    { id: "4", category: "Comptable", score: 78, label: "Évaluation Stocks", observations: "Méthode de valorisation non documentée pour les encours." },
];

export default function IARiskAuditPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const startAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setShowResults(true);
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-indigo-400" />
                        Cartographie des Risques IA
                    </h2>
                    <p className="text-slate-400 mt-1">Analyse prédictive et ciblage des zones à risque pour l'audit légal.</p>
                </div>

                <button
                    onClick={startAnalysis}
                    disabled={analyzing}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {analyzing ? (
                        <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                        <ShieldAlert className="w-5 h-5" />
                    )}
                    {analyzing ? "Génération de la matrice..." : "Lancer Scoring Risque"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">

                {/* Risk Matrix Visualization */}
                <div className="lg:col-span-2 space-y-6 text-white">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 bg-slate-900/50 relative overflow-hidden">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-rose-500" />
                            Matrice d'Évaluation des Risques
                        </h3>

                        {!showResults && !analyzing && (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                                <PieChart className="w-12 h-12 mb-4 opacity-20" />
                                <p className="max-w-xs mx-auto">Lancez l'analyse pour visualiser la répartition des risques du dossier.</p>
                            </div>
                        )}

                        {analyzing && (
                            <div className="h-64 flex items-center justify-center">
                                <div className="space-y-4 w-full max-w-xs">
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]" style={{ width: '40%' }} />
                                    </div>
                                    <p className="text-center text-xs text-indigo-400 font-medium">Scan du Grand Livre en cours...</p>
                                </div>
                            </div>
                        )}

                        {showResults && (
                            <div className="grid grid-cols-2 gap-8 items-center py-4">
                                {/* Mock Bubble Chart representation */}
                                <div className="relative h-64 border-l-2 border-b-2 border-slate-800 flex items-center justify-center">
                                    <div className="absolute top-4 right-4 text-[10px] text-slate-500 font-bold uppercase">Impact Élevé</div>
                                    <span className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 font-bold text-xs absolute top-10 right-10 animate-pulse">CLIENTS</span>
                                    <span className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-[10px] absolute bottom-20 left-20">TVA</span>
                                    <span className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-[10px] absolute top-20 left-40">PERS</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                        <span className="text-xs font-bold text-slate-400">Risque Moyen Global</span>
                                        <span className="text-xl font-bold text-amber-500">6.4/10</span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-slate-400 leading-relaxed italic">
                                            "L'IA suggère d'orienter les travaux de terrain sur le cycle 'Ventes' compte tenu des fluctuations mensuelles anormales par rapport à 2023."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Points */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                            <h3 className="font-bold text-white text-sm">Ciblage des Travaux (Sondages IA)</h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {MOCK_RISKS.map((risk) => (
                                <div key={risk.id} className="p-4 flex gap-4 hover:bg-slate-800/30 transition-all group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                        risk.score > 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            risk.score > 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                    )}>
                                        {risk.score}%
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold transition-colors group-hover:text-indigo-400 leading-none">{risk.label}</h4>
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{risk.category}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">{risk.observations}</p>
                                    </div>
                                    <button className="self-center p-2 text-slate-700 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: AI Sampling Generator */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-indigo-900/20">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-400" />
                            Générateur de Sondages
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">L'IA sélectionne les écritures les plus pertinentes à tester pour couvrir 80% du risque.</p>

                        <div className="space-y-3 mb-6">
                            {[
                                "Sondage sur les factures > 10M",
                                "Échantillon aléatoire (Strate B)",
                                "Focus Cycle Achats Immobilisés"
                            ].map((t, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">{t}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                            Générer les listes de pointage
                        </button>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Couverture d'Audit
                        </h4>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-white">72%</span>
                            <span className="text-xs text-emerald-400 font-bold mb-1">+15%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[72%]" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                            Taux de couverture du programme de travail basé sur les risques identifiés par l'IA.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
