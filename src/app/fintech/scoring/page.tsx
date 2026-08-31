"use client";

import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

// Le score portait auparavant sur un client implicite (le premier retourne par
// la base) : ni la page ni la reponse ne disaient de quel dossier il s'agissait.
// Le client est desormais choisi explicitement et affiche.
type ClientOption = { id: string; name: string };

export default function CreditScoringPage() {
    const [scoreData, setScoreData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientId, setClientId] = useState<string>("");
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                const liste: ClientOption[] = (data.clients || []).map((c: any) => ({
                    id: c.id,
                    name: c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                }));
                setClients(liste);
            })
            .catch(err => console.error("Failed to load clients", err));
    }, []);

    const fetchScore = async (id: string) => {
        if (!id) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/fintech/scoring?clientId=${id}`);
            const data = await res.json();
            setScoreData(res.ok ? data : null);
        } catch (error) {
            console.error("Failed to fetch score", error);
            setScoreData(null);
        } finally {
            setLoading(false);
        }
    };

    const onSelectClient = (id: string) => {
        setClientId(id);
        setScoreData(null);
        setMessage(null);
        fetchScore(id);
    };

    const evaluateScore = async () => {
        if (!clientId) return;
        setEvaluating(true);
        setMessage(null);
        try {
            const res = await fetch('/api/fintech/scoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            });
            const data = await res.json();
            if (res.ok) {
                setScoreData(data);
            } else {
                setScoreData(null);
                setMessage(data.error || "Le score n'a pas pu etre calcule.");
            }
        } catch (error) {
            console.error("Failed to evaluate score", error);
            setMessage("Le score n'a pas pu etre calcule.");
        } finally {
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
                        <h1 className="page-title">Score Solvabilité</h1>
                    </div>
                    <p className="page-subtitle">Barème interne du cabinet, calculé sur les factures, le journal et les encaissements Mobile Money du client sélectionné.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={clientId}
                        onChange={(e) => onSelectClient(e.target.value)}
                        className="apix-input min-w-[220px] text-sm"
                    >
                        <option value="">Sélectionner un client…</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button onClick={evaluateScore} disabled={evaluating || !clientId} className="flex items-center gap-2 px-4 py-2 border border-border/50 hover:bg-muted/50 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin text-amber-500' : ''}`} /> Recalculer
                    </button>
                    <button disabled title="Non implémenté : aucune intégration bancaire n'existe" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
                        Transmettre aux Banques <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Principal */}
                <div className="apix-card flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-32 h-32 text-amber-500" />
                    </div>
                    <h2 className="text-sm font-bold text-muted-foreground mb-4 relative z-10">Score global</h2>
                    
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
                                    <span className={`text-xl sm:text-2xl lg:text-3xl sm:text-4xl lg:text-6xl font-black ${evaluating ? 'animate-pulse text-muted' : isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                <div className="lg:col-span-2 apix-card">
                    <h3 className="text-lg font-bold mb-6">Détail des facteurs</h3>
                    
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
                            {Array.isArray(scoreData.facteursIndetermines) && scoreData.facteursIndetermines.length > 0 && (
                                <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                        Facteur(s) sans donnée sous-jacente, neutralisé(s) à 50/100 :{" "}
                                        {scoreData.facteursIndetermines.join(", ")}. Le score n'en tient donc pas compte.
                                    </span>
                                </div>
                            )}
                            {[
                                { name: "Règlement des factures du cabinet", score: factors.paymentHistory, color: factors.paymentHistory > 75 ? "bg-emerald-500" : "bg-amber-500" },
                                { name: "Évolution des encaissements (2 dernières périodes)", score: factors.revenueGrowth, color: factors.revenueGrowth > 60 ? "bg-emerald-500" : "bg-amber-500" },
                                { name: "Part des entrées dans le flux du journal", score: factors.debtRatio, color: factors.debtRatio > 50 ? "bg-emerald-500" : factors.debtRatio < 30 ? "bg-rose-500" : "bg-amber-500", warning: factors.debtRatio < 40 },
                                { name: "Canaux d'encaissement Mobile Money", score: factors.clientDiversification, color: factors.clientDiversification > 60 ? "bg-emerald-500" : "bg-rose-500", warning: factors.clientDiversification < 40 },
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
                            {message
                                ? message
                                : clientId
                                    ? "Aucun score enregistré pour ce client. Lancez un calcul."
                                    : "Sélectionnez un client pour afficher son score."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
