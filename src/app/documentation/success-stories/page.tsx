"use client";

import { TrendingUp, ArrowUpRight, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page présentait trois clients fictifs ("Industries du Sahel",
// "Afrimoney Tech", "Bénin Retail Group") comme des témoignages réels, avec
// un badge « Audit Certifié » suggérant une vérification qui n'a jamais eu
// lieu. Le cabinet n'a pas encore de clients réels sur la plateforme dont le
// nom puisse être cité : ces scénarios sont donc explicitement présentés
// comme illustratifs, sans nom d'entreprise ni badge de certification.
// ─────────────────────────────────────────────────────────────────────────────

const SCENARIOS_ILLUSTRATIFS = [
    {
        id: "industrie-logistique",
        sector: "Industrie & Logistique",
        challenge: "Reporting mensuel trop lent et erreurs de rapprochement bancaire chroniques.",
        result: "Le module Core Accounting avec synchronisation API bancaire vise à réduire le temps de saisie et accélérer la clôture mensuelle.",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10"
    },
    {
        id: "fintech",
        sector: "Fintech / Services Financiers",
        challenge: "Besoin de prouver l'intégrité des données lors d'une levée de fonds.",
        result: "La piste d'audit et l'export FEC visent à faciliter une due diligence sans réserve technique.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        id: "distribution",
        sector: "Grande Distribution",
        challenge: "Gestion de la paie multi-sites pour un effectif important.",
        result: "Le module Paie & Social centralise les déclarations sociales et le suivi des échéances.",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    }
];

export default function SuccessStoriesPage() {
    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-4 sm:p-8 lg:p-12 rounded-[60px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                    <TrendingUp className="w-80 h-80 text-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10">
                            Impact & Performance
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                    <h1 className="page-title">
                        Scénarios <span className="text-indigo-400">Illustratifs</span>
                    </h1>
                    <p className="page-subtitle">
                        Exemples types d&apos;usage de la plateforme par secteur — pas des témoignages de clients réels.
                    </p>
                </div>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {SCENARIOS_ILLUSTRATIFS.map((scenario) => (
                    <div key={scenario.id} className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 bg-slate-900/40 relative group overflow-hidden transition-all hover:border-indigo-500/30">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", scenario.bg, scenario.color)}>
                                    Exemple illustratif
                                </span>
                                <h3 className="text-2xl font-black text-white uppercase mt-3">{scenario.sector}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 mb-10 relative z-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Problématique type</h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{scenario.challenge}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> Réponse de la plateforme
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{scenario.result}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="p-4 sm:p-8 lg:p-16 rounded-[60px] bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 lg:gap-12 shadow-2xl shadow-indigo-600/20">
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4 leading-none">Découvrez la plateforme</h2>
                    <p className="text-indigo-100 font-medium">Explorez les modules du cabinet 360.</p>
                </div>
            </div>
        </div>
    );
}
