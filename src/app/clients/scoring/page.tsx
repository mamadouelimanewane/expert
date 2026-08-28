"use client";

import { useState, useEffect } from "react";
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

type ClientScoring = {
    id: string;
    name: string;
    sector: string;
    score: number;
    riskLevel: string;
    alerts: string[];
    ca: number;
    lastActivity: string | null;
    kycStatus: string | null;
};

type Factors = {
    regularite: number;
    tresorerie: number;
    croissance: number;
    conformite: number;
} | null;

const METRIC_LABELS = {
    regularite: { label: "Régularité (transmission)", icon: FileText, max: 40 },
    tresorerie: { label: "Trésorerie", icon: DollarSign, max: 30 },
    croissance: { label: "Croissance", icon: TrendingUp, max: 20 },
    conformite: { label: "Conformité KYC", icon: Users, max: 10 },
};

export default function ClientScoringPage() {
    const [clients, setClients] = useState<ClientScoring[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<ClientScoring | null>(null);
    const [factors, setFactors] = useState<Factors>(null);
    const [recalculating, setRecalculating] = useState(false);

    const loadData = () => {
        Promise.all([
            fetch("/api/clients").then(r => r.json()),
            fetch("/api/invoices").then(r => r.json()),
        ]).then(([clientsRes, invoicesRes]) => {
            const invoices: any[] = invoicesRes.invoices || [];
            const list: ClientScoring[] = (clientsRes.clients || []).map((c: any) => {
                const clientInvoices = invoices.filter(inv => inv.clientId === c.id);
                const ca = clientInvoices.reduce((a, inv) => a + (inv.total || 0), 0);
                const overdue = clientInvoices.filter(inv => inv.status === "OVERDUE");
                const alerts: string[] = [];
                if (overdue.length > 0) alerts.push(`${overdue.length} facture(s) en retard`);
                if (c.kycStatus && c.kycStatus !== "valid") alerts.push("Dossier KYC incomplet");
                const lastInvoice = clientInvoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())[0];

                return {
                    id: c.id,
                    name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
                    sector: c.sector || "—",
                    score: c.healthScore ?? 0,
                    riskLevel: c.rating || "C",
                    alerts,
                    ca,
                    lastActivity: lastInvoice?.issueDate || c.updatedAt || null,
                    kycStatus: c.kycStatus || null,
                };
            });
            setClients(list);
            setSelectedClient(prev => list.find(l => l.id === prev?.id) || list[0] || null);
            setLoading(false);
        });
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (!selectedClient) { setFactors(null); return; }
        fetch(`/api/clients/${selectedClient.id}/health-score`)
            .then(r => r.json())
            .then(d => setFactors(d.factors || null));
    }, [selectedClient?.id]);

    const recalculate = async () => {
        if (!selectedClient) return;
        setRecalculating(true);
        await fetch(`/api/clients/${selectedClient.id}/health-score`, { method: "POST" });
        setRecalculating(false);
        loadData();
    };

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
                    <h1 className="page-title-dark flex items-center gap-4">
                        Client Intelligence
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Notation automatique basée sur les comportements de paiement, la complexité du dossier et la rentabilité.
                        <span className="text-violet-400 font-bold ml-2">Identifiez les risques avant qu'ils ne surviennent.</span>
                    </p>
                </div>

                <div className="flex gap-3 z-10">
                    <button
                        onClick={recalculate}
                        disabled={recalculating || !selectedClient}
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", recalculating && "animate-spin")} /> {recalculating ? "Calcul…" : "Recalculer le Score"}
                    </button>
                </div>
            </div>

            {loading || !selectedClient ? (
                <div className="text-slate-400">Chargement des clients…</div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Client List with Scores */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-violet-400" /> Portfolio Clients
                        </h3>
                        <span className="text-[10px] text-slate-500">{clients.length} clients</span>
                    </div>

                    {clients.map((client) => (
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
                                    <h4 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">{client.name}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{client.sector}</p>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-2xl font-black", getScoreColor(client.score))}>{client.score}</div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-black",
                                        client.riskLevel === "AAA" ? "bg-emerald-500/20 text-emerald-400" :
                                            client.riskLevel === "AA" || client.riskLevel === "A" ? "bg-emerald-500/10 text-emerald-400" :
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
                                <span className="text-xs text-slate-500">CA facturé: <span className="text-white font-bold">{client.ca.toLocaleString()} F</span></span>
                                <span className="text-[10px] text-slate-600">{client.lastActivity ? new Date(client.lastActivity).toLocaleDateString("fr-FR") : "—"}</span>
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
                                <p className="text-slate-500 text-sm">{selectedClient.sector}</p>
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
                                    <span className={cn("text-xl sm:text-2xl lg:text-3xl font-black", getScoreColor(selectedClient.score))}>{selectedClient.score}</span>
                                    <span className="text-[8px] text-slate-500 uppercase">Score Global</span>
                                </div>
                            </div>
                        </div>

                        {/* Metric Bars */}
                        {factors ? (
                            <div className="space-y-5">
                                {(Object.keys(METRIC_LABELS) as Array<keyof typeof METRIC_LABELS>).map((key) => {
                                    const meta = METRIC_LABELS[key];
                                    const value = factors[key] ?? 0;
                                    const pct = Math.round((value / meta.max) * 100);
                                    const Icon = meta.icon;
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                    <Icon className="w-4 h-4" /> {meta.label}
                                                </span>
                                                <span className={cn("font-black", getScoreColor(pct))}>{value}/{meta.max}</span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-700", getScoreBg(pct))}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Score jamais calculé pour ce client. Cliquez sur « Recalculer le Score » ci-dessus.</p>
                        )}
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
                                        <button disabled title="Non implémenté : ces alertes sont recalculées à chaque score, pas de suivi individuel" className="text-xs text-rose-400/40 font-bold cursor-not-allowed">Traiter</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Recommendation */}
                    <div className="p-6 bg-violet-500/5 border border-violet-500/20 rounded-[32px]">
                        <h4 className="font-bold text-violet-400 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Recommandation
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
            )}
        </div>
    );
}
