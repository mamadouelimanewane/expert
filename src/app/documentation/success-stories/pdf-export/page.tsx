"use client";

import { Award, CheckCircle2, TrendingUp, ShieldCheck, Zap, Globe, Briefcase, Mail } from "lucide-react";

export default function SuccessStoriesPDF() {
    return (
        <div className="bg-white min-h-screen text-slate-900 font-serif pb-20">
            {/* Control Bar (Screen Only) */}
            <div className="print:hidden fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 max-w-xs animate-in slide-in-from-bottom duration-500">
                    <p className="font-bold text-sm mb-2">Génération Études de Cas</p>
                    <p className="text-[11px] text-slate-400 mb-4">Exportez vos Success Stories au format PDF via <kbd className="bg-white/10 px-1 rounded">Ctrl + P</kbd>.</p>
                    <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        Imprimer les Success Stories
                    </button>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto bg-white border-x border-slate-100 shadow-2xl print:shadow-none">
                {/* PAGE 1: COVER */}
                <section className="h-[297mm] p-24 flex flex-col justify-between break-after-page relative overflow-hidden bg-slate-900 text-white">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 -mr-64 -mt-64 rotate-45 rounded-[120px]" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-32">
                            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl">
                                <Award className="w-8 h-8 text-slate-900" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase font-sans">Cabinet 360 <span className="text-white/40 italic font-medium">Elite</span></span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-8xl font-sans font-black tracking-tight leading-[0.85] uppercase">
                                Études de <br />
                                <span className="text-indigo-400">Succès</span>
                            </h1>
                            <div className="h-2 w-48 bg-indigo-500" />
                            <p className="text-3xl text-slate-300 max-w-xl font-serif italic pt-10">
                                Analyse des performances et transformations digitales au sein de la zone OHADA.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-12 flex justify-between items-end font-sans relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Division Impact</p>
                            <p className="text-lg font-bold italic">Rapport Performance 2026</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Sénégal • Côte d'Ivoire • Bénin</p>
                            <p className="text-lg font-bold">Cabinet Expert & Consulting OHADA</p>
                        </div>
                    </div>
                </section>

                {/* PAGE 2: CASE STUDY 1 */}
                <section className="min-h-[297mm] p-24 break-after-page">
                    <div className="flex items-center gap-4 mb-16">
                        <span className="text-indigo-600 font-sans font-black uppercase text-xs tracking-[0.3em]">Cas d'École 01</span>
                        <div className="flex-1 h-[1px] bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-12 gap-12">
                        <div className="col-span-12">
                            <h2 className="text-5xl font-sans font-black text-slate-900 leading-none mb-6">Industries du Sahel</h2>
                            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest font-sans mb-12">Secteur : Industrie & Logistique (Dakar)</p>
                        </div>

                        <div className="col-span-7 space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Le Défi Stratégique
                                </h3>
                                <p className="text-lg leading-relaxed text-slate-700 italic border-l-4 border-slate-900 pl-6 py-2">
                                    "Nous perdions un temps considérable dans le rapprochement de plus de 20 comptes bancaires sur plusieurs pays UEMOA. La clôture prenait 15 jours."
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> La Solution Cabinet 360
                                </h3>
                                <p className="text-base leading-relaxed text-slate-600">
                                    Implémentation du module <strong>Core Accounting</strong> avec automatisation OCR des factures. Liaison directe avec les banques via le connecteur Nexus API pour un lettrage en temps réel.
                                </p>
                            </div>
                        </div>

                        <div className="col-span-5">
                            <div className="bg-slate-900 text-white p-10 rounded-[50px] space-y-8">
                                <div className="text-center">
                                    <p className="text-7xl font-sans font-black text-indigo-400 leading-none">70%</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 opacity-50">Gain de Productivité</p>
                                </div>
                                <div className="border-t border-white/10 pt-8 space-y-4">
                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Clôture à J+2
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Zéro Saisie Manuelle
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Reporting Holistique
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-slate-100 font-sans text-[10px] text-slate-300 flex justify-between italic uppercase tracking-widest leading-none">
                        <span>Success Story - Cabinet 360 Elite</span>
                        <span>Propriété de Cabinet Expert & Consulting OHADA</span>
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
