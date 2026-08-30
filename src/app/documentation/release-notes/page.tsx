"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Ce journal des mises à jour affichait des chiffres de précision et de
// performance non vérifiables ("OCR 98% de précision", "+40% de rendu") et
// un encart de statistiques globales entièrement fabriqué ("98,9% de
// satisfaction", "450+ commits ce trimestre", "12 nouvelles features IA"),
// sans aucune mesure réelle derrière. Les chiffres non vérifiables ont été
// retirés ; le contenu qui reste décrit des fonctionnalités réellement
// présentes dans l'application, sans statistique inventée.
// ─────────────────────────────────────────────────────────────────────────────

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
            { icon: Cpu, name: "Assistant IA", detail: "Assistant capable de répondre aux questions sur le SYSCOHADA (nécessite une clé DeepSeek configurée)." },
            { icon: Sparkles, name: "OCR des factures", detail: "Extraction automatique des données de factures scannées." },
            { icon: ShieldCheck, name: "Conformité AUDCIF", detail: "Modèles d'états financiers pour la zone UEMOA/CEMAC." }
        ],
    },
    {
        version: "1.9.5",
        date: "15 Janvier 2026",
        badge: "PERFORMANCE",
        title: "Optimisation & CRM",
        description: "Amélioration de la gestion des gros volumes de données CRM et optimisation du temps de chargement des fiches clients.",
        features: [
            { icon: Rocket, name: "Export Excel", detail: "Génération de balances comptables au format Excel." },
            { icon: Calendar, name: "Échéancier Fiscal", detail: "Suivi des échéances de déclaration par pays." }
        ]
    },
    {
        version: "1.9.0",
        date: "01 Janvier 2026",
        badge: "SECURITY",
        title: "Sécurité & Accès",
        description: "Renforcement du contrôle d'accès et journalisation des actions sensibles.",
        features: [
            { icon: ShieldCheck, name: "Contrôle d'accès par rôle", detail: "Permissions différenciées selon le profil (staff, admin)." },
            { icon: Bug, name: "Correctifs de stabilité", detail: "Corrections diverses sur l'affichage responsive." }
        ]
    }
];

export default function ReleaseNotesPage() {
    return (
        <div className="min-h-screen bg-[#050608] text-slate-200 p-8 md:p-20">
            <div className="max-w-4xl mx-auto space-y-20">

                {/* Header */}
                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase">
                        Journal des Mises à Jour
                    </div>
                    <h1 className="page-title-dark">
                        Release <span className="text-primary">Notes</span>
                    </h1>
                    <p className="page-subtitle-dark">
                        Suivez l'évolution constante de Cabinet 360. Chaque mise à jour nous rapproche
                        de la perfection opérationnelle.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative space-y-24 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/0 before:via-primary/20 before:to-primary/0">

                    {RELEASES.map((release, idx) => (
                        <div key={release.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">

                            {/* Dot / Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#050608] text-primary shadow-xl group-hover:border-primary group-hover:scale-110 transition-all z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                                <Rocket className="w-5 h-5 flex-shrink-0" />
                            </div>

                            {/* Card Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-[32px] bg-[#13161c] border border-white/5 hover:border-primary/30 transition-all shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full group-hover:brightness-110/10 transition-colors" />

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 bg-primary rounded-lg text-[10px] font-black text-white tracking-widest">{release.version}</span>
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
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-primary transition-colors">
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

                                    <div className="pt-2 flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
                                        Lire le changelog complet <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
