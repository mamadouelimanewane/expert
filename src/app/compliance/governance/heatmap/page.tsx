"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    ShieldCheck,
    TrendingUp,
    Zap,
    Users,
    ArrowUpRight,
    Search,
    Filter,
    Radar,
    Flame,
    Grid,
    LayoutGrid,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Gavel,
    Globe2
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
    { id: "ag", label: "Tenue AG (Annuelles)" },
    { id: "mandats", label: "Mandats Dirigeants" },
    { id: "depot", label: "Dépôt Comptes (RCCM)" },
    { id: "kyc", label: "Conformité KYC/AML" },
];

export default function GovernanceHeatmapPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/governance/heatmap")
            .then(res => res.json())
            .then(data => {
                setClients(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Governance Command Center */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Grid className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Supervision Gouvernance OHADA
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Heatmap de <span className="text-indigo-400">Conformité Juridique</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Surveillance temps réel de l'hygiène juridique de votre portefeuille. Identifiez instantanément les risques de sanctions ou de nullité d'actes.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <Zap className="w-5 h-5" /> Relancer Tout le Portefeuille
                        </button>
                    </div>
                </div>
            </div>

            {/* Strategic KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatusStat label="Indice de Conformité" value="84" unit="%" trend="+2.4%" color="text-indigo-400" />
                <StatusStat label="AG en Retard" value={clients.filter(c => c.status.ag === 'late').length} trend="+1" color="text-rose-400" />
                <StatusStat label="Mandats Expirants" value={clients.filter(c => c.status.mandats === 'expiring').length} trend="-3" color="text-amber-400" />
                <StatusStat label="Clients 100% Green" value={clients.filter(c => Object.values(c.status).every(v => v === 'valid')).length} trend="+5" color="text-emerald-400" />
            </div>

            {/* Heatmap Grid */}
            <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Matrice de Risque</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/80" /> Conforme</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500/80" /> Attention</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500/80" /> Critique</div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                        </div>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-2">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client / Société</th>
                                    {COLUMNS.map(col => (
                                        <th key={col.id} className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center min-w-[140px]">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, idx) => (
                                    <tr key={client.id} className="group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-[10px] text-white">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase truncate max-w-[150px]">{client.name}</span>
                                            </div>
                                        </td>
                                        {COLUMNS.map(col => (
                                            <td key={col.id} className="p-1">
                                                <HeatmapCell status={(client.status as any)[col.id]} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Predictive Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Incidents Critiques Identifiés (Réel)
                    </h3>
                    <div className="space-y-4">
                        {clients.filter(c => c.status.ag === 'late' || c.status.mandats === 'late').map(c => (
                            <IncidentCard
                                key={c.id}
                                title={c.name}
                                desc={`Alerte: ${c.status.ag === 'late' ? 'Assemblée Générale en retard.' : ''} ${c.status.mandats === 'late' ? 'Mandats expirés.' : ''}`}
                                risk="CRITIQUE"
                            />
                        ))}
                        {clients.length === 0 && <p className="text-slate-500 italic text-sm">Aucun incident critique détecté.</p>}
                    </div>
                </div>
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                        <Gavel className="w-40 h-40 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-8">Intelligence OHADA</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium italic mb-6">
                        "Nexus analyse votre portefeuille en temps réel. {clients.filter(c => c.status.mandats === 'expiring').length} mandats arrivent à terme d'ici 30 jours."
                    </p>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20 transition-all">
                        Gérer les Mandats Stratégiques
                    </button>
                </div>
            </div>
        </div>
    );
}

function HeatmapCell({ status }: { status: "valid" | "expiring" | "late" | "invalid" }) {
    const config = {
        valid: { bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" },
        expiring: { bg: "bg-amber-500/10 border-amber-500/30", dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b]" },
        late: { bg: "bg-rose-500/10 border-rose-500/30", dot: "bg-rose-500 shadow-[0_0_8px_#ef4444]" },
        invalid: { bg: "bg-rose-900/20 border-rose-500/50", dot: "bg-rose-500 animate-pulse" },
    };

    const cell = config[status] || config.valid;

    return (
        <div className={cn("h-12 rounded-2xl border flex items-center justify-center transition-all hover:scale-[1.05] cursor-pointer", cell.bg)}>
            <div className={cn("w-2 h-2 rounded-full", cell.dot)} />
        </div>
    );
}

function StatusStat({ label, value, unit, trend, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl font-black", color)}>{value}{unit || ""}</span>
                <span className="text-[10px] font-black text-slate-700 underline">{trend}</span>
            </div>
        </div>
    );
}

function IncidentCard({ title, desc, risk }: any) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-white uppercase">{title}</h4>
                <span className="text-[8px] font-black px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30 uppercase">{risk}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
