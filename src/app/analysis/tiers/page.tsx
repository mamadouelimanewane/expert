"use client";

import { useState } from "react";
import {
    Users,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    FileText,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    BarChart3,
    MessageSquare,
    Wand2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TierAccount {
    id: string;
    name: string;
    type: "Client" | "Fournisseur";
    balance: string;
    overdue: string;
    lastActivity: string;
    riskScore: "Faible" | "Modéré" | "Élevé";
    status: "Actif" | "Litige" | "Inactif";
}

const MOCK_TIERS: TierAccount[] = [
    { id: "411001", name: "Telecom Afrique SA", type: "Client", balance: "12 500 000", overdue: "8 000 000", lastActivity: "15/05/2024", riskScore: "Élevé", status: "Actif" },
    { id: "411002", name: "Distribution Moderne", type: "Client", balance: "4 200 000", overdue: "0", lastActivity: "20/05/2024", riskScore: "Faible", status: "Actif" },
    { id: "401001", name: "Somafi Fournitures", type: "Fournisseur", balance: "6 800 000", overdue: "1 500 000", lastActivity: "10/05/2024", riskScore: "Modéré", status: "Actif" },
    { id: "411005", name: "Logistique Plus", type: "Client", balance: "2 100 000", overdue: "2 100 000", lastActivity: "01/01/2024", riskScore: "Élevé", status: "Litige" },
];

export default function TierAnalysisPage() {
    const [activeTab, setActiveTab] = useState<"analyse" | "rapport">("analyse");
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportContent, setReportContent] = useState("");

    const generateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setReportContent(`RAPPORT SYNTHÉTIQUE SUR L'ANALYSE DES COMPTES TIERS

ENTREPRISE : [NOM_CLIENT]
PÉRIODE : EXERCICE 2024 (MAI)

1. SYNTHÈSE DU POSTE CLIENTS
Le solde global des clients s'élève à 18 800 000 FCFA. L'analyse révèle que 10 100 000 FCFA (soit 53%) sont hors délai de paiement standard (30 jours).
Point de vigilance : Le client "Telecom Afrique SA" concentre 66% de l'encours global, présentant un risque de concentration et de liquidité élevé.

2. ANALYSE DU POSTE FOURNISSEURS
Dettes fournisseurs : 6 800 000 FCFA. 
Le délai moyen de paiement fournisseurs (DPO) est de 45 jours, ce qui est conforme aux normes du secteur mais nécessite une surveillance pour éviter des frais financiers.

3. RECOMMANDATIONS STRATÉGIQUES
- Engager une procédure de recouvrement amiable pour le dossier "Logistique Plus" (Litige).
- Négocier une assurance-crédit pour le client majeur Telecom Afrique.
- Automatiser les relances de paiement à J+5 de l'échéance.`);
            setIsGenerating(false);
            setActiveTab("rapport");
        }, 2500);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-400" />
                        Analyse des Comptes Tiers
                    </h2>
                    <p className="text-slate-400 mt-1">Audit approfondi des balances clients et fournisseurs avec scoring de risque IA.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={generateReport}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all"
                    >
                        <Wand2 className="w-4 h-4" /> {isGenerating ? "Analyse en cours..." : "Générer Rapport Santé IA"}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Encours Clients Global</p>
                    <div className="text-3xl font-bold text-white mb-2">18 800 000 <span className="text-xs text-slate-600">FCFA</span></div>
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                        <TrendingUp className="w-4 h-4" /> +15% vs mois dernier
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Total Retards Clients</p>
                    <div className="text-3xl font-bold text-rose-400 mb-2">10 100 000 <span className="text-xs text-slate-600">FCFA</span></div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> 3 clients à risque élevé
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Délai Moyen (DSO)</p>
                    <div className="text-3xl font-bold text-white mb-2">68 <span className="text-xs text-slate-600">jours</span></div>
                    <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[68%]" />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("analyse")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "analyse" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Analyse Détail Tiers
                </button>
                <button
                    onClick={() => setActiveTab("rapport")}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                        activeTab === "rapport" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    Rapport de Santé IA
                </button>
            </div>

            {activeTab === "analyse" && (
                <div className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Rechercher un compte..." className="w-full bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Filter className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Download className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 font-bold bg-slate-900/50 border-b border-slate-800 uppercase text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Compte / Tiers</th>
                                    <th className="px-6 py-4">Nature</th>
                                    <th className="px-6 py-4 text-right">Solde global</th>
                                    <th className="px-6 py-4 text-right">Dont Échu</th>
                                    <th className="px-6 py-4">Risque IA</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {MOCK_TIERS.map((tier) => (
                                    <tr key={tier.id} className="hover:bg-slate-800/20 group transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">
                                                    {tier.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{tier.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{tier.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold",
                                                tier.type === "Client" ? "text-cyan-400 bg-cyan-400/5" : "text-amber-400 bg-amber-400/5"
                                            )}>{tier.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-200">
                                            {tier.balance}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-rose-400">
                                            {tier.overdue}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    tier.riskScore === "Élevé" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                        tier.riskScore === "Modéré" ? "bg-amber-500" : "bg-emerald-500"
                                                )} />
                                                <span className="text-xs text-slate-400 font-medium">{tier.riskScore}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                tier.status === "Actif" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5"
                                            )}>{tier.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "rapport" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-700/50 flex flex-col min-h-[600px] overflow-hidden bg-slate-900/30">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                Rapport de Diagnostic Tiers
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Download className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 relative">
                            {isGenerating && (
                                <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                        <span className="text-indigo-400 font-bold animate-pulse">L'IA analyse les flux tiers et les risques d'impayés...</span>
                                    </div>
                                </div>
                            )}
                            <textarea
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 font-serif leading-relaxed text-sm resize-none"
                                placeholder="Lancez l'analyse IA pour générer le rapport..."
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5">
                            <h4 className="flex items-center gap-2 font-bold text-indigo-400 mb-4 text-sm">
                                <Zap className="w-4 h-4 fill-current" /> Insight Prédictif
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "Sur la base des tendances actuelles, le DSO augmentera de 5 jours le mois prochain si aucune action n'est engagée sur Telecom Afrique SA."
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-slate-700/50 space-y-4">
                            <h4 className="font-bold text-white text-sm">Actions de Recouvrement</h4>
                            <div className="space-y-2">
                                <button className="w-full p-3 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-left flex items-center justify-between border border-transparent hover:border-indigo-500/30">
                                    Envoyer relances automatiques
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="w-full p-3 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-left flex items-center justify-between border border-transparent hover:border-indigo-500/30">
                                    Générer lettre de mise en demeure
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="w-full p-3 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-left flex items-center justify-between border border-transparent hover:border-indigo-500/30">
                                    Ouvrir dossier litige expertise
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
