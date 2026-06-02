"use client";

import React, { useState } from 'react';
import { Ship, Anchor, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SimulateurDouanePage() {
    const [cafString, setCafString] = useState("15000000");
    const [category, setCategory] = useState(10); // DD %
    
    // Convert CAF to number safely
    const rawCaf = parseInt(cafString.replace(/[^0-9]/g, ''), 10) || 0;
    
    // Constants TEC
    const RS_RATE = 0.01; // Redevance Statistique 1%
    const PCS_RATE = 0.008; // Prélèvement Communautaire 0.8%
    const TVA_RATE = 0.18; // TVA 18%
    
    // Calculations
    const droitsDouane = rawCaf * (category / 100);
    const rs = rawCaf * RS_RATE;
    const pcs = rawCaf * PCS_RATE;
    
    // Assiette TVA = CAF + DD + RS + PCS
    const assietteTva = rawCaf + droitsDouane + rs + pcs;
    const tva = assietteTva * TVA_RATE;
    
    const total = droitsDouane + rs + pcs + tva;
    
    const formatFCFA = (val: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(val)) + ' FCFA';
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex flex-col gap-2 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Ship className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Simulateur de Droits de Douane</h1>
                </div>
                <p className="text-muted-foreground">Estimez les frais d'importation (TEC CEDEAO/CEMAC) en temps réel.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-8 border border-border/50">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Anchor className="w-5 h-5 text-blue-500" /> Paramètres d'Importation</h2>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-muted-foreground mb-1 block">Port de Débarquement</label>
                                <select className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                                    <option>Port Autonome d'Abidjan (CI)</option>
                                    <option>Port de Dakar (SN)</option>
                                    <option>Port de Douala (CM)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground mb-1 block">Valeur CAF (FCFA)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                                    value={cafString}
                                    onChange={(e) => setCafString(e.target.value)}
                                    placeholder="Ex: 15000000" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-muted-foreground mb-1 block">Catégorie Tarifaire (Code SH)</label>
                            <select 
                                className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                value={category}
                                onChange={(e) => setCategory(Number(e.target.value))}
                            >
                                <option value={0}>Cat 0: Biens Sociaux essentiels (0%)</option>
                                <option value={5}>Cat 1: Biens de première nécessité (5%)</option>
                                <option value={10}>Cat 2: Intrants et biens d'équipement (10%)</option>
                                <option value={20}>Cat 3: Biens finaux de consommation (20%)</option>
                                <option value={35}>Cat 4: Biens spécifiques de dvpt économique (35%)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                        <Calculator className="w-64 h-64 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500" /> Estimation Globale</h2>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Valeur CAF d'origine</span>
                            <span className="font-medium text-xs">{formatFCFA(rawCaf)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Droits de Douane (DD {category}%)</span>
                            <span className="font-bold">{formatFCFA(droitsDouane)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Redevance Statistique (RS 1%)</span>
                            <span className="font-bold">{formatFCFA(rs)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Prélèvement Com. (PCS 0.8%)</span>
                            <span className="font-bold">{formatFCFA(pcs)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-muted-foreground">TVA (18%)</span>
                            <span className="font-bold">{formatFCFA(tva)}</span>
                        </div>
                        <div className="pt-4 flex justify-between items-end">
                            <span className="text-sm font-bold uppercase text-muted-foreground">Total Taxes à Payer</span>
                            <span className="text-3xl font-black text-blue-500 transition-all">{formatFCFA(total)}</span>
                        </div>
                        <button className="w-full mt-6 py-2 border border-blue-500/50 text-blue-500 font-bold rounded-xl hover:bg-blue-500/10 transition-colors">
                            Générer Rapport PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
