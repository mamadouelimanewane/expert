"use client";

import { BookOpen, Award, Zap, ShieldCheck, Scale, Globe, Activity, Cpu, Briefcase, UserCheck, MessageSquare, CheckCircle2 } from "lucide-react";

export default function TrainingPDFExport() {
    return (
        <div className="bg-white min-h-screen text-slate-900 font-serif pb-20">
            {/* Print Instruction Card (Screen Only) */}
            <div className="print:hidden fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 max-w-xs animate-in slide-in-from-bottom duration-500">
                    <p className="font-bold text-sm mb-2">Génération Academy PDF</p>
                    <p className="text-[11px] text-slate-400 mb-4">Pour exporter ce programme de formation complet, utilisez <kbd className="bg-white/10 px-1 rounded">Ctrl + P</kbd> et choisissez "Enregistrer au format PDF".</p>
                    <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        Imprimer le Catalogue
                    </button>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none">
                {/* PAGE 1: COVER */}
                <section className="h-[297mm] flex flex-col justify-between p-24 border-[15px] border-slate-900 relative overflow-hidden break-after-page">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-900 -mr-64 -mt-64 rotate-12 opacity-5" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-20">
                            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase font-sans">Cabinet 360 <span className="text-slate-400 italic">Academy</span></span>
                        </div>

                        <div className="space-y-4">
                            <p className="text-indigo-600 font-sans font-bold uppercase tracking-[0.4em] text-sm">Programme Officiel 2026</p>
                            <h1 className="text-7xl font-sans font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
                                Masterclass <br />
                                <span className="text-slate-400">Professionnelle</span>
                            </h1>
                        </div>

                        <div className="h-1 w-40 bg-indigo-500 mt-12" />

                        <p className="text-2xl text-slate-600 max-w-lg mt-12 leading-relaxed font-serif italic">
                            Le guide intégral de formation pour l'excellence opérationnelle des cabinets d'expertise en zone OHADA.
                        </p>
                    </div>

                    <div className="border-t pt-12 flex justify-between items-end font-sans relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Certification</p>
                            <p className="text-sm font-bold">Niveau : Associé & Senior Manager</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Édition</p>
                            <p className="text-sm font-bold uppercase underline decoration-2 underline-offset-4">Cabinet Expert OHADA</p>
                        </div>
                    </div>
                </section>

                {/* PAGE 2: TABLE OF CONTENTS */}
                <section className="h-[297mm] p-24 break-after-page flex flex-col justify-center">
                    <h2 className="text-4xl font-sans font-black uppercase tracking-tight mb-20 border-b-4 border-slate-900 pb-4 inline-block">Curriculum</h2>

                    <div className="grid grid-cols-1 gap-8">
                        {[
                            { title: "MODULE 1 : NEXUS CORE ACCOUNTING", page: "04" },
                            { title: "MODULE 2 : NEXUS AUDIT & ASSURANCE", page: "08" },
                            { title: "MODULE 3 : NEXUS TAX INTELLIGENCE", page: "12" },
                            { title: "MODULE 4 : NEXUS CORPORATE & GOUVERNANCE", page: "16" },
                            { title: "MODULE 5 : NEXUS JUDICIAL COMMAND", page: "20" },
                            { title: "MODULE 6 : NEXUS MARKET INTELLIGENCE", page: "24" },
                            { title: "MODULE 7 : NEXUS PAYROLL & SOCIAL", page: "28" },
                            { title: "MODULE 8 : NEXUS RISK & COMPLIANCE", page: "32" },
                            { title: "MODULE 9 : NEXUS OPÉRATIONS & RENTABILITÉ", page: "36" },
                            { title: "MODULE 10 : CYBER-VIGILANCE & DATA SECURITY", page: "40" },
                            { title: "MODULE 11 : GESTION RELATION CLIENT PREMIUM", page: "44" },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <span className="font-sans font-bold text-lg text-slate-900 italic">{item.title}</span>
                                <span className="font-mono text-slate-300">Section {item.page}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CONTENT SECTIONS EXAMPLES */}

                {/* SECTION: STRATEGY */}
                <section className="p-24 space-y-16">
                    <div className="space-y-12 break-after-page min-h-[250mm]">
                        <div className="flex items-center gap-6 text-indigo-500 font-sans font-black uppercase tracking-widest text-xs">
                            <span className="w-12 h-[2px] bg-indigo-500" />
                            Module 01 : Expertise Comptable
                        </div>

                        <h3 className="text-5xl font-sans font-black text-slate-900 uppercase leading-none">
                            Nexus <br />Core Accounting
                        </h3>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h4 className="text-xl font-bold border-l-4 border-slate-900 pl-4">Objectif 01 : Zéro Saisie</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Dématérialisation totale du flux de pièces. Utilisation de l'OCR sémantique pour automatiser l'imputation
                                    comptable dès la capture du document.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xl font-bold border-l-4 border-slate-900 pl-4">Objectif 02 : Clôture IA</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Révision assistée par l'intelligence artificielle pour détecter les anomalies de lettrage et les
                                    erreurs de TVA en temps réel.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-12 rounded-[50px] border border-slate-100 relative overflow-hidden mt-12">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Cpu className="w-40 h-40 text-slate-900" />
                            </div>
                            <h5 className="text-2xl font-black uppercase mb-8">Points d'Attentions Technique</h5>
                            <ul className="space-y-6">
                                {[
                                    "Configuration du Plan Comptable SYSCOHADA interactif.",
                                    "Mapping des flux bancaires via API sécurisée.",
                                    "Validation et scellement des journaux comptables.",
                                    "Génération de la Liasse Fiscale (Bilan, CR, TFT)."
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-4 items-start font-sans text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                        <span className="font-bold">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* SECTION: AUDIT */}
                    <div className="space-y-12 break-after-page min-h-[250mm] pt-20">
                        <div className="flex items-center gap-6 text-emerald-500 font-sans font-black uppercase tracking-widest text-xs">
                            <span className="w-12 h-[2px] bg-emerald-500" />
                            Module 02 : Audit & Assurance
                        </div>

                        <h3 className="text-5xl font-sans font-black text-slate-900 uppercase leading-none">
                            Nexus <br />Audit Intelligence
                        </h3>

                        <p className="text-lg text-slate-700 font-serif leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-slate-900">
                            La conduite d'une mission de commissariat aux comptes ou d'audit contractuel exige une rigueur documentaire que seule
                            la plateforme Nexus garantit via son archivage Blockchain. Dans ce module, nous abordons la détection de fraude.
                        </p>

                        <div className="grid grid-cols-1 gap-8 mt-12 font-sans">
                            <div className="p-8 border-2 border-slate-900 flex justify-between items-center group">
                                <div>
                                    <h4 className="text-lg font-black uppercase">Benford Scan Algorithm</h4>
                                    <p className="text-xs text-slate-500 mt-2">Analyse mathématique de la répartition des chiffres du GL.</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-slate-900" />
                            </div>
                            <div className="p-8 border-2 border-slate-900 flex justify-between items-center group">
                                <div>
                                    <h4 className="text-lg font-black uppercase">Digital Circularization</h4>
                                    <p className="text-xs text-slate-500 mt-2">Gestion dématérialisée des confirmations tiers.</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-slate-900" />
                            </div>
                        </div>

                        <div className="mt-auto pt-20 text-center font-sans text-[10px] text-slate-300 uppercase tracking-[0.5em]">
                            Cabinet 360 Academy - Certification Master Expert 2026
                        </div>
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
                        background-color: white !important;
                    }
                    .break-after-page {
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}
