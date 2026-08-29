"use client";

import { useState, useEffect, useCallback } from "react";
import {
    TrendingUp,
    Search,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    CheckCircle2,
    Building2,
    Users,
    Info,
    RefreshCw,
    XCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditScoreFactor {
    label: string;
    impact: "positive" | "negative";
    description: string;
}

interface CreditScoreEntry {
    id: string;
    clientId: string;
    entityName: string;
    type: "individual" | "business";
    score: number;
    trend: "up" | "down" | "stable";
    riskCategory: "excellent" | "good" | "fair" | "high_risk";
    isEligible: boolean;
    evaluatedAt: string;
    factors: CreditScoreFactor[];
}

interface CreditInsightsData {
    scores: CreditScoreEntry[];
    kpis: { totalScored: number; avgScore: number | null; eligibleCount: number; highRiskCount: number };
}

export default function CreditInsightsPage() {
    const [data, setData] = useState<CreditInsightsData | null>(null);
    const [selectedScore, setSelectedScore] = useState<CreditScoreEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const load = useCallback(() => {
        setIsRefreshing(true);
        fetch("/api/analysis/credit-insights")
            .then((r) => r.json())
            .then((d: CreditInsightsData) => {
                setData(d);
                setSelectedScore((prev) => d.scores.find((s) => s.id === prev?.id) ?? d.scores[0] ?? null);
            })
            .finally(() => setIsRefreshing(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const getScoreColor = (category: string) => {
        switch (category) {
            case "excellent": return "text-emerald-400";
            case "good": return "text-blue-400";
            case "fair": return "text-amber-400";
            case "high_risk": return "text-rose-400";
            default: return "text-slate-400";
        }
    };

    if (!data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    const filteredScores = data.scores.filter((s) => s.entityName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Nexus Credit Insights
                            </span>
                        </div>
                        <h2 className="page-title uppercase">
                            Nexus <span className="text-indigo-400">Credit Insights</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Scores de solvabilité calculés à partir des données comptables réelles (factures, journaux TPE, transactions mobile money).
                        </p>
                    </div>

                    <button
                        onClick={load}
                        disabled={isRefreshing}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                    >
                        {isRefreshing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />} Actualiser
                    </button>
                </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Score Moyen</p>
                    <p className="text-2xl font-black text-white">{data.kpis.avgScore ?? "—"}</p>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Dossiers Scorés</p>
                    <p className="text-2xl font-black text-white">{data.kpis.totalScored}</p>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Éligibles Crédit</p>
                    <p className="text-2xl font-black text-emerald-400">{data.kpis.eligibleCount}</p>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Haut Risque</p>
                    <p className="text-2xl font-black text-rose-400">{data.kpis.highRiskCount}</p>
                </div>
            </div>

            {!selectedScore ? (
                <div className="apix-card text-center">
                    <Info className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Aucun score de crédit enregistré pour le moment. Les scores sont générés depuis le module TPE / Scoring Fintech.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Score Overview */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="apix-card">
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        {selectedScore.type === "individual" ? <Users className="w-12 h-12" /> : <Building2 className="w-12 h-12" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2">{selectedScore.entityName}</h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Évalué le {new Date(selectedScore.evaluatedAt).toLocaleDateString("fr-FR")}</span>
                                            {selectedScore.trend !== "stable" && (
                                                <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase", selectedScore.trend === "up" ? "text-emerald-400" : "text-rose-400")}>
                                                    {selectedScore.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {selectedScore.trend === "up" ? "Tendance Positive" : "Tendance Négative"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-xl sm:text-2xl lg:text-3xl sm:text-4xl lg:text-6xl font-black leading-none mb-1", getScoreColor(selectedScore.riskCategory))}>
                                        {selectedScore.score}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score Nexus / 1000</div>
                                </div>
                            </div>

                            {/* KPI Highlights */}
                            <div className="grid grid-cols-2 gap-4 mb-12">
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Éligibilité Crédit</p>
                                    <p className={cn("text-lg font-black", selectedScore.isEligible ? "text-emerald-400" : "text-rose-400")}>
                                        {selectedScore.isEligible ? "Éligible" : "Non éligible"}
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Catégorie de Risque</p>
                                    <p className={cn("text-lg font-black capitalize", getScoreColor(selectedScore.riskCategory))}>
                                        {selectedScore.riskCategory.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            {/* Score Scale Overlay */}
                            <div className="relative pt-12">
                                <div className="h-2 bg-white/5 rounded-full mb-4 flex overflow-hidden">
                                    <div className="w-[40%] bg-rose-500/40" />
                                    <div className="w-[20%] bg-amber-500/40" />
                                    <div className="w-[15%] bg-blue-500/40" />
                                    <div className="w-[25%] bg-emerald-500/40" />
                                </div>
                                <div className="absolute top-10 flex -translate-x-1/2 flex-col items-center" style={{ left: `${Math.min(100, (selectedScore.score / 1000) * 100)}%` }}>
                                    <div className="w-1 h-6 bg-white shadow-xl shadow-indigo-500/50" />
                                    <div className="mt-1 px-3 py-1 bg-white text-indigo-900 text-[10px] font-black uppercase rounded-md">Ce dossier</div>
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest">
                                    <span>Haut Risque</span>
                                    <span>Correct</span>
                                    <span>Bon</span>
                                    <span>Excellent</span>
                                </div>
                            </div>
                        </div>

                        {/* Contributing Factors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="apix-card">
                                <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" /> Facteurs Positifs
                                </h4>
                                <div className="space-y-4">
                                    {selectedScore.factors.filter((f) => f.impact === "positive").length === 0 && (
                                        <p className="text-xs text-slate-500">Aucun facteur positif identifié.</p>
                                    )}
                                    {selectedScore.factors.filter((f) => f.impact === "positive").map((f, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight mb-1">{f.label}</p>
                                                <p className="text-[10px] text-emerald-400/70 leading-relaxed">{f.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="apix-card">
                                <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-400" /> Points d'Attention
                                </h4>
                                <div className="space-y-4">
                                    {selectedScore.factors.filter((f) => f.impact === "negative").length === 0 && (
                                        <p className="text-xs text-slate-500">Aucun point d'attention identifié.</p>
                                    )}
                                    {selectedScore.factors.filter((f) => f.impact === "negative").map((f, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                                                <XCircle className="w-4 h-4 text-rose-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight mb-1">{f.label}</p>
                                                <p className="text-[10px] text-rose-400/70 leading-relaxed">{f.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="apix-card">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4 text-indigo-400" /> Rechercher un dossier
                            </h4>
                            <input
                                type="text"
                                placeholder="Nom du client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="apix-card">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Dossiers Scorés</h4>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {filteredScores.length === 0 && (
                                    <p className="text-xs text-slate-500 text-center py-4">Aucun dossier ne correspond.</p>
                                )}
                                {filteredScores.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedScore(s)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                                            selectedScore.id === s.id ? "bg-indigo-600 shadow-xl shadow-indigo-600/30" : "bg-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="text-left">
                                            <p className={cn("text-xs font-black uppercase", selectedScore.id === s.id ? "text-white" : "text-slate-200")}>{s.entityName}</p>
                                            <p className={cn("text-[9px] font-bold uppercase", selectedScore.id === s.id ? "text-indigo-200" : "text-slate-500")}>{new Date(s.evaluatedAt).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                        <span className={cn("text-lg font-black", selectedScore.id === s.id ? "text-white" : getScoreColor(s.riskCategory))}>{s.score}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Card - honest note */}
                        <div className="apix-card">
                            <div className="flex items-start gap-4">
                                <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Calcul automatique non disponible sur cette page — les scores affichés proviennent des données comptables existantes (factures, journaux TPE, transactions mobile money), calculés via le module Scoring Fintech.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
