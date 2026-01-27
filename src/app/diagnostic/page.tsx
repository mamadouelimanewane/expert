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
    Activity,
    Brain,
    Target,
    Shield,
    DollarSign,
    Users,
    TrendingDown,
    Sparkles,
    FileSpreadsheet,
    Eye,
    BarChart3,
    LineChart,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface YearData {
    year: string;
    ca: number;
    resultatNet: number;
    fondsPropresPct: number;
    bfr: number;
    tresorerie: number;
}

interface DiagnosticSection {
    title: string;
    score: number;
    status: "excellent" | "correct" | "critique";
    findings: string[];
    recommendations: string[];
    metrics?: { label: string; value: string; trend?: string }[];
    evolution?: { label: string; n1: string; n: string; n1Proj?: string; variation: string }[];
}

const MOCK_YEARS: YearData[] = [
    { year: "N-1 (2023)", ca: 450, resultatNet: 35, fondsPropresPct: 42, bfr: 38, tresorerie: 27 },
    { year: "N (2024)", ca: 520, resultatNet: 42, fondsPropresPct: 45, bfr: 45, tresorerie: 22 },
    { year: "N+1 (2025 Proj.)", ca: 595, resultatNet: 51, fondsPropresPct: 48, bfr: 42, tresorerie: 28 }
];

const MOCK_DIAGNOSTIC: DiagnosticSection[] = [
    {
        title: "Structure Financière & Solvabilité",
        score: 85,
        status: "excellent",
        findings: [
            "Fonds propres solides représentant 45% du total bilan.",
            "Capacité d'autofinancement en progression de 12%.",
            "Ratio d'endettement maîtrisé à 0.35 (Norme OHADA: < 0.5)."
        ],
        recommendations: [
            "Envisager un investissement de croissance via levier bancaire modéré.",
            "Optimiser la gestion des excédents de trésorerie (placement court terme)."
        ],
        metrics: [
            { label: "Ratio d'Autonomie Financière", value: "45%", trend: "+3%" },
            { label: "CAF / CA", value: "12.5%", trend: "+1.2%" }
        ],
        evolution: [
            { label: "Fonds Propres / Total Bilan", n1: "42%", n: "45%", n1Proj: "48%", variation: "+6 pts" },
            { label: "Ratio d'Endettement", n1: "0.42", n: "0.35", n1Proj: "0.30", variation: "-0.12" }
        ]
    },
    {
        title: "Performance Opérationnelle (SIG)",
        score: 62,
        status: "correct",
        findings: [
            "Marge commerciale stable à 35% (Norme secteur : 38%).",
            "Charges de personnel en augmentation de 15% sans hausse corrélée du CA.",
            "EBE en baisse de 8% sur l'exercice."
        ],
        recommendations: [
            "Mettre en place un audit de productivité RH.",
            "Renégocier les contrats de sous-traitance pour améliorer la marge.",
            "Analyser la structure de coûts fixes vs variables."
        ],
        metrics: [
            { label: "Marge Commerciale", value: "35%", trend: "stable" },
            { label: "EBE / CA", value: "18%", trend: "-8%" }
        ],
        evolution: [
            { label: "Chiffre d'Affaires (M FCFA)", n1: "450", n: "520", n1Proj: "595", variation: "+32%" },
            { label: "Résultat Net (M FCFA)", n1: "35", n: "42", n1Proj: "51", variation: "+46%" },
            { label: "Marge Nette", n1: "7.8%", n: "8.1%", n1Proj: "8.6%", variation: "+0.8 pts" }
        ]
    },
    {
        title: "Conformité Fiscale & Sociale",
        score: 45,
        status: "critique",
        findings: [
            "Incohérence détectée entre la TVA déclarée et le CA comptabilisé (Écart 5M FCFA).",
            "Retards récurrents de paiement des cotisations sociales (CNPS).",
            "Absence de justificatifs pour 12% des charges déductibles."
        ],
        recommendations: [
            "Procéder à un cadrage de TVA immédiat pour corriger les déclarations.",
            "Mettre en place un calendrier de paiement automatisé pour éviter les pénalités.",
            "Constituer un dossier de justification exhaustif avant contrôle fiscal."
        ],
        metrics: [
            { label: "Risque Fiscal Estimé", value: "8.5M FCFA", trend: "critique" },
            { label: "Taux de Conformité", value: "45%", trend: "-12%" }
        ],
        evolution: [
            { label: "Taux de Conformité", n1: "57%", n: "45%", variation: "-12 pts" },
            { label: "Pénalités & Amendes (M FCFA)", n1: "1.2", n: "3.5", variation: "+192%" }
        ]
    },
    {
        title: "Trésorerie & BFR",
        score: 72,
        status: "correct",
        findings: [
            "BFR en hausse de 25% (ralentissement des encaissements clients).",
            "Délai moyen de paiement clients: 75 jours (Norme: 60j).",
            "Trésorerie nette positive mais en baisse de 18%."
        ],
        recommendations: [
            "Mettre en place une politique de relance clients plus agressive.",
            "Négocier des délais fournisseurs plus longs.",
            "Envisager l'affacturage pour les créances > 60 jours."
        ],
        metrics: [
            { label: "BFR (jours CA)", value: "45j", trend: "+10j" },
            { label: "Trésorerie Nette", value: "22M FCFA", trend: "-18%" }
        ],
        evolution: [
            { label: "BFR (jours CA)", n1: "38j", n: "45j", n1Proj: "42j", variation: "+7j" },
            { label: "Trésorerie Nette (M FCFA)", n1: "27", n: "22", n1Proj: "28", variation: "-19%" },
            { label: "Délai Clients (jours)", n1: "68", n: "75", n1Proj: "65", variation: "+7j" }
        ]
    }
];

