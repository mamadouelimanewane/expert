"use client";

import { Book, Shield, Gavel, FileText, PieChart, Activity, Globe, Zap, Cpu, Briefcase, UserCheck, MessageSquare, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HandbookPDFExport() {
    return (
        <div className="bg-white min-h-screen text-slate-900 font-serif">
            {/* Screen-only instructions */}
            <div className="print:hidden fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 max-w-xs animate-in slide-in-from-bottom duration-500">
                    <p className="font-bold text-sm mb-2">Génération PDF Premium</p>
                    <p className="text-[11px] text-slate-400 mb-4">Pour obtenir la version PDF, utilisez le raccourci <kbd className="bg-white/10 px-1 rounded">Ctrl + P</kbd> et choisissez "Enregistrer au format PDF".</p>
                    <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        Imprimer le Handbook
                    </button>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto bg-white">
                {/* 1. COVER PAGE */}
                <section className="h-[297mm] flex flex-col justify-between p-20 border-[20px] border-slate-900 relative overflow-hidden break-after-page">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-900 -mr-48 -mt-48 rotate-45" />

                    <div>
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase font-sans">Cabinet 360 <span className="text-slate-400 italic">Elite</span></span>
                        </div>

                        <h1 className="text-7xl font-sans font-black text-slate-900 tracking-tight leading-[0.9] uppercase mb-8">
                            Manuel <br />
                            d'Exploitation <br />
                            <span className="text-slate-500 tracking-[-0.05em]">Intégral</span>
                        </h1>

                        <div className="h-2 w-32 bg-slate-900 mb-12" />

                        <p className="text-2xl text-slate-600 max-w-md leading-relaxed font-sans italic">
                            Pilotez votre cabinet 4.0 avec la suite logicielle la plus avancée de l'espace OHADA.
                        </p>
                    </div>

                    <div className="flex justify-between items-end font-sans">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Version</p>
                            <p className="text-lg font-bold">2.0.0 - 2026 Edition</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Éditeur</p>
                            <p className="text-lg font-bold uppercase">Cabinet Expert OHADA</p>
                        </div>
                    </div>
                </section>

                {/* 2. TABLE OF CONTENTS */}
                <section className="min-h-[297mm] p-20 break-after-page font-sans">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-16 underline decoration-4 underline-offset-8">Sommaire Général</h2>

                    <div className="space-y-6">
                        {[
                            "PARTIE I : INTRODUCTION & VISION NEXUS",
                            "PARTIE II : L'INTERFACE DE COMMANDEMENT (DASHBOARD)",
                            "PARTIE III : NEXUS CORPORATE - GESTION ÉLITE",
                            "PARTIE IV : NEXUS RISK & COMPLIANCE (LBA/FT)",
                            "PARTIE V : NEXUS AUDIT & ASSURANCE (CAC)",
                            "PARTIE VI : NEXUS TAX INTELLIGENCE (FISCALITÉ)",
                            "PARTIE VII : NEXUS JUDICIAL COMMAND (EXPERTISES)",
                            "PARTIE VIII : NEXUS MARKET INTELLIGENCE (BENCH)",
                            "PARTIE IX : NEXUS CORE ACCOUNTING (EXPERTISE COMPTABLE)",
                            "PARTIE X : NEXUS CONSOLIDATION & REPORTING",
                            "PARTIE XI : NEXUS PAYROLL & SOCIAL (PAIE)",
                            "PARTIE XII : NEXUS COMMUNICATIONS & COLLABORATION",
                            "PARTIE XIII : INFRASTRUCTURE & SÉCURITÉ",
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-900">{item}</span>
                                <span className="text-slate-400 font-mono italic">Page 0{idx + 3}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. CORE CONTENT (Summary logic for PDF generation) */}
                <section className="p-20 space-y-24">
                    {/* Intro */}
                    <div className="space-y-8">
                        <header className="flex items-center gap-4 text-slate-400 mb-4 border-b-2 border-slate-900 pb-2">
                            <span className="font-black text-slate-900">PARTIE I</span>
                            <span className="flex-1 h-[1px] bg-slate-100" />
                        </header>
                        <h3 className="text-5xl font-black text-slate-900 uppercase">Vision "Elite"</h3>
                        <p className="text-xl text-slate-700 leading-relaxed font-serif">
                            L'écosystème Nexus Elite n'est pas un simple logiciel. C'est le système nerveux central d'un cabinet proactif.
                            Face aux défis de la zone OHADA, nous fusionnons la rigueur comptable avec l'intelligence artificielle pour
                            garantir une sécurité absolue et une productivité sans précédent.
                        </p>
                        <div className="grid grid-cols-3 gap-8">
                            {[
                                { title: "Blockchain", desc: "Immuyabilité des logs" },
                                { title: "Nexus IA", desc: "Collaborateur 24/7" },
                                { title: "Souveraineté", desc: "Hébergement Local" }
                            ].map((card, i) => (
                                <div key={i} className="bg-slate-50 p-6 border-t-4 border-slate-900">
                                    <p className="font-black text-xs uppercase mb-2">{card.title}</p>
                                    <p className="text-[11px] text-slate-500 font-sans">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Accounting - Heart of the business */}
                    <div className="space-y-8 break-before-page pt-20">
                        <header className="flex items-center gap-4 text-slate-400 mb-4 border-b-2 border-slate-900 pb-2">
                            <span className="font-black text-slate-900">PARTIE IX</span>
                            <span className="flex-1 h-[1px] bg-slate-100" />
                        </header>
                        <h3 className="text-5xl font-black text-slate-900 uppercase leading-none">Nexus Core <br />Accounting</h3>

                        <div className="space-y-12">
                            <div>
                                <h4 className="text-2xl font-black uppercase mb-4 text-indigo-600">Saisie et OCR Intelligent</h4>
                                <p className="text-lg text-slate-700 italic border-l-4 border-indigo-200 pl-6">
                                    "Réduction de 85% du temps de saisie manuelle via notre moteur de reconnaissance sémantique."
                                </p>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    Chaque facture importée est analysée par l'IA pour extraire les données essentielles. Le système propose une imputation immédiate basée sur l'historique du client et les spécificités du SYSCOHADA.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-2xl font-black uppercase mb-4 text-indigo-600">IA Match Bancaire</h4>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    Une synchronisation directe avec vos comptes bancaires permet un rapprochement en temps réel. L'algorithme Nexus croise les libellés, les montants et les dates pour proposer des lettrages automatiques.
                                </p>
                            </div>

                            <div className="bg-slate-900 text-white p-10 rounded-[40px]">
                                <p className="font-black uppercase text-xs tracking-[0.3em] mb-4 text-indigo-400">Section Technique</p>
                                <h5 className="text-3xl font-black mb-6 leading-tight">États Financiers Annueled</h5>
                                <p className="text-slate-400 text-sm mb-8">Génération automatisée des états conformément au SYSCOHADA révisé (AUDCIF).</p>
                                <ul className="space-y-4 font-sans font-bold">
                                    <li className="flex gap-4 items-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Bilan Actif / Passif
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Compte de Résultat
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" /> TFT (Tableau Financier)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer for each content page simulating book feel */}
                    <div className="pt-20 text-center italic text-slate-300 font-serif text-sm">
                        "Cabinet 360 Elite Handbook - Propriété Exclusive du Cabinet Expert OHADA - Diffusion Interdite"
                    </div>
                </section>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    .break-after-page {
                        page-break-after: always;
                    }
                    .break-before-page {
                        page-break-before: always;
                    }
                }
            `}</style>
        </div>
    );
}
