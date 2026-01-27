"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Zap,
    Target,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Download,
    Calculator,
    FileText,
    BarChart,
    Lightbulb,
    Wand2,
    Loader2,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FiscalRisk {
    id: string;
    category: string;
    label: string;
    score: number;
    impact: string;
    observation: string;
}

const MOCK_RISKS: FiscalRisk[] = [
    { id: "1", category: "TVA", label: "Cadrage TVA/CA", score: 85, impact: "Moyen", observation: "Écart de 2.5% détecté entre le CA comptabilisé et le CA déclaré en TVA." },
    { id: "2", category: "IS", label: "Charges non déductibles", score: 40, impact: "Élevé", observation: "Volume atypique de frais de réception sans justificatifs conformes (Art. 12 CGI)." },
    { id: "3", category: "Social", label: "Retenues à la source", score: 15, impact: "Critique", observation: "Retard de reversement des retenues sur salaires (ITS) depuis 2 mois." },
];

export default function FiscalOptimizationPage() {
    const [activeTab, setActiveTab] = useState<"audit" | "optimisation">("audit");
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);

    const runAnalysis = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setReportVisible(true);
        }, 2500);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-rose-500" />
                        Analyse & Optimisation Fiscale
                    </h2>
                    <p className="text-slate-400 mt-1">Audit de conformité (Risk Scoring) et stratégies de réduction de la charge fiscale.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={runAnalysis}
                        className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all"
                    >
                        <Zap className="w-4 h-4 fill-current" /> {isGenerating ? "Analyse Multi-CGI..." : "Lancer Audit Fiscal IA"}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("audit")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "audit" ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Audit de Conformité
                </button>
                <button
                    onClick={() => setActiveTab("optimisation")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "optimisation" ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Pistes d'Optimisation
                </button>
            </div>

            {activeTab === "audit" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Risk Map */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border border-slate-700/50 bg-slate-900/30">
                            <h3 className="font-bold text-white text-lg mb-8 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Points de Vigilance (Contrôle Fiscal Préventif)
                            </h3>

                            <div className="space-y-6">
                                {MOCK_RISKS.map((risk) => (
                                    <div key={risk.id} className="p-5 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{risk.category}</span>
                                                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">{risk.label}</h4>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-1 rounded text-[10px] font-bold border",
                                                risk.impact === "Critique" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    risk.impact === "Élevé" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-slate-700 text-slate-400 border-slate-600"
                                            )}>
                                                Impact {risk.impact}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full transition-all duration-1000",
                                                    risk.score < 30 ? "bg-rose-500" : risk.score < 70 ? "bg-amber-500" : "bg-emerald-500"
                                                )} style={{ width: `${risk.score}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{risk.score}% de conformité</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-4 leading-relaxed group-hover:text-slate-300 transition-colors">
                                            "{risk.observation}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Strategy Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-900 to-rose-900/20">
                            <h3 className="text-white font-bold flex items-center gap-2 mb-6">
                                <Wand2 className="w-5 h-5 text-rose-400" />
                                Stratégie de Défense IA
                            </h3>
                            <div className="space-y-4">
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    "Pour le risque de cadrage TVA, l'IA suggère de vérifier les factures en attente du compte 4457. Un écart de 2.5% peut générer un redressement de 1.5M FCFA plus pénalités."
                                </p>
                                <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Calculator className="w-4 h-4" /> Simuler Redressement
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Statut des Obligations</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-xs text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> TVA Mai validée (05/06)
                                </li>
                                <li className="flex items-center gap-3 text-xs text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acompte IS réglé
                                </li>
                                <li className="flex items-center gap-3 text-xs text-slate-300 underline underline-offset-4 decoration-rose-500/50 decoration-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" /> ITS de retard (URGENT)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "optimisation" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <OptimizationCard
                                title="Code des Investissements (Agrément)"
                                potential="Exonération IS 5-8 ans"
                                desc="Votre client remplit les critères d'investissement minimum pour bénéficier du régime d'incitation."
                                icon={Target}
                                color="text-emerald-400"
                            />
                            <OptimizationCard
                                title="Crédit d'Impôt Recherche (CIR)"
                                potential="Déduction de 15% des frais R&D"
                                desc="Les dépenses inscrites en compte 611 (Sous-traitance technique) pourraient être éligibles."
                                icon={Lightbulb}
                                color="text-indigo-400"
                            />
                            <OptimizationCard
                                title="Traitement Fiscal des Amortissements"
                                potential="Gain Cash : 2.8M FCFA"
                                desc="Passage en amortissement dégressif sur le nouveau matériel industriel."
                                icon={TrendingDown}
                                color="text-amber-400"
                            />
                            <OptimizationCard
                                title="Régime de faveur (Fusions/Apports)"
                                potential="Neutralité fiscale"
                                desc="La restructuration prévue peut bénéficier du régime de faveur de l'Acte Uniforme OHADA."
                                icon={ShieldCheck}
                                color="text-rose-400"
                            />
                        </div>

                        {/* Simulation Table */}
                        <div className="glass-card rounded-3xl p-8 border border-slate-700/50 bg-slate-900/30">
                            <h3 className="font-bold text-white mb-6">Simulation de Charge Fiscale (Options de Régime)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-500 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Régime Fiscal</th>
                                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Base Imposable (Est.)</th>
                                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Charge Fiscale Totale</th>
                                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Économie / Gain</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        <tr className="bg-slate-800/10">
                                            <td className="px-4 py-4 text-white font-medium">Réel Normal (Actuel)</td>
                                            <td className="px-4 py-4 text-slate-400 font-mono">45 800 000</td>
                                            <td className="px-4 py-4 text-white font-bold">11 450 000</td>
                                            <td className="px-4 py-4 text-slate-600 italic">Baseline</td>
                                        </tr>
                                        <tr className="bg-emerald-500/[0.03]">
                                            <td className="px-4 py-4 text-white font-medium">Réel avec Exonération (Agrément)</td>
                                            <td className="px-4 py-4 text-slate-400 font-mono">45 800 000</td>
                                            <td className="px-4 py-4 text-emerald-400 font-bold">0</td>
                                            <td className="px-4 py-4 text-emerald-500 font-bold">+11.4M</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 text-white font-medium">Régime Simplifié PME</td>
                                            <td className="px-4 py-4 text-slate-400 font-mono">38 200 000</td>
                                            <td className="px-4 py-4 text-white font-bold">9 550 000</td>
                                            <td className="px-4 py-4 text-indigo-400 font-bold">+1.9M</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50">
                            <h4 className="font-bold text-white text-sm mb-4">Édition du Rapport</h4>
                            <p className="text-xs text-slate-500 mb-6">Compilez les pistes d'optimisation en un rapport de conseil stratégique.</p>
                            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                                <FileText className="w-4 h-4" /> Rapport Optimisation PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function OptimizationCard({ title, potential, desc, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/50 transition-all border-l-4 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 bg-slate-800 rounded-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
            <p className={cn("text-xs font-bold mb-3", color)}>{potential}</p>
            <p className="text-[10px] text-slate-500 leading-relaxed italic line-clamp-2">"{desc}"</p>
        </div>
    );
}
