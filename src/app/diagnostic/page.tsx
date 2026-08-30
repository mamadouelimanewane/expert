"use client";

import { useState, useEffect } from "react";
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
    Shield,
    DollarSign,
    Sparkles,
    FileSpreadsheet,
    Eye,
    BarChart3,
    LineChart,
    Calendar,
    Edit3,
    Save,
    RefreshCw,
    Wand2
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

interface ClientOption {
    id: string;
    name: string;
}

const REPORT_SECTION_KEYS = [
    "executiveSummary",
    "structureAnalysis",
    "performanceAnalysis",
    "complianceAnalysis",
    "treasuryAnalysis",
    "projections",
    "conclusion",
] as const;
type ReportSectionKey = typeof REPORT_SECTION_KEYS[number];

export default function DiagnosticPage() {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [loadingClients, setLoadingClients] = useState(true);

    const [isGenerating, setIsGenerating] = useState(false);
    const [diagnosticVisible, setDiagnosticVisible] = useState(false);
    const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const [showEvolution, setShowEvolution] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [diagData, setDiagData] = useState<{
        globalScore: number,
        sections: DiagnosticSection[],
        years: YearData[]
    } | null>(null);

    const [reportContent, setReportContent] = useState<Record<ReportSectionKey, string>>({
        executiveSummary: "",
        structureAnalysis: "",
        performanceAnalysis: "",
        complianceAnalysis: "",
        treasuryAnalysis: "",
        projections: "",
        conclusion: ""
    });

    useEffect(() => {
        const loadClients = async () => {
            setLoadingClients(true);
            try {
                const res = await fetch("/api/clients");
                const data = await res.json();
                if (data.clients) {
                    const options: ClientOption[] = data.clients.map((c: any) => ({
                        id: c.id,
                        name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client sans nom",
                    }));
                    setClients(options);
                    if (options.length > 0) setSelectedClientId(options[0].id);
                }
            } catch (err) {
                console.error("Failed to load clients", err);
            } finally {
                setLoadingClients(false);
            }
        };
        loadClients();
    }, []);

    const selectedClient = clients.find(c => c.id === selectedClientId) || null;

    const runDiagnostic = async () => {
        if (!selectedClientId) return;
        setIsGenerating(true);
        setDiagnosticVisible(false);
        setDiagnosticError(null);

        try {
            const res = await fetch("/api/diagnostic/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: selectedClientId, clientName: selectedClient?.name })
            });
            const data = await res.json();

            if (data.success && data.diagnostic) {
                setDiagData(data.diagnostic);
                setDiagnosticVisible(true);
            } else {
                setDiagnosticError(data.error || "Erreur lors de la génération du diagnostic.");
            }
        } catch (error) {
            console.error("Diagnostic error:", error);
            setDiagnosticError("Erreur de connexion au service de diagnostic.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateReport = async () => {
        if (!diagData || !selectedClient) return;
        setIsGeneratingReport(true);
        setReportError(null);

        try {
            const res = await fetch("/api/diagnostic/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientName: selectedClient.name, diagnostic: diagData })
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                setReportError(data.error || "Erreur lors de la génération du rapport IA.");
                setIsGeneratingReport(false);
                return;
            }

            setReportContent(data.report);
            setIsGeneratingReport(false);
            setShowReport(true);
        } catch (error) {
            console.error("Report generation error:", error);
            setReportError("Erreur de connexion au service de génération de rapport.");
            setIsGeneratingReport(false);
        }
    };

    const regenerateSection = async () => {
        // Pas d'endpoint de régénération par section : on relance une génération complète du rapport.
        await generateReport();
    };

    const currentSections = diagData?.sections || [];
    const currentYears = diagData?.years || [];
    const globalScoreHealth = diagData?.globalScore ?? 0;
    const sectionAt = (i: number) => currentSections[i];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-rose-400" />
                        Diagnostic IA États Financiers
                    </h2>
                    <p className="page-subtitle">Analyse médicale complète avec évolution pluriannuelle N-1, N, N+1.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        disabled={loadingClients || clients.length === 0}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-1 focus:ring-rose-500 outline-none cursor-pointer disabled:opacity-50"
                    >
                        {loadingClients ? (
                            <option>Chargement des clients...</option>
                        ) : clients.length === 0 ? (
                            <option>Aucun client trouvé</option>
                        ) : (
                            clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        )}
                    </select>
                    <button
                        onClick={runDiagnostic}
                        disabled={isGenerating || !selectedClientId}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        {isGenerating ? "Analyse..." : "Lancer Diagnostic"}
                    </button>
                </div>
            </div>

            {!diagnosticVisible && !isGenerating && !diagnosticError && (
                <div className="h-96 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-3xl p-4 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-900/50 to-rose-900/5">
                    <div className="relative mb-6">
                        <Stethoscope className="w-20 h-20 text-slate-700 opacity-20" />
                        <Brain className="w-10 h-10 text-rose-500 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Prêt pour le Check-up Financier ?</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Sélectionnez un client puis lancez le diagnostic pour analyser ses données financières réelles (balances, SIG) et générer un scoring avec analyse pluriannuelle.
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
                        <h3 className="text-xl font-bold text-white">Analyse des données financières en cours...</h3>
                        <p className="text-slate-500 text-sm mt-2 italic">Calcul des ratios OHADA et détection des zones de risques à partir des données réelles du client.</p>
                    </div>
                </div>
            )}

            {!isGenerating && diagnosticError && (
                <div className="h-96 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-amber-900/40 rounded-3xl bg-amber-950/10">
                    <AlertTriangle className="w-12 h-12 text-amber-500" />
                    <p className="text-slate-300 max-w-md">{diagnosticError}</p>
                    <button
                        onClick={runDiagnostic}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Réessayer
                    </button>
                </div>
            )}

            {diagnosticVisible && diagData && (
                <div className="space-y-6 pb-12">
                    {/* Global Score Dashboard */}
                    <div className="glass-card rounded-2xl p-8 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-primary/10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Score Global de Santé</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl sm:text-3xl lg:text-5xl font-black text-white">{globalScoreHealth}</span>
                                    <span className="text-2xl text-slate-500">/100</span>
                                </div>
                            </div>
                                <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center border-4",
                                globalScoreHealth >= 75 ? "border-emerald-500 bg-emerald-500/10" :
                                    globalScoreHealth >= 50 ? "border-amber-500 bg-amber-500/10" :
                                        "border-rose-500 bg-rose-500/10"
                            )}>
                                <Activity className={cn(
                                    "w-12 h-12",
                                    globalScoreHealth >= 75 ? "text-emerald-500" :
                                        globalScoreHealth >= 50 ? "text-amber-500" :
                                            "text-rose-500"
                                )} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickMetric icon={Shield} label="Solvabilité" value={sectionAt(0) ? `${sectionAt(0).score}%` : "—"} status={sectionAt(0)?.status} />
                            <QuickMetric icon={TrendingUp} label="Performance" value={sectionAt(1) ? `${sectionAt(1).score}%` : "—"} status={sectionAt(1)?.status} />
                            <QuickMetric icon={AlertTriangle} label="Conformité" value={sectionAt(2) ? `${sectionAt(2).score}%` : "—"} status={sectionAt(2)?.status} />
                            <QuickMetric icon={DollarSign} label="Trésorerie" value={sectionAt(3) ? `${sectionAt(3).score}%` : "—"} status={sectionAt(3)?.status} />
                        </div>
                    </div>

                    {/* Evolution Pluriannuelle */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div
                            className="p-5 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                            onClick={() => setShowEvolution(!showEvolution)}
                        >
                            <h3 className="font-bold text-white flex items-center gap-3">
                                <LineChart className="w-5 h-5 text-primary" />
                                Évolution Pluriannuelle
                            </h3>
                            <Eye className={cn("w-5 h-5 text-slate-500 transition-transform", showEvolution ? "rotate-180" : "")} />
                        </div>

                        {showEvolution && (
                            currentYears.length === 0 ? (
                                <p className="p-6 text-center text-xs text-slate-500">Aucune donnée financière pluriannuelle disponible pour ce client.</p>
                            ) : (
                            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {currentYears.map((year, i) => (
                                        <div key={i} className={cn(
                                            "p-4 rounded-xl border",
                                            i === currentYears.length - 1 ? "bg-primary/10 border-primary/30" : "bg-slate-800/30 border-slate-700/30"
                                        )}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs font-bold text-slate-400 uppercase">{year.year}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <MetricRow label="CA" value={year.ca.toLocaleString("fr-FR")} />
                                                <MetricRow label="Résultat Net" value={year.resultatNet.toLocaleString("fr-FR")} />
                                                <MetricRow label="Fonds Propres" value={`${year.fondsPropresPct}%`} />
                                                <MetricRow label="BFR (jours)" value={year.bfr.toString()} />
                                                <MetricRow label="Trésorerie" value={year.tresorerie.toLocaleString("fr-FR")} />
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
                                        {currentYears.map((year, i) => {
                                            const maxCa = Math.max(...currentYears.map(y => y.ca), 1);
                                            const maxResult = Math.max(...currentYears.map(y => Math.abs(y.resultatNet)), 1);
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="w-full flex flex-col gap-1">
                                                        <div
                                                            className="w-full bg-primary rounded-t transition-all hover:brightness-110"
                                                            style={{ height: `${Math.max(4, (year.ca / maxCa) * 100)}px` }}
                                                        />
                                                        <div
                                                            className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                                                            style={{ height: `${Math.max(4, (Math.abs(year.resultatNet) / maxResult) * 100)}px` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold">{year.year}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-primary rounded" />
                                            <span className="text-slate-400">CA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded" />
                                            <span className="text-slate-400">Résultat Net</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        )}
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-4">
                        {currentSections.map((section, idx) => (
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
                                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3" /> Évolution Comparative
                                                    </h4>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="apix-table w-full text-sm">
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
                                                                        <td className="p-3 text-right text-primary font-mono">{evo.n1Proj}</td>
                                                                    )}
                                                                    <td className={cn(
                                                                        "p-3 text-right font-bold font-mono",
                                                                        evo.variation.includes("+") ? "text-emerald-400" :
                                                                            evo.variation.includes("-") ? "text-rose-400" :
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {section.metrics.map((m, i) => (
                                                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-white">{m.value}</span>
                                                            {m.trend && (
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    m.trend.includes("+") ? "text-emerald-400" : "text-rose-400"
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
                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Lightbulb className="w-3 h-3 fill-current" /> Recommandations
                                                </h4>
                                                <ul className="space-y-3">
                                                    {section.recommendations.map((r, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex gap-2 font-medium">
                                                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
                        <button
                            onClick={generateReport}
                            disabled={isGeneratingReport}
                            className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-primary/50 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingReport ? (
                                <RefreshCw className="w-8 h-8 text-primary mb-3 animate-spin" />
                            ) : (
                                <Wand2 className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            )}
                            <h4 className="font-bold text-white mb-1">
                                {isGeneratingReport ? "Génération IA..." : "Générer Rapport Narratif IA"}
                            </h4>
                            <p className="text-xs text-slate-500">Rapport narratif rédigé par IA à partir des données ci-dessus (éditable)</p>
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
                    {reportError && (
                        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-400">{reportError}</p>
                        </div>
                    )}
                </div>
            )}

            {/* PREMIUM AI REPORT MODAL - EDITABLE */}
            {showReport && diagData && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 print:static print:bg-white print:p-0 print:block">
                    <div className="w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden print:h-auto print:max-w-none print:rounded-none print:shadow-none print:block">
                        {/* Sidebar - Table of Contents */}
                        <div className="w-64 bg-slate-900 p-6 flex flex-col border-r border-slate-700 print:hidden">
                            <div className="mb-6">
                                <h3 className="text-white font-bold text-sm mb-2">TABLE DES MATIÈRES</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className={cn(
                                            "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                                            editMode ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        {editMode ? <><Save className="w-3 h-3" /> Mode Édition</> : <><Edit3 className="w-3 h-3" /> Lecture</>}
                                    </button>
                                </div>
                            </div>

                            <nav className="space-y-2 flex-1 overflow-y-auto">
                                <TOCItem number="I" title="Synthèse Exécutive" />
                                <TOCItem number="II" title="Analyse Détaillée" />
                                <TOCItem number="II.A" title="Structure Financière" indent />
                                <TOCItem number="II.B" title="Performance" indent />
                                <TOCItem number="II.C" title="Conformité" indent />
                                <TOCItem number="II.D" title="Trésorerie" indent />
                                <TOCItem number="III" title="Projections" />
                                <TOCItem number="IV" title="Conclusion" />
                            </nav>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <p className="text-xs text-slate-500 mb-2">Généré par</p>
                                <p className="text-white font-bold text-sm">Cabinet 360 — Assistant IA (DeepSeek)</p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col print:block">
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-primary to-primary text-white flex justify-between items-center print:hidden">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">RAPPORT DE DIAGNOSTIC FINANCIER</h2>
                                    <p className="text-sm text-primary-foreground/70 mt-1">Généré par intelligence artificielle - {new Date().toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Report Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 bg-white text-slate-900 print:overflow-visible print:p-0 print:block">
                                <div className="max-w-4xl mx-auto space-y-10">
                                    {/* Metadata */}
                                    <div className="flex justify-between items-start pb-6 border-b-2 border-slate-200">
                                        <div>
                                            <p className="text-sm text-slate-600 uppercase tracking-widest font-bold mb-1">Client</p>
                                            <p className="text-xl font-bold">{selectedClient?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600 uppercase tracking-widest font-bold mb-1">Période</p>
                                            <p className="text-xl font-bold">{currentYears[0]?.year} — {currentYears[currentYears.length - 1]?.year}</p>
                                        </div>
                                    </div>

                                    {/* I. Executive Summary */}
                                    <EditableSection
                                        title="I. SYNTHÈSE EXÉCUTIVE"
                                        content={reportContent.executiveSummary}
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, executiveSummary: value }))}
                                        onRegenerate={regenerateSection}
                                    />

                                    {/* II. Detailed Analysis */}
                                    <section>
                                        <h3 className="text-2xl font-black text-slate-900 mb-6 pb-3 border-b-2 border-slate-300">
                                            II. ANALYSE DÉTAILLÉE PAR AXE
                                        </h3>

                                        <EditableSection
                                            title={`A. Structure Financière & Solvabilité (${sectionAt(0)?.score ?? "—"}/100)`}
                                            content={reportContent.structureAnalysis}
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, structureAnalysis: value }))}
                                            onRegenerate={regenerateSection}
                                            statusColor="emerald"
                                        />

                                        <EditableSection
                                            title={`B. Performance Opérationnelle (${sectionAt(1)?.score ?? "—"}/100)`}
                                            content={reportContent.performanceAnalysis}
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, performanceAnalysis: value }))}
                                            onRegenerate={regenerateSection}
                                            statusColor="amber"
                                        />

                                        <EditableSection
                                            title={`C. Conformité Fiscale & Sociale (${sectionAt(2)?.score ?? "—"}/100)`}
                                            content={reportContent.complianceAnalysis}
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, complianceAnalysis: value }))}
                                            onRegenerate={regenerateSection}
                                            statusColor="rose"
                                        />

                                        <EditableSection
                                            title={`D. Trésorerie & BFR (${sectionAt(3)?.score ?? "—"}/100)`}
                                            content={reportContent.treasuryAnalysis}
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, treasuryAnalysis: value }))}
                                            onRegenerate={regenerateSection}
                                            statusColor="amber"
                                        />
                                    </section>

                                    {/* III. Projections */}
                                    <EditableSection
                                        title="III. PROJECTIONS ET PERSPECTIVES"
                                        content={reportContent.projections}
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, projections: value }))}
                                        onRegenerate={regenerateSection}
                                    />

                                    {/* IV. Conclusion */}
                                    <EditableSection
                                        title="IV. CONCLUSION ET PLAN D'ACTION"
                                        content={reportContent.conclusion}
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, conclusion: value }))}
                                        onRegenerate={regenerateSection}
                                    />

                                    {/* Signature */}
                                    <div className="mt-12 pt-8 border-t-2 border-slate-200 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">Généré par</p>
                                            <p className="text-lg font-bold">Cabinet 360 — Assistant IA (DeepSeek)</p>
                                            <p className="text-sm text-slate-500 italic">À valider par un Expert-Comptable avant diffusion</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">Signature Électronique</p>
                                            <div className="w-40 h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                                                <Shield className="w-10 h-10 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center print:hidden">
                                <p className="text-xs text-slate-600 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    Rapport généré par intelligence artificielle (DeepSeek) — à relire avant diffusion
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                                        Imprimer
                                    </button>
                                    <button onClick={() => window.print()} className="px-6 py-2 bg-primary hover:brightness-110 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Télécharger PDF
                                    </button>
                                </div>
                            </div>
                        </div>
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
                            status === "critique" ? "text-rose-500" : "text-slate-500"
                )} />
                <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn(
                "text-2xl font-bold",
                status === "excellent" ? "text-emerald-400" :
                    status === "correct" ? "text-amber-400" :
                        status === "critique" ? "text-rose-400" : "text-slate-400"
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

function TOCItem({ number, title, indent = false }: { number: string; title: string; indent?: boolean }) {
    return (
        <a
            href={`#${number}`}
            className={cn(
                "block px-3 py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors",
                indent ? "pl-6 text-slate-400" : "text-slate-300 font-bold"
            )}
        >
            <span className="text-primary mr-2">{number}</span>
            {title}
        </a>
    );
}

function EditableSection({ title, content, editMode, onChange, onRegenerate, statusColor }: {
    title: string;
    content: string;
    editMode: boolean;
    onChange: (value: string) => void;
    onRegenerate: () => void;
    statusColor?: "emerald" | "amber" | "rose";
}) {
    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h4 className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    statusColor === "emerald" ? "text-emerald-700" :
                        statusColor === "amber" ? "text-amber-700" :
                            statusColor === "rose" ? "text-rose-700" :
                                "text-slate-900"
                )}>
                    {statusColor && (
                        <div className={cn(
                            "w-2 h-6 rounded",
                            statusColor === "emerald" ? "bg-emerald-500" :
                                statusColor === "amber" ? "bg-amber-500" :
                                    "bg-rose-500"
                        )} />
                    )}
                    {title}
                </h4>
                {editMode && (
                    <button
                        onClick={onRegenerate}
                        className="px-3 py-1 bg-primary hover:brightness-110 text-primary rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Régénérer
                    </button>
                )}
            </div>
            {editMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[200px] p-4 border-2 border-primary rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary bg-primary/50"
                />
            ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
                    {content}
                </div>
            )}
        </section>
    );
}
