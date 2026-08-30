"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    Globe,
    FileText,
    Target,
    Scale,
    LayoutDashboard,
    Loader2,
    Info,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiItem {
    label: string;
    value: string;
    changePct: number | null;
    isPointsDelta?: boolean;
}

interface MonthlyPoint {
    label: string;
    value: number;
}

interface Insight {
    title: string;
    detail: string;
}

interface DocumentItem {
    id: string;
    name: string;
    url: string;
    date: string;
}

interface PerformanceData {
    groupName: string | null;
    entityCount: number;
    usingFallbackScope: boolean;
    kpis: KpiItem[];
    monthlySeries: MonthlyPoint[];
    insights: Insight[];
    documents: DocumentItem[];
}

function relativeDateFr(dateStr: string): string {
    const date = new Date(dateStr);
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 30) return `Il y a ${days}j`;
    const months = Math.floor(days / 30);
    return `Il y a ${months} mois`;
}

export default function NexusPerformancePage() {
    const [view, setView] = useState<"cpm" | "esg" | "tax">("cpm");
    const [data, setData] = useState<PerformanceData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // La route répond parfois { error: "..." } (session expirée, erreur
        // serveur) au lieu de la forme attendue — sans cette vérification,
        // data.monthlySeries.map(...) plus bas plantait toute la page avec
        // "Cannot read properties of undefined (reading 'map')".
        fetch("/api/corporate/performance")
            .then(async (r) => {
                const json = await r.json();
                if (!r.ok || json.error) throw new Error(json.error || "Erreur serveur");
                setData(json);
            })
            .catch((e) => setError(e instanceof Error ? e.message : "Impossible de charger les indicateurs."));
    }, []);

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-rose-400 font-bold">{error}</p>
                <p className="text-slate-500 text-sm">Rechargez la page ou reconnectez-vous si le problème persiste.</p>
            </div>
        );
    }

    if (!data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    const maxMonthly = Math.max(...data.monthlySeries.map((m) => m.value), 1);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BarChart3 className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Corporate Performance Management
                            </span>
                        </div>
                        <h2 className="page-title">
                            Nexus <span className="text-emerald-400">Performance</span>
                        </h2>
                        <p className="page-subtitle">
                            {data.groupName ? `Périmètre "${data.groupName}" — ${data.entityCount} entité(s) consolidée(s).` : "Aucun groupe de consolidation configuré."}
                            {data.usingFallbackScope && " Aucune entité rattachée à des clients : les agrégats ci-dessous couvrent l'ensemble du portefeuille clients actifs."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-2 bg-slate-900/40 rounded-[32px] border border-white/5 w-fit mx-auto shadow-xl flex-wrap justify-center">
                {[
                    { id: "cpm", label: "CPM & Consolidation", icon: LayoutDashboard },
                    { id: "esg", label: "Sustainability (ESG)", icon: Globe },
                    { id: "tax", label: "Global Tax Integrity", icon: Scale },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as "cpm" | "esg" | "tax")}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            view === tab.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {view === "cpm" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: KPIs & Graphs */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {data.kpis.map((kpi, i) => (
                                <div key={i} className="apix-card group hover:border-emerald-500/20 transition-all">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-black text-white">{kpi.value}</span>
                                        {kpi.changePct !== null && (
                                            <span className={cn("text-[10px] font-bold", kpi.changePct >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {kpi.changePct >= 0 ? "+" : ""}{kpi.changePct}{kpi.isPointsDelta ? " pts" : "%"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Chart Card */}
                        <div className="apix-card">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">CA Facturé Mensuel (12 derniers mois)</h3>
                                    <p className="text-xs text-slate-500">Données réelles issues des factures émises sur le périmètre consolidé.</p>
                                </div>
                            </div>

                            <div className="h-80 flex items-end gap-3 px-4 relative">
                                {data.monthlySeries.map((point, i) => (
                                    <div key={i} className="flex-1 group relative">
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-600/20 to-emerald-400/40 border-t border-emerald-400/50 rounded-t-lg transition-all hover:to-emerald-300/80 cursor-pointer"
                                            style={{ height: `${Math.max(2, (point.value / maxMonthly) * 100)}%` }}
                                        />
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                            <div className="px-2 py-1 bg-white text-emerald-900 text-[10px] font-black rounded-md shadow-xl">
                                                {point.value}M
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="absolute bottom-0 left-0 w-full h-px bg-white/10" />
                            </div>
                            <div className="flex justify-between mt-4 px-2 text-[10px] text-slate-600 font-black uppercase">
                                {data.monthlySeries.map((p, i) => <span key={i}>{p.label}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Right: Insights & Documents */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="apix-card">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-6 h-6 text-emerald-400" />
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Constats Réels</h4>
                            </div>
                            <div className="space-y-4">
                                {data.insights.length === 0 && (
                                    <p className="text-xs text-slate-500">Données financières insuffisantes pour générer des constats.</p>
                                )}
                                {data.insights.map((insight, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-xs text-white font-bold mb-1">{insight.title}</p>
                                        <p className="text-[10px] text-slate-400">{insight.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className="apix-card">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Rapports Statutaires</h4>
                            <div className="space-y-2">
                                {data.documents.length === 0 && (
                                    <p className="text-xs text-slate-500 text-center py-4">Aucun rapport ou déclaration enregistré (module Documents).</p>
                                )}
                                {data.documents.map((doc) => (
                                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            <div>
                                                <p className="text-xs text-slate-300 font-bold truncate max-w-[160px]">{doc.name}</p>
                                                <p className="text-[9px] text-slate-600">{relativeDateFr(doc.date)}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-slate-600" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === "esg" && (
                <div className="apix-card text-center max-w-2xl mx-auto">
                    <Globe className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                    <h4 className="text-white font-black uppercase text-sm tracking-widest mb-2">Reporting ESG non disponible</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Aucun modèle de données ESG (émissions, indicateurs sociaux, gouvernance) n'est encore implémenté dans l'application. Cette section sera activée lorsque le module de collecte ESG sera développé.
                    </p>
                </div>
            )}

            {view === "tax" && (
                <div className="apix-card text-center max-w-2xl mx-auto">
                    <Scale className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                    <h4 className="text-white font-black uppercase text-sm tracking-widest mb-2">Global Tax Integrity non disponible</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        L'exposition fiscale internationale (Pilier 2, taux effectif d'imposition par juridiction) nécessite des données non collectées par l'application actuelle. Utilisez le module Déclarations Fiscales pour le suivi OHADA standard.
                    </p>
                </div>
            )}

            <div className="max-w-2xl mx-auto flex items-start gap-3 px-4">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Les agrégats CPM sont calculés à partir des exercices FinancialData les plus récents des clients rattachés aux entités du groupe de consolidation, ainsi que des factures réellement émises.
                </p>
            </div>
        </div>
    );
}
