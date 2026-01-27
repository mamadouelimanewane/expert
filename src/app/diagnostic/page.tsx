"use client";

import { useState } from "react";
import {
    Stethoscope,
    FileText,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Lightbulb,
    ArrowRight,
    Download,
    Share,
    Zap,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosticSection {
    title: string;
    score: number;
    status: "excellent" | "correct" | "critique";
    findings: string[];
    recommendations: string[];
}

const MOCK_DIAGNOSTIC: DiagnosticSection[] = [
    {
        title: "Structure Financière & Solvabilité",
        score: 85,
        status: "excellent",
        findings: [
            "Fonds propres solides représentant 45% du total bilan.",
            "Capacité d'autofinancement en progression de 12%."
        ],
        recommendations: [
            "Envisager un investissement de croissance via levier bancaire modéré.",
            "Optimiser la gestion des excédents de trésorerie."
        ]
    },
    {
        title: "Performance Opérationnelle (SIG)",
        score: 62,
        status: "correct",
        findings: [
            "Marge commerciale stable à 35% (Norme secteur : 38%).",
            "Charges de personnel en augmentation de 15% sans hausse corrélée du CA."
        ],
        recommendations: [
            "Mettre en place un audit de productivité RH.",
            "Renégocier les contrats de sous-traitance pour améliorer la marge."
        ]
    },
    {
        title: "Conformité Fiscale & Sociale",
        score: 45,
        status: "critique",
        findings: [
            "Incohérence détectée entre la TVA déclarée et le CA comptabilisé (Écart 5M FCFA).",
            "Retards récurrents de paiement des cotisations sociales (CNPS)."
        ],
        recommendations: [
            "Procéder à un cadrage de TVA immédiat pour corriger les déclarations.",
            "Mettre en place un calendrier de paiement automatisé pour éviter les pénalités."
        ]
    }
];

export default function DiagnosticPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [diagnosticVisible, setDiagnosticVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");

    const runDiagnostic = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setDiagnosticVisible(true);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-rose-400" />
                        Diagnostic 360 & Rapports
                    </h2>
                    <p className="text-slate-400 mt-1">Examen complet de la santé de l'entreprise et édition automatisée de rapports d'expertise.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-1 focus:ring-rose-500 outline-none cursor-pointer"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                    </select>
                    <button
                        onClick={runDiagnostic}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        Lancer Diagnostic
                    </button>
                </div>
            </div>

            {!diagnosticVisible && !isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-3xl p-12">
                    <Stethoscope className="w-20 h-20 text-slate-700 mb-6 opacity-20" />
                    <h3 className="text-xl font-bold text-slate-400">Prêt pour le Check-up ?</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        L'IA va scanner l'intégralité du grand livre, de la balance et des journaux pour générer un rapport de diagnostic complet.
                    </p>
                </div>
            )}

            {isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-rose-500 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Génération du rapport en cours...</h3>
                        <p className="text-slate-500 text-sm mt-2 italic">Analyse des flux, calcul des ratios OHADA et détection des zones de risques.</p>
                    </div>
                </div>
            )}

            {diagnosticVisible && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

                    {/* Main Content: Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {MOCK_DIAGNOSTIC.map((section, idx) => (
                            <div key={idx} className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden group">
                                <div className="p-5 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-6 rounded-full",
                                            section.status === "excellent" ? "bg-emerald-500" :
                                                section.status === "correct" ? "bg-amber-500" : "bg-rose-500"
                                        )} />
                                        {section.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-400">Score: <span className={cn(
                                            section.status === "excellent" ? "text-emerald-400" :
                                                section.status === "correct" ? "text-amber-400" : "text-rose-400"
                                        )}>{section.score}%</span></span>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Findings */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Constats Clés
                                        </h4>
                                        <ul className="space-y-3">
                                            {section.findings.map((f, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex gap-2">
                                                    <ArrowRight className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Recs */}
                                    <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-3 h-3 fill-current" /> Recommandations
                                        </h4>
                                        <ul className="space-y-3">
                                            {section.recommendations.map((r, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex gap-2 font-medium">
                                                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar: Report Generation & Exports */}
                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-6 bg-gradient-to-br from-slate-900 to-rose-900/10">
                            <h3 className="font-bold text-white text-lg">Édition du Rapport</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Le diagnostic est prêt. Vous pouvez maintenant exporter ce document en format professionnel pour votre client.
                            </p>

                            <div className="space-y-3">
                                <button className="w-full py-3 bg-white text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl">
                                    <Download className="w-5 h-5 text-indigo-600" />
                                    Télécharger Rapport PDF
                                </button>
                                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700">
                                    <Share className="w-5 h-5" />
                                    Envoyer sur Portail Client
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-500 italic text-[10px]">Généré par Cabinet 360 AI Engine v4.2</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions / Follow up */}
                        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" /> Actions de Suivi
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-transparent hover:border-slate-600">
                                    Créer une mission d'accompagnement DSO
                                </button>
                                <button className="w-full text-left p-3 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-transparent hover:border-slate-600">
                                    Programmer une réunion de restitution
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
