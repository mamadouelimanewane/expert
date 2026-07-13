"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    AlertTriangle,
    Activity,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    collaborator: string;
    role: string;
    hours: number;
    valorizedAmount: number;
    assignedMissions: number;
    completedMissions: number;
    completionRate: number | null;
    tasksCompleted: number;
    status: "Top" | "Moyen" | "Alerte" | "Données Insuffisantes";
}

interface RevenueMixItem {
    label: string;
    amount: number;
    percentage: number;
}

interface PartnerData {
    cabinet: {
        caCurrent: number;
        caTrendPct: number | null;
        overdueMissions: number;
        hoursLogged90: number;
        newClients90: number;
        newClientsTrend: number;
        activeMissions: number;
    };
    team: TeamMember[];
    revenueMix: RevenueMixItem[];
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrateur",
    EXPERT: "Expert-Comptable",
    COLLABORATOR: "Collaborateur",
    ASSISTANT: "Assistant",
};

const MIX_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-purple-500"];

export default function PartnerDashboard() {
    const [data, setData] = useState<PartnerData | null>(null);

    useEffect(() => {
        fetch("/api/dashboard/partner").then((r) => r.json()).then(setData);
    }, []);

    if (!data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <TrendingUp className="w-56 h-56 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/40">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        Pilotage Associé
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg italic">
                        Pilotage du cabinet à partir des feuilles de temps, missions et factures réelles.
                    </p>
                </div>

                <div className="flex flex-col items-end relative z-10">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">CA Facturé (90 derniers jours)</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl sm:text-3xl lg:text-5xl font-black text-white">{(data.cabinet.caCurrent / 1000000).toFixed(1)}M</span>
                        {data.cabinet.caTrendPct !== null && (
                            <span className={cn("text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg", data.cabinet.caTrendPct >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10")}>
                                {data.cabinet.caTrendPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {data.cabinet.caTrendPct >= 0 ? "+" : ""}{data.cabinet.caTrendPct}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StrategicCard title="Dossiers en Retard" value={String(data.cabinet.overdueMissions)} subtext="Missions dont l'échéance est dépassée" icon={AlertTriangle} color="text-rose-400" bgColor="bg-rose-500/10" />
                <StrategicCard title="Heures Enregistrées (90j)" value={data.cabinet.hoursLogged90.toLocaleString("fr-FR")} subtext="Feuilles de temps sur 90 jours" icon={Activity} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                <StrategicCard title="Nouveaux Clients (90j)" value={String(data.cabinet.newClients90)} subtext={`${data.cabinet.newClientsTrend >= 0 ? "+" : ""}${data.cabinet.newClientsTrend} vs période précédente`} icon={Users} color="text-indigo-400" bgColor="bg-indigo-500/10" />
                <StrategicCard title="Missions Actives" value={String(data.cabinet.activeMissions)} subtext="En cours actuellement" icon={Target} color="text-emerald-400" bgColor="bg-emerald-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Collaborateurs */}
                <div className="lg:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Performance de l'Équipe
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Collaborateur</th>
                                    <th className="px-6 py-6">Taux de Complétion</th>
                                    <th className="px-6 py-6 text-right">Heures / Valorisation</th>
                                    <th className="px-6 py-6">Statut</th>
                                    <th className="px-8 py-6 text-right">Missions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.team.length === 0 && (
                                    <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm">Aucune activité enregistrée pour l'équipe.</td></tr>
                                )}
                                {data.team.map((m) => (
                                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {m.collaborator[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{m.collaborator}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{ROLE_LABELS[m.role] ?? m.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {m.completionRate !== null ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[80px]">
                                                        <div className={cn(
                                                            "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px]",
                                                            m.completionRate > 90 ? "bg-emerald-500 shadow-emerald-500/40" :
                                                                m.completionRate > 60 ? "bg-amber-500 shadow-amber-500/40" : "bg-rose-500 shadow-rose-500/40"
                                                        )} style={{ width: `${m.completionRate}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-300">{m.completionRate}%</span>
                                                </div>
                                            ) : <span className="text-xs text-slate-600">—</span>}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono font-black text-white">{m.hours}h</span>
                                                <span className="text-[10px] text-slate-600 font-medium">{m.valorizedAmount > 0 ? `≈ ${(m.valorizedAmount / 1000000).toFixed(2)}M FCFA` : "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                                m.status === "Top" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    m.status === "Moyen" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        m.status === "Alerte" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            )}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-xs text-slate-400 font-bold">
                                            {m.completedMissions}/{m.assignedMissions}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Répartition Portefeuille */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-3 uppercase text-xs tracking-widest">
                            <PieChart className="w-4 h-4 text-cyan-400" />
                            Mix par Type de Mission
                        </h3>
                        <p className="text-[10px] text-slate-500 mb-8">Valorisation des heures enregistrées (durée × tarif de mission), par type — proxy du mix d'activité en l'absence de catégorisation directe des factures.</p>
                        <div className="space-y-6">
                            {data.revenueMix.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">Aucune donnée valorisable.</p>
                            )}
                            {data.revenueMix.map((item, i) => (
                                <DistributionRow key={item.label} label={item.label} value={`${(item.amount / 1000000).toFixed(2)}M`} color={MIX_COLORS[i % MIX_COLORS.length]} percentage={item.percentage} />
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40">
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" /> Résumé Cabinet
                        </h4>
                        <div className="space-y-3 text-xs text-slate-400">
                            <div className="flex justify-between"><span>Missions actives</span><span className="text-white font-bold">{data.cabinet.activeMissions}</span></div>
                            <div className="flex justify-between"><span>Missions en retard</span><span className="text-rose-400 font-bold">{data.cabinet.overdueMissions}</span></div>
                            <div className="flex justify-between"><span>Collaborateurs actifs</span><span className="text-white font-bold">{data.team.length}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StrategicCard({ title, value, subtext, icon: Icon, color, bgColor }: { title: string; value: string; subtext: string; icon: React.ElementType; color: string; bgColor: string }) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl shadow-xl transition-transform group-hover:scale-110", bgColor, color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter">{value}</h3>
            <p className="text-[10px] text-slate-600 font-medium mt-2">{subtext}</p>
        </div>
    );
}

function DistributionRow({ label, value, color, percentage }: { label: string; value: string; color: string; percentage: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                <span className="text-xs font-black text-white">{value} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px]", color)} style={{ width: `${percentage}%`, opacity: 0.8 }} />
            </div>
        </div>
    );
}
