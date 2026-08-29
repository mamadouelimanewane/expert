"use client";

import { useState, useEffect } from "react";
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
    Target,
    CalendarClock,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudAlert {
    id: string;
    title: string;
    description: string;
    severity: "FAIBLE" | "MOYENNE" | "ELEVEE" | "CRITIQUE";
    status: "NOUVELLE" | "EN_ANALYSE" | "CONFIRMEE" | "ECARTEE";
    amount: number | null;
    ruleTriggered: string;
    client: { id: string; companyName: string | null; firstName: string | null; lastName: string | null } | null;
    transaction: { id: string; date: string; description: string; amount: number; type: string } | null;
    createdAt: string;
}

const RULE_LABEL: Record<string, string> = {
    DIMANCHE: "Transactions Dominicales",
    MONTANT_ROND: "Montants Ronds",
    MONTANT_ATYPIQUE: "Montants Atypiques",
};

const RULE_ICON: Record<string, any> = {
    DIMANCHE: CalendarClock,
    MONTANT_ROND: DollarSign,
    MONTANT_ATYPIQUE: TrendingUp,
};

const SEVERITY_LABEL: Record<string, string> = {
    FAIBLE: "faible",
    MOYENNE: "moyenne",
    ELEVEE: "élevée",
    CRITIQUE: "critique",
};

const STATUS_LABEL: Record<string, string> = {
    NOUVELLE: "À traiter",
    EN_ANALYSE: "En cours",
    CONFIRMEE: "Confirmée",
    ECARTEE: "Classée",
};

function clientName(c: FraudAlert["client"]): string {
    if (!c) return "Client non identifié";
    return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client";
}

