"use client";

import React from 'react';
import { Radar, AlertTriangle, Users, BookOpen, Send, Sparkles } from 'lucide-react';

export default function RadarImpactPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                            <Radar className="w-6 h-6 animate-pulse" />
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Radar d'Impact Réglementaire</h1>
                    </div>
                    <p className="text-muted-foreground">Nexus IA surveille les lois de finances OHADA et prédit l'impact sur vos clients.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-muted-foreground">Dernier Scan</p>
                    <p className="text-xs">Aujourd'hui, 08:30</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Alertes Majeures */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" /> Alertes en cours
                    </h2>

                    <div className="glass-card rounded-3xl p-6 border border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BookOpen className="w-32 h-32 text-rose-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">Loi de Finances 2026</span>
                                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">Côte d'Ivoire (CI)</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Hausse de la taxe sur les télécommunications (+2%)</h3>
                            <p className="text-muted-foreground max-w-2xl mb-6">L'article 14 de la nouvelle loi de finances prévoit une augmentation de la taxe spécifique. Notre IA a scanné votre portefeuille et identifié les clients exposés.</p>
                            
                            <div className="flex gap-4">
                                <div className="bg-background/80 backdrop-blur border border-border/50 rounded-2xl p-4 flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-muted-foreground"><Users className="w-4 h-4 inline mr-1" /> Clients Impactés</span>
                                        <span className="text-2xl font-black text-rose-500">14</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Secteurs: IT, Call Centers, FAI</p>
                                </div>
                                <div className="bg-background/80 backdrop-blur border border-border/50 rounded-2xl p-4 flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-muted-foreground">Impact Trésorerie Est.</span>
                                        <span className="text-2xl font-black text-orange-500">-4.5M FCFA</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Moyenne annuelle par client</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all">
                                    <Send className="w-4 h-4" /> Notifier ces 14 clients
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">Acte Uniforme OHADA</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">Nouveau format obligatoire pour les PV d'AG</h3>
                        <p className="text-sm text-muted-foreground mb-4">Application stricte à partir du T3. La bibliothèque du cabinet doit être mise à jour.</p>
                        <button className="text-sm font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Mettre à jour les modèles via IA
                        </button>
                    </div>
                </div>

                {/* Dashboard Side */}
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-border/50">
                        <h3 className="font-bold mb-4 text-muted-foreground">Veille par Pays</h3>
                        <div className="space-y-3">
                            {[
                                { pays: "Sénégal", status: "Calme", color: "bg-emerald-500" },
                                { pays: "Côte d'Ivoire", status: "1 Loi en Revue", color: "bg-rose-500" },
                                { pays: "Cameroun", status: "Veille Active", color: "bg-blue-500" },
                                { pays: "Mali", status: "2 Décrets Récents", color: "bg-amber-500" }
                            ].map((p, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
                                    <span className="font-semibold text-sm">{p.pays}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{p.status}</span>
                                        <div className={`w-2 h-2 rounded-full ${p.color}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
