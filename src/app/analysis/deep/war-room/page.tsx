"use client";

import { useEffect, useState } from "react";
import {
    ShieldAlert,
    Target,
    Zap,
    Clock,
    Flame,
    BarChart3,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// War Room stratégique (vue associés).
//
// Cette page ne faisait aucun appel réseau : quatre KPI fixes (« Budget
// Recovered 84% », « Client Sentiment 4.8/5 »…), trois dossiers en retard
// fictifs (« SOCIÉTÉ D'HOTELLERIE DU GABON »…), trois « leads » de croissance
// inventés nommant une entreprise réelle (« Orange Sénégal »), une
// profitabilité « +14.2% YoY » et un badge « Elite Pro 360 v2.4 » sans aucune
// signification. Aucune de ces métriques n'a d'équivalent calculable dans
// l'application (pas de sentiment client, pas de suivi de synergies M&A) :
// elles sont donc retirées plutôt que rebranchées sur une fausse source.
// Les dossiers en retard viennent maintenant de /api/missions (deadline
// dépassée), et les indicateurs de risque du nombre réel d'alertes de fraude
// ouvertes (/api/audit/fraud-alerts) et de clients au KYC non conforme
// (/api/clients).
// ─────────────────────────────────────────────────────────────────────────────

interface MissionEnRetard {
    id: string;
    title: string;
    type: string;
    deadline: string;
    delayDays: number;
    client: string;
    assignedTo: string | null;
}

export default function PartnerWarRoom() {
    const [chargement, setChargement] = useState(true);
    const [retards, setRetards] = useState<MissionEnRetard[]>([]);
    const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
    const [alertesFraudeOuvertes, setAlertesFraudeOuvertes] = useState(0);
    const [clientsKycNonConforme, setClientsKycNonConforme] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const [rm, rf, rc] = await Promise.all([
                    fetch("/api/missions"),
                    fetch("/api/audit/fraud-alerts?status=NOUVELLE"),
                    fetch("/api/clients?limit=200&isActive=true"),
                ]);
                const [dm, df, dc] = await Promise.all([rm.json(), rf.json(), rc.json()]);

                const maintenant = Date.now();
                const enRetard: MissionEnRetard[] = (dm.missions ?? [])
                    .filter((m: any) => m.deadline && m.status !== "COMPLETED" && new Date(m.deadline).getTime() < maintenant)
                    .map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        type: m.type,
                        deadline: m.deadline,
                        delayDays: Math.floor((maintenant - new Date(m.deadline).getTime()) / (1000 * 60 * 60 * 24)),
                        client: m.client?.companyName || [m.client?.firstName, m.client?.lastName].filter(Boolean).join(" ") || "Client",
                        assignedTo: m.assignedTo ? [m.assignedTo.firstName, m.assignedTo.lastName].filter(Boolean).join(" ") : null,
                    }))
                    .sort((a: MissionEnRetard, b: MissionEnRetard) => b.delayDays - a.delayDays);

                setRetards(enRetard);
                setStats({ total: dm.stats?.total ?? 0, inProgress: dm.stats?.inProgress ?? 0, completed: dm.stats?.completed ?? 0 });
                setAlertesFraudeOuvertes((df.alerts ?? []).length);
                setClientsKycNonConforme((dc.clients ?? []).filter((c: any) => c.kycStatus === "invalid").length);
            } catch (e) {
                console.error("Chargement du war room :", e);
            } finally {
                setChargement(false);
            }
        })();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
                    <Target className="w-64 h-64 text-rose-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                Command Center (Associés)
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            War Room <span className="text-rose-500">Stratégique</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Dossiers en retard, alertes de fraude ouvertes et conformité KYC sur le portefeuille réel.
                        </p>
                    </div>
                </div>
            </div>

            {chargement ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Strategic KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <WarStatCard title="Missions en cours" value={String(stats.inProgress)} icon={Zap} color="text-indigo-400" />
                        <WarStatCard title="Missions terminées" value={String(stats.completed)} icon={CheckCircle2} color="text-emerald-400" />
                        <WarStatCard title="Dossiers en retard" value={String(retards.length)} icon={Flame} color="text-rose-400" />
                        <WarStatCard title="Alertes fraude ouvertes" value={String(alertesFraudeOuvertes)} icon={ShieldAlert} color="text-amber-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Production Bottlenecks */}
                        <div className="lg:col-span-8 glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 p-4 sm:p-6 lg:p-10 flex flex-col shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 sm:p-6 lg:p-10 opacity-5">
                                <Briefcase className="w-48 h-48 text-white" />
                            </div>

                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Production Critique (Retards)</h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase rounded-full border border-rose-500/20">
                                        {retards.length} Dossier{retards.length > 1 ? "s" : ""} Bloqué{retards.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            {retards.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-10">Aucune mission en retard.</p>
                            ) : (
                                <div className="space-y-6">
                                    {retards.slice(0, 8).map((m) => (
                                        <BottleneckRow key={m.id} client={m.client} mission={m.title} delay={`${m.delayDays} Jour${m.delayDays > 1 ? "s" : ""}`} expert={m.assignedTo} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Risk Panel */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40">
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                                    Cartographie des Risques
                                </h3>
                                <div className="space-y-4">
                                    <RiskAlert label="Alertes de fraude ouvertes" count={alertesFraudeOuvertes} />
                                    <RiskAlert label="Clients au KYC non conforme" count={clientsKycNonConforme} />
                                </div>
                            </div>

                            <div className="p-8 rounded-[40px] bg-slate-900/60 border border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Missions actives</p>
                                    <h4 className="text-2xl font-black text-white">{stats.total}</h4>
                                </div>
                                <BarChart3 className="w-10 h-10 text-indigo-500 opacity-50" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function WarStatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 tracking-tighter">{value}</h3>
        </div>
    );
}

function BottleneckRow({ client, mission, delay, expert }: any) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.05] transition-all gap-6">
            <div className="flex-1 w-full lg:w-auto">
                <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{client}</h4>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{mission}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {delay} de retard
                    </span>
                </div>
            </div>
            {expert && (
                <div className="hidden sm:block text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Chargé de Mission</p>
                    <span className="text-xs font-bold text-white uppercase">{expert}</span>
                </div>
            )}
        </div>
    );
}

function RiskAlert({ label, count }: { label: string; count: number }) {
    return (
        <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-300">{label}</span>
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                count > 0 ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-emerald-500/20 text-emerald-400"
            )}>
                {count}
            </span>
        </div>
    );
}
