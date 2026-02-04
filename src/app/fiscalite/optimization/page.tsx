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
    BarChart3,
    Lightbulb,
    Wand2,
    Loader2,
    Lock,
    Scale,
    Globe,
    FileSearch,
    BrainCircuit,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClients } from "@/data/mock-clients";

interface FiscalRisk {
    id: string;
    category: string;
    label: string;
    score: number;
    impact: "low" | "medium" | "high" | "critical";
    observation: string;
    potentialRisk: string;
}

const MOCK_RISKS: FiscalRisk[] = [
    {
        id: "1",
        category: "TVA",
        label: "Cadrage TVA / Chiffre d'Affaires",
        score: 85,
        impact: "medium",
        observation: "Écart de 2.5% détecté entre le CA comptabilisé et le CA déclaré en TVA.",
        potentialRisk: "1.5M FCFA"
    },
    {
        id: "2",
        category: "IS",
        label: "Deductibilité des Charges (Art. 12 CGI)",
        score: 40,
        impact: "high",
        observation: "Volume atypique de frais de réception sans justificatifs conformes OHADA.",
        potentialRisk: "4.2M FCFA"
    },
    {
        id: "3",
        category: "Social",
        label: "Retenues ITS & Reversements",
        score: 15,
        impact: "critical",
        observation: "Retard de reversement des retenues sur salaires au Trésor Public.",
        potentialRisk: "9.8M FCFA + Pénalités 100%"
    },
];

