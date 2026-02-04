"use client";

import { Award, TrendingUp, ShieldCheck, Zap, ArrowUpRight, Download, Users, Briefcase, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SUCCESS_STORIES = [
    {
        id: "dakar-industrial",
        client: "Industries du Sahel (Dakar)",
        sector: "Industrie & Logistique",
        challenge: "Reporting mensuel trop lent et erreurs de rapprochement bancaire chroniques.",
        solution: "Déploiement du module Core Accounting avec synchronisation API bancaire.",
        result: "Réduction de 70% du temps de saisie et clôture mensuelle à J+2.",
        metric: "70%",
        metricLabel: "Productivité",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10"
    },
    {
        id: "abidjan-fintech",
        client: "Afrimoney Tech (Abidjan)",
        sector: "Fintech / Services Financiers",
        challenge: "Besoin de prouver l'intégrité des données lors d'une levée de fonds Series A.",
        solution: "Utilisation du Nexus Vault et certification Blockchain de tous les rapports financiers.",
        result: "Due diligence bouclée en 15 jours sans aucune réserve technique.",
        metric: "100%",
        metricLabel: "Fiabilité Data",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        id: "cotonou-retail",
        client: "Bénin Retail Group (Cotonou)",
        sector: "Grande Distribution",
        challenge: "Gestion complexe de la paie pour 450 employés répartis sur 12 sites.",
        solution: "Centralisation RH via Nexus Payroll & Social avec portail employé.",
        result: "Zéro retard de paiement et automatisation des déclarations sociales.",
        metric: "450",
        metricLabel: "Salariés Gérés",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    }
];

export default function SuccessStoriesPage() {
    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-12 rounded-[60px] border border-white/5 relative overflow-hidden shadow-2xl">
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
                    <h1 className="text-5xl font-black text-white tracking-tight underline decoration-indigo-500/50 decoration-8 underline-offset-12 mb-8 uppercase">
                        Histoires de <span className="text-indigo-400">Succès</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                        Découvrez comment les leaders de la zone OHADA transforment leur gouvernance avec Cabinet 360 Elite. Des résultats concrets pour une vision stratégique.
                    </p>
                </div>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {SUCCESS_STORIES.map((story) => (
                    <div key={story.id} className="glass-card p-10 rounded-[50px] border border-white/5 bg-slate-900/40 relative group overflow-hidden transition-all hover:border-indigo-500/30">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase mb-1">{story.client}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{story.sector}</p>
                            </div>
                            <div className={cn("px-6 py-4 rounded-[32px] flex flex-col items-center justify-center", story.bg)}>
                                <span className={cn("text-3xl font-black", story.color)}>{story.metric}</span>
                                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{story.metricLabel}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Problématique
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{story.challenge}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> Résultat Élite
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{story.result}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                            <Link href="/documentation/success-stories/pdf-export" className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                                <Download className="w-4 h-4" /> Étude de Cas PDF
                                <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <div className="flex items-center gap-2 text-slate-500">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Audit Certifié</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="p-16 rounded-[60px] bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-indigo-600/20">
                <div className="max-w-xl text-center md:text-left">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-4 leading-none">Votre succès est notre priorité</h2>
                    <p className="text-indigo-100 font-medium">Rejoignez le cercle restreint des cabinets qui redéfinissent l'expertise en Afrique.</p>
                </div>
                <button className="px-12 py-6 bg-white text-indigo-700 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl">
                    Lancez votre Transformation
                </button>
            </div>
        </div>
    );
}
