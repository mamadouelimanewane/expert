"use client";

import { Download, Printer, ShieldCheck, Cpu, Globe, Zap, BarChart3, Lock, Server } from "lucide-react";
import Image from "next/image";

export default function PresentationPage() {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:text-black">
            {/* Toolbar (Hidden on Print) */}
            <div className="fixed top-6 right-6 flex gap-4 print:hidden z-50">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                    Imprimer / Sauvegarder en PDF
                </button>
            </div>

            {/* Document Container */}
            <div className="max-w-[21cm] mx-auto bg-white shadow-2xl min-h-screen my-8 p-[2cm] print:shadow-none print:m-0 print:p-0 print:w-full">

                {/* Header */}
                <header className="border-b-4 border-indigo-600 pb-8 mb-12">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Cabinet 360</h1>
                            <p className="text-indigo-600 font-bold text-lg">Expertise Comptable OHADA & Audit</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-sm font-semibold text-slate-500">DOCUMENT STRATÉGIQUE</p>
                            <p className="text-sm text-slate-400">Janvier 2026</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mt-2">
                                <ShieldCheck className="w-3 h-3" /> CERTIFIÉ OHADA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-8 print:space-y-6 text-justify leading-relaxed">

                    {/* Title Section */}
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyse de la Solution Cabinet 360 ERP</h2>
                        <h3 className="text-lg text-slate-600 font-medium">Pour le marché de l'expertise comptable en Afrique et l'espace OHADA</h3>
                    </div>

                    {/* 1. Présentation */}
                    <section className="space-y-4">
                        <h4 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-lg text-sm">1</span>
                            Présentation Générale de la Solution
                        </h4>
                        <p className="text-slate-600">
                            <strong>Cabinet 360 ERP</strong> représente une plateforme SaaS complète dédiée à la gestion des cabinets d'expertise comptable,
                            spécialement conçue pour l'Afrique francophone et l'espace OHADA. Cette solution se positionne comme un outil intégré répondant aux
                            besoins spécifiques des Experts-Comptables dans un contexte africain en pleine mutation digitale.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><BriefcaseIcon className="w-4 h-4 text-indigo-500" /> Fonctionnalités Classiques</h5>
                                <p className="text-sm text-slate-600">
                                    Gestion complète des dossiers clients, tenue comptable conforme SYSCOHADA, facturation des honoraires,
                                    suivi des temps (Time Tracking) et Gestion Électronique de Documents (GED) fiscale.
                                </p>
                            </div>
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 print:border-slate-300">
                                <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-indigo-500" /> Innovations IA</h5>
                                <p className="text-sm text-slate-600">
                                    <strong>ExpertAI</strong> pour l'assistant fiscal, <strong>Audit Scanner</strong> pour la détection automatique d'anomalies comptables,
                                    et générateur automatique d'états financiers et de liasses fiscales.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Pertinence Marché */}
                    <section className="space-y-4">
                        <h4 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-lg text-sm">2</span>
                            Pertinence pour le Marché Sénégalais et Sous-Régional
                        </h4>
                        <div className="space-y-3">
                            <h5 className="font-bold text-slate-800">2.1. Contexte de Transformation Digitale</h5>
                            <p className="text-slate-600 text-sm">
                                Le Sénégal et la zone OHADA connaissent une digitalisation accélérée. La conformité stricte aux révisions du SYSCOHADA
                                et la nécessité de déclarations fiscales dématérialisées (e-Impôt) rendent obsolètes les outils traditionnels.
                                L'intégration des paiements mobiles (Wave, Orange Money) pour le règlement des honoraires est devenue un standard incontournable.
                            </p>

                            <h5 className="font-bold text-slate-800">2.2. Besoins Opérationnels des Experts-Comptables</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-4">
                                <li><strong>Agenda Fiscal Intelligent :</strong> Visualisation immédiate des échéances (TVA, VRS, BRS) pour éviter les pénalités.</li>
                                <li><strong>Scanner IA :</strong> Analyse automatique des factures et catégorisation des dépenses.</li>
                                <li><strong>Portail Client :</strong> Espace extranet pour que le client dépose ses pièces et consulte ses soldes en temps réel.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Avantage IA */}
                    <section className="space-y-4 break-inside-avoid">
                        <h4 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-lg text-sm">3</span>
                            Avantage Concurrentiel de l'Intelligence Artificielle
                        </h4>
                        <p className="text-slate-600 text-sm">
                            L'IA constitue le levier de productivité majeur. Là où les cabinets traditionnels saisissent manuellement,
                            <strong>Cabinet 360</strong> automatise. L'analyse prédictive du risque fiscal permet de conseiller le client
                            en amont des contrôles. La réconciliation bancaire automatisée divise par 10 le temps de traitement des relevés.
                        </p>
                    </section>

                    {/* 4. Architecture & Sécurité */}
                    <section className="space-y-4 break-inside-avoid">
                        <h4 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-lg text-sm">4</span>
                            Architecture Technique & Sécurité
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-emerald-600" /> Sécurité Bancaire
                                </h5>
                                <p className="text-xs text-slate-500">
                                    Chiffrement AES-256 des données financières. Logs d'audit immuables pour garantir la traçabilité complète des écritures
                                    (exigence ONECCA).
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Server className="w-4 h-4 text-emerald-600" /> Souveraineté des Données
                                </h5>
                                <p className="text-xs text-slate-500">
                                    Architecture prête pour un déploiement Cloud hybride ou local, respectant les lois sur la protection des données personnelles
                                    dans l'espace UEMOA.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Pricing & Conclusion */}
                    <section className="bg-slate-900 text-white p-6 rounded-2xl print:bg-white print:text-black print:border print:border-slate-300">
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400 print:text-black" />
                            Modèle Économique & Conclusion
                        </h4>
                        <p className="text-sm opacity-90 print:opacity-100">
                            Avec un positionnement tarifaire adapté aux "Cabinets d'élite" (50k - 100k FCFA/mois), Cabinet 360 offre un ROI immédiat par le gain de temps.
                            L'opportunité de marché est massive, couvrant non seulement Dakar mais l'ensemble des capitales économiques de l'UEMOA (Abidjan, Lomé, Cotonou).
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/10 print:border-black/10 flex justify-between items-center">
                            <span className="font-bold text-indigo-400 print:text-black">Cabinet 360 v2.0</span>
                            <span className="text-xs opacity-70">Généré le {new Date().toLocaleDateString()}</span>
                        </div>
                    </section>

                </div>

                {/* Print Footer */}
                <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t border-slate-200 text-xs text-slate-400">
                    <p>Cabinet 360 - Solution de Gestion pour l'Expertise Comptable OHADA</p>
                    <p>Page 1/2</p>
                </div>
            </div>
        </div>
    );
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
