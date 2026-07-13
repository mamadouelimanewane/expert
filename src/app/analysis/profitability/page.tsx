"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Clock,
    DollarSign,
    Target,
    Search,
    BarChart3,
    Activity,
    AlertCircle,
    Calendar,
    Loader2,
    Info,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientProfit {
    id: string;
    company: string;
    invoicedRevenue: number;
    hoursSpent: number;
    standardRate: number | null;
    effectiveHourlyRate: number | null;
    rateGapPct: number | null;
    status: "Rentable" | "À Surveiller" | "Sous-facturé" | "Données Insuffisantes";
}

interface Collaborator {
    name: string;
    role: string;
    hours: number;
    avgValuePerHour: number | null;
}

interface ProfitabilityData {
    clients: ClientProfit[];
    kpis: { avgEffectiveRate: number | null; billingRealizationPct: number | null; underbilledCount: number; totalHours: number };
    collaborators: Collaborator[];
    insight: string | null;
}

export default function ClientProfitabilityPage() {
    const [data, setData] = useState<ProfitabilityData | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/analysis/profitability").then((r) => r.json()).then(setData);
    }, []);

    if (!data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    const filtered = data.clients.filter((c) => c.company.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <TrendingUp className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-5">
                        <div className="p-4 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-600/30">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                        Rentabilité Clients & Pilotage
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                        Comparaison réelle entre honoraires facturés et temps passé (feuilles de temps), tarif effectif vs tarif standard des missions.
                    </p>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlobalKPICard title="Taux Horaire Moyen" value={data.kpis.avgEffectiveRate !== null ? data.kpis.avgEffectiveRate.toLocaleString("fr-FR") : "—"} unit="FCFA" icon={DollarSign} color="text-indigo-400" />
                <GlobalKPICard title="Taux de Réalisation" value={data.kpis.billingRealizationPct !== null ? `${data.kpis.billingRealizationPct}` : "—"} unit="%" icon={Activity} color="text-emerald-400" />
                <GlobalKPICard title="Dossiers Sous-facturés" value={String(data.kpis.underbilledCount)} unit="" icon={AlertCircle} color="text-rose-400" />
                <GlobalKPICard title="Heures Enregistrées" value={data.kpis.totalHours.toLocaleString("fr-FR")} unit="h" icon={Clock} color="text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Table */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            Performances par Dossier
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Filtrer client..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Client</th>
                                    <th className="px-4 py-6 text-right">CA facturé</th>
                                    <th className="px-4 py-6 text-right">Taux Horaire Effectif</th>
                                    <th className="px-4 py-6 text-right">Écart vs Tarif Std.</th>
                                    <th className="px-6 py-6">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm">Aucune donnée de rentabilité disponible.</td></tr>
                                )}
                                {filtered.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-white">
                                                    {client.company[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block truncate max-w-[180px]">{client.company}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{client.hoursSpent}h enregistrées</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-right font-mono font-bold text-slate-300">
                                            {(client.invoicedRevenue / 1000000).toFixed(2)}M
                                        </td>
                                        <td className="px-4 py-6 text-right font-mono font-bold">
                                            {client.effectiveHourlyRate !== null ? (
                                                <span className={cn(
                                                    client.rateGapPct !== null && client.rateGapPct >= 10 ? "text-emerald-400" :
                                                        client.rateGapPct !== null && client.rateGapPct <= -10 ? "text-rose-400" : "text-amber-400"
                                                )}>
                                                    {client.effectiveHourlyRate.toLocaleString("fr-FR")}
                                                </span>
                                            ) : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-4 py-6 text-right">
                                            {client.rateGapPct !== null ? (
                                                <span className={cn("font-bold", client.rateGapPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                    {client.rateGapPct >= 0 ? "+" : ""}{client.rateGapPct}%
                                                </span>
                                            ) : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={cn(
                                                "flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1 rounded-full border w-fit",
                                                client.status === "Rentable" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    client.status === "Sous-facturé" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        client.status === "À Surveiller" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            )}>
                                                {client.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.insight && (
                        <div className="p-8 bg-indigo-500/5 border-t border-indigo-500/10">
                            <div className="flex items-start gap-4">
                                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-200/80 leading-relaxed">{data.insight}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panels */}
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-800/30">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Heures par Collaborateur
                        </h4>
                        <div className="space-y-4">
                            {data.collaborators.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">Aucune feuille de temps enregistrée.</p>
                            )}
                            {data.collaborators.map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-xs font-bold text-white">
                                    <div>
                                        <span className="block">{c.name}</span>
                                        <span className="text-[9px] text-slate-500 font-medium uppercase">{c.role} · {c.hours}h</span>
                                    </div>
                                    <span className="text-slate-300 font-mono">{c.avgValuePerHour !== null ? `${c.avgValuePerHour.toLocaleString("fr-FR")} F/h` : "—"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-indigo-600/10 border border-indigo-500/20">
                        <h4 className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Méthodologie
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Le tarif standard est la moyenne pondérée du <code className="text-slate-300">hourlyRate</code> des missions liées aux heures enregistrées. Le taux effectif est le CA facturé (hors brouillons/annulées) rapporté aux heures réellement enregistrées. L'écart mesure la sur- ou sous-facturation par rapport au tarif prévu — aucune donnée de coût salarial n'est disponible pour calculer une marge nette réelle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GlobalKPICard({ title, value, unit, icon: Icon, color }: { title: string; value: string; unit: string; icon: React.ElementType; color: string }) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{value}</span>
                <span className="text-xs font-bold text-slate-600">{unit}</span>
            </div>
        </div>
    );
}
