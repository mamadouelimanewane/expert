"use client";

import { useState, useCallback } from "react";
import {
    Brain,
    Upload,
    Zap,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    TrendingDown,
    FileSpreadsheet,
    Search,
    Filter,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    Eye,
    Flag,
    ShieldAlert,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    account: string;
    riskScore: number;
    riskType: "normal" | "warning" | "critical";
    flags: string[];
}

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "TXN-001", date: "2026-01-15", description: "Paiement fournisseur Société Ivoirienne de Banque", debit: 4500000, credit: 0, account: "401000", riskScore: 15, riskType: "normal", flags: [] },
    { id: "TXN-002", date: "2026-01-18", description: "Virement suspect - Compte personnel (Dakar)", debit: 12000000, credit: 0, account: "512000", riskScore: 92, riskType: "critical", flags: ["Montant inhabituel", "Compte personnel détecté"] },
    { id: "TXN-003", date: "2026-01-20", description: "Facture client Orange Sénégal (Sonatel)", debit: 0, credit: 8500000, account: "411000", riskScore: 8, riskType: "normal", flags: [] },
    { id: "TXN-004", date: "2026-01-22", description: "Régularisation TVA Sénégal Janvier", debit: 1200000, credit: 0, account: "445700", riskScore: 45, riskType: "warning", flags: ["Montant élevé pour la période"] },
    { id: "TXN-005", date: "2026-01-25", description: "Salaires Siège Dakar Janvier 2026", debit: 15000000, credit: 0, account: "421000", riskScore: 12, riskType: "normal", flags: [] },
    { id: "TXN-006", date: "2026-01-28", description: "Achat Immeuble Plateau - Pas de PV AG", debit: 135000000, credit: 0, account: "211000", riskScore: 95, riskType: "critical", flags: ["Investissement majeur", "Absence PV AG détectée"] },
    { id: "TXN-007", date: "2026-01-30", description: "Avoir Doublon - Traoré Import-Export", debit: 0, credit: 2500000, account: "401000", riskScore: 78, riskType: "critical", flags: ["Doublon potentiel", "Même référence facture"] },
    { id: "TXN-008", date: "2026-02-01", description: "Frais de mission DG - Cotonou (Bénin)", debit: 850000, credit: 0, account: "625100", riskScore: 55, riskType: "warning", flags: ["Justificatifs requis"] },
    { id: "TXN-009", date: "2026-02-02", description: "Contrat de maintenance CFAO Motors", debit: 1500000, credit: 0, account: "622100", riskScore: 10, riskType: "normal", flags: [] },
];

const RISK_RULES = [
    { id: "R1", name: "Montants > 10M FCFA", count: 3, severity: "high" },
    { id: "R2", name: "Comptes personnels", count: 1, severity: "critical" },
    { id: "R3", name: "Doublons potentiels", count: 2, severity: "medium" },
    { id: "R4", name: "Investissements sans PV", count: 1, severity: "high" },
    { id: "R5", name: "Frais sans justificatifs", count: 4, severity: "medium" },
];