export default function DiagnosticPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [diagnosticVisible, setDiagnosticVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const [showEvolution, setShowEvolution] = useState(false);

    const runDiagnostic = () => {
        setIsGenerating(true);
        setDiagnosticVisible(false);
        setTimeout(() => {
            setIsGenerating(false);
            setDiagnosticVisible(true);
        }, 3500);
    };

    const globalScore = Math.round(MOCK_DIAGNOSTIC.reduce((acc, s) => acc + s.score, 0) / MOCK_DIAGNOSTIC.length);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-rose-400" />
                        Diagnostic IA États Financiers
                    </h2>
                    <p className="text-slate-400 mt-1">Analyse médicale complète avec évolution pluriannuelle N-1, N, N+1.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-1 focus:ring-rose-500 outline-none cursor-pointer"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                        <option>SOGECOM SA</option>
                    </select>
                    <button
                        onClick={runDiagnostic}
                        disabled={isGenerating}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        {isGenerating ? "Analyse..." : "Lancer Diagnostic"}
                    </button>
                </div>
            </div>

            {!diagnosticVisible && !isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-3xl p-12 bg-gradient-to-br from-slate-900/50 to-rose-900/5">
                    <div className="relative mb-6">
                        <Stethoscope className="w-20 h-20 text-slate-700 opacity-20" />
                        <Brain className="w-10 h-10 text-rose-500 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Prêt pour le Check-up Financier ?</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        L'IA va scanner l'intégralité du grand livre, de la balance et des journaux pour générer un rapport de diagnostic complet avec scoring prédictif et analyse pluriannuelle.
                    </p>
                </div>
            )}

            {isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-rose-500 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Génération du rapport en cours...</h3>
                        <p className="text-slate-500 text-sm mt-2 italic">Analyse des flux, calcul des ratios OHADA et détection des zones de risques.</p>
                        <div className="mt-4 space-y-2 text-xs text-slate-600 font-mono">
                            <p className="animate-pulse">→ Scan du Grand Livre (2,450 écritures)...</p>
                            <p className="animate-pulse delay-100">→ Calcul des SIG et ratios de structure...</p>
                            <p className="animate-pulse delay-200">→ Analyse croisée N-1, N, N+1...</p>
                            <p className="animate-pulse delay-300">→ Détection d'anomalies par ML...</p>
                        </div>
                    </div>
                </div>
            )}

            {diagnosticVisible && (
                <div className="space-y-6 pb-12">
                    {/* Global Score Dashboard */}
                    <div className="glass-card rounded-2xl p-8 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-indigo-900/10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Score Global de Santé</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-white">{globalScore}</span>
                                    <span className="text-2xl text-slate-500">/100</span>
                                </div>
                            </div>
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center border-4",
                                globalScore >= 75 ? "border-emerald-500 bg-emerald-500/10" :
                                    globalScore >= 50 ? "border-amber-500 bg-amber-500/10" :
                                        "border-rose-500 bg-rose-500/10"
                            )}>
                                <Activity className={cn(
                                    "w-12 h-12",
                                    globalScore >= 75 ? "text-emerald-500" :
                                        globalScore >= 50 ? "text-amber-500" :
                                            "text-rose-500"
                                )} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <QuickMetric icon={Shield} label="Solvabilité" value="85%" status="excellent" />
                            <QuickMetric icon={TrendingUp} label="Performance" value="62%" status="correct" />
                            <QuickMetric icon={AlertTriangle} label="Conformité" value="45%" status="critique" />
                            <QuickMetric icon={DollarSign} label="Trésorerie" value="72%" status="correct" />
                        </div>
                    </div>

                    {/* Evolution Pluriannuelle */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div
                            className="p-5 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                            onClick={() => setShowEvolution(!showEvolution)}
                        >
                            <h3 className="font-bold text-white flex items-center gap-3">
                                <LineChart className="w-5 h-5 text-indigo-400" />
                                Évolution Pluriannuelle (N-1, N, N+1)
                            </h3>
                            <Eye className={cn("w-5 h-5 text-slate-500 transition-transform", showEvolution ? "rotate-180" : "")} />
                        </div>

                        {showEvolution && (
                            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="grid grid-cols-3 gap-4">
                                    {MOCK_YEARS.map((year, i) => (
                                        <div key={i} className={cn(
                                            "p-4 rounded-xl border",
                                            i === 1 ? "bg-indigo-500/10 border-indigo-500/30" : "bg-slate-800/30 border-slate-700/30"
                                        )}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs font-bold text-slate-400 uppercase">{year.year}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <MetricRow label="CA (M FCFA)" value={year.ca.toString()} />
                                                <MetricRow label="Résultat Net (M)" value={year.resultatNet.toString()} />
                                                <MetricRow label="Fonds Propres" value={`${year.fondsPropresPct}%`} />
                                                <MetricRow label="BFR (jours)" value={year.bfr.toString()} />
                                                <MetricRow label="Trésorerie (M)" value={year.tresorerie.toString()} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Visual Trend */}
                                <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                    <h4 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" /> Tendance CA & Résultat Net
                                    </h4>
                                    <div className="flex items-end justify-between gap-4 h-32">
                                        {MOCK_YEARS.map((year, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-full flex flex-col gap-1">
                                                    <div
                                                        className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-400"
                                                        style={{ height: `${(year.ca / 600) * 100}px` }}
                                                    />
                                                    <div
                                                        className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                                                        style={{ height: `${(year.resultatNet / 60) * 100}px` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold">{year.year.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-indigo-500 rounded" />
                                            <span className="text-slate-400">CA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded" />
                                            <span className="text-slate-400">Résultat Net</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-4">
                        {MOCK_DIAGNOSTIC.map((section, idx) => (
                            <div key={idx} className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden group">
                                <div
                                    className="p-5 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                                    onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                                >
                                    <h3 className="font-bold text-white flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-6 rounded-full shadow-lg",
                                            section.status === "excellent" ? "bg-emerald-500 shadow-emerald-500/50" :
                                                section.status === "correct" ? "bg-amber-500 shadow-amber-500/50" :
                                                    "bg-rose-500 shadow-rose-500/50"
                                        )} />
                                        {section.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-400">Score: <span className={cn(
                                            section.status === "excellent" ? "text-emerald-400" :
                                                section.status === "correct" ? "text-amber-400" : "text-rose-400"
                                        )}>{section.score}%</span></span>
                                        <Eye className={cn("w-5 h-5 text-slate-500 transition-transform", expandedSection === idx ? "rotate-180" : "")} />
                                    </div>
                                </div>

                                {expandedSection === idx && (
                                    <div className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                        {/* Evolution Table */}
                                        {section.evolution && (
                                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden">
                                                <div className="p-3 bg-slate-900/50 border-b border-slate-700/30">
                                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3" /> Évolution Comparative
                                                    </h4>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-slate-700/30">
                                                                <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Indicateur</th>
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N-1</th>
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N</th>
                                                                {section.evolution.some(e => e.n1Proj) && (
                                                                    <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N+1 (Proj.)</th>
                                                                )}
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">Variation</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.evolution.map((evo, i) => (
                                                                <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                                                                    <td className="p-3 text-slate-300 font-medium">{evo.label}</td>
                                                                    <td className="p-3 text-right text-slate-400 font-mono">{evo.n1}</td>
                                                                    <td className="p-3 text-right text-white font-mono font-bold">{evo.n}</td>
                                                                    {evo.n1Proj && (
                                                                        <td className="p-3 text-right text-indigo-400 font-mono">{evo.n1Proj}</td>
                                                                    )}
                                                                    <td className={cn(
                                                                        "p-3 text-right font-bold font-mono",
                                                                        evo.variation.includes("+") && !evo.variation.includes("Pénalités") ? "text-emerald-400" :
                                                                            evo.variation.includes("-") || evo.variation.includes("critique") ? "text-rose-400" :
                                                                                "text-slate-400"
                                                                    )}>{evo.variation}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metrics */}
                                        {section.metrics && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {section.metrics.map((m, i) => (
                                                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-white">{m.value}</span>
                                                            {m.trend && (
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    m.trend.includes("+") ? "text-emerald-400" :
                                                                        m.trend === "stable" ? "text-slate-400" :
                                                                            m.trend === "critique" ? "text-rose-400" :
                                                                                "text-rose-400"
                                                                )}>{m.trend}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                            {/* Recommendations */}
                                            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Lightbulb className="w-3 h-3 fill-current" /> Recommandations IA
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
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group text-left">
                            <Download className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-white mb-1">Télécharger Rapport PDF</h4>
                            <p className="text-xs text-slate-500">Format professionnel avec branding</p>
                        </button>
                        <button className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group text-left">
                            <Share className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-white mb-1">Envoyer sur Portail Client</h4>
                            <p className="text-xs text-slate-500">Accès sécurisé en ligne</p>
                        </button>
                        <button className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-rose-500/50 transition-all group text-left">
                            <FileSpreadsheet className="w-8 h-8 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-white mb-1">Exporter Données Brutes</h4>
                            <p className="text-xs text-slate-500">Excel avec tous les calculs</p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickMetric({ icon: Icon, label, value, status }: any) {
    return (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn(
                    "w-4 h-4",
                    status === "excellent" ? "text-emerald-500" :
                        status === "correct" ? "text-amber-500" :
                            "text-rose-500"
                )} />
                <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn(
                "text-2xl font-bold",
                status === "excellent" ? "text-emerald-400" :
                    status === "correct" ? "text-amber-400" :
                        "text-rose-400"
            )}>{value}</p>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{label}</span>
            <span className="text-white font-bold font-mono">{value}</span>
        </div>
    );
}
