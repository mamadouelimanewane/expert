"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Search,
    AlertTriangle,
    AlertOctagon,
    Activity,
    TrendingUp,
    TrendingDown,
    Eye,
    FileWarning,
    DollarSign,
    Users,
    Building2,
    Zap,
    RefreshCw,
    Filter,
    BarChart3,
    Network,
    Sparkles,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudAlert {
    id: string;
    type: "transaction" | "relationship" | "pattern" | "compliance";
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    entities: string[];
    amount?: number;
    detectedAt: string;
    confidence: number;
    status: "new" | "investigating" | "resolved" | "dismissed";
}

const MOCK_ALERTS: FraudAlert[] = [
    {
        id: "FRD-001",
        type: "transaction",
        severity: "critical",
        title: "Flux circulaires détectés",
        description: "Série de virements triangulaires entre 3 entités liées avec retour au compte d'origine. Montant total: 45M FCFA sur 30 jours.",
        entities: ["SARL Kofi Trading", "GIE Bamako Services", "SA Import-Export CI"],
        amount: 45000000,
        detectedAt: "2026-02-04 14:30",
        confidence: 94,
        status: "new"
    },
    {
        id: "FRD-002",
        type: "relationship",
        severity: "high",
        title: "Réseau de sociétés fictives",
        description: "5 sociétés avec même adresse de domiciliation, mêmes dirigeants et sans activité réelle détectable. Suspicion de facturation fictive.",
        entities: ["SARL Alpha", "SARL Beta", "SARL Gamma", "SARL Delta", "SARL Epsilon"],
        detectedAt: "2026-02-03 09:15",
        confidence: 87,
        status: "investigating"
    },
    {
        id: "FRD-003",
        type: "pattern",
        severity: "high",
        title: "Fractionnement de dépôts (Smurfing)",
        description: "62 dépôts espèces inférieurs au seuil de déclaration (10M) sur 2 semaines. Total: 580M FCFA. Possible blanchiment.",
        entities: ["Compte 40120089654"],
        amount: 580000000,
        detectedAt: "2026-02-02 16:45",
        confidence: 91,
        status: "new"
    },
    {
        id: "FRD-004",
        type: "compliance",
        severity: "medium",
        title: "KYC incomplet - Client à risque élevé",
        description: "Client classé PEP (Personne Exposée Politiquement) sans documentation renforcée. Dernière vérification: 18 mois.",
        entities: ["M. Amadou Diallo", "HOLDING ADG"],
        detectedAt: "2026-02-01 11:00",
        confidence: 100,
        status: "investigating"
    },
    {
        id: "FRD-005",
        type: "transaction",
        severity: "medium",
        title: "Surfacturation fournisseur",
        description: "Prix unitaire 340% au-dessus du marché pour prestations informatiques. Écart de 12M FCFA avec les prix de référence.",
        entities: ["IT Solutions SARL", "Client: SOGECOM"],
        amount: 12000000,
        detectedAt: "2026-01-30 08:20",
        confidence: 78,
        status: "resolved"
    },
];

const FRAUD_TYPES = [
    { id: "all", label: "Toutes", count: 5 },
    { id: "transaction", label: "Transactions", count: 2 },
    { id: "relationship", label: "Relations", count: 1 },
    { id: "pattern", label: "Patterns", count: 1 },
    { id: "compliance", label: "Conformité", count: 1 },
];

export default function FraudDetectionPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>(MOCK_ALERTS);
    const [filterType, setFilterType] = useState<string>("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

    const filteredAlerts = alerts.filter(a => {
        if (filterType !== "all" && a.type !== filterType) return false;
        if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
        return true;
    });

    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    const highCount = alerts.filter(a => a.severity === "high").length;
    const newCount = alerts.filter(a => a.status === "new").length;
    const totalAmount = alerts.reduce((acc, a) => acc + (a.amount || 0), 0);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "transaction": return DollarSign;
            case "relationship": return Network;
            case "pattern": return Activity;
            case "compliance": return FileWarning;
            default: return AlertTriangle;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20 animate-pulse">
                                Détection Temps Réel
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Shield
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Fraud <span className="text-rose-400">Detection</span> Hub
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Détection automatisée des schémas frauduleux, flux suspects et anomalies de conformité. Analyse IA des transactions et relations d'affaires.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95">
                        <RefreshCw className="w-5 h-5" /> Scanner Maintenant
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Alertes Critiques</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-rose-400">{criticalCount}</span>
                        <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Risque Élevé</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400">{highCount}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Nouvelles Alertes</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-indigo-400">{newCount}</span>
                        <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Montant Exposé</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{(totalAmount / 1000000).toFixed(0)}M</span>
                        <span className="text-xs text-slate-500 font-bold">FCFA</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Type Filter */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Type d'Alerte</h3>
                        <div className="space-y-2">
                            {FRAUD_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setFilterType(type.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        filterType === type.id ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <span className="text-sm font-bold">{type.label}</span>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{type.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Severity Filter */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Sévérité</h3>
                        <div className="space-y-2">
                            {["all", "critical", "high", "medium", "low"].map(sev => (
                                <button
                                    key={sev}
                                    onClick={() => setFilterSeverity(sev)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        filterSeverity === sev ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <span className="text-sm font-bold capitalize">{sev === "all" ? "Toutes" : sev}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="glass-card rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-sm font-black text-white uppercase">Insights Nexus</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Tendance détectée: <b className="text-rose-400">+35% de flux suspects</b> ce mois vs. moyenne. Concentration sur le secteur import-export.
                        </p>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="lg:col-span-9 space-y-4">
                    {filteredAlerts.map((alert) => {
                        const TypeIcon = getTypeIcon(alert.type);
                        return (
                            <div
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className={cn(
                                    "glass-card rounded-3xl border p-6 transition-all cursor-pointer hover:scale-[1.01]",
                                    alert.severity === "critical" ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40" :
                                        alert.severity === "high" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
                                            "bg-slate-900/40 border-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-3 rounded-xl", getSeverityColor(alert.severity))}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-white">{alert.title}</h4>
                                                <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase border", getSeverityColor(alert.severity))}>
                                                    {alert.severity}
                                                </span>
                                                {alert.status === "new" && (
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-black uppercase border border-indigo-500/20 animate-pulse">
                                                        Nouveau
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-3">{alert.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {alert.entities.map((entity, i) => (
                                                    <span key={i} className="px-2 py-1 bg-white/5 text-[10px] text-slate-400 rounded-lg border border-white/10">
                                                        {entity}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-6 text-[10px] text-slate-500">
                                                <span>Détecté: {alert.detectedAt}</span>
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-3 h-3" />
                                                    Confiance: {alert.confidence}%
                                                </span>
                                                {alert.amount && (
                                                    <span className="text-rose-400 font-bold">
                                                        {(alert.amount / 1000000).toFixed(0)}M FCFA
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                alert.severity === "critical" ? "bg-rose-500" :
                                                    alert.severity === "high" ? "bg-amber-500" : "bg-yellow-500"
                                            )}
                                            style={{ width: `${alert.confidence}%` }}
                                        />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase",
                                        alert.status === "new" ? "text-indigo-400" :
                                            alert.status === "investigating" ? "text-amber-400" :
                                                alert.status === "resolved" ? "text-emerald-400" : "text-slate-500"
                                    )}>
                                        {alert.status === "new" ? "À traiter" :
                                            alert.status === "investigating" ? "En cours" :
                                                alert.status === "resolved" ? "Résolu" : "Classé"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
