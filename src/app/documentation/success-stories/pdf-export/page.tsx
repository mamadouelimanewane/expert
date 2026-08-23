"use client";

import { Award, ShieldCheck, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Ce document imprimable citait un client fictif ("Industries du Sahel")
// avec une citation directe entre guillemets présentée comme une déclaration
// réelle, prête à être imprimée comme une véritable étude de cas signée.
// Le cabinet n'a pas encore de client réel dont l'expérience puisse être
// citée : le document est donc explicitement étiqueté comme un scénario
// illustratif, sans nom d'entreprise ni citation attribuée.
// ─────────────────────────────────────────────────────────────────────────────

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
                    <div className="absolute top-0 right-0 w-[600px] h-[350px] sm:h-[450px] lg:h-[600px] bg-white/5 -mr-64 -mt-64 rotate-45 rounded-[120px]" />

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
                            <p className="text-xl sm:text-2xl lg:text-3xl text-slate-300 max-w-xl font-serif italic pt-10">
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

                {/* PAGE 2: SCÉNARIO ILLUSTRATIF */}
                <section className="min-h-[297mm] p-24 break-after-page">
                    <div className="flex items-center gap-4 mb-16">
                        <span className="text-indigo-600 font-sans font-black uppercase text-xs tracking-[0.3em]">Scénario Illustratif</span>
                        <div className="flex-1 h-[1px] bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
                        <div className="col-span-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-sans font-black text-slate-900 leading-none mb-6">Industrie & Logistique</h2>
                            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest font-sans mb-12">Exemple type — pas un client réel</p>
                        </div>

                        <div className="col-span-7 space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Problématique type
                                </h3>
                                <p className="text-base leading-relaxed text-slate-600">
                                    Rapprochement manuel de nombreux comptes bancaires sur plusieurs pays UEMOA, allongeant fortement le délai de clôture mensuelle.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Réponse de la plateforme
                                </h3>
                                <p className="text-base leading-relaxed text-slate-600">
                                    Le module <strong>Core Accounting</strong> vise à automatiser le rapprochement bancaire et à réduire la saisie manuelle lors de la clôture.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-slate-100 font-sans text-[10px] text-slate-300 flex justify-between italic uppercase tracking-widest leading-none">
                        <span>Scénario illustratif — Cabinet 360</span>
                        <span>Ne représente aucun client réel</span>
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
