"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Building2,
    Workflow,
    Plus,
    Clock,
    CheckCircle2,
    Bell,
    Lock,
    Loader2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
    id: string;
    name: string;
    type: string;
    status: string;
    description: string | null;
    client: { companyName: string | null; firstName: string | null; lastName: string | null } | null;
    _count: { members: number; activities: number };
    updatedAt: string;
}
interface Activity {
    id: string;
    action: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
    workspace: { name: string };
}

const TYPE_LABEL: Record<string, string> = { DUE_DILIGENCE: "Due Diligence", LITIGE: "Contentieux", PROJET: "Projet", AUTRE: "Autre" };
const TYPE_COLOR: Record<string, string> = {
    DUE_DILIGENCE: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    LITIGE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    PROJET: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    AUTRE: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function CollaborationWorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", type: "AUTRE", description: "" });
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        fetch("/api/workspaces")
            .then(r => r.json())
            .then(d => { setWorkspaces(d.workspaces ?? []); setActivities(d.recentActivities ?? []); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filteredWorkspaces = workspaces.filter(ws => filterType === "all" || ws.type === filterType);
    const activeCount = workspaces.filter(ws => ws.status === "ACTIF").length;
    const totalMembers = workspaces.reduce((acc, ws) => acc + ws._count.members, 0);

    const clientName = (c: Workspace["client"]) => c ? (c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()) : "—";

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ name: "", type: "AUTRE", description: "" });
                load();
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Workflow className="w-64 h-64 text-cyan-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-cyan-500/20 mb-4 inline-block">
                            Collaboration Client
                        </span>
                        <h2 className="page-title uppercase">
                            Espaces <span className="text-cyan-400">de Collaboration</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Organisez vos dossiers transverses : due diligence, contentieux et projets impliquant plusieurs collaborateurs.
                        </p>
                    </div>

                    <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-cyan-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Nouveau Workspace
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Projets Actifs</p>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400">{activeCount}</span>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Collaborateurs Impliqués</p>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{totalMembers}</span>
                </div>
                <div className="apix-card">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Workspaces</p>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400">{workspaces.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex gap-2 flex-wrap">
                        {["all", "DUE_DILIGENCE", "LITIGE", "PROJET", "AUTRE"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterType === type ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-500 hover:bg-white/10")}
                            >
                                {type === "all" ? "Tous" : TYPE_LABEL[type]}
                            </button>
                        ))}
                    </div>

                    {filteredWorkspaces.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-[32px]">
                            <Workflow className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucun workspace pour le moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredWorkspaces.map(workspace => (
                                <div
                                    key={workspace.id}
                                    className="apix-card transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase border", TYPE_COLOR[workspace.type])}>
                                            {TYPE_LABEL[workspace.type]}
                                        </span>
                                        {workspace.status === "ACTIF" ? (
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-slate-500" />
                                        )}
                                    </div>

                                    <h4 className="text-lg font-black text-white mb-1 line-clamp-2">{workspace.name}</h4>
                                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {clientName(workspace.client)}
                                    </p>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {workspace._count.members}</span>
                                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {workspace._count.activities} activités</span>
                                        </div>
                                        <span className="text-[10px] text-slate-600">{new Date(workspace.updatedAt).toLocaleDateString("fr-FR")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="apix-card">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Bell className="w-4 h-4 text-cyan-400" /> Activité Récente
                        </h3>
                        {activities.length === 0 ? (
                            <p className="text-xs text-slate-500">Aucune activité pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map(activity => (
                                    <div key={activity.id} className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                            {activity.user.firstName[0]}{activity.user.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-300">
                                                <b className="text-white">{activity.user.firstName} {activity.user.lastName}</b> {activity.action}
                                            </p>
                                            <p className="text-[10px] text-slate-600">{activity.workspace.name} • {new Date(activity.createdAt).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm font-black text-white uppercase">Accès Restreint</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                            Chaque workspace n'est visible que par ses membres, ajoutés explicitement par le créateur.
                        </p>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Nouveau Workspace</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Nom du workspace"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
                            />
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                            >
                                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <textarea
                                placeholder="Description (optionnel)"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={saving || !form.name.trim()}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
