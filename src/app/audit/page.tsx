"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Search,
    FileSearch,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

type AnomalyLevel = "CRITIQUE" | "MOYEN" | "FAIBLE";

interface Anomaly {
    id: string;
    type: string;
    description: string;
    account: string;
    amount: string;
    date: string;
    level: AnomalyLevel;
    confidence: number;
}

const MOCK_ANOMALIES: Anomaly[] = [
    {
        id: "AN-001",
        type: "Doublon Suspect",
        description: "Deux écritures identiques détectées (Montant, Fournisseur, Date proche) à 2 jours d'intervalle.",
        account: "605100 - Transport",
        amount: "45 000 FCFA",
        date: "12/05/2024",
        level: "CRITIQUE",
        confidence: 98
    },
    {
        id: "AN-002",
        type: "TVA Incohérente",
        description: "Le taux de TVA calculé (12%) ne correspond pas au taux standard CI (18%) pour ce type de tiers.",
        account: "445200 - TVA Récupérable",
        amount: "1 200 000 FCFA",
        date: "18/05/2024",
        level: "MOYEN",
        confidence: 85
    },
    {
        id: "AN-003",
        type: "Écriture le Dimanche",
        description: "Saisie comptable effectuée un jour non ouvré (Dimanche) pour une opération de caisse.",
        account: "571100 - Caisse Siège",
        amount: "150 000 FCFA",
        date: "19/05/2024",
        level: "FAIBLE",
        confidence: 60
    },
    {
        id: "AN-004",
        type: "Loi de Benford",
        description: "La distribution des premiers chiffres sur le compte 'Frais de Mission' s'écarte du modèle standard.",
        account: "625100 - Frais Mission",
        amount: "N/A",
        date: "Exercice 2024",
        level: "MOYEN",
        confidence: 72
    }
];

export default function AuditIAPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [anomalies, setAnomalies] = useState<Anomaly[]>(MOCK_ANOMALIES);
    const [selectedFolder, setSelectedFolder] = useState("Société Ivoirienne de Banque");

    const runAnalysis = () => {
        setAnalyzing(true);
        // Simulate processing
        setTimeout(() => {
            setAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-rose-500" />
                        Audit & Conformité IA
                    </h2>
                    <p className="text-slate-400 mt-1">Détection automatique d'anomalies comptables et fraude (FEC Analyzer).</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
                    <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="bg-transparent text-white text-sm font-medium border-none focus:ring-0 cursor-pointer"
                    >
                        <option value="Société Ivoirienne de Banque">Société Ivoirienne de Banque</option>
                        <option value="Traoré Import-Export">Traoré Import-Export</option>
                    </select>
                </div>
            </div>

            {/* Analysis Control Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Launch Card */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-white text-lg mb-2">Lancer un Audit</h3>
                        <p className="text-sm text-slate-400 mb-6">L'IA va analyser l'intégralité du Grand Livre de <strong>{selectedFolder}</strong> à la recherche d'incohérences.</p>

                        <button
                            onClick={runAnalysis}
                            disabled={analyzing}
                            className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 group"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Scanner le dossier
                                </>
                            )}
                        </button>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Global Score */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex items-center gap-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Simple Circular Progress Mock */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-800"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-emerald-500"
                                strokeDasharray="85, 100" // 85% score
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">85<span className="text-sm text-slate-400">%</span></span>
                            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">FIABLE</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Score de Qualité</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Le dossier présente une bonne cohérence globale. <br />
                            <span className="text-rose-400 font-medium">4 anomalies détectées</span> nécessitant votre attention.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-center space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <FileSearch className="w-4 h-4" /> Écritures analysées
                        </div>
                        <span className="font-bold text-white">12 450</span>
                    </div>
                    <div className="w-full h-px bg-slate-800" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <BarChart3 className="w-4 h-4" /> Test de Benford
                        </div>
                        <span className="font-bold text-emerald-400">Conforme</span>
                    </div>
                    <div className="w-full h-px bg-slate-800" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <TrendingUp className="w-4 h-4" /> Risque Fiscal
                        </div>
                        <span className="font-bold text-amber-400">Modéré</span>
                    </div>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Anomalies Détectées
                    </h3>
                    <div className="text-xs text-slate-500">Dernière analyse : Aujourd'hui 14:30</div>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {anomalies.map((anom) => (
                        <div key={anom.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center group">

                            {/* Severity Icon */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                anom.level === "CRITIQUE" ? "bg-rose-500/10 text-rose-500" :
                                    anom.level === "MOYEN" ? "bg-amber-500/10 text-amber-500" :
                                        "bg-blue-500/10 text-blue-500"
                            )}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border",
                                        anom.level === "CRITIQUE" ? "bg-rose-900/30 text-rose-400 border-rose-500/30" :
                                            anom.level === "MOYEN" ? "bg-amber-900/30 text-amber-400 border-amber-500/30" :
                                                "bg-blue-900/30 text-blue-400 border-blue-500/30"
                                    )}>
                                        {anom.level}
                                    </span>
                                    <h4 className="font-bold text-slate-200 text-sm">{anom.type}</h4>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                        IA Confiance: {anom.confidence}%
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">{anom.description}</p>
                            </div>

                            {/* Details */}
                            <div className="flex flex-col items-end gap-1 min-w-[150px]">
                                <span className="font-mono text-white text-sm font-bold bg-slate-800/80 px-2 py-1 rounded">{anom.amount}</span>
                                <span className="text-xs text-slate-500">{anom.account}</span>
                                <span className="text-[10px] text-slate-600">{anom.date}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors">Corriger</button>
                                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors">Ignorer</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
