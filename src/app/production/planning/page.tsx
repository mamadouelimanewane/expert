"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Users,
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertCircle,
    Plus,
    LayoutGrid,
    Target,
    Loader2,
    X,
    ListChecks
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AllocUser { id: string; firstName: string; lastName: string; role: string }
interface AllocTask { id: string; title: string; status: string }
interface AllocMission { id: string; title: string; client: { companyName: string | null; firstName: string | null; lastName: string | null } | null }

interface Allocation {
    id: string;
    weekStart: string;
    dayOfWeek: number;
    durationHours: number;
    capacityHours: number;
    user: AllocUser;
    task: AllocTask | null;
    mission: AllocMission | null;
}

interface TaskOption {
    id: string;
    title: string;
    dueDate: string | null;
    mission: AllocMission | null;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

function getMonday(d: Date) {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + diff);
    return date;
}

function clientLabel(client: AllocMission["client"]) {
    if (!client) return "";
    return client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();
}

export default function ResourcesPlanning() {
    const [weekStartISO, setWeekStartISO] = useState<string>(() => getMonday(new Date()).toISOString());
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [users, setUsers] = useState<AllocUser[]>([]);
    const [tasks, setTasks] = useState<TaskOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ userId: "", dayOfWeek: "0", durationHours: "4", capacityHours: "8", taskId: "" });
    const [saving, setSaving] = useState(false);
    const [prefillTaskId, setPrefillTaskId] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetch(`/api/planning?weekStart=${encodeURIComponent(weekStartISO)}`)
            .then((r) => r.json())
            .then((d) => {
                setAllocations(d.allocations || []);
                setUsers(d.users || []);
                setTasks(d.tasks || []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [weekStartISO]);

    const weekLabel = useMemo(() => {
        const start = new Date(weekStartISO);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 4);
        const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", timeZone: "UTC" });
        return `${fmt(start)} — ${fmt(end)}`;
    }, [weekStartISO]);

    const shiftWeek = (deltaDays: number) => {
        const d = new Date(weekStartISO);
        d.setUTCDate(d.getUTCDate() + deltaDays);
        setWeekStartISO(getMonday(d).toISOString());
    };

    const cellAllocations = (userId: string, day: number) =>
        allocations.filter((a) => a.user.id === userId && a.dayOfWeek === day);

    const userOccupancy = (userId: string) => {
        const userAllocs = allocations.filter((a) => a.user.id === userId);
        if (userAllocs.length === 0) return { pct: 0, hasData: false };
        const totalHours = userAllocs.reduce((s, a) => s + a.durationHours, 0);
        const byDay = new Map<number, number>();
        userAllocs.forEach((a) => byDay.set(a.dayOfWeek, Math.max(byDay.get(a.dayOfWeek) || 0, a.capacityHours)));
        const capacityTotal = Array.from(byDay.values()).reduce((s, c) => s + c, 0) || userAllocs.length * 8;
        return { pct: Math.min(200, Math.round((totalHours / capacityTotal) * 100)), hasData: true };
    };

    const overloads = useMemo(() => {
        const map = new Map<string, { userId: string; userName: string; day: number; total: number; capacity: number }>();
        for (const a of allocations) {
            const key = `${a.user.id}-${a.dayOfWeek}`;
            const existing = map.get(key);
            if (existing) {
                existing.total += a.durationHours;
                existing.capacity = Math.max(existing.capacity, a.capacityHours);
            } else {
                map.set(key, { userId: a.user.id, userName: `${a.user.firstName} ${a.user.lastName}`, day: a.dayOfWeek, total: a.durationHours, capacity: a.capacityHours });
            }
        }
        return Array.from(map.values()).filter((v) => v.total > v.capacity);
    }, [allocations]);

    const averageOccupancy = useMemo(() => {
        const withData = users.map((u) => userOccupancy(u.id)).filter((o) => o.hasData);
        if (withData.length === 0) return null;
        return Math.round(withData.reduce((s, o) => s + o.pct, 0) / withData.length);
    }, [users, allocations]);

    const unallocatedTasks = useMemo(() => {
        const allocatedTaskIds = new Set(allocations.map((a) => a.task?.id).filter(Boolean));
        return tasks.filter((t) => !allocatedTaskIds.has(t.id)).slice(0, 6);
    }, [tasks, allocations]);

    const openModalForTask = (taskId?: string) => {
        setPrefillTaskId(taskId || null);
        setForm({ userId: "", dayOfWeek: "0", durationHours: "4", capacityHours: "8", taskId: taskId || "" });
        setShowModal(true);
    };

    const handleAllocate = async () => {
        if (!form.userId || !form.durationHours) return;
        setSaving(true);
        try {
            await fetch("/api/planning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weekStart: weekStartISO,
                    dayOfWeek: parseInt(form.dayOfWeek, 10),
                    durationHours: form.durationHours,
                    capacityHours: form.capacityHours,
                    userId: form.userId,
                    taskId: form.taskId || null,
                    missionId: form.taskId ? tasks.find((t) => t.id === form.taskId)?.mission?.id || null : null,
                }),
            });
            setShowModal(false);
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (id: string) => {
        await fetch(`/api/planning?id=${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <CalendarIcon className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                                Resource Management (GPAO)
                            </span>
                        </div>
                        <h2 className="page-title leading-tight">
                            Planning & <span className="text-primary">Charge de Travail</span>
                        </h2>
                        <p className="page-subtitle">
                            Visualisez et allouez la charge réelle de vos collaborateurs, semaine par semaine.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="tabs-scroll flex items-center gap-3 p-1.5 bg-slate-800 border border-white/5 rounded-2xl">
                            <button onClick={() => shiftWeek(-7)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="text-xs font-black text-white uppercase tracking-widest px-4">{weekLabel}</span>
                            <button onClick={() => shiftWeek(7)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <button onClick={() => openModalForTask()} className="px-8 py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95">
                            <Plus className="w-5 h-5" /> Allouer Ressource
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Resource Grid */}
                    <div className="lg:col-span-12 apix-card flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <LayoutGrid className="w-6 h-6 text-primary" />
                                Vue Hebdomadaire des Équipes
                            </h3>
                        </div>

                        {users.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-12">Aucun collaborateur actif trouvé.</p>
                        ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                <div className="grid grid-cols-6 grid-keep gap-4 mb-8">
                                    <div className="col-span-1" />
                                    {DAYS.map(day => (
                                        <div key={day} className="text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{day}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {users.map(user => {
                                        const occ = userOccupancy(user.id);
                                        return (
                                        <div key={user.id} className="grid grid-cols-6 grid-keep gap-4 items-start">
                                            <div className="col-span-1 flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-sm font-black text-white border border-white/5">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-white truncate w-24 uppercase">{user.firstName} {user.lastName}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden w-16">
                                                            <div className={cn("h-full", occ.pct > 100 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, occ.pct)}%` }} />
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-500">{occ.hasData ? `${occ.pct}%` : "—"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {[0, 1, 2, 3, 4].map((day) => {
                                                const cell = cellAllocations(user.id, day);
                                                const total = cell.reduce((s, a) => s + a.durationHours, 0);
                                                const capacity = cell.length ? Math.max(...cell.map((a) => a.capacityHours)) : 8;
                                                const isOverloaded = total > capacity;
                                                return (
                                                    <div key={day} className={cn(
                                                        "col-span-1 min-h-[64px] rounded-2xl border p-1.5 flex flex-col gap-1",
                                                        isOverloaded ? "border-rose-500/30 bg-rose-500/5" : "border-white/5 bg-white/[0.01]"
                                                    )}>
                                                        {cell.length === 0 ? (
                                                            <span className="text-[9px] text-slate-700 text-center py-4">—</span>
                                                        ) : cell.map((a) => (
                                                            <div key={a.id} onClick={() => handleRemove(a.id)} title="Cliquer pour retirer" className={cn(
                                                                "rounded-lg px-1.5 py-1 cursor-pointer hover:opacity-70 transition-all",
                                                                isOverloaded ? "bg-rose-500/10 text-rose-300" : "bg-primary/10 text-primary-foreground/70"
                                                            )}>
                                                                <p className="text-[8px] font-black uppercase tracking-tighter truncate">{a.mission?.title || a.task?.title || "Allocation"}</p>
                                                                <p className="text-[7px] font-bold opacity-70">{a.durationHours}h</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Overload / charge summary */}
                        <div className="mt-12 p-8 bg-primary/5 border border-primary/10 rounded-[32px] flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-4 rounded-2xl", overloads.length > 0 ? "bg-rose-600" : "bg-primary")}>
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">Analyse de Charge</h4>
                                    {allocations.length === 0 ? (
                                        <p className="text-slate-400 text-xs font-medium">Aucune allocation enregistrée cette semaine — le tableau de charge sera calculé automatiquement dès que des ressources seront allouées.</p>
                                    ) : overloads.length === 0 ? (
                                        <p className="text-slate-400 text-xs font-medium">Aucune surcharge détectée cette semaine : la charge de chaque collaborateur reste sous sa capacité déclarée.</p>
                                    ) : (
                                        <p className="text-rose-300 text-xs font-medium">
                                            {overloads.map((o) => `${o.userName} : ${o.total}h allouées ${DAYS[o.day]?.toLowerCase()} (capacité ${o.capacity}h)`).join(" · ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="apix-card">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" /> Taux d'Occupation Équipe
                            </h3>
                            <div className="flex items-center justify-center p-6 border-b border-white/5 mb-6">
                                <div className="text-center">
                                    <p className="text-2xl sm:text-3xl lg:text-5xl font-black text-white">{averageOccupancy !== null ? `${averageOccupancy}%` : "—"}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">
                                        {averageOccupancy !== null ? "Moyenne cette semaine" : "Aucune donnée cette semaine"}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {users.slice(0, 4).map((u) => {
                                    const occ = userOccupancy(u.id);
                                    return (
                                        <div key={u.id} className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{u.firstName} {u.lastName}</span>
                                            <span className={cn("text-xs font-black", occ.pct > 100 ? "text-rose-400" : "text-emerald-400")}>{occ.hasData ? `${occ.pct}%` : "—"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="apix-card">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-amber-400" /> Tâches non allouées
                            </h3>
                            <div className="space-y-3">
                                {unallocatedTasks.length === 0 ? (
                                    <p className="text-[10px] text-slate-500">Toutes les tâches ouvertes sont allouées, ou aucune tâche ouverte n'existe.</p>
                                ) : unallocatedTasks.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-white truncate">{t.title}</p>
                                            <p className="text-[8px] text-slate-500 uppercase truncate">{t.mission?.title} {t.mission?.client ? `· ${clientLabel(t.mission.client)}` : ""}</p>
                                        </div>
                                        <button onClick={() => openModalForTask(t.id)} className="shrink-0 p-2 bg-primary hover:brightness-110 rounded-lg text-white">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Allouer une Ressource</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Sélectionner un collaborateur…</option>
                                {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                            </select>
                            <select value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Tâche (optionnel)</option>
                                {tasks.map((t) => (
                                    <option key={t.id} value={t.id}>{t.title} {t.mission ? `— ${t.mission.title}` : ""}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                                <input type="number" step="0.5" placeholder="Heures" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input type="number" step="0.5" placeholder="Capacité/jour" value={form.capacityHours} onChange={(e) => setForm({ ...form, capacityHours: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <button onClick={handleAllocate} disabled={saving} className="w-full py-3 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Allouer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
