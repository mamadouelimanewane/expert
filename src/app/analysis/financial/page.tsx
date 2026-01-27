"use client";

import { useState } from "react";
import {
    FilePieChart,
    TrendingUp,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    FileText,
    Download,
    BarChart,
    PieChart,
    Activity,
    Search,
    ChevronRight,
    Target,
    Wand2,
    Loader2,
    LineChart as LineChartIcon,
    Layers,
    BarChart3,
    Divide,
    Droplets,
    Scale,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialRatio {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
    status: "good" | "warning" | "critical";
    desc: string;
}

const MOCK_RATIOS: FinancialRatio[] = [
    { label: "Liquidité Générale", value: "1.45", trend: "up", status: "good", desc: "Capacité à couvrir les dettes à court terme." },
    { label: "Autonomie Financière", value: "42%", trend: "stable", status: "good", desc: "Part des capitaux propres dans le financement permanent." },
    { label: "Rentabilité Nette", value: "8.2%", trend: "up", status: "good", desc: "Marge bénéficiaire sur le chiffre d'affaires." },
    { label: "Délai Rotation Stocks", value: "52j", trend: "down", status: "warning", desc: "Durée moyenne de stockage des marchandises." },
];

export default function FinancialAnalysisPage() {
    const [activeTab, setActiveTab] = useState<"bilan" | "cashflow" | "advanced" | "rapport">("bilan");
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportContent, setReportContent] = useState("");

    const generateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setReportContent(`RAPPORT D'ANALYSE FINANCIÈRE APPROFONDIE (MODÈLE IA)

DOSSIER : [NOM_CLIENT]
EXERCICE : 2023-2024

1. OPINION SUR L'ÉQUILIBRE FINANCIER
La structure financière est jugée SOLIDE. Le Fonds de Roulement Net Global (FRNG) de 5M FCFA permet de couvrir l'intégralité des investissements et de dégager un excédent de ressources stables. 
Ratio d'autonomie financière : 42% (Conforme aux standards du secteur OHADA).

2. PERFORMANCE OPÉRATIONNELLE (SIG)
Le taux de Valeur Ajoutée (42%) témoigne d'une bonne maîtrise des consommations intermédiaires. 
Cependant, l'Excédent Brut d'Exploitation (EBE/CA : 15%) est en légère contraction, suggérant une augmentation des charges de personnel (+12%) qui pèse sur la rentabilité opérationnelle.

3. ANALYSE DU BFR & TRÉSORERIE
La trésorerie nette est positive (+5M), mais l'IA détecte un signal d'alerte sur la rotation des stocks (52 jours contre 44 jours l'an dernier). 
Recommandation : Auditer le cycle achat et optimiser les niveaux de stock pour libérer 2.5M FCFA de liquidités supplémentaires.

4. CONCLUSION & PERSPECTIVE
L'entreprise dispose d'une bonne capacité de résilience. Une optimisation opérationnelle des charges fixes permettrait d'atteindre un score de santé de 90/100.`);
            setIsGenerating(false);
            setActiveTab("rapport");
        }, 3000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FilePieChart className="w-8 h-8 text-purple-400" />
                        Analyse Financière Avancée
                    </h2>
                    <p className="text-slate-400 mt-1">Diagnostic 360° : Bilan, Cash Flow, et Modélisation DuPont.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={generateReport}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all"
                    >
                        <Wand2 className="w-4 h-4" /> {isGenerating ? "Analyse Multi-États..." : "Générer Rapport Financier"}
                    </button>
                </div>
            </div>

            {/* KPI Overlays - Sticky Top Context */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {MOCK_RATIOS.map((ratio, i) => (
                    <div key={i} className="glass-card p-5 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ratio.label}</span>
                            <div className={cn(
                                "p-1 rounded-md",
                                ratio.status === "good" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                                {ratio.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">{ratio.value}</div>
                        <p className="text-[10px] text-slate-500 leading-tight">{ratio.desc}</p>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit">
                <button onClick={() => setActiveTab("bilan")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "bilan" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <Layers className="w-3 h-3 inline mr-2" /> Structure Bilan
                </button>
                <button onClick={() => setActiveTab("cashflow")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "cashflow" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <Droplets className="w-3 h-3 inline mr-2" /> Cash Flow Waterfall
                </button>
                <button onClick={() => setActiveTab("advanced")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "advanced" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <Divide className="w-3 h-3 inline mr-2" /> DuPont & Altman
                </button>
                <button onClick={() => setActiveTab("rapport")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "rapport" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                    <FileText className="w-3 h-3 inline mr-2" /> Rapport IA
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[500px]">

                {/* === TAB 1: BILAN (Existing but Refined) === */}
                {activeTab === "bilan" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 glass-card rounded-[40px] p-10 border border-slate-700/50 bg-slate-900/40">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="font-bold text-white text-lg flex items-center gap-3">Visualisation Actif / Passif</h3>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-white/5">ÉQUILIBRE FINANCIER</span>
                            </div>

                            <div className="grid grid-cols-2 gap-16 h-80">
                                {/* ACTIF */}
                                <div className="flex flex-col h-full border-l-4 border-indigo-500/20 pl-6 relative">
                                    <div className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-500 rounded-full border-4 border-slate-900" />
                                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Emplois (Actif)</h4>

                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex-grow-[6] bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-center relative group hover:bg-indigo-500/30 transition-all">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase">Actif Immobilisé</span>
                                            <span className="text-2xl font-black text-white">45.0M</span>
                                        </div>
                                        <div className="flex-grow-[3] bg-indigo-400/10 border border-indigo-400/20 rounded-xl p-3 flex flex-col justify-center relative group hover:bg-indigo-400/20 transition-all">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase">Actif Circulant</span>
                                            <span className="text-lg font-black text-white">25.0M</span>
                                        </div>
                                        <div className="flex-grow-[1] bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 flex flex-col justify-center relative group hover:bg-emerald-500/20 transition-all">
                                            <span className="text-[10px] font-black text-emerald-400 uppercase">Tréso.</span>
                                            <span className="text-sm font-black text-white">5.0M</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PASSIF */}
                                <div className="flex flex-col h-full border-r-4 border-purple-500/20 pr-6 relative items-end">
                                    <div className="absolute -right-[11px] top-0 w-5 h-5 bg-purple-500 rounded-full border-4 border-slate-900" />
                                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4">Ressources (Passif)</h4>

                                    <div className="flex-1 flex flex-col gap-2 w-full">
                                        <div className="flex-grow-[4] bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-center items-end relative group hover:bg-purple-500/30 transition-all">
                                            <span className="text-[10px] font-black text-purple-300 uppercase">Capitaux Propres</span>
                                            <span className="text-2xl font-black text-white">32.0M</span>
                                        </div>
                                        <div className="flex-grow-[2] bg-purple-400/10 border border-purple-400/20 rounded-xl p-3 flex flex-col justify-center items-end relative group hover:bg-purple-400/20 transition-all">
                                            <span className="text-[10px] font-black text-purple-400 uppercase">Dettes LMT</span>
                                            <span className="text-lg font-black text-white">18.0M</span>
                                        </div>
                                        <div className="flex-grow-[4] bg-slate-700/30 border border-slate-600/30 rounded-xl p-3 flex flex-col justify-center items-end relative group hover:bg-slate-700/40 transition-all">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Dettes CT</span>
                                            <span className="text-lg font-black text-white">25.0M</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-card p-8 rounded-[40px] border border-purple-500/20 bg-gradient-to-br from-slate-900 to-purple-900/20 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
                                <h3 className="text-4xl font-black text-white mb-2">82/100</h3>
                                <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6">Score Santé Financière</p>
                                <div className="space-y-3 text-left">
                                    <ScoreRow label="Solvabilité" score={90} />
                                    <ScoreRow label="Rentabilité" score={75} />
                                    <ScoreRow label="Liquidité" score={80} />
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/40">
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase mb-4">
                                    <Target className="w-4 h-4 text-emerald-400" /> Recommandations
                                </h4>
                                <ul className="space-y-3">
                                    <li className="text-xs text-slate-300 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        Excellente couverture des emplois stables par ressources stables.
                                    </li>
                                    <li className="text-xs text-slate-300 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        Attention à la rotation des stocks qui dégrade la trésorerie.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 2: CASH FLOW WATERFALL === */}
                {activeTab === "cashflow" && (
                    <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Tableau des Flux de Trésorerie (TFT)</h3>
                                <p className="text-sm text-slate-500">Visualisation en cascade de la variation de trésorerie sur l'exercice.</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-mono text-emerald-400 border border-emerald-500/20">
                                Net Change: +12.5M
                            </div>
                        </div>

                        <div className="flex items-end justify-between h-[400px] gap-2 px-4 border-b border-white/5 pb-4">
                            {/* Opening Balance */}
                            <WaterfallBar label="Tréso. Ouverture" value={25} total={40} type="neutral" start={0} />

                            {/* Operating Activities */}
                            <WaterfallBar label="EBE" value={15} total={15} type="positive" start={25} isFlow />
                            <WaterfallBar label="Var. BFR" value={-5} total={5} type="negative" start={40} isFlow />
                            <WaterfallBar label="Impôts" value={-3} total={3} type="negative" start={35} isFlow />

                            {/* Investing Activities */}
                            <WaterfallBar label="CAPEX" value={-8} total={8} type="negative" start={32} isFlow />
                            <WaterfallBar label="Cessions" value={4} total={4} type="positive" start={24} isFlow />

                            {/* Financing Activities */}
                            <WaterfallBar label="Nouvel Emprunt" value={10} total={10} type="positive" start={28} isFlow />
                            <WaterfallBar label="Dividendes" value={-2.5} total={2.5} type="negative" start={38} isFlow />

                            {/* Closing Balance */}
                            <WaterfallBar label="Tréso. Clôture" value={35.5} total={35.5} type="final" start={0} />
                        </div>
                    </div>
                )}

                {/* === TAB 3: ADVANCED DUPONT & ALTMAN === */}
                {activeTab === "advanced" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* DuPont Analysis */}
                        <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40">
                            <div className="flex items-center gap-3 mb-8">
                                <Divide className="w-6 h-6 text-indigo-400" />
                                <h3 className="text-xl font-bold text-white">Décomposition DuPont (ROE)</h3>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 text-center w-full">
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Return On Equity (ROE)</p>
                                    <p className="text-4xl font-black text-white">18.5%</p>
                                </div>

                                <div className="flex items-center w-full gap-4">
                                    <div className="h-px bg-slate-700 flex-1" />
                                    <span className="text-xs text-slate-500 font-bold">=</span>
                                    <div className="h-px bg-slate-700 flex-1" />
                                </div>

                                <div className="grid grid-cols-3 gap-4 w-full">
                                    <DuPontCard label="Marge Nette" value="12%" desc="Efficacité Opérationnelle" color="text-emerald-400" />
                                    <div className="flex items-center justify-center text-slate-600 font-bold">×</div>
                                    <DuPontCard label="Rotation Actif" value="0.95" desc="Efficacité des Actifs" color="text-amber-400" />
                                    <div className="col-span-3 flex items-center justify-center text-slate-600 font-bold my-[-10px]">×</div>
                                    <div className="col-span-3 flex justify-center">
                                        <DuPontCard label="Levier Financier" value="1.62" desc="Structure du Capital" color="text-purple-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Altman Z-Score */}
                        <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />

                            <div className="flex items-center gap-3 mb-8">
                                <Scale className="w-6 h-6 text-emerald-400" />
                                <h3 className="text-xl font-bold text-white">Altman Z-Score (Faillite)</h3>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative w-64 h-32 overflow-hidden mb-4">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-[20px] border-slate-800 border-t-emerald-500 border-r-emerald-500 rotation-wrapper transform -rotate-45" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-4 text-center">
                                        <span className="text-5xl font-black text-white">3.42</span>
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Zone Sûre (Safe)</p>
                                    </div>
                                </div>

                                <p className="text-center text-sm text-slate-400 max-w-sm leading-relaxed">
                                    Le score Z de 3.42 indique une probabilité de défaillance extrêmement faible à 2 ans. L'entreprise est financièrement robuste.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex flex-col items-center">
                                        <span className="text-xs text-slate-500 uppercase">Zone de Danger</span>
                                        <span className="font-bold text-rose-400">Z &lt; 1.8</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex flex-col items-center">
                                        <span className="text-xs text-slate-500 uppercase">Zone Grise</span>
                                        <span className="font-bold text-amber-400">1.8 - 2.99</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 4: REPORT (Existing) === */}
                {activeTab === "rapport" && (
                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40 h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                                <FileText className="w-5 h-5 text-purple-400" />
                                Rapport Généré par IA
                            </h3>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                                <Download className="w-4 h-4" /> PDF
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-950/50 rounded-2xl p-6 border border-white/5 font-mono text-sm text-slate-300 leading-loose overflow-y-auto whitespace-pre-line shadow-inner">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                    <p className="text-purple-400 animate-pulse">Analyse des ratios en cours...</p>
                                </div>
                            ) : reportContent || "Cliquez sur 'Générer Rapport Financier' pour lancer l'analyse IA."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// === Sub Components ===

function ScoreRow({ label, score }: { label: string, score: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 w-16 uppercase">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${score}%` }} />
            </div>
            <span className="text-[10px] font-bold text-white w-6 text-right">{score}</span>
        </div>
    );
}

function WaterfallBar({ label, value, total, type, start, isFlow }: any) {
    const height = Math.abs((total / 50) * 100); // Scale factor, 50 is max
    const bottom = (start / 50) * 100;

    let colorClass = "bg-slate-500";
    if (type === "positive") colorClass = "bg-emerald-500";
    if (type === "negative") colorClass = "bg-rose-500";
    if (type === "final") colorClass = "bg-blue-500";

    return (
        <div className="flex-1 h-full flex flex-col justify-end items-center group relative">
            <div className="w-full text-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[100%]">
                <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">{value > 0 && isFlow ? "+" : ""}{value}</span>
            </div>

            <div className="relative w-full h-full">
                <div
                    className={cn("absolute w-full rounded-md transition-all duration-700 hover:brightness-110 cursor-pointer shadow-lg", colorClass)}
                    style={{
                        height: `${Math.max(height, 2)}%`,
                        bottom: `${bottom}%`,
                        opacity: isFlow ? 0.8 : 1
                    }}
                />
                {isFlow && <div className="absolute w-px h-full border-l border-dashed border-white/10 left-1/2 -z-10" />}
            </div>

            <span className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-tighter rotate-0 truncate w-full text-center group-hover:text-white transition-colors">{label}</span>
        </div>
    );
}

function DuPontCard({ label, value, desc, color }: any) {
    return (
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center flex-1 min-w-[120px]">
            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</span>
            <span className={cn("text-2xl font-black mb-1", color)}>{value}</span>
            <span className="text-[9px] text-slate-600 leading-tight">{desc}</span>
        </div>
    );
}
