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
    BarChart3
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
    const [activeTab, setActiveTab] = useState<"bilan" | "rapport">("bilan");
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
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FilePieChart className="w-8 h-8 text-purple-400" />
                        Analyse Financière & États de Synthèse
                    </h2>
                    <p className="text-slate-400 mt-1">Diagnostic complet par IA du bilan, compte de résultat et ratios OHADA.</p>
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

            {/* KPI Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {MOCK_RATIOS.map((ratio, i) => (
                    <div key={i} className="glass-card p-5 rounded-2xl border border-slate-700/50 bg-slate-900/30">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ratio.label}</span>
                            <div className={cn(
                                "p-1 rounded-md",
                                ratio.status === "good" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                                {ratio.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{ratio.value}</div>
                        <p className="text-[10px] text-slate-500 leading-tight">{ratio.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("bilan")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "bilan" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Analyse du Bilan
                </button>
                <button
                    onClick={() => setActiveTab("rapport")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "rapport" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Rapport d'Analyse IA
                </button>
            </div>

            {activeTab === "bilan" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Visual Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border border-slate-700/50 bg-slate-900/40">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="font-bold text-white text-lg flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                    Visualisation de la Structure du Bilan
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">MOYENNE SECTEUR: 82%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {/* ACTIF GRAPHIC */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Actif (Utilisation)</h4>
                                        <span className="text-xs text-white font-bold">100%</span>
                                    </div>
                                    <div className="flex flex-col gap-1 h-64 border-l-2 border-slate-800 pl-4">
                                        <div className="flex-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-3 flex flex-col justify-center gap-1 group hover:bg-indigo-500/30 transition-all cursor-pointer" style={{ flex: 60 }}>
                                            <span className="text-[10px] font-bold text-indigo-300 uppercase">Actif Immobilisé</span>
                                            <span className="text-lg font-bold text-white">45.0M</span>
                                        </div>
                                        <div className="flex-1 bg-indigo-400/10 border border-indigo-400/20 rounded-lg p-3 flex flex-col justify-center gap-1 group hover:bg-indigo-400/20 transition-all cursor-pointer mt-1" style={{ flex: 33 }}>
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Actif Circulant</span>
                                            <span className="text-sm font-bold text-white">25.0M</span>
                                        </div>
                                        <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex flex-col justify-center gap-1 group hover:bg-emerald-500/20 transition-all cursor-pointer mt-1" style={{ flex: 7 }}>
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Cash</span>
                                            <span className="text-[10px] font-bold text-white">5.0M</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PASSIF GRAPHIC */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Passif (Origine)</h4>
                                        <span className="text-xs text-white font-bold">100%</span>
                                    </div>
                                    <div className="flex flex-col gap-1 h-64 border-r-2 border-slate-800 pr-4">
                                        <div className="flex-1 bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 flex flex-col justify-center gap-1 text-right group hover:bg-purple-500/30 transition-all cursor-pointer" style={{ flex: 42 }}>
                                            <span className="text-[10px] font-bold text-purple-300 uppercase">Capitaux Propres</span>
                                            <span className="text-lg font-bold text-white">32.0M</span>
                                        </div>
                                        <div className="flex-1 bg-purple-400/10 border border-purple-400/20 rounded-lg p-3 flex flex-col justify-center gap-1 text-right group hover:bg-purple-400/20 transition-all cursor-pointer mt-1" style={{ flex: 24 }}>
                                            <span className="text-[10px] font-bold text-purple-400 uppercase">Dettes Long Terme</span>
                                            <span className="text-sm font-bold text-white">18.0M</span>
                                        </div>
                                        <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 flex flex-col justify-center gap-1 text-right group hover:bg-slate-700/50 transition-all cursor-pointer mt-1" style={{ flex: 34 }}>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Dettes Court Terme</span>
                                            <span className="text-sm font-bold text-white">25.0M</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Equilibrium Summary */}
                            <div className="mt-12 p-6 bg-slate-950/40 rounded-3xl border border-slate-800 flex justify-around items-center text-center">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Fonds de Roulement</p>
                                    <p className="text-xl font-bold text-emerald-400">+5.0M</p>
                                </div>
                                <div className="w-px h-10 bg-slate-800" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Rotation Stock</p>
                                    <p className="text-xl font-bold text-amber-500">52j</p>
                                </div>
                                <div className="w-px h-10 bg-slate-800" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Capacité d'Autofin.</p>
                                    <p className="text-xl font-bold text-white">12.4M</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Intelligence Panel */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900 to-purple-900/20">
                            <h3 className="text-white font-bold flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 text-purple-400" />
                                Score de Performance IA
                            </h3>
                            <div className="relative h-48 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-purple-500 animate-[spin_3s_linear_infinite]" />
                                </div>
                                <div className="text-center">
                                    <span className="text-4xl font-bold text-white">82</span>
                                    <p className="text-[10px] font-bold text-purple-400 uppercase">SANTÉ FINANCIÈRE</p>
                                </div>
                            </div>
                            <div className="space-y-3 mt-6">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed italic">
                                    "L'entreprise surpasse 75% du secteur en termes d'autonomie financière, mais présente une vulnérabilité sur la liquidité immédiate."
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" /> Comparaison SIG
                            </h4>
                            <div className="space-y-4">
                                <SIGProgress label="Valeur Ajoutée / CA" value={42} color="bg-emerald-500" />
                                <SIGProgress label="EBE / CA" value={15} color="bg-indigo-500" />
                                <SIGProgress label="Résultat Net / CA" value={8.2} color="bg-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "rapport" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-700/50 flex flex-col min-h-[650px] overflow-hidden bg-slate-900/30">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                                <FileText className="w-5 h-5 text-purple-400" />
                                Rapport de Diagnostic Bilan & SIG
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Download className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 relative">
                            {isGenerating && (
                                <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                                        <span className="text-purple-400 font-bold animate-pulse">L'IA croise les données du Bilan et du Compte de Résultat...</span>
                                    </div>
                                </div>
                            )}
                            <textarea
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 font-serif leading-relaxed text-sm resize-none"
                                placeholder="Lancez l'analyse financière pour générer le rapport..."
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5">
                            <h4 className="flex items-center gap-2 font-bold text-purple-400 mb-4 text-sm">
                                <Target className="w-4 h-4" /> Focus Stratégique IA
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "L'entreprise est en sur-capacité de financement stable. Envisagez une distribution de dividendes ou un investissement autofinancé de 12M FCFA."
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 space-y-4">
                            <h4 className="font-bold text-white text-sm">Actions de Performance</h4>
                            <div className="space-y-2">
                                <button className="w-full p-4 rounded-2xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-purple-900/40 transition-all text-left flex items-center justify-between border border-transparent hover:border-purple-500/30 group">
                                    Lancer audit des charges fixes
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                                </button>
                                <button className="w-full p-4 rounded-2xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-purple-900/40 transition-all text-left flex items-center justify-between border border-transparent hover:border-purple-500/30 group">
                                    Simuler investissement CAPEX
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                                </button>
                                <button className="w-full p-4 rounded-2xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-purple-900/40 transition-all text-left flex items-center justify-between border border-transparent hover:border-purple-500/30 group">
                                    Éditer liasse fiscale syscohada
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SIGProgress({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-400 font-bold">{label}</span>
                <span className="text-white font-bold">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
