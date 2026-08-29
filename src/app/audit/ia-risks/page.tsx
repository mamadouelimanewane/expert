"use client";

import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Target,
    Zap,
    Search,
    CheckCircle2,
    ArrowRight,
    Fingerprint,
    PieChart,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBreakdownItem {
    category: string;
    score: number;
    label: string;
    observations: string;
}

interface RiskData {
    globalScore: string;
    breakdown: RiskBreakdownItem[];
}

interface Coverage {
    progress: number;
    missionTitle: string;
}

export default function IARiskAuditPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [riskData, setRiskData] = useState<RiskData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [coverage, setCoverage] = useState<Coverage | null>(null);
    const [coverageError, setCoverageError] = useState<string | null>(null);

    const startAnalysis = async () => {
        setAnalyzing(true);
        setError(null);
        try {
            const res = await fetch("/api/audit/risk-score");
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error || "Erreur lors du calcul du risque.");
                setShowResults(false);
            } else {
                setRiskData(data);
                setShowResults(true);
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Erreur de connexion au service d'analyse.");
            setShowResults(false);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        const loadCoverage = async () => {
            try {
                const res = await fetch("/api/audit/dossier");
                const data = await res.json();
                if (!res.ok || data.error) {
                    setCoverageError(data.error || "Aucun dossier de travail d'audit disponible.");
                    return;
                }
                setCoverage({ progress: data.globalProgress, missionTitle: data.mission?.name || "" });
            } catch (err) {
                console.error("Coverage fetch failed:", err);
                setCoverageError("Erreur lors du chargement de la couverture d'audit.");
            }
        };
        loadCoverage();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-indigo-400" />
                        Cartographie des Risques IA
                    </h2>
                    <p className="page-subtitle">Analyse prédictive et ciblage des zones à risque pour l'audit légal.</p>
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
                    <div className="apix-card relative overflow-hidden">
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-rose-500" />
                            Matrice d'Évaluation des Risques
                        </h3>

                        {!showResults && !analyzing && !error && (
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

                        {!analyzing && error && (
                            <div className="h-64 flex flex-col items-center justify-center text-center gap-4">
                                <AlertTriangle className="w-10 h-10 text-amber-500" />
                                <p className="text-sm text-slate-300 max-w-sm">{error}</p>
                                <button
                                    onClick={startAnalysis}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" /> Réessayer
                                </button>
                            </div>
                        )}

                        {showResults && riskData && (
                            <div className="grid grid-cols-2 gap-8 items-center py-4">
                                {/* Bubble Chart representation — decorative chrome only, labels come from real breakdown categories */}
                                <div className="relative h-64 border-l-2 border-b-2 border-slate-800 flex items-center justify-center">
                                    <div className="absolute top-4 right-4 text-[10px] text-slate-500 font-bold uppercase">Impact Élevé</div>
                                    {riskData.breakdown.slice(0, 3).map((r, i) => (
                                        <span
                                            key={r.category}
                                            className={cn(
                                                "rounded-full border-2 flex items-center justify-center font-bold absolute",
                                                r.score > 70 ? "bg-rose-500/20 border-rose-500/50 text-rose-400 text-xs w-20 h-20 top-10 right-10 animate-pulse" :
                                                    r.score > 40 ? "bg-amber-500/20 border-amber-500/50 text-amber-400 text-[10px] w-16 h-16 top-20 left-40" :
                                                        "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 text-[10px] w-12 h-12 bottom-20 left-20"
                                            )}
                                        >
                                            {r.category.slice(0, 6).toUpperCase()}
                                        </span>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                        <span className="text-xs font-bold text-slate-400">Risque Moyen Global</span>
                                        <span className="text-xl font-bold text-amber-500">{riskData.globalScore}/10</span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-slate-400 leading-relaxed italic">
                                            {parseFloat(riskData.globalScore) > 7
                                                ? "Risque élevé détecté. Une revue approfondie des cycles de vente et de trésorerie est impérative."
                                                : "Le scoring suggère d'orienter les travaux de terrain en priorité sur les catégories les mieux notées ci-dessous."
                                            }
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
                            {!riskData || riskData.breakdown.length === 0 ? (
                                <p className="p-6 text-center text-xs text-slate-500">
                                    {error ? "Aucune donnée de risque disponible." : "Lancez le scoring pour afficher le détail par catégorie."}
                                </p>
                            ) : (
                                riskData.breakdown.map((risk) => (
                                    <div key={risk.label} className="p-4 flex gap-4 hover:bg-slate-800/30 transition-all group">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                            risk.score > 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                risk.score > 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            {Math.round(risk.score)}%
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
                                ))
                            )}
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
                        <p className="text-xs text-slate-400 leading-relaxed">
                            La génération automatique d&apos;échantillons de sondage n&apos;est pas encore implémentée : aucun moteur ne sélectionne d&apos;écritures à tester. Utilisez la matrice de risques ci-contre pour orienter manuellement vos travaux.
                        </p>
                    </div>

                    <div className="apix-card">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Couverture d'Audit
                        </h4>
                        {coverageError ? (
                            <p className="text-[10px] text-slate-500 leading-relaxed">{coverageError}</p>
                        ) : coverage ? (
                            <>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{coverage.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${coverage.progress}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                                    Taux de complétion du programme de travail ({coverage.missionTitle || "dossier d'audit en cours"}) — part des items de checklist marqués « Terminé ».
                                </p>
                            </>
                        ) : (
                            <div className="h-16 flex items-center justify-center text-slate-600 text-xs">Chargement...</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
