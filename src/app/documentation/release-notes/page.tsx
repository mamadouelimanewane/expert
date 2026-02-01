"use client";

import React from 'react';
import {
    Zap,
    Sparkles,
    Rocket,
    ShieldCheck,
    Bug,
    Cpu,
    ArrowRight,
    CheckCircle2,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

const RELEASES = [
    {
        version: "2.0.0",
        date: "01 Février 2026",
        badge: "MAJOR UPDATE",
        title: "L'Ère de l'Intelligence Artificielle",
        description: "Cette version marque un tournant historique avec l'intégration native de Nexa-AI et la refonte complète du moteur de calcul OHADA.",
        features: [
            { icon: Cpu, name: "Expert AI v2.4", detail: "Assistant fiscal capable de répondre aux questions complexes sur le SYSCOHADA." },
            { icon: Sparkles, name: "OCR Avancé", detail: "Extraction automatique des données de factures avec un taux de précision de 98%." },
            { icon: ShieldCheck, name: "Conformité AUDCIF v2024", detail: "Mise à jour intégrale des modèles d'états financiers pour la zone UEMOA/CEMAC." }
        ],
        notes: "Amélioration des performances de rendu de 40% et nouveau design 'Elite Glass'."
    },
    {
        version: "1.9.5",
        date: "15 Janvier 2026",
        badge: "PERFORMANCE",
        title: "Optimisation & CRM",
        description: "Amélioration de la gestion des gros volumes de données CRM et optimisation du temps de chargement des fiches clients.",
        features: [
            { icon: Rocket, name: "Export Excel Ultra-Rapide", detail: "Génération de balances comptables complexes en moins de 3 secondes." },
            { icon: Calendar, name: "Agenda Fiscal Dynamique", detail: "Nouveau système d'alertes push pour les échéances TVA." }
        ]
    },
    {
        version: "1.9.0",
        date: "01 Janvier 2026",
        badge: "SECURITY",
        title: "Sécurité & Multi-Cabinets",
        description: "Renforcement de l'architecture de données et introduction de nouvelles couches de chiffrement.",
        features: [
            { icon: ShieldCheck, name: "Double Authentification (2FA)", detail: "Protection renforcée des comptes administrateurs." },
            { icon: Bug, name: "Correctifs Mineurs", detail: "Résolution des problèmes d'affichage sur les tablettes Android." }
        ]
    }
];

export default function ReleaseNotesPage() {
    return (
        <div className="min-h-screen bg-[#050608] text-slate-200 p-8 md:p-20">
            <div className="max-w-4xl mx-auto space-y-20">

                {/* Header */}
                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black tracking-widest uppercase">
                        Journal des Mises à Jour
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
                        Release <span className="text-indigo-500">Notes</span>
                    </h1>
                    <p className="text-slate-500 max-w-xl text-lg mx-auto md:mx-0">
                        Suivez l'évolution constante de Cabinet 360. Chaque mise à jour nous rapproche
                        de la perfection opérationnelle.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative space-y-24 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-600/0 before:via-indigo-600/20 before:to-indigo-600/0">

                    {RELEASES.map((release, idx) => (
                        <div key={release.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">

                            {/* Dot / Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#050608] text-indigo-500 shadow-xl group-hover:border-indigo-500 group-hover:scale-110 transition-all z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                                <Rocket className="w-5 h-5 flex-shrink-0" />
                            </div>

                            {/* Card Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-[32px] bg-[#13161c] border border-white/5 hover:border-indigo-500/30 transition-all shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] rounded-full group-hover:bg-indigo-600/10 transition-colors" />

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white tracking-widest">{release.version}</span>
                                        <span className="text-xs font-bold text-slate-500">{release.date}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-white tracking-tight">{release.title}</h2>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            {release.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        {release.features.map((feature, fIdx) => {
                                            const Icon = feature.icon;
                                            return (
                                                <div key={fIdx} className="flex gap-4 group/item">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-indigo-400 transition-colors">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-sm font-bold text-white">{feature.name}</h4>
                                                        <p className="text-[11px] text-slate-500 leading-tight">{feature.detail}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {release.notes && (
                                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs text-indigo-300 italic">
                                            💡 {release.notes}
                                        </div>
                                    )}

                                    <div className="pt-2 flex items-center gap-2 text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                                        Lire le changelog complet <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="pt-20 text-center space-y-8">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Cabinet 360 Evolution Pipeline</p>
                    <div className="flex justify-center gap-12">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl font-black text-white tracking-tighter">98.9%</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center">Taux de Satisfaction</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl font-black text-white tracking-tighter">450+</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center">Commits ce trimestre</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl font-black text-white tracking-tighter">12</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center">Nouvelles Features IA</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
