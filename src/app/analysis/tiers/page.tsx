"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Download,
    FileText,
    AlertTriangle,
    Loader2,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TierAccount {
    id: string;
    name: string;
    type: "Client";
    balance: number;
    overdue: number;
    lastActivity: string;
    riskScore: "Faible" | "Modéré" | "Élevé";
    status: "En Retard" | "Actif" | "Soldé";
    invoiceCount: number;
}

interface TiersData {
    tiers: TierAccount[];
    kpis: { totalOutstanding: number; totalOverdue: number; dso: number | null; highRiskCount: number };
    summary: string;
}

export default function TierAnalysisPage() {
    const [activeTab, setActiveTab] = useState<"analyse" | "rapport">("analyse");
    const [data, setData] = useState<TiersData | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/analysis/tiers").then((r) => r.json()).then(setData);
    }, []);

    if (!data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const filtered = data.tiers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    const handleExportCSV = () => {
        const header = ["Client", "Encours (FCFA)", "Retard (FCFA)", "Dernière Activité", "Risque", "Statut", "Factures"];
        const rows = filtered.map((t) => [t.name, t.balance, t.overdue, t.lastActivity, t.riskScore, t.status, t.invoiceCount]);
        const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comptes-tiers-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Analyse des Comptes Tiers
                    </h2>
                    <p className="page-subtitle">Balance âgée des comptes clients, calculée à partir des factures réelles.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="apix-card">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Encours Clients Global</p>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{data.kpis.totalOutstanding.toLocaleString("fr-FR")} <span className="text-xs text-slate-600">FCFA</span></div>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Total Retards Clients</p>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-rose-400 mb-2">{data.kpis.totalOverdue.toLocaleString("fr-FR")} <span className="text-xs text-slate-600">FCFA</span></div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> {data.kpis.highRiskCount} client(s) à risque élevé
                    </div>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Délai Moyen (DSO)</p>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{data.kpis.dso ?? "—"} <span className="text-xs text-slate-600">jours</span></div>
                    {data.kpis.dso !== null && (
                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, data.kpis.dso)}%` }} />
                        </div>
                    )}
                </div>
            </div>

            <div className="tabs-scroll flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("analyse")}
                    className={cn("px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all", activeTab === "analyse" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-white")}
                >
                    Analyse Détail Tiers
                </button>
                <button
                    onClick={() => setActiveTab("rapport")}
                    className={cn("px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all", activeTab === "rapport" ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-white")}
                >
                    Rapport de Synthèse
                </button>
            </div>

            {activeTab === "analyse" && (
                <div className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un compte..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button disabled title="Non implémenté" className="p-2 rounded-lg text-slate-700 cursor-not-allowed"><Filter className="w-5 h-5" /></button>
                            <button onClick={handleExportCSV} title="Exporter en CSV" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Download className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="apix-table text-left text-sm">
                            <thead className="text-slate-500 font-bold bg-slate-900/50 border-b border-slate-800 uppercase text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Compte / Tiers</th>
                                    <th className="px-6 py-4">Nature</th>
                                    <th className="px-6 py-4 text-right">Solde global</th>
                                    <th className="px-6 py-4 text-right">Dont Échu</th>
                                    <th className="px-6 py-4">Risque</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Aucun compte client à afficher.</td></tr>
                                )}
                                {filtered.map((tier) => (
                                    <tr key={tier.id} className="hover:bg-slate-800/20 group transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">
                                                    {tier.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-primary transition-colors">{tier.name}</p>
                                                    <p className="text-[10px] text-slate-500">{tier.invoiceCount} facture(s)</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 bg-cyan-400/5">{tier.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-200">
                                            {tier.balance.toLocaleString("fr-FR")}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-rose-400">
                                            {tier.overdue.toLocaleString("fr-FR")}
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
                                                tier.status === "En Retard" ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                                                    tier.status === "Actif" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                                                        "text-slate-400 border-slate-500/20 bg-slate-500/5"
                                            )}>{tier.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-800 flex items-start gap-3 bg-slate-900/40">
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Le poste fournisseurs n'est pas encore disponible : aucun grand livre fournisseurs n'est modélisé dans l'application. Cette analyse ne couvre que les comptes clients (factures émises).
                        </p>
                    </div>
                </div>
            )}

            {activeTab === "rapport" && (
                <div className="glass-card rounded-3xl border border-slate-700/50 flex flex-col min-h-[350px] overflow-hidden bg-slate-900/30">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Rapport de Synthèse (calculé sur données réelles)
                        </h3>
                    </div>
                    <div className="flex-1 p-8">
                        <pre className="w-full h-full bg-transparent text-slate-200 font-serif leading-relaxed text-sm whitespace-pre-wrap">{data.summary}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
