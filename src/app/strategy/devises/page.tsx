"use client";

import React, { useState } from 'react';
import { Globe, ArrowRightLeft, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

// EUR/FCFA est un taux FIXE légal (parité UEMOA/CEMAC, traité de coopération monétaire) — c'est une
// valeur réelle, pas une approximation. USD et GNF sont des taux de marché flottants : aucune API de
// change en temps réel n'est connectée, ces valeurs sont donc indicatives et non actualisées.
const RATES: Record<string, number> = {
    'FCFA': 1,
    'EUR': 655.957, // Parité fixe légale — réelle
    'USD': 605.50,  // Indicatif, non temps réel
    'GNF': 0.070,   // Indicatif, non temps réel
};
const LIVE_RATE_CURRENCIES = new Set(['FCFA', 'EUR']);

export default function DevisesPage() {
    const [amount, setAmount] = useState<string>("10000");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("FCFA");

    // Calculation
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    
    // Convert to base FCFA first, then to target
    const amountInFcfa = numAmount * (RATES[fromCurrency] || 1);
    const finalAmount = amountInFcfa / (RATES[toCurrency] || 1);

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
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Hub Multi-Devises</h1>
                    </div>
                    <p className="text-muted-foreground">Gestion du risque de change et conversion en temps réel.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-muted-foreground">Parité Officielle UEMOA/CEMAC (fixe)</p>
                    <p className="text-xs">1 EUR = 655.957 FCFA</p>
                </div>
            </header>

            {(!LIVE_RATE_CURRENCIES.has(fromCurrency) || !LIVE_RATE_CURRENCIES.has(toCurrency)) && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Le taux {fromCurrency}/{toCurrency} n'est pas un taux de marché en temps réel (aucune API de change connectée) — valeur indicative à vérifier avant toute écriture comptable.
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
                                    {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
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
                                    {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
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
