"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    Play,
    Pause,
    Save,
    TrendingUp,
    History,
    Timer,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionOption {
    id: string;
    clientId: string;
    clientName: string;
    title: string;
    status: string;
    estimatedHours: number | null;
    hourlyRate: number | null;
}

interface RawEntry {
    id: string;
    date: string;
    duration: number;
    status: string;
    client?: { companyName: string | null } | null;
    mission?: { title: string } | null;
}

export default function MissionTimesheetsPage() {
    const [entries, setEntries] = useState<RawEntry[]>([]);
    const [missions, setMissions] = useState<MissionOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [activeMission, setActiveMission] = useState<MissionOption | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = () => {
        Promise.all([
            fetch("/api/timesheets").then(r => r.json()),
            fetch("/api/missions?status=IN_PROGRESS").then(r => r.json()),
        ]).then(([tsRes, missionsRes]) => {
            setEntries(tsRes.entries || []);
            const opts: MissionOption[] = (missionsRes.missions || []).map((m: any) => ({
                id: m.id,
                clientId: m.clientId,
                clientName: m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim(),
                title: m.title,
                status: m.status,
                estimatedHours: m.estimatedHours ?? null,
                hourlyRate: m.hourlyRate ?? null,
            }));
            setMissions(opts);
            setActiveMission(prev => prev || opts[0] || null);
            setLoading(false);
        });
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        let interval: any;
        if (isTimerRunning) {
            interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSaveTimer = async () => {
        if (!activeMission || elapsedTime === 0) return;
        setSaving(true);
        await fetch("/api/timesheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                duration: elapsedTime / 3600,
                category: "PRODUCTION",
                description: "Travaux en cours",
                date: new Date().toISOString(),
                clientId: activeMission.clientId,
                missionId: activeMission.id,
            }),
        });
        setSaving(false);
        setIsTimerRunning(false);
        setElapsedTime(0);
        loadData();
    };

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    const weekTotalH = weekEntries.reduce((a, e) => a + e.duration, 0);
    const invoicedH = weekEntries.filter(e => e.status === "INVOICED" || e.status === "APPROVED").reduce((a, e) => a + e.duration, 0);
    const billableRate = weekTotalH > 0 ? Math.round((invoicedH / weekTotalH) * 100) : 0;

    const rateWeighted = weekEntries.reduce((acc, e) => {
        const mission = missions.find(m => m.title === e.mission?.title);
        return acc + (mission?.hourlyRate || 0) * e.duration;
    }, 0);
    const avgRate = weekTotalH > 0 ? Math.round(rateWeighted / weekTotalH) : 0;

    // Mission en dépassement réel (heures cumulées > budget estimé)
    const overBudgetMission = missions.find(m => {
        if (!m.estimatedHours) return false;
        const consumed = entries.filter(e => e.mission?.title === m.title).reduce((a, e) => a + e.duration, 0);
        return consumed > m.estimatedHours;
    });

    if (loading) {
        return <div className="p-8 text-slate-400">Chargement…</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Timer */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Timer className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6 lg:gap-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-4">
                            <Clock className="w-10 h-10 text-indigo-500" />
                            Gestion des Temps
                        </h2>
                        <p className="text-slate-400 mt-3 max-w-xl font-medium text-lg leading-relaxed">
                            Suivez vos heures passées par client et optimisez la rentabilité de vos missions.
                        </p>
                    </div>

                    <div className="bg-slate-950/80 p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center gap-6 min-w-[400px]">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Chronomètre Actif</p>
                            <span className="text-xl sm:text-2xl lg:text-3xl sm:text-4xl lg:text-6xl font-black text-white font-mono tracking-tighter tabular-nums">
                                {formatTime(elapsedTime)}
                            </span>
                            <p className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                                {activeMission ? `${activeMission.clientName} — ${activeMission.title}` : "Aucune mission sélectionnée"}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                disabled={!activeMission}
                                className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-40",
                                    isTimerRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                )}
                            >
                                {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                            </button>
                            <button
                                onClick={handleSaveTimer}
                                className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-40"
                                disabled={elapsedTime === 0 || saving}
                            >
                                <Save className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary (calculées sur les 7 derniers jours) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total 7 jours" value={`${weekTotalH.toFixed(1)}h`} subtext="Toutes missions confondues" color="text-indigo-400" />
                <SummaryCard title="Heures Approuvées/Facturées" value={`${invoicedH.toFixed(1)}h`} subtext={`${billableRate}% du temps total`} color="text-emerald-400" />
                <SummaryCard title="Taux Horaire Moyen" value={avgRate.toLocaleString()} subtext="FCFA / Heure (missions au taux horaire)" color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entries List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                Entrées Récentes
                            </h3>
                        </div>

                        <div className="divide-y divide-white/5">
                            {entries.slice(0, 20).map((entry) => (
                                <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black border border-white/5">
                                            {entry.duration.toFixed(1)}h
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{entry.client?.companyName || "—"}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{entry.mission?.title || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-600 font-bold uppercase">{new Date(entry.date).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            entry.status === "INVOICED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        )}>
                                            {entry.status === "INVOICED" ? "Facturé" : entry.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {entries.length === 0 && (
                                <p className="p-8 text-sm text-slate-500">Aucune saisie enregistrée pour l'instant.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Missions Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-black text-white mb-6">Missions en cours</h3>
                        <div className="space-y-4">
                            {missions.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveMission(m)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center group",
                                        activeMission?.id === m.id ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-indigo-500/30"
                                    )}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{m.clientName} — {m.title}</span>
                                    <Clock className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0", activeMission?.id === m.id && "opacity-100")} />
                                </button>
                            ))}
                            {missions.length === 0 && (
                                <p className="text-xs text-slate-500">Aucune mission en cours.</p>
                            )}
                        </div>
                    </div>

                    {overBudgetMission && (
                        <div className="glass-card p-8 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Alerte Rentabilité</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                La mission <span className="text-white font-bold">{overBudgetMission.title}</span> ({overBudgetMission.clientName}) dépasse son budget d'heures estimé ({overBudgetMission.estimatedHours}h). Prévoyez une facturation complémentaire.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, subtext, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className={cn("text-xl sm:text-2xl lg:text-3xl font-black mb-2", color)}>{value}</h3>
            <p className="text-xs text-slate-600 font-bold">{subtext}</p>
        </div>
    );
}
