"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    FileText,
    CreditCard,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    ArrowUpRight,
    Zap,
    Download,
    Eye,
    User,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const HEALTH_CHECK = [
    { label: "Dossiers à Jour", count: 42, color: "text-emerald-400", trend: "+5%" },
    { label: "En Retard (TVA)", count: 3, color: "text-rose-400", trend: "-2" },
    { label: "Connexions Bancaires", count: "98%", color: "text-indigo-400", trend: "Stable" },
];

export default function SupervisionTimelinePage() {
    const [filter, setFilter] = useState("all");
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit-logs?limit=30');
                const data = await res.json();
                if (data.logs) setLogs(data.logs);
            } catch (error) {
                console.error("Failed to fetch audit logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        // Optionnel : Polling toutes les 30 secondes pour le côté "Live"
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (action: string, entity: string) => {
        if (entity === 'DOCUMENT' || action.includes('UPLOAD')) return FileText;
        if (entity === 'INVOICE' || entity === 'TIME_ENTRY') return CreditCard;
        if (action.includes('ALERT') || action.includes('ERROR')) return AlertCircle;
        return Activity;
    };

    const getColor = (action: string) => {
        if (action === 'CREATE') return "text-emerald-400";
        if (action === 'DELETE') return "text-rose-400";
        if (action === 'UPDATE') return "text-sky-400";
        return "text-indigo-400";
    };

    const getBg = (action: string) => {
        if (action === 'CREATE') return "bg-emerald-500/10";
        if (action === 'DELETE') return "bg-rose-500/10";
        if (action === 'UPDATE') return "bg-sky-500/10";
        return "bg-indigo-500/10";
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 sm:p-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-sky-500/5 via-transparent to-transparent rounded-3xl sm:rounded-[40px] px-6 sm:px-10 border-l-4 border-l-sky-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-sky-500/20">
                        <Activity className="w-3 h-3" /> Supervision Temps Réel
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Flux d'Activité Live
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base font-medium">
                        Surveillez en temps réel les actions effectuées dans votre cabinet.
                        Traçabilité complète des dossiers, factures et saisies.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-10">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" /> Filtrer
                    </button>
                    <button className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 active:scale-95">
                        <Zap className="w-4 h-4" /> Actualiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Feed */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Timeline */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                            <p className="text-slate-500 font-medium font-bold uppercase tracking-widest text-xs">Chargement du flux live...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="glass-card p-12 text-center rounded-3xl border border-dashed border-slate-800">
                            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Aucune activité enregistrée</p>
                        </div>
                    ) : (
                        <div className="relative space-y-8 pl-8 before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-800">
                            {logs.map((log) => {
                                const Icon = getIcon(log.action, log.entity);
                                const color = getColor(log.action);
                                const bg = getBg(log.action);

                                return (
                                    <div key={log.id} className="relative group">
                                        {/* Dot on timeline */}
                                        <div className={cn(
                                            "absolute -left-[2.15rem] top-6 w-3 h-3 rounded-full border-2 border-[#0a0c10] shadow-[0_0_0_4px_rgba(30,41,59,0.5)] transition-all group-hover:scale-125 bg-sky-500"
                                        )} />

                                        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group-hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                                                        <Icon className={cn("w-5 h-5", color)} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">
                                                            {log.user?.firstName} {log.user?.lastName || "Système"}
                                                        </h4>
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {format(new Date(log.createdAt), 'HH:mm', { locale: fr })} • {log.action} {log.entity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="pl-[3.25rem]">
                                                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                                    {log.details || `Action ${log.action} sur ${log.entity}`}
                                                </p>

                                                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-[10px] font-bold uppercase tracking-widest text-sky-400 hover:underline flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> Inspecter
                                                    </button>
                                                    <span className="text-[10px] font-mono text-slate-600 ml-auto">
                                                        ID: {log.id.slice(-6)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && logs.length > 0 && (
                        <button className="w-full py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white hover:bg-slate-900/50 rounded-xl transition-all border border-dashed border-slate-800 hover:border-slate-600">
                            Charger plus d'activité
                        </button>
                    )}
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-6">

                    {/* Health Widget */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-sky-400" />
                            Statistiques Cabinet
                        </h3>
                        <div className="space-y-4">
                            {HEALTH_CHECK.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-white/5">
                                    <span className="text-xs text-slate-400 font-bold">{item.label}</span>
                                    <div className="text-right">
                                        <div className={cn("font-black text-lg", item.color)}>{item.count}</div>
                                        <div className="text-[10px] text-slate-600">{item.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Validations */}
                    <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Alertes de Sécurité</h3>
                            <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">Live</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-800/30 rounded-xl border-l-2 border-sky-500 hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <p className="text-xs font-bold text-white">Traçabilité Active</p>
                                <p className="text-[10px] text-slate-500 mt-1">Tous les mouvements sont loggés</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

