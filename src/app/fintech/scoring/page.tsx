"use client";

import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Download, ExternalLink, RefreshCw } from 'lucide-react';

export default function CreditScoringPage() {
    const [scoreData, setScoreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);

    const fetchScore = async () => {
        try {
            const res = await fetch('/api/fintech/scoring');
            if (res.ok) {
                const data = await res.json();
                setScoreData(data);
            }
        } catch (error) {
            console.error("Failed to fetch score", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScore();
    }, []);

    const evaluateScore = async () => {
        setEvaluating(true);
        try {
            const res = await fetch('/api/fintech/scoring', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                // Simulate an AI thinking delay for visual effect
                setTimeout(() => {
                    setScoreData(data);
                    setEvaluating(false);
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to evaluate score", error);
            setEvaluating(false);
        }
    };

    // Defaults if no data
    const currentScore = scoreData ? scoreData.score : 0;
    const isEligible = scoreData ? scoreData.isEligible : false;
    const factors = scoreData ? scoreData.factors : {
        paymentHistory: 0, revenueGrowth: 0, debtRatio: 0, clientDiversification: 0
    };
    
    // Circle math
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (currentScore / 1000) * circumference;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                            <Coins className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Score Solvabilité IA</h1>
                    </div>
                    <p className="text-muted-foreground">Évaluation automatique de la santé financière pour faciliter l'accès au crédit bancaire.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={evaluateScore} disabled={evaluating} className="flex items-center gap-2 px-4 py-2 border border-border/50 hover:bg-muted/50 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin text-amber-500' : ''}`} /> Recalculer via IA
                    </button>
                    <button disabled={!isEligible} className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all ${isEligible ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-muted text-muted-foreground opacity-50'}`}>
                        Transmettre aux Banques <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Principal */}
                <div className="glass-card p-8 rounded-3xl border border-amber-500/30 bg-amber-500/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-32 h-32 text-amber-500" />
                    </div>
                    <h2 className="text-sm font-bold text-muted-foreground mb-4 relative z-10">Score Global Nexus</h2>
                    
                    {loading ? (
                        <div className="h-48 flex items-center justify-center"><span className="animate-pulse">Chargement...</span></div>
                    ) : (
                        <>
                            <div className="relative w-48 h-48 flex items-center justify-center z-10">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                        strokeDasharray={circumference} 
                                        strokeDashoffset={evaluating ? circumference : strokeDashoffset} 
                                        className={`transition-all duration-1000 ease-out ${isEligible ? 'text-emerald-500' : currentScore > 0 ? 'text-amber-500' : 'text-muted'}`} />
                                </svg>
                                <div className="text-center">
                                    <span className={`text-6xl font-black ${evaluating ? 'animate-pulse text-muted' : isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {evaluating ? "..." : currentScore}
                                    </span>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">/ 1000</p>
                                </div>
                            </div>
                            {currentScore > 0 && !evaluating && (
                                <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm z-10 ${isEligible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {isEligible ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {isEligible ? 'Profil Éligible au Crédit' : 'Risque Modéré - À Améliorer'}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Facteurs d'analyse */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-border/50">
                    <h3 className="text-lg font-bold mb-6">Détails de l'Analyse IA</h3>
                    
                    {loading || evaluating ? (
                        <div className="space-y-6 opacity-50">
                            {[1,2,3,4].map(i => (
                                <div key={i}>
                                    <div className="h-4 bg-muted w-1/3 rounded mb-2"></div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden"></div>
                                </div>
                            ))}
                        </div>
                    ) : scoreData ? (
                        <div className="space-y-6">
                            {[
                                { name: "Historique de paiement (TVA & Impôts)", score: factors.paymentHistory, color: factors.paymentHistory > 75 ? "bg-emerald-500" : "bg-amber-500" },
                                { name: "Croissance du Chiffre d'Affaires (YoY)", score: factors.revenueGrowth, color: factors.revenueGrowth > 60 ? "bg-emerald-500" : "bg-amber-500" },
                                { name: "Ratio d'endettement actuel", score: factors.debtRatio, color: factors.debtRatio > 50 ? "bg-emerald-500" : factors.debtRatio < 30 ? "bg-rose-500" : "bg-amber-500", warning: factors.debtRatio < 40 },
                                { name: "Diversification Clientèle", score: factors.clientDiversification, color: factors.clientDiversification > 60 ? "bg-emerald-500" : "bg-rose-500", warning: factors.clientDiversification < 40 },
                            ].map((factor, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold flex items-center gap-2">
                                            {factor.name}
                                            {factor.warning && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                                        </span>
                                        <span className="text-sm font-bold">{factor.score}/100</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${factor.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${factor.score}%` }}></div>
                                    </div>
                                    {factor.warning && (
                                        <p className="text-xs text-rose-500 mt-1">Alerte : Cet indicateur pénalise fortement la note globale de l'entreprise.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            Aucun score calculé pour l'instant. Lancez une évaluation IA.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
