"use client";

import { useState } from "react";
import {
    FileSearch,
    FileSpreadsheet,
    FileText,
    Upload,
    Loader2,
    BarChart3,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    TrendingDown,
    ArrowRight,
    Scan,
    Database,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

type FileFormat = "excel" | "csv" | "pdf";
type AnalysisStatus = "idle" | "uploading" | "processing" | "results";

interface AnalysisResult {
    fileName: string;
    format: FileFormat;
    type: "Balance" | "Grand Livre" | "Journal";
    summary: {
        totalDebit: string;
        totalCredit: string;
        gap: string;
        entriesCount: number;
        anomaliesCount: number;
    };
    risks: {
        title: string;
        severity: "high" | "medium" | "low";
        desc: string;
    }[];
}

const MOCK_RESULT: AnalysisResult = {
    fileName: "Balance_Generale_2024_Q1.xlsx",
    format: "excel",
    type: "Balance",
    summary: {
        totalDebit: "145 230 400",
        totalCredit: "145 230 400",
        gap: "0",
        entriesCount: 154,
        anomaliesCount: 3
    },
    risks: [
        { title: "Comptes d'attente non soldés", severity: "high", desc: "Le compte 471 présente un solde de 1.2M FCFA à la clôture." },
        { title: "Variation anormale de marge", severity: "medium", desc: "La classe 601 (Achats) a augmenté de 40% alors que le CA (701) est stable." },
        { title: "Soldes Créditeurs sur Clients", severity: "low", desc: "Plusieurs comptes de la classe 411 présentent des soldes créditeurs suspects." }
    ]
};

export default function DeepAnalysisPage() {
    const [status, setStatus] = useState<AnalysisStatus>("idle");
    const [activeFile, setActiveFile] = useState<AnalysisResult | null>(null);

    const handleAction = () => {
        if (status === "idle") {
            setStatus("uploading");
            setTimeout(() => setStatus("processing"), 1500);
            setTimeout(() => {
                setStatus("results");
                setActiveFile(MOCK_RESULT);
            }, 4500);
        } else {
            setStatus("idle");
            setActiveFile(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                        Analyse Approfondie (IA)
                    </h2>
                    <p className="text-slate-400 mt-1">Analyse intelligente de Balances, Journaux et Grands Livres (Excel, CSV, PDF).</p>
                </div>
                {status === "results" && (
                    <button
                        onClick={handleAction}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition-all font-medium"
                    >
                        Nouvelle Analyse
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Input / Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={cn(
                        "glass-card rounded-2xl p-8 border border-slate-700/50 flex flex-col items-center justify-center text-center transition-all min-h-[400px]",
                        status === "idle" ? "hover:border-indigo-500/50 cursor-pointer" : ""
                    )} onClick={status === "idle" ? handleAction : undefined}>

                        {status === "idle" && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-2xl">
                                    <Upload className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Importer vos exports</h3>
                                <p className="text-slate-500 text-sm max-w-[200px]">Formats acceptés: Excel (.xlsx), CSV ou Scan PDF de balance</p>

                                <div className="mt-8 flex gap-4">
                                    <FileSpreadsheet className="w-6 h-6 text-emerald-500 opacity-50" />
                                    <FileText className="w-6 h-6 text-rose-500 opacity-50" />
                                    <Scan className="w-6 h-6 text-amber-500 opacity-50" />
                                </div>
                            </>
                        )}

                        {(status === "uploading" || status === "processing") && (
                            <div className="space-y-6 w-full">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Database className="w-8 h-8 text-indigo-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {status === "uploading" ? "Téléchargement..." : "Analyse Sémantique IA..."}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-2">
                                        {status === "uploading" ? "Préparation des données sécurisée" : "Vérification des équilibres et recherche d'anomalies"}
                                    </p>
                                </div>
                                {/* Progress bar simulation */}
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={cn(
                                        "h-full bg-indigo-500 transition-all duration-1000",
                                        status === "uploading" ? "w-1/3" : "w-3/4 animate-pulse"
                                    )} />
                                </div>
                            </div>
                        )}

                        {status === "results" && activeFile && (
                            <div className="w-full space-y-6">
                                <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Fichier Analysé</p>
                                        <p className="text-sm font-bold text-white truncate max-w-[150px]">{activeFile.fileName}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                                        <span className="text-slate-500">Nature</span>
                                        <span className="text-white font-bold">{activeFile.type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                                        <span className="text-slate-500">Écritures</span>
                                        <span className="text-white font-bold">{activeFile.summary.entriesCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                                        <span className="text-slate-500">Équilibre</span>
                                        <span className="text-emerald-400 font-bold">PARFAIT</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Deep Insights */}
                <div className="lg:col-span-2">
                    {status === "results" && activeFile ? (
                        <div className="space-y-6">
                            {/* Financial Check Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-card p-4 rounded-xl border border-slate-700/50 bg-slate-900/30">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Débit</span>
                                        <span className="text-white font-mono font-bold">{activeFile.summary.totalDebit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Crédit</span>
                                        <span className="text-white font-mono font-bold">{activeFile.summary.totalCredit}</span>
                                    </div>
                                </div>
                                <div className="glass-card p-4 rounded-xl border border-slate-700/50 bg-emerald-500/5 border-emerald-500/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-400 uppercase">Écart de Balance</p>
                                        <p className="text-xl font-bold text-white">0.00 FCFA</p>
                                    </div>
                                </div>
                            </div>

                            {/* Anomaly Feed */}
                            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                                <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                                        Points de Vigilance IA
                                    </h3>
                                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold">
                                        {activeFile.summary.anomaliesCount} ALERTES
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-800">
                                    {activeFile.risks.map((risk, i) => (
                                        <div key={i} className="p-5 hover:bg-slate-800/20 transition-all flex gap-4 group">
                                            <div className={cn(
                                                "w-1 h-12 rounded-full",
                                                risk.severity === "high" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                                                    risk.severity === "medium" ? "bg-amber-500" : "bg-blue-500"
                                            )} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors uppercase text-xs tracking-wider">{risk.title}</h4>
                                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{risk.desc}</p>

                                                <div className="flex gap-4 mt-3">
                                                    <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                                                        <ArrowRight className="w-3 h-3" /> VOIR DÉTAIL JOURNAL
                                                    </button>
                                                    <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">
                                                        IGNORER CETTE FOIS
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Analytic Graph Suggestion */}
                            <div className="glass-card rounded-2xl p-6 border border-slate-700/50 bg-gradient-to-r from-slate-900 to-indigo-900/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                                        <PieChart className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Analyse de la Structure de Charge</h4>
                                        <p className="text-xs text-slate-400 mt-1">L'IA a identifié une concentration inhabituelle sur les 'Frais de transport'.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                            <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">En attente de données</h3>
                            <p className="text-sm max-w-xs mx-auto mt-2 italic">
                                Importez une Balance Générale ou un Grand Livre pour lancer l'audit structurel complet par IA.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