export default function FraudDetectionPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [ruleCounts, setRuleCounts] = useState<{ rule: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState<string | null>(null);
    const [filterRule, setFilterRule] = useState<string>("all");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");
    const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

    const loadAlerts = () => {
        setLoading(true);
        fetch("/api/audit/fraud-alerts")
            .then(r => r.json())
            .then(d => {
                setAlerts(d.alerts || []);
                setRuleCounts(d.ruleCounts || []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAlerts(); }, []);

    const runScan = async () => {
        setScanning(true);
        setScanMessage(null);
        try {
            const res = await fetch("/api/audit/fraud-alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "scan" }),
            });
            const data = await res.json();
            if (data.scanned === 0) {
                setScanMessage("Aucune transaction à analyser. Importez des transactions bancaires pour activer le scan.");
            } else if (data.created === 0) {
                setScanMessage(`${data.scanned} transaction(s) analysée(s) — aucune nouvelle anomalie détectée.`);
            } else {
                setScanMessage(`${data.scanned} transaction(s) analysée(s) — ${data.created} nouvelle(s) alerte(s) générée(s).`);
            }
            loadAlerts();
        } finally {
            setScanning(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        await fetch("/api/audit/fraud-alerts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        loadAlerts();
    };

    const filteredAlerts = alerts.filter(a => {
        if (filterRule !== "all" && a.ruleTriggered !== filterRule) return false;
        if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
        return true;
    });

    const criticalCount = alerts.filter(a => a.severity === "CRITIQUE").length;
    const highCount = alerts.filter(a => a.severity === "ELEVEE").length;
    const newCount = alerts.filter(a => a.status === "NOUVELLE").length;
    const totalAmount = alerts.reduce((acc, a) => acc + (a.amount || 0), 0);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "CRITIQUE": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "ELEVEE": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "MOYENNE": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "FAIBLE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Shield
                            </span>
                        </div>
                        <h2 className="page-title">
                            Fraud <span className="text-rose-400">Detection</span> Hub
                        </h2>
                        <p className="page-subtitle">
                            Détection algorithmique d'anomalies sur les transactions bancaires : écritures dominicales, montants ronds, montants atypiques.
                        </p>
                    </div>

                    <button onClick={runScan} disabled={scanning} className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 active:scale-95">
                        {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        {scanning ? "Analyse en cours..." : "Scanner Maintenant"}
                    </button>
                </div>
                {scanMessage && (
                    <div className="relative z-10 mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-300">
                        {scanMessage}
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Alertes Critiques</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-400">{criticalCount}</span>
                        <AlertOctagon className="w-5 h-5 text-rose-500" />
                    </div>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Risque Élevé</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400">{highCount}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Nouvelles Alertes</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-400">{newCount}</span>
                        <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Montant Exposé</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">{(totalAmount / 1000000).toFixed(1)}M</span>
                        <span className="text-xs text-slate-500 font-bold">FCFA</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Rule Filter — comptages réels */}
                    <div className="apix-card">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Règle Déclenchée</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setFilterRule("all")}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                    filterRule === "all" ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-slate-400"
                                )}
                            >
                                <span className="text-sm font-bold">Toutes</span>
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{alerts.length}</span>
                            </button>
                            {ruleCounts.map(rc => (
                                <button
                                    key={rc.rule}
                                    onClick={() => setFilterRule(rc.rule)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        filterRule === rc.rule ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <span className="text-sm font-bold">{RULE_LABEL[rc.rule] || rc.rule}</span>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{rc.count}</span>
                                </button>
                            ))}
                            {ruleCounts.length === 0 && (
                                <p className="text-xs text-slate-500 p-3">Aucune alerte générée pour le moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Severity Filter */}
                    <div className="apix-card">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Sévérité</h3>
                        <div className="space-y-2">
                            {["all", "CRITIQUE", "ELEVEE", "MOYENNE", "FAIBLE"].map(sev => (
                                <button
                                    key={sev}
                                    onClick={() => setFilterSeverity(sev)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        filterSeverity === sev ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <span className="text-sm font-bold capitalize">{sev === "all" ? "Toutes" : SEVERITY_LABEL[sev]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rule Reference */}
                    <div className="glass-card rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-sm font-black text-white uppercase">Règles de Détection</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Le scan applique 3 règles simples aux transactions bancaires réelles : écriture un dimanche, montant rond ≥ 500K FCFA, montant &gt; 3x la moyenne observée.
                        </p>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="lg:col-span-9 space-y-4">
                    {loading ? (
                        <div className="apix-card flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="apix-card text-center">
                            <ShieldAlert className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-white font-bold">Aucune anomalie détectée</p>
                            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Lancez un scan pour analyser les transactions bancaires existantes, ou ajustez vos filtres.</p>
                        </div>
                    ) : filteredAlerts.map((alert) => {
                        const TypeIcon = RULE_ICON[alert.ruleTriggered] || AlertTriangle;
                        return (
                            <div
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className={cn(
                                    "glass-card rounded-3xl border p-6 transition-all cursor-pointer hover:scale-[1.01]",
                                    alert.severity === "CRITIQUE" ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40" :
                                        alert.severity === "ELEVEE" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
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
                                                    {SEVERITY_LABEL[alert.severity]}
                                                </span>
                                                {alert.status === "NOUVELLE" && (
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-black uppercase border border-indigo-500/20">
                                                        Nouveau
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-3">{alert.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-2 py-1 bg-white/5 text-[10px] text-slate-400 rounded-lg border border-white/10">
                                                    {clientName(alert.client)}
                                                </span>
                                                {alert.transaction && (
                                                    <span className="px-2 py-1 bg-white/5 text-[10px] text-slate-400 rounded-lg border border-white/10">
                                                        {alert.transaction.description}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6 text-[10px] text-slate-500">
                                                <span>Détecté : {new Date(alert.createdAt).toLocaleDateString("fr-FR")}</span>
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-3 h-3" />
                                                    Règle : {RULE_LABEL[alert.ruleTriggered] || alert.ruleTriggered}
                                                </span>
                                                {alert.amount && (
                                                    <span className="text-rose-400 font-bold">
                                                        {alert.amount.toLocaleString("fr-FR")} FCFA
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase",
                                        alert.status === "NOUVELLE" ? "text-indigo-400" :
                                            alert.status === "EN_ANALYSE" ? "text-amber-400" :
                                                alert.status === "CONFIRMEE" ? "text-rose-400" : "text-slate-500"
                                    )}>
                                        {STATUS_LABEL[alert.status]}
                                    </span>
                                    <div className="flex-1" />
                                    {alert.status === "NOUVELLE" && (
                                        <button onClick={(e) => { e.stopPropagation(); updateStatus(alert.id, "EN_ANALYSE"); }} className="px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-[9px] font-black uppercase rounded-lg border border-amber-500/20 transition-all">
                                            Mettre en analyse
                                        </button>
                                    )}
                                    {alert.status === "EN_ANALYSE" && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(alert.id, "CONFIRMEE"); }} className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-[9px] font-black uppercase rounded-lg border border-rose-500/20 transition-all">
                                                Confirmer
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(alert.id, "ECARTEE"); }} className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-[9px] font-black uppercase rounded-lg border border-white/10 transition-all">
                                                Écarter
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
