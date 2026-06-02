"use client";

import React, { useState } from 'react';
import { Globe, ArrowRightLeft, DollarSign, RefreshCw, BarChart3 } from 'lucide-react';

// Taux de change simulés par rapport au FCFA (XOF/XAF)
const RATES: Record<string, number> = {
    'FCFA': 1,
    'EUR': 655.957,
    'USD': 605.50,
    'GNF': 0.070, // 1 GNF = ~0.07 FCFA
};

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
                        <h1 className="text-3xl font-black tracking-tight">Hub Multi-Devises</h1>
                    </div>
                    <p className="text-muted-foreground">Gestion du risque de change et conversion en temps réel.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-muted-foreground">Parité Officielle UEMOA/CEMAC</p>
                    <p className="text-xs">1 EUR = 655.957 FCFA</p>
                </div>
            </header>

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
                        
                        <button className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Enregistrer l'écriture (Taux: {(RATES[fromCurrency] / RATES[toCurrency]).toFixed(4)})
                        </button>
                    </div>
                </div>

                {/* Impact Trésorerie */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-purple-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-500" /> Exposition au Risque de Change</h3>
                        <select className="bg-muted/50 border border-border/50 rounded-lg px-2 py-1 text-xs">
                            <option>Ce mois</option>
                            <option>Ce trimestre</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border border-border/50 rounded-2xl">
                            <p className="text-xs font-bold text-muted-foreground mb-1">Pertes de change (Compte 656)</p>
                            <p className="text-xl font-black text-rose-500">- 450,200 FCFA</p>
                        </div>
                        <div className="p-4 border border-border/50 rounded-2xl">
                            <p className="text-xs font-bold text-muted-foreground mb-1">Gains de change (Compte 756)</p>
                            <p className="text-xl font-black text-emerald-500">+ 1,200,500 FCFA</p>
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase border-b border-border/50">
                            <tr>
                                <th className="py-2">Devise</th>
                                <th>Vol. Achats</th>
                                <th>Vol. Ventes</th>
                                <th>Écart (Net)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            <tr className="hover:bg-muted/30">
                                <td className="py-3 font-bold flex items-center gap-2"><DollarSign className="w-3 h-3 text-purple-500" /> USD</td>
                                <td>$45,000</td>
                                <td>$12,000</td>
                                <td className="text-rose-500 font-bold">-$33,000</td>
                            </tr>
                            <tr className="hover:bg-muted/30">
                                <td className="py-3 font-bold flex items-center gap-2">GNF</td>
                                <td>0</td>
                                <td>450,000,000</td>
                                <td className="text-emerald-500 font-bold">+450M</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
