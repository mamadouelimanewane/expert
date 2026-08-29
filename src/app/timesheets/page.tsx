"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Clock,
    CalendarDays,
    Play,
    Pause,
    Plus,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Save,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    Briefcase,
    Zap,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RawEntry {
    id: string;
    date: string;
    duration: number;
    category: string;
    status: string;
    clientId: string | null;
    missionId: string | null;
    client?: { companyName: string | null } | null;
    mission?: { title: string } | null;
}

interface MissionOption {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    estimatedHours: number | null;
}

interface Row {
    key: string;
    clientName: string;
    missionTitle: string;
    clientId: string;
    missionId: string;
    hours: number[]; // par jour de la semaine affichée, uniquement les entrées déjà persistées
    pendingHours: number[]; // nouvelles saisies non encore envoyées
    budget: number;
    consumedBefore: number; // heures consommées avant cette semaine
}

function startOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay() || 7; // lundi = 1 ... dimanche = 7
    if (day !== 1) date.setDate(date.getDate() - (day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
}

export default function TimesheetsPage() {
    const [rawEntries, setRawEntries] = useState<RawEntry[]>([]);
    const [missions, setMissions] = useState<MissionOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [pending, setPending] = useState<Record<string, number[]>>({});
    const [saving, setSaving] = useState(false);
    const [newMissionId, setNewMissionId] = useState("");

    const weekStart = useMemo(() => startOfWeek(new Date()), []);
    const days = useMemo(() => {
        const labels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        return labels.map((label, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            return { label: `${label} ${String(d.getDate()).padStart(2, "0")}`, date: d };
        });
    }, [weekStart]);

    const loadData = () => {
        Promise.all([
            fetch("/api/timesheets").then(r => r.json()),
            fetch("/api/missions").then(r => r.json()),
        ]).then(([tsRes, missionsRes]) => {
            setRawEntries(tsRes.entries || []);
            const missionList: MissionOption[] = (missionsRes.missions || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                clientId: m.clientId,
                clientName: m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim(),
                estimatedHours: m.estimatedHours ?? null,
            }));
            setMissions(missionList);
            setLoading(false);
        });
    };

    useEffect(() => { loadData(); }, []);

    const rows: Row[] = useMemo(() => {
        const byMission = new Map<string, Row>();
        for (const e of rawEntries) {
            if (!e.missionId) continue;
            const key = e.missionId;
            if (!byMission.has(key)) {
                const mission = missions.find(m => m.id === e.missionId);
                byMission.set(key, {
                    key,
                    clientName: e.client?.companyName || mission?.clientName || "—",
                    missionTitle: e.mission?.title || mission?.title || "—",
                    clientId: e.clientId || mission?.clientId || "",
                    missionId: e.missionId,
                    hours: [0, 0, 0, 0, 0],
                    pendingHours: pending[key] || [0, 0, 0, 0, 0],
                    budget: mission?.estimatedHours || 0,
                    consumedBefore: 0,
                });
            }
            const row = byMission.get(key)!;
            const entryDate = new Date(e.date);
            const dayIdx = days.findIndex(d => d.date.toDateString() === entryDate.toDateString());
            if (dayIdx >= 0) {
                row.hours[dayIdx] += e.duration;
            } else if (entryDate < weekStart) {
                row.consumedBefore += e.duration;
            }
        }
        return Array.from(byMission.values());
    }, [rawEntries, missions, days, weekStart, pending]);

    const setPendingHour = (rowKey: string, dayIdx: number, val: string) => {
        const numVal = Math.min(parseFloat(val) || 0, 24);
        setPending(prev => {
            const current = prev[rowKey] || [0, 0, 0, 0, 0];
            const next = [...current];
            next[dayIdx] = numVal;
            return { ...prev, [rowKey]: next };
        });
    };

    const addMissionRow = () => {
        if (!newMissionId) return;
        setPending(prev => ({ ...prev, [newMissionId]: prev[newMissionId] || [0, 0, 0, 0, 0] }));
        setNewMissionId("");
    };

    const saveWeek = async () => {
        setSaving(true);
        const calls: Promise<any>[] = [];
        for (const [missionId, hours] of Object.entries(pending)) {
            const mission = missions.find(m => m.id === missionId);
            if (!mission) continue;
            hours.forEach((h, dayIdx) => {
                if (h > 0) {
                    calls.push(fetch("/api/timesheets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            duration: h,
                            category: "PRODUCTION",
                            description: "Saisie depuis feuille de temps",
                            date: days[dayIdx].date.toISOString(),
                            clientId: mission.clientId,
                            missionId: mission.id,
                        }),
                    }));
                }
            });
        }
        await Promise.all(calls);
        setPending({});
        setSaving(false);
        loadData();
    };

    const totalHoursThisWeek = rows.reduce((acc, row) => {
        const persisted = row.hours.reduce((a, b) => a + b, 0);
        const inFlight = (pending[row.key] || []).reduce((a, b) => a + b, 0);
        return acc + persisted + inFlight;
    }, 0);

    const overBudgetCount = rows.filter(r => r.budget > 0 && (r.consumedBefore + r.hours.reduce((a, b) => a + b, 0)) > r.budget).length;
    const nonAdminDuration = rawEntries.filter(e => e.category !== "AUTRE").reduce((a, e) => a + e.duration, 0);
    const totalDuration = rawEntries.reduce((a, e) => a + e.duration, 0);
    const billableRate = totalDuration > 0 ? Math.round((nonAdminDuration / totalDuration) * 100) : 0;

    if (loading) {
        return <div className="p-8 text-slate-400">Chargement des feuilles de temps…</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Premium */}
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <Clock className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                Semaine en cours
                            </span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> {days[0].date.toLocaleDateString("fr-FR")} - {days[4].date.toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                        <h2 className="page-title">
                            Suivi des Temps & <span className="text-indigo-400">Rentabilité</span>
                        </h2>
                        <p className="page-subtitle">
                            Saisissez vos heures pour analyser la rentabilité des missions et facturer le hors-forfait.
                        </p>
                    </div>

                    {/* Timer Widget (chronométrage local, à enregistrer manuellement ci-dessous) */}
                    <div className="p-4 bg-slate-950/50 border border-white/10 rounded-3xl flex items-center gap-6 shadow-xl backdrop-blur-xl">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Chronomètre</p>
                            <p className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-white">
                                {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
                                {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
                                {String(timerSeconds % 60).padStart(2, '0')}
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTimer(!activeTimer)}
                            className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                activeTimer ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
                            )}
                        >
                            {activeTimer ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Heures saisies", val: `${totalHoursThisWeek}h`, sub: "Cette semaine", icon: Clock, color: "text-indigo-400 bg-indigo-500/10" },
                    { label: "Taux de facturabilité", val: `${billableRate}%`, sub: "Hors catégorie 'Autre'", icon: TrendingDown, color: "text-emerald-400 bg-emerald-500/10" },
                    { label: "Alertes Budget", val: String(overBudgetCount), sub: "Dossiers en dépassement", icon: AlertTriangle, color: "text-rose-400 bg-rose-500/10" },
                    { label: "Dossiers Actifs", val: String(rows.length), sub: "Missions avec saisies", icon: Briefcase, color: "text-blue-400 bg-blue-500/10" }
                ].map((k, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={cn("p-3 rounded-2xl", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
                        </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{k.val}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{k.sub}</p>
                    </div>
                ))}
            </div>

            {/* Grille de Saisie */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/5 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Feuille de Temps</h3>
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            value={newMissionId}
                            onChange={e => setNewMissionId(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        >
                            <option value="">Ajouter une mission…</option>
                            {missions.filter(m => !rows.some(r => r.key === m.id)).map(m => (
                                <option key={m.id} value={m.id}>{m.clientName} — {m.title}</option>
                            ))}
                        </select>
                        <button onClick={addMissionRow} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto p-6">
                    <table className="w-full text-left border-collapse min-w-[800px] apix-table">
                        <thead>
                            <tr>
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/4">Client & Mission</th>
                                {days.map(d => (
                                    <th key={d.label} className="pb-4 text-[10px] font-black text-slate-400 uppercase text-center w-24">{d.label}</th>
                                ))}
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-8">État du Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const pendingRow = pending[row.key] || [0, 0, 0, 0, 0];
                                const rowTotal = row.hours.reduce((a, b) => a + b, 0) + pendingRow.reduce((a, b) => a + b, 0);
                                const totalConsumed = row.consumedBefore + rowTotal;
                                const budgetPercent = row.budget > 0 ? (totalConsumed / row.budget) * 100 : 0;
                                const isOverBudget = budgetPercent > 100;

                                return (
                                    <tr key={row.key} className="group">
                                        <td className="py-2 pr-4">
                                            <p className="text-sm text-white font-bold">{row.clientName}</p>
                                            <p className="text-xs text-slate-400">{row.missionTitle}</p>
                                        </td>
                                        {days.map((_, dayIdx) => {
                                            const persisted = row.hours[dayIdx];
                                            const isLocked = persisted > 0;
                                            return (
                                                <td key={dayIdx} className="py-2 px-1 text-center">
                                                    <input
                                                        type="number"
                                                        min="0" max="24" step="0.5"
                                                        readOnly={isLocked}
                                                        title={isLocked ? "Déjà enregistré — non modifiable ici" : undefined}
                                                        value={isLocked ? persisted : (pendingRow[dayIdx] || "")}
                                                        onChange={(e) => setPendingHour(row.key, dayIdx, e.target.value)}
                                                        className={cn(
                                                            "w-14 h-12 text-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                                                            isLocked ? "bg-slate-800/80 border-white/5 text-slate-400 cursor-not-allowed" :
                                                            (pendingRow[dayIdx] > 0 ? "border-indigo-500/50 text-indigo-300 font-black bg-indigo-500/10" : "bg-slate-800/50 border-white/5 text-slate-500")
                                                        )}
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="py-2 px-4 text-right">
                                            <span className="font-mono text-lg font-black text-white">{rowTotal}h</span>
                                        </td>
                                        <td className="py-2 pl-8">
                                            {row.budget > 0 ? (
                                                <div className="space-y-2 w-48">
                                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                                        <span className={isOverBudget ? "text-rose-400" : "text-emerald-400"}>
                                                            {totalConsumed}h / {row.budget}h
                                                        </span>
                                                        <span className="text-slate-500">{Math.round(budgetPercent)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-1000", isOverBudget ? "bg-rose-500" : budgetPercent > 80 ? "bg-amber-500" : "bg-emerald-500")}
                                                            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                    {isOverBudget && (
                                                        <p className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Dépassement ! Facturer hors-forfait.
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Non budgété</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                                        Aucune saisie pour l'instant. Ajoutez une mission ci-dessus pour commencer.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={7} className="pt-6 text-right">
                                    <button
                                        onClick={saveWeek}
                                        disabled={saving || Object.keys(pending).length === 0}
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center gap-2 ml-auto"
                                    >
                                        <Save className="w-4 h-4" /> {saving ? "Enregistrement…" : "Enregistrer la semaine"}
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Alertes budget réelles */}
            {overBudgetCount > 0 && (
                <div className="p-6 bg-gradient-to-r from-rose-900/30 to-amber-900/20 border border-rose-500/20 rounded-[32px] flex items-start gap-4 shadow-xl">
                    <div className="p-3 bg-rose-500/20 rounded-2xl shrink-0 mt-1">
                        <Zap className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-rose-300 uppercase tracking-widest mb-2">Dépassements de budget détectés</h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
                            {overBudgetCount} mission{overBudgetCount > 1 ? "s ont" : " a"} dépassé leur budget d'heures estimé. Vérifiez la ligne concernée ci-dessus et envisagez une facturation hors-forfait ou un avenant à la lettre de mission.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
