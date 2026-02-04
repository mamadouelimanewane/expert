"use client";

import { Award, CheckCircle2, Rocket, ShieldCheck, Zap, ArrowRight, Download, Printer, User, Mail, Globe } from "lucide-react";
import Link from "next/link";

export default function WelcomePackPage() {
    return (
        <div className="bg-white min-h-screen text-slate-900 font-serif">
            {/* Control Bar (Screen Only) */}
            <div className="print:hidden fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                <div className="glass-card bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 max-w-xs animate-in slide-in-from-bottom duration-500">
                    <p className="font-bold text-sm mb-2">Kit d'Accueil Cabinet 360</p>
                    <p className="text-[11px] text-slate-400 mb-4">Exportez votre Welcome Pack personnalisé au format PDF via <kbd className="bg-white/10 px-1 rounded">Ctrl + P</kbd>.</p>
                    <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        Imprimer le Welcome Pack
                    </button>
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto bg-white border-x border-slate-100">
                {/* PAGE 1: WELCOME LETTER */}
                <section className="h-[297mm] p-24 flex flex-col justify-between break-after-page relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl" />

                    <div>
                        <div className="flex justify-between items-start mb-24">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tighter uppercase font-sans">Cabinet 360 <span className="text-slate-400 italic font-medium">Elite</span></span>
                            </div>
                            <div className="text-right font-sans text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Dossier : WELCOME-2026-X1<br />
                                Date : 04 Février 2026
                            </div>
                        </div>

                        <div className="space-y-12 max-w-2xl">
                            <h1 className="text-5xl font-sans font-black text-slate-900 tracking-tight leading-none uppercase">
                                Bienvenue dans <br />
                                <span className="text-indigo-600">l'Excellence 4.0</span>
                            </h1>

                            <p className="text-lg text-slate-700 leading-relaxed italic">
                                Cher Partenaire,
                            </p>

                            <p className="text-lg text-slate-700 leading-relaxed font-serif">
                                C'est avec une grande fierté que l’équipe de <strong>Cabinet Expert & Consulting OHADA</strong> vous souhaite la bienvenue dans l'écosystème <strong>Cabinet 360 Elite</strong>.
                                En nous rejoignant, vous ne choisissez pas seulement une solution technologique, vous optez pour une nouvelle vision de la performance stratégique.
                            </p>

                            <p className="text-lg text-slate-700 leading-relaxed font-serif">
                                Notre engagement à vos côtés repose sur trois piliers : l'automatisation intelligente pour libérer votre temps,
                                la certification blockchain pour sécuriser vos actifs, et l'analyse prédictive pour anticiper vos besoins.
                            </p>

                            <p className="text-lg text-slate-700 leading-relaxed font-serif">
                                Ce kit d'accueil marque le début de notre collaboration vers une gestion transparente, sécurisée et résolument tournée vers le futur.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t pt-12 font-sans">
                        <div className="space-y-4">
                            <p className="text-sm font-bold">La Direction Associée</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cabinet Expert & Consulting OHADA</p>
                            <div className="flex gap-6 grayscale opacity-80">
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                    <Globe className="w-3 h-3 text-indigo-600" /> Dakar - Abidjan - Cotonou
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                    <Mail className="w-3 h-3 text-indigo-600" /> expert@ohada.pro
                                </div>
                            </div>
                        </div>
                        <div className="w-32 h-1 bg-slate-900" />
                    </div>
                </section>

                {/* PAGE 2: QUICK START GUIDE (Visual) */}
                <section className="h-[297mm] p-24 break-after-page bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                        <Rocket className="w-96 h-96 text-indigo-600" />
                    </div>

                    <h2 className="text-3xl font-sans font-black uppercase tracking-tight mb-16 border-b-4 border-slate-900 pb-4 inline-block">Quick Start Guide</h2>

                    <div className="grid grid-cols-1 gap-12 relative z-10">
                        {[
                            { step: "01", title: "Activation du Profil", desc: "Connectez-vous à votre interface sécurisée et activez votre clé d'authentification biométrique Nexus ID.", icon: User },
                            { step: "02", title: "Synchronisation Bancaire", desc: "Liez vos comptes via le module Accounting pour démarrer le rapprochement automatique par l'IA.", icon: Zap },
                            { step: "03", title: "Migration des Données", desc: "Utilisez l'Entity Hub pour importer vos dossiers permanents et vos bases de données clients.", icon: ShieldCheck },
                            { step: "04", title: "Lancement de Mission", desc: "Créez votre première mission d'audit ou d'expertise et activez le scellement Blockchain.", icon: CheckCircle2 }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-8 items-start bg-white p-10 rounded-[40px] shadow-sm border border-slate-200/50">
                                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-sans font-black text-2xl shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-4 h-4 text-indigo-600" />
                                        <h3 className="text-xl font-black uppercase text-slate-900">{item.title}</h3>
                                    </div>
                                    <p className="text-slate-500 font-serif leading-relaxed italic">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 bg-slate-900 text-white rounded-[50px] relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold mb-4">Besoin d'aide immédiate ?</h4>
                            <p className="text-slate-400 text-sm mb-8">Nos experts onboarding sont disponibles 24/7 via la messagerie sécurisée.</p>
                            <div className="flex gap-6 font-sans text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-indigo-400"><ArrowRight className="w-4 h-4" /> Slack Élite</span>
                                <span className="flex items-center gap-2 text-indigo-400"><ArrowRight className="w-4 h-4" /> Support Prioritaire</span>
                            </div>
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
