"use client";

import React, { useState, useEffect } from 'react';
import { Globe, ArrowRightLeft, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

// EUR/FCFA est un taux FIXE légal (parité UEMOA/CEMAC, traité de coopération monétaire) — c'est une
// valeur réelle, pas une approximation. USD et GNF sont des taux de marché flottants, récupérés en
// temps réel via /api/fx/rates (source publique gratuite). En cas d'échec de la récupération, on
// retombe sur les dernières valeurs connues, explicitement signalées comme non actualisées plutôt
// que de faire comme si elles l'étaient.
const FALLBACK_RATES: Record<string, number> = {
    'FCFA': 1,
    'EUR': 655.957, // Parité fixe légale — réelle
    'USD': 605.50,  // Dernière valeur connue, à défaut de flux temps réel
    'GNF': 0.070,   // Dernière valeur connue, à défaut de flux temps réel
};

export default function DevisesPage() {
    const [amount, setAmount] = useState<string>("10000");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("FCFA");
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [liveDate, setLiveDate] = useState<string | null>(null);
    const [liveCurrencies, setLiveCurrencies] = useState<Set<string>>(new Set(['FCFA', 'EUR']));
    const [fxErreur, setFxErreur] = useState(false);

    useEffect(() => {
        fetch("/api/fx/rates")
            .then((r) => r.json())
            .then((d) => {
                if (d.error) { setFxErreur(true); return; }
                setRates((prev) => ({ ...prev, USD: d.xofPerUsd, GNF: d.xofPerGnf }));
                setLiveDate(d.date);
                setLiveCurrencies(new Set(['FCFA', 'EUR', 'USD', 'GNF']));
            })
            .catch(() => setFxErreur(true));
    }, []);

    // Calculation
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;

    // Convert to base FCFA first, then to target
    const amountInFcfa = numAmount * (rates[fromCurrency] || 1);
    const finalAmount = amountInFcfa / (rates[toCurrency] || 1);

    const formatNumber = (val: number, isFcfa: boolean) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: isFcfa ? 0 : 2,
            maximumFractionDigits: isFcfa ? 0 : 2
        }).format(val);
    };

    const handleSwap = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h1 className="page-title mb-0">Hub Multi-Devises</h1>
                    </div>
                    <p className="page-subtitle mb-0">Gestion du risque de change et conversion en temps réel.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-muted-foreground">Parité Officielle UEMOA/CEMAC (fixe)</p>
                    <p className="text-xs">1 EUR = 655.957 FCFA</p>
                    {liveDate && <p className="text-[10px] text-emerald-500 mt-1">Taux USD/GNF actualisés le {liveDate}</p>}
                </div>
            </header>

            {fxErreur && (
                <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-500">
                        Impossible de récupérer les taux de change en temps réel — les valeurs USD/GNF affichées sont les dernières connues, non actualisées.
                    </p>
                </div>
            )}

            {!fxErreur && (!liveCurrencies.has(fromCurrency) || !liveCurrencies.has(toCurrency)) && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Récupération du taux {fromCurrency}/{toCurrency} en cours ou indisponible — valeur indicative à vérifier avant toute écriture comptable.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Convertisseur rapide */}
                <div className="glass-card rounded-3xl p-6 border border-border/50 bg-gradient-to-br from-background to-muted/20">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-purple-500" /> Conversion Instantanée</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Montant à convertir</label>
                            <div className="flex bg-muted/50 border border-border/50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
                                <select 
                                    className="bg-transparent border-r border-border/50 px-3 py-3 text-sm focus:outline-none font-bold cursor-pointer"
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                >
                                    {Object.keys(FALLBACK_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input 
                                    type="number" 
                                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-center -my-2 relative z-10">
                            <button onClick={handleSwap} className="p-2 bg-background border border-border/50 rounded-full shadow-sm hover:bg-muted transition-colors group">
                                <ArrowRightLeft className="w-4 h-4 text-muted-foreground rotate-90 group-hover:text-purple-500 transition-colors" />
                            </button>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Résultat</label>
                            <div className="flex bg-muted/50 border border-border/50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
                                <select 
                                    className="bg-transparent border-r border-border/50 px-3 py-3 text-sm focus:outline-none font-bold text-purple-500 cursor-pointer"
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                >
                                    {Object.keys(FALLBACK_RATES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none font-bold text-purple-500" 
                                    value={formatNumber(finalAmount, toCurrency === 'FCFA')} 
                                    readOnly 
                                />
                            </div>
                        </div>
                        
                        <button disabled title="La génération d'écriture comptable de change n'est pas encore implémentée" className="w-full mt-2 py-3 bg-purple-600/40 text-white/60 font-bold rounded-xl cursor-not-allowed transition-all flex justify-center items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Générer l'écriture (bientôt disponible)
                        </button>
                    </div>
                </div>

                {/* Impact Trésorerie */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-500" /> Exposition au Risque de Change</h3>
                    </div>

                    <div className="flex items-start gap-3 p-6 bg-muted/30 border border-dashed border-border/50 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold mb-1">Suivi des transactions en devises non disponible</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Le calcul des pertes/gains de change et de l'exposition par devise nécessite d'enregistrer la devise d'origine sur les factures et transactions bancaires, ce qui n'est pas encore implémenté dans l'application (toutes les données actuelles sont en FCFA).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