export default function AuditIntelligencePage() {
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [filterRisk, setFilterRisk] = useState<"all" | "warning" | "critical">("all");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const filteredTransactions = transactions.filter(t =>
        filterRisk === "all" || t.riskType === filterRisk || (filterRisk === "warning" && t.riskType === "critical")
    );

    const criticalCount = transactions.filter(t => t.riskType === "critical").length;
    const warningCount = transactions.filter(t => t.riskType === "warning").length;
    const avgRisk = Math.round(transactions.reduce((acc, t) => acc + t.riskScore, 0) / transactions.length);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Audit Intelligence Command Center */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Brain className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                Intelligence Artificielle • Audit
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                NEXUS Premium
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Audit <span className="text-rose-400">Intelligence</span> Analyze
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Analyse automatisée des transactions avec détection IA des anomalies, doublons et flux suspects. Échantillonnage intelligent pour un audit ciblé.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all border border-white/10">
                            <Upload className="w-5 h-5" /> Importer Excel
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95 disabled:opacity-50">
                            {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                            {isAnalyzing ? "Analyse en cours..." : "Lancer Analyse IA"}
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Transactions Analysées</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{transactions.length}</span>
                        <span className="text-[10px] font-black text-emerald-400">+12 nouvelles</span>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Alertes Critiques</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-rose-400">{criticalCount}</span>
                        <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Points d'Attention</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400">{warningCount}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Score de Risque Moyen</p>
                    <div className="flex items-baseline gap-2">
                        <span className={cn("text-3xl font-black", avgRisk > 50 ? "text-amber-400" : "text-emerald-400")}>{avgRisk}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Transaction Table */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                            Journal des Transactions
                        </h3>
                        <div className="flex gap-2">
                            {(["all", "warning", "critical"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterRisk(f)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filterRisk === f
                                            ? f === "critical" ? "bg-rose-500 text-white" : f === "warning" ? "bg-amber-500 text-white" : "bg-indigo-500 text-white"
                                            : "bg-white/5 text-slate-500 hover:bg-white/10"
                                    )}
                                >
                                    {f === "all" ? "Tout" : f === "warning" ? "Attention" : "Critique"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Libellé</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Débit</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Crédit</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Risque</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((txn, i) => (
                                    <tr
                                        key={txn.id}
                                        onClick={() => setSelectedTransaction(txn)}
                                        className={cn(
                                            "border-b border-white/5 cursor-pointer transition-all hover:bg-white/5",
                                            txn.riskType === "critical" && "bg-rose-500/5",
                                            txn.riskType === "warning" && "bg-amber-500/5"
                                        )}
                                    >
                                        <td className="px-4 py-4 text-xs text-slate-400 font-mono">{txn.date}</td>
                                        <td className="px-4 py-4 text-sm text-white font-medium max-w-[200px] truncate">{txn.description}</td>
                                        <td className="px-4 py-4 text-sm text-rose-400 font-bold text-right font-mono">
                                            {txn.debit > 0 ? txn.debit.toLocaleString() : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-emerald-400 font-bold text-right font-mono">
                                            {txn.credit > 0 ? txn.credit.toLocaleString() : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black",
                                                txn.riskType === "critical" ? "bg-rose-500/20 text-rose-400" :
                                                    txn.riskType === "warning" ? "bg-amber-500/20 text-amber-400" :
                                                        "bg-emerald-500/20 text-emerald-400"
                                            )}>
                                                {txn.riskScore}%
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {txn.flags.map((flag, j) => (
                                                    <span key={j} className="px-2 py-0.5 bg-white/5 text-[9px] text-slate-400 rounded border border-white/10">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Risk Rules & Sample */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Risk Rules */}
                    <div className="glass-card p-8 rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                            <Flag className="w-5 h-5 text-amber-400" />
                            Règles de Risque Actives
                        </h3>
                        <div className="space-y-4">
                            {RISK_RULES.map(rule => (
                                <div key={rule.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            rule.severity === "critical" ? "bg-rose-500" :
                                                rule.severity === "high" ? "bg-amber-500" : "bg-yellow-500"
                                        )} />
                                        <span className="text-xs text-slate-300 font-medium">{rule.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-white bg-white/10 px-2 py-1 rounded">{rule.count}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/10 transition-all">
                            + Ajouter une Règle
                        </button>
                    </div>

                    {/* AI Sample Selection */}
                    <div className="glass-card p-8 rounded-[48px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase">Échantillonnage IA</h4>
                                <p className="text-[10px] text-slate-500">Sélection automatique optimale</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Population totale</span>
                                <span className="text-white font-bold">{transactions.length} transactions</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Échantillon suggéré</span>
                                <span className="text-indigo-400 font-bold">{Math.min(criticalCount + warningCount + 2, transactions.length)} transactions</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Réduction</span>
                                <span className="text-emerald-400 font-bold">-{Math.round((1 - (criticalCount + warningCount + 2) / transactions.length) * 100)}%</span>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30">
                            Générer Échantillon Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
