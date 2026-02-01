"use client";

import React from 'react';
import {
    ShieldCheck,
    Zap,
    Cpu,
    Globe,
    CheckCircle2,
    BarChart3,
    Clock,
    Lock,
    Download,
    Printer,
    ArrowRight
} from 'lucide-react';

export default function BrochurePage() {
    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-slate-900 overflow-y-auto font-sans print:bg-white print:text-black">
            {/* Action Bar */}
            <div className="fixed bottom-8 right-8 z-50 flex gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Printer className="w-5 h-5" /> Imprimer / PDF
                </button>
            </div>

            {/* Brochure Container */}
            <div className="max-w-[21cm] mx-auto bg-white my-10 shadow-2xl print:my-0 print:shadow-none min-h-screen flex flex-col">

                {/* Hero SECTION (Cover) */}
                <div className="relative h-[29.7cm] flex flex-col justify-center items-center text-center p-20 bg-slate-900 overflow-hidden break-after-page">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-slate-900 to-slate-900 z-0" />
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />

                    <div className="relative z-10 space-y-12">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-indigo-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <span className="text-5xl font-black text-white">C</span>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-6xl font-black text-white tracking-tighter">CABINET <span className="text-indigo-500">360</span></h1>
                                <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-xs">Innovation Comptable OHADA</p>
                            </div>
                        </div>

                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />

                        <h2 className="text-4xl font-light text-slate-300 leading-tight max-w-2xl mx-auto">
                            L'IA au service de l'expertise comptable : <br />
                            <span className="font-bold text-white">Précision, Automatisation, Excellence.</span>
                        </h2>

                        <div className="pt-10 flex gap-8 justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <ShieldCheck className="w-8 h-8 text-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">SYSCOHADA</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Cpu className="w-8 h-8 text-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Expert AI</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Globe className="w-8 h-8 text-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">UEMOA/CEMAC</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-20 left-0 w-full text-center">
                        <p className="text-slate-600 uppercase tracking-widest text-[10px] font-bold">Brochure Institutionnelle 2026 • v2.0</p>
                    </div>
                </div>

                {/* Page 2: VISION & CORE VALUES */}
                <div className="p-20 flex flex-col gap-16 min-h-[29.7cm] break-after-page text-slate-800">
                    <div className="flex justify-between items-start">
                        <h3 className="text-4xl font-black tracking-tight flex items-center gap-4">
                            <span className="w-2 h-10 bg-indigo-600 rounded-full" />
                            Notre Vision
                        </h3>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 01</span>
                        </div>
                    </div>

                    <p className="text-2xl text-slate-500 leading-relaxed italic">
                        "Nous ne créons pas seulement un logiciel, nous façonnons l'avenir de l'expertise comptable en Afrique.
                        Cabinet 360 transforme la complexité réglementaire en agilité stratégique."
                    </p>

                    <div className="grid grid-cols-2 gap-12 pt-10">
                        <FeatureBlock
                            title="Conformité Native"
                            desc="Une plateforme pensée pour le SYSCOHADA et les spécificités fiscales locales (UEMOA/CEMAC)."
                            icon={ShieldCheck}
                        />
                        <FeatureBlock
                            title="Intelligence Augmentée"
                            desc="Le moteur Nexa-Audit détecte les anomalies et suggère les écritures complexes en temps réel."
                            icon={Zap}
                        />
                        <FeatureBlock
                            title="Expérience Client"
                            desc="Un portail interactif qui renforce la confiance et fluidifie les échanges documents/validation."
                            icon={Globe}
                        />
                        <FeatureBlock
                            title="Haute Sécurité"
                            desc="Chiffrement militaire et hébergement localisé respectant la souveraineté des données."
                            icon={Lock}
                        />
                    </div>
                </div>

                {/* Page 3: Key Features & Modules */}
                <div className="p-20 bg-slate-50 min-h-[29.7cm] flex flex-col gap-12 text-slate-800">
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black tracking-tight uppercase">Solutions & Modules</h3>
                        <p className="text-slate-500 font-medium">L'écosystème le plus complet du marché.</p>
                    </div>

                    <div className="space-y-8">
                        <ModuleRow
                            title="Gestion Client (CRM 360°)"
                            items={["RCCM/NINEA Automatique", "Régimes Fiscaux Spécifiques", "KYC & Conformité Anti-Blanchiment"]}
                        />
                        <ModuleRow
                            title="Production & Audit"
                            items={["États Financiers SYSCOHADA", "Liasse Fiscale Sénégalaise/Ivoirienne", "Audit Trail & Révisions"]}
                        />
                        <ModuleRow
                            title="Business Intelligence"
                            items={["Tableaux de Bord Sectoriels", "Predictive Analytics (Cash-flow)", "Benchmarking OHADA"]}
                        />
                        <ModuleRow
                            title="Digital Ledger & Facturation"
                            items={["Revue des comptes Assistée", "Déclaration de TVA Assistée", "Honoraires & Multi-De devises"]}
                        />
                    </div>

                    <div className="mt-auto p-10 bg-white shadow-xl rounded-3xl border border-slate-200">
                        <div className="flex gap-8 items-center">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold">Certification Professionnelle</h4>
                                <p className="text-slate-500 text-sm">Validé par un panel d'experts-comptables inscrits aux Tableaux de l'ONECCA (Sénégal) et de l'OEC (Côte d'Ivoire).</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Page */}
                <div className="p-20 flex flex-col justify-end min-h-[29.7cm] bg-slate-900 text-white">
                    <div className="space-y-10">
                        <div className="space-y-4 text-center md:text-left">
                            <h3 className="text-5xl font-black">Prêt pour l'excellence ?</h3>
                            <p className="text-xl text-slate-400">Rejoignez les cabinets qui mènent la transformation digitale en Afrique.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-10 border-t border-white/10">
                            <div>
                                <p className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mb-4">Contact</p>
                                <p className="text-lg">contact@cabinet360.com</p>
                                <p className="text-slate-400">+221 33 000 00 00</p>
                            </div>
                            <div>
                                <p className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mb-4">Bureaux</p>
                                <p className="text-lg">Dakar, Sénégal (Plateau)</p>
                                <p className="text-slate-400">Abidjan, Côte d'Ivoire (Plateau)</p>
                            </div>
                            <div className="flex items-end justify-end">
                                <div className="text-right">
                                    <h4 className="text-2xl font-black">CABINET 360</h4>
                                    <p className="text-slate-500 text-xs uppercase tracking-widest">Elite Service Edition</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function FeatureBlock({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
    return (
        <div className="space-y-4 group">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold">{title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function ModuleRow({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                {title}
            </h4>
            <div className="grid grid-cols-3 gap-4">
                {items.map((item, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-indigo-300 transition-colors">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
