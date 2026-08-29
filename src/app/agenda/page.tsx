"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    Video,
    FileText,
    Clock,
    UserPlus,
    MoreVertical,
    Loader2,
    Save,
    Plus,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Meeting {
    id: string;
    title: string;
    description: string | null;
    client: string;
    startTime: string;
    endTime: string;
    type: "VIRTUELLE" | "PRESENTIEL";
    status: "PLANIFIE" | "TERMINE" | "ANNULE";
    location: string | null;
    meetingUrl: string | null;
    notes: string | null;
    reportGenerated: boolean;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function AgendaPage() {
    const [meetings, setMeetings] = useState<Meeting[] | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [clientsList, setClientsList] = useState<{ id: string; name: string }[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "",
        clientId: "",
        type: "VIRTUELLE" as "VIRTUELLE" | "PRESENTIEL",
        date: new Date().toISOString().slice(0, 10),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        meetingUrl: "",
    });

    const loadMeetings = (): Promise<Meeting[]> => {
        return fetch("/api/meetings")
            .then((r) => r.json())
            .then((data) => {
                const list: Meeting[] = (data.meetings || []).map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    client: m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim() || "—",
                    startTime: m.startTime,
                    endTime: m.endTime,
                    type: m.type,
                    status: m.status,
                    location: m.location,
                    meetingUrl: m.meetingUrl,
                    notes: m.notes,
                    reportGenerated: m.reportGenerated,
                }));
                setMeetings(list);
                return list;
            })
            .catch(() => {
                setMeetings([]);
                return [];
            });
    };

    useEffect(() => {
        loadMeetings().then((list) => {
            if (list && list.length > 0) {
                setSelectedId(list[0].id);
                setNotes(list[0].notes || "");
            }
        });
        fetch("/api/clients?limit=200&isActive=true")
            .then((r) => r.json())
            .then((data) => {
                setClientsList(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        name: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            })
            .catch(() => setClientsList([]));
    }, []);

    const handleCreateMeeting = async () => {
        if (!form.title.trim()) {
            setCreateError("Le titre est obligatoire.");
            return;
        }
        const startTime = new Date(`${form.date}T${form.startTime}`);
        const endTime = new Date(`${form.date}T${form.endTime}`);
        if (endTime <= startTime) {
            setCreateError("L'heure de fin doit être après l'heure de début.");
            return;
        }
        setCreating(true);
        setCreateError(null);
        try {
            const res = await fetch("/api/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    type: form.type,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    location: form.type === "PRESENTIEL" ? form.location || undefined : undefined,
                    meetingUrl: form.type === "VIRTUELLE" ? form.meetingUrl || undefined : undefined,
                    clientId: form.clientId || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setCreateError(data.error || "Échec de la création.");
                return;
            }
            setShowCreate(false);
            setForm({ title: "", clientId: "", type: "VIRTUELLE", date: new Date().toISOString().slice(0, 10), startTime: "09:00", endTime: "10:00", location: "", meetingUrl: "" });
            loadMeetings().then(() => {
                setSelectedId(data.meeting.id);
                setNotes("");
            });
        } catch (e) {
            console.error(e);
            setCreateError("Erreur de connexion au serveur.");
        } finally {
            setCreating(false);
        }
    };

    const selectedMeeting = meetings?.find((m) => m.id === selectedId) || null;

    const handleSelect = (m: Meeting) => {
        setSelectedId(m.id);
        setNotes(m.notes || "");
        setSaved(false);
    };

    const handleSaveNotes = async () => {
        if (!selectedMeeting) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/meetings/${selectedMeeting.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                const { meeting } = await res.json();
                setMeetings((prev) =>
                    prev ? prev.map((m) => (m.id === meeting.id ? { ...m, notes: meeting.notes, reportGenerated: meeting.reportGenerated } : m)) : prev
                );
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } finally {
            setSaving(false);
        }
    };

    // Calendrier réel du mois en cours, avec pastilles sur les jours ayant une réunion
    const now = new Date();
    const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const todayDate = now.getDate();

    const daysWithMeetings = useMemo(() => {
        const set = new Set<number>();
        (meetings || []).forEach((m) => {
            const d = new Date(m.startTime);
            if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
                set.add(d.getDate());
            }
        });
        return set;
    }, [meetings]);

    if (!meetings) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Mobile Header */}
            <div className="lg:hidden">
                <h2 className="page-title flex items-center gap-3">
                    <CalendarIcon className="w-6 h-6 text-indigo-400" />
                    Agenda Partagé
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)]">
                {/* Sidebar: Calendar & List */}
                <div className="w-full lg:w-96 flex flex-col gap-4 sm:gap-6">
                    {/* Calendar Widget (mois courant, réel) */}
                    <div className="apix-card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white capitalize">{monthLabel}</h3>
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm">
                            {WEEKDAYS.map((d, i) => <span key={i} className="text-slate-500 text-[10px] sm:text-xs">{d}</span>)}
                            {Array.from({ length: daysInMonth }, (_, i) => (
                                <div key={i} className={cn(
                                    "p-1 sm:p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors relative text-xs sm:text-sm",
                                    i + 1 === todayDate ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30" : "text-slate-300"
                                )}>
                                    {i + 1}
                                    {daysWithMeetings.has(i + 1) && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meetings List */}
                    <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
                        <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between gap-2">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Réunions ({meetings.length})
                            </h3>
                            <button
                                onClick={() => { setShowCreate(true); setCreateError(null); }}
                                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                title="Nouvelle réunion"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {meetings.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-10">Aucune réunion planifiée.</p>
                            )}
                            {meetings.map(meeting => (
                                <div
                                    key={meeting.id}
                                    onClick={() => handleSelect(meeting)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedId === meeting.id
                                            ? "bg-indigo-500/10 border-indigo-500/50"
                                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-white text-sm">
                                            {new Date(meeting.startTime).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} · {new Date(meeting.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                                            meeting.type === "VIRTUELLE" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>{meeting.type === "VIRTUELLE" ? "virtuelle" : "présentiel"}</span>
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-200 truncate">{meeting.title}</h4>
                                    <p className="text-xs text-slate-500 truncate">{meeting.client}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Meeting Room / Notes */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-h-[600px] lg:min-h-0">
                    {selectedMeeting ? (
                        <>
                            {/* Header Card */}
                            <div className="apix-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedMeeting.title}</h2>
                                        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                                            {new Date(selectedMeeting.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – {new Date(selectedMeeting.endTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        {selectedMeeting.client}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
                                    {selectedMeeting.type === "VIRTUELLE" && selectedMeeting.meetingUrl && (
                                        <a
                                            href={selectedMeeting.meetingUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 text-sm sm:text-base"
                                        >
                                            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline">Rejoindre la visio</span>
                                            <span className="sm:hidden">Visio</span>
                                        </a>
                                    )}
                                    <button disabled title="Non implémenté" className="p-2.5 bg-slate-800/50 text-slate-600 rounded-xl border border-slate-700 cursor-not-allowed">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Notes Editor (compte-rendu manuel réel) */}
                            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
                                <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                                    <h3 className="text-sm font-medium text-indigo-400">
                                        Compte Rendu de Réunion
                                    </h3>
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={saving}
                                        className="px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1 sm:gap-2 transition-all whitespace-nowrap"
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {saved ? "Enregistré" : "Enregistrer"}
                                    </button>
                                </div>

                                <div className="flex-1 p-4 sm:p-6 bg-slate-900/30 overflow-hidden">
                                    <div className="h-full flex flex-col gap-4">
                                        <textarea
                                            className="flex-1 w-full h-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-6 text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-mono text-xs sm:text-sm"
                                            placeholder="Rédigez ici les notes et le compte-rendu de la réunion (points abordés, décisions, prochaines étapes)…"
                                            value={notes}
                                            onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
                                        />

                                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                                            <p className="text-[10px] text-slate-500 mr-auto self-center">
                                                Rédaction manuelle — la génération automatique par IA n'est pas disponible.
                                            </p>
                                            <button disabled title="Non implémenté : aucun moteur de génération PDF n'est encore connecté" className="px-4 py-2 bg-slate-800/50 text-slate-600 rounded-lg text-xs sm:text-sm font-medium border border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed">
                                                <FileText className="w-4 h-4" />
                                                Exporter PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>Sélectionnez une réunion pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modale : nouvelle réunion (POST /api/meetings réel) */}
            {showCreate && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Nouvelle réunion</h3>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">{createError}</div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Titre *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ex: Revue trimestrielle"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Client (optionnel)</label>
                                <select
                                    value={form.clientId}
                                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="">Aucun</option>
                                    {clientsList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">Début</label>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">Fin</label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setForm({ ...form, type: "VIRTUELLE" })}
                                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold border transition-all", form.type === "VIRTUELLE" ? "bg-purple-600/20 border-purple-500/50 text-purple-300" : "bg-slate-800 border-slate-700 text-slate-400")}
                                    >
                                        Virtuelle
                                    </button>
                                    <button
                                        onClick={() => setForm({ ...form, type: "PRESENTIEL" })}
                                        className={cn("flex-1 py-2 rounded-lg text-xs font-bold border transition-all", form.type === "PRESENTIEL" ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-400")}
                                    >
                                        Présentiel
                                    </button>
                                </div>
                            </div>

                            {form.type === "VIRTUELLE" ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">Lien de visio (optionnel)</label>
                                    <input
                                        type="text"
                                        value={form.meetingUrl}
                                        onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">Lieu (optionnel)</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        placeholder="Ex: Siège, bureau du client..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateMeeting}
                                disabled={creating}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
