"use client";

import { useState } from "react";
import {
    Gauge,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    Users,
    FileText,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    RefreshCw,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLIENTS_SCORING = [
    {
        id: "CLI-001",
        name: "Orange Côte d'Ivoire",
        sector: "Télécommunications",
        score: 92,
        trend: "up",
        riskLevel: "A+",
        metrics: {
            payment: 95,
            complexity: 75,
            profitability: 90,
            relationship: 98
        },
        alerts: [],
        ca: "2.4M",
        lastActivity: "Il y a 2h"
    },
    {
        id: "CLI-002",
        name: "SARL Koné & Fils",
        sector: "BTP",
        score: 68,
        trend: "down",
        riskLevel: "B",
        metrics: {
            payment: 55,
            complexity: 85,
            profitability: 70,
            relationship: 60
        },
        alerts: ["Retard paiement 45j", "Contrôle fiscal en cours"],
        ca: "850K",
        lastActivity: "Il y a 5 jours"
    },
    {
        id: "CLI-003",
        name: "Pharmacie Centrale",
        sector: "Santé",
        score: 85,
        trend: "stable",
        riskLevel: "A",
        metrics: {
            payment: 90,
            complexity: 60,
            profitability: 88,
            relationship: 92
        },
        alerts: [],
        ca: "1.2M",
        lastActivity: "Hier"
    },
    {
        id: "CLI-004",
        name: "Société Générale Imports",
        sector: "Commerce",
        score: 45,
        trend: "down",
        riskLevel: "C",
        metrics: {
            payment: 30,
            complexity: 90,
            profitability: 40,
            relationship: 50
        },
        alerts: ["Factures impayées 120j", "Dossier incomplet", "Risque de radiation"],
        ca: "2.1M",
        lastActivity: "Il y a 1 mois"
    }
];

const METRIC_LABELS = {
    payment: { label: "Paiement", icon: DollarSign },
    complexity: { label: "Complexité", icon: FileText },
    profitability: { label: "Rentabilité", icon: TrendingUp },
    relationship: { label: "Relation", icon: Users }
};

export default function ClientScoringPage() {
    const [selectedClient, setSelectedClient] = useState(CLIENTS_SCORING[1]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-rose-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-amber-500";
        return "bg-rose-500";
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-violet-500/5 via-transparent to-transparent rounded-[32px] px-10">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-violet-500/20">
                        <Gauge className="w-3 h-3" /> Scoring & Risque Client
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Client Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Notation automatique basée sur les comportements de paiement, la complexité du dossier et la rentabilité.
                        <span className="text-violet-400 font-bold ml-2">Identifiez les risques avant qu'ils ne surviennent.</span>
                    </p>
                </div>

                <div className="flex gap-3 z-10">
                    <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Recalculer Scores
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Client List with Scores */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-violet-400" /> Portfolio Clients
                        </h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg">A+ : 45%</span>
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-lg">B : 35%</span>
                            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-lg">C : 20%</span>
                        </div>
                    </div>

                    {CLIENTS_SCORING.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className={cn(
                                "p-5 rounded-[24px] border cursor-pointer transition-all group relative overflow-hidden",
                                selectedClient.id === client.id ? "bg-slate-800/80 border-violet-500/40 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                            )}
                        >
                            {/* Background Score Indicator */}
                            <div
                                className={cn("absolute top-0 left-0 bottom-0 opacity-10", getScoreBg(client.score))}
                                style={{ width: `${client.score}%` }}
                            />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">{client.name}</h4>
                                        {client.trend === "up" && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                                        {client.trend === "down" && <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">{client.sector}</p>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-2xl font-black", getScoreColor(client.score))}>{client.score}</div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black",
                                        client.riskLevel === "A+" ? "bg-emerald-500/20 text-emerald-400" :
                                            client.riskLevel === "A" ? "bg-emerald-500/10 text-emerald-400" :
                                                client.riskLevel === "B" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                                    )}>
                                        {client.riskLevel}
                                    </span>
                                </div>
                            </div>

                            {client.alerts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                                    {client.alerts.slice(0, 2).map((alert, i) => (
                                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] rounded-lg font-bold border border-rose-500/20">
                                            <AlertTriangle className="w-3 h-3" /> {alert}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 relative z-10">
                                <span className="text-xs text-slate-500">CA Annuel: <span className="text-white font-bold">{client.ca}</span></span>
                                <span className="text-[10px] text-slate-600">{client.lastActivity}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Detailed Score Analysis */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Score Dashboard */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white">{selectedClient.name}</h2>
                                <p className="text-slate-500 text-sm">{selectedClient.sector} • {selectedClient.id}</p>
                            </div>
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="56" cy="56" r="50" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                                    <circle
                                        cx="56" cy="56" r="50"
                                        fill="transparent"
                                        stroke={selectedClient.score >= 80 ? "#10b981" : selectedClient.score >= 60 ? "#f59e0b" : "#ef4444"}
                                        strokeWidth="10"
                                        strokeDasharray="314"
                                        strokeDashoffset={314 - (selectedClient.score / 100) * 314}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className={cn("text-3xl font-black", getScoreColor(selectedClient.score))}>{selectedClient.score}</span>
                                    <span className="text-[8px] text-slate-500 uppercase">Score Global</span>
                                </div>
                            </div>
                        </div>

                        {/* Metric Bars */}
                        <div className="space-y-5">
                            {(Object.keys(selectedClient.metrics) as Array<keyof typeof selectedClient.metrics>).map((key) => {
                                const value = selectedClient.metrics[key];
                                const meta = METRIC_LABELS[key];
                                const Icon = meta.icon;
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                <Icon className="w-4 h-4" /> {meta.label}
                                            </span>
                                            <span className={cn("font-black", getScoreColor(value))}>{value}/100</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-700", getScoreBg(value))}
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alerts & Recommendations */}
                    {selectedClient.alerts.length > 0 && (
                        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[32px]">
                            <h4 className="font-bold text-rose-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Alertes Actives ({selectedClient.alerts.length})
                            </h4>
                            <div className="space-y-3">
                                {selectedClient.alerts.map((alert, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-xl border border-rose-500/10">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <span className="text-sm text-white flex-1">{alert}</span>
                                        <button className="text-xs text-rose-400 hover:text-rose-300 font-bold">Traiter</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Recommendation */}
                    <div className="p-6 bg-violet-500/5 border border-violet-500/20 rounded-[32px]">
                        <h4 className="font-bold text-violet-400 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Recommandation IA
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {selectedClient.score >= 80 ? (
                                <>Client premium à fidéliser. Proposez des services additionnels (Conseil stratégique, Accompagnement international). Potentiel d'upsell estimé à <span className="text-violet-400 font-bold">+30%</span>.</>
                            ) : selectedClient.score >= 60 ? (
                                <>Ce client présente des signes de fragilité. Planifiez un entretien pour comprendre les difficultés de paiement et ajuster les modalités de facturation. Surveillez le ratio honoraires/encaissements.</>
                            ) : (
                                <>⚠️ Client à risque élevé. Recommandation : <span className="text-rose-400 font-bold">Suspendre les travaux en cours</span> jusqu'à régularisation des factures impayées. Envisager une mise en demeure formelle.</>
                            )}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