export default function NexusTaxIntelligencePage() {
    const [activeTab, setActiveTab] = useState<"audit" | "optimisation" | "integrity">("audit");
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedClient, setSelectedClient] = useState(mockClients[0]);
    const [reportVisible, setReportVisible] = useState(false);

    const runAnalysis = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setReportVisible(true);
        }, 2500);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Scale className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Global Tax & Integrity
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-rose-400">Tax Intelligence</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Pilotage de l'intégrité fiscale, gestion automatique des risques CGI et stratégies d'optimisation basées sur l'Acte Uniforme OHADA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={selectedClient.id}
                            onChange={(e) => setSelectedClient(mockClients.find(c => c.id === e.target.value) || mockClients[0])}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-rose-500 focus:border-rose-500 outline-none transition-all hover:bg-white/10"
                        >
                            {mockClients.map(client => (
                                <option key={client.id} value={client.id} className="bg-slate-900">{client.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={runAnalysis}
                            disabled={isGenerating}
                            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95 disabled:opacity-50">
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            {isGenerating ? "Traitement CGI..." : "Audit Fiscal IA"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-[24px] w-fit">
                {[
                    { id: "audit", label: "Intégrité & Risques", icon: ShieldCheck },
                    { id: "optimisation", label: "Pistes d'Optimisation", icon: Target },
                    { id: "integrity", label: "Cadrage Global", icon: Layers },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            activeTab === tab.id ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "audit" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Risk Grid */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Tableau des Risques : {selectedClient.name}</h3>
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/5 px-4 py-2 rounded-full border border-rose-500/10">
                                {MOCK_RISKS.length} Anomalies Détectées
                            </div>
                        </div>

                        <div className="space-y-4">
                            {MOCK_RISKS.map((risk) => (
                                <div key={risk.id} className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6 group hover:border-rose-500/20 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition-all",
                                                risk.impact === "critical" ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800"
                                            )}>
                                                <AlertTriangle className={cn("w-6 h-6", risk.impact === "critical" ? "text-rose-400" : "text-slate-400")} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white">{risk.label}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{risk.category} • CGI {selectedClient.country}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase border",
                                            risk.impact === "critical" ? "bg-rose-500/20 border-rose-500/30 text-rose-400" :
                                                risk.impact === "high" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                                                    "bg-slate-800 border-white/5 text-slate-400"
                                        )}>
                                            Impact {risk.impact}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Score Conformité</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", risk.score < 30 ? "bg-rose-500" : "bg-amber-500")} style={{ width: `${risk.score}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-white">{risk.score}%</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Risque Financier Est.</p>
                                            <p className="text-sm font-black text-rose-400">{risk.potentialRisk}</p>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Règle Appliquée</p>
                                            <p className="text-sm font-black text-white">OHADA Art. 12 & CGI</p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">
                                        "{risk.observation}"
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <button className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">
                                            <FileSearch className="w-3.5 h-3.5" /> Analyser les Pièces Jointes
                                        </button>
                                        <button className="px-6 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-[9px] font-black uppercase rounded-xl border border-rose-500/20 transition-all">
                                            Générer Note de Défense
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Analytics */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-rose-400" /> Conseil IA Nexus
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-6">
                                Basé sur les jurisprudences récentes de la Cour Commune de Justice et d'Arbitrage (CCJA), l'IA suggère une régularisation spontanée des retenues ITS pour éviter une majoration automatique de 50%.
                            </p>
                            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-rose-400 uppercase">Économie Potentielle</span>
                                    <TrendingDown className="w-4 h-4 text-rose-400" />
                                </div>
                                <p className="text-xl font-black text-white">4.9M FCFA</p>
                                <p className="text-[9px] text-slate-500 uppercase mt-1">via déclaration rectificative</p>
                            </div>
                            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all">
                                Simuler Calendrier de Paiement
                            </button>
                        </div>

                        <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Calendrier des Obligations</h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Déclaration TVA", date: "15 Juin 2026", status: "urgent" },
                                    { label: "Reversement ITS", date: "10 Juin 2026", status: "late" },
                                    { label: "Acompte IS", date: "30 Juin 2026", status: "planned" },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] text-white font-bold">{item.label}</p>
                                            <p className="text-[9px] text-slate-500">{item.date}</p>
                                        </div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            item.status === 'late' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                item.status === 'urgent' ? 'bg-amber-500' : 'bg-slate-600'
                                        )} />
                                    </div>
                                ))}
                            </div>
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
                                desc="Votre client remplit les critères d'investissement minimum pour bénéficier du régime d'incitation fiscale sectorielle."
                                icon={Target}
                                color="text-emerald-400"
                            />
                            <OptimizationCard
                                title="Recherche & Développement (CGI)"
                                potential="Déduction de 15% des frais R&D"
                                desc="Identification de 12.5M FCFA de dépenses éligibles au crédit d'impôt innovation."
                                icon={Lightbulb}
                                color="text-violet-400"
                            />
                            <OptimizationCard
                                title="Amortissements Dégressifs"
                                potential="Gain Cash : 2.8M FCFA"
                                desc="Activation du mode dégressif sur le parc informatique et matériel de bureau acquis au Q1 2026."
                                icon={TrendingDown}
                                color="text-amber-400"
                            />
                            <OptimizationCard
                                title="Régime de faveur Fusions-Acquisitions"
                                potential="Neutralité Fiscale CCJA"
                                desc="La restructuration prévue peut bénéficier de l'exonération des plus-values via le régime de faveur OHADA."
                                icon={Layers}
                                color="text-rose-400"
                            />
                        </div>

                        {/* Analysis Grid */}
                        <div className="glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Comparatif des Régimes Fiscaux</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Scénario de Pilotage</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Base Imposable</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Charge d'Impôt</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Gain Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5 transition-all">
                                            <td className="px-6 py-5 text-sm font-bold text-white">Réel Normal (Baseline)</td>
                                            <td className="px-6 py-5 text-sm font-mono text-slate-400 text-right">45 800 000</td>
                                            <td className="px-6 py-5 text-sm font-bold text-white text-right">11 450 000</td>
                                            <td className="px-6 py-5 text-center"><span className="text-[10px] text-slate-500 font-black uppercase">Référence</span></td>
                                        </tr>
                                        <tr className="bg-emerald-500/5 group">
                                            <td className="px-6 py-5 text-sm font-bold text-emerald-400">Régime Incitatif (Optimal)</td>
                                            <td className="px-6 py-5 text-sm font-mono text-slate-400 text-right">45 800 000</td>
                                            <td className="px-6 py-5 text-sm font-black text-emerald-400 text-right">0</td>
                                            <td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-black text-[10px] group-hover:bg-emerald-500/30 transition-all">+11.4M FCFA</span></td>
                                        </tr>
                                        <tr className="hover:bg-white/5 transition-all">
                                            <td className="px-6 py-5 text-sm font-bold text-white">PME Innovante</td>
                                            <td className="px-6 py-5 text-sm font-mono text-slate-400 text-right">38 200 000</td>
                                            <td className="px-6 py-5 text-sm font-bold text-white text-right">9 550 000</td>
                                            <td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg font-black text-[10px]">+1.9M FCFA</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-8 rounded-[32px] border border-indigo-500/20 bg-indigo-500/5">
                            <h4 className="text-sm font-black text-white mb-4 uppercase">Rapport Stratégique</h4>
                            <p className="text-[10px] text-slate-400 mb-8 leading-relaxed">
                                Le système a généré 4 scénarios d'optimisation. Exportez le rapport complet pour présentation au CA.
                            </p>
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/30 transition-all">
                                <Download className="w-4 h-4 inline mr-2" /> Télécharger PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "integrity" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-[40px] p-10 border border-white/5 bg-slate-900/40 min-h-[400px] flex items-center justify-center border-dashed">
                        <div className="text-center">
                            <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-500 uppercase">Cadrage Fiscal Multi-Zones</h3>
                            <p className="text-sm text-slate-600 max-w-sm mt-2">Gérez la consolidation fiscale de vos filiales dans toute la zone UEMOA/CEMAC.</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-[32px] border border-amber-500/20 bg-amber-500/5 p-8 self-start">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-5 h-5 text-amber-500" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Nexus Vault Compliance</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
                            Toutes vos données fiscales sont chiffrées et vérifiées par un hash blockchain pour garantir l'intégrité en cas de contrôle.
                        </p>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="w-[100%] h-full bg-emerald-500" />
                        </div>
                        <p className="text-[9px] text-emerald-400 font-black mt-2 uppercase">100% Inaltérable</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function OptimizationCard({ title, potential, desc, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                <Icon className="w-24 h-24" />
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 transition-all group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4 text-white" />
                </div>
            </div>

            <h3 className="text-sm font-black text-white mb-2">{title}</h3>
            <p className={cn("text-xs font-black uppercase tracking-widest mb-4", color)}>{potential}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">"{desc}"</p>
        </div>
    );
}
