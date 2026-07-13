"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Clock,
    Play,
    Pause,
    Save,
    Calendar,
    Briefcase,
    Timer,
    CheckCircle2,
    Plus,
    Zap,
    TrendingUp,
    Target,
    Search,
    ChevronRight,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionOption {
    id: string;
    clientId: string;
    name: string;
    mission: string;
}

interface RawEntry {
    id: string;
    date: string;
    duration: number;
    category: string;
    description: string | null;
    client?: { companyName: string | null } | null;
    mission?: { title: string } | null;
}

export default function TimeEntryPage() {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [missions, setMissions] = useState<MissionOption[]>([]);
    const [entries, setEntries] = useState<RawEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<MissionOption | null>(null);
    const [manualHours, setManualHours] = useState("");
    const [manualMinutes, setManualMinutes] = useState("");
    const [description, setDescription] = useState("");

    const loadData = () => {
        Promise.all([
            fetch("/api/missions").then(r => r.json()),
            fetch("/api/timesheets").then(r => r.json()),
        ]).then(([missionsRes, tsRes]) => {
            const opts: MissionOption[] = (missionsRes.missions || []).map((m: any) => ({
                id: m.id,
                clientId: m.clientId,
                name: m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim(),
                mission: m.title,
            }));
            setMissions(opts);
            setEntries(tsRes.entries || []);
            setLoading(false);
        });
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        let interval: any;
        if (isTimerRunning) {
            interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
    };

    const filteredMissions = missions.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) || m.mission.toLowerCase().includes(search.toLowerCase())
    );

    const today = new Date().toDateString();
    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === today);
    const todayTotal = todayEntries.reduce((a, e) => a + e.duration, 0);

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    const weekTotal = weekEntries.reduce((a, e) => a + e.duration, 0);
    const billableWeek = weekEntries.filter(e => e.category !== "AUTRE").reduce((a, e) => a + e.duration, 0);
    const imputationRate = weekTotal > 0 ? Math.round((billableWeek / weekTotal) * 100) : 0;

    const saveEntry = async (durationHours: number) => {
        if (!selectedClient || durationHours <= 0) return;
        setSaving(true);
        await fetch("/api/timesheets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                duration: durationHours,
                category: "PRODUCTION",
                description: description || "Saisie rapide",
                date: new Date().toISOString(),
                clientId: selectedClient.clientId,
                missionId: selectedClient.id,
            }),
        });
        setSaving(false);
        setDescription("");
        setManualHours("");
        setManualMinutes("");
        setTimerSeconds(0);
        setIsTimerRunning(false);
        loadData();
    };

    if (loading) {
        return <div className="p-8 text-slate-400">Chargement…</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-8 md:p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <Timer className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                        Saisie <span className="text-indigo-400">Rapide des Temps</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                        Timer en temps réel ou saisie manuelle, directement persisté sur la mission sélectionnée.
                    </p>
                </div>
            </div>

            {/* Quick Stats (calculés à partir des vraies saisies) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat icon={Clock} label="Aujourd'hui" value={formatDuration(todayTotal)} color="text-indigo-400" />
                <QuickStat icon={Calendar} label="7 derniers jours" value={formatDuration(weekTotal)} color="text-emerald-400" />
                <QuickStat icon={Target} label="Taux Imputation" value={`${imputationRate}%`} color="text-amber-400" />
                <QuickStat icon={TrendingUp} label="Facturable (7j)" value={formatDuration(billableWeek)} color="text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Timer & Quick Entry */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 text-center shadow-2xl">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Chronomètre en Temps Réel</h3>

                        <div className="mb-10">
                            <div className="text-xl sm:text-2xl lg:text-3xl sm:text-4xl lg:text-6xl font-black text-white font-mono tracking-tight mb-4">
                                {formatTime(timerSeconds)}
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase border",
                                isTimerRunning ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" : "bg-slate-800 text-slate-500 border-slate-700"
                            )}>
                                <div className={cn("w-2 h-2 rounded-full", isTimerRunning ? "bg-emerald-500" : "bg-slate-600")} />
                                {isTimerRunning ? "En cours" : "Arrêté"}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                disabled={!selectedClient}
                                className={cn(
                                    "flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl disabled:opacity-40",
                                    isTimerRunning
                                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                                )}
                            >
                                {isTimerRunning ? <><Pause className="w-5 h-5 inline mr-2" /> Pause</> : <><Play className="w-5 h-5 inline mr-2" /> Démarrer</>}
                            </button>
                            <button
                                onClick={() => saveEntry(timerSeconds / 3600)}
                                disabled={!selectedClient || timerSeconds === 0 || saving}
                                className="px-6 py-5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-2xl font-black uppercase text-xs transition-all border border-white/5"
                            >
                                <Save className="w-4 h-4 inline mr-2" /> Enregistrer
                            </button>
                        </div>

                        {selectedClient ? (
                            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl text-left">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Mission Active</p>
                                <h4 className="text-white font-bold text-sm">{selectedClient.name}</h4>
                                <p className="text-xs text-slate-400">{selectedClient.mission}</p>
                            </div>
                        ) : (
                            <p className="mt-8 text-xs text-slate-500">Sélectionnez une mission à droite pour activer le chronomètre.</p>
                        )}
                    </div>

                    {/* Manual Entry Card */}
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/20">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" /> Saisie Manuelle Express
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Heures</label>
                                    <input
                                        type="number"
                                        value={manualHours}
                                        onChange={(e) => setManualHours(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-white text-center focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Minutes</label>
                                    <input
                                        type="number"
                                        value={manualMinutes}
                                        onChange={(e) => setManualMinutes(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-white text-center focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description de la tâche…"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                            />

                            <button
                                onClick={() => saveEntry((parseFloat(manualHours) || 0) + (parseFloat(manualMinutes) || 0) / 60)}
                                disabled={!selectedClient || saving}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 transition-all"
                            >
                                <Save className="w-4 h-4 inline mr-2" /> {saving ? "Enregistrement…" : "Enregistrer le Temps"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Client/Mission Selection & Recent Entries */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="glass-card p-8 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sélectionner une Mission</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredMissions.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedClient(m)}
                                    className={cn(
                                        "p-6 rounded-3xl border cursor-pointer transition-all group",
                                        selectedClient?.id === m.id
                                            ? "bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                                            : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{m.name}</h4>
                                            </div>
                                        </div>
                                        {selectedClient?.id === m.id && (
                                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{m.mission}</p>
                                </div>
                            ))}
                            {filteredMissions.length === 0 && (
                                <p className="text-sm text-slate-500 col-span-2">Aucune mission ne correspond. Créez-en une depuis <a href="/missions/new" className="text-indigo-400 underline">Nouvelle mission</a>.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Entries */}
                    <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-900/60">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Clock className="w-6 h-6 text-indigo-400" />
                                Saisies d'Aujourd'hui
                            </h3>
                        </div>

                        <div className="divide-y divide-white/5">
                            {todayEntries.map((entry) => (
                                <div key={entry.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{entry.client?.companyName || "—"}</h4>
                                                <span className={cn(
                                                    "px-2 py-0.5 text-[8px] font-black uppercase rounded border",
                                                    entry.category !== "AUTRE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>
                                                    {entry.category !== "AUTRE" ? "Facturable" : entry.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-1">{entry.mission?.title || "—"}</p>
                                            {entry.description && <p className="text-xs text-slate-600 italic">{entry.description}</p>}
                                        </div>
                                        <div className="text-right ml-6">
                                            <div className="text-2xl font-black text-indigo-400 font-mono">{formatDuration(entry.duration)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {todayEntries.length === 0 && (
                                <p className="p-6 text-sm text-slate-500">Aucune saisie aujourd'hui.</p>
                            )}
                        </div>

                        <div className="p-6 bg-slate-900/80 border-t border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Jour</span>
                            </div>
                            <span className="text-xl font-black text-white">{formatDuration(todayTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickStat({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all">
            <div className="flex items-center gap-4">
                <div className={cn("p-3 bg-white/5 rounded-2xl", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
                    <h3 className={cn("text-xl font-black tracking-tight", color)}>{value}</h3>
                </div>
            </div>
        </div>
    );
}
