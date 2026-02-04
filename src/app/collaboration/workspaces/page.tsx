"use client";

import { useState } from "react";
import {
    Users,
    Building2,
    FileText,
    Workflow,
    Plus,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Bell,
    Upload,
    Download,
    MessageSquare,
    Calendar,
    Sparkles,
    Zap,
    Eye,
    Lock,
    Share2,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
    id: string;
    name: string;
    client: string;
    type: "due-diligence" | "contentieux" | "fiscal" | "corporate";
    status: "active" | "pending" | "completed";
    progress: number;
    lastActivity: string;
    members: number;
    documents: number;
    tasks: { completed: number; total: number };
}

interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
}

const MOCK_WORKSPACES: Workspace[] = [
    {
        id: "WS-001",
        name: "Due Diligence - Acquisition SOGECOM",
        client: "Groupe Atlantic Finances",
        type: "due-diligence",
        status: "active",
        progress: 65,
        lastActivity: "Il y a 2h",
        members: 8,
        documents: 124,
        tasks: { completed: 47, total: 72 }
    },
    {
        id: "WS-002",
        name: "Contentieux OHADA - Recouvrement",
        client: "Banque Internationale CI",
        type: "contentieux",
        status: "active",
        progress: 40,
        lastActivity: "Il y a 5h",
        members: 4,
        documents: 38,
        tasks: { completed: 12, total: 30 }
    },
    {
        id: "WS-003",
        name: "Restructuration Fiscale Q1 2026",
        client: "Dakar Digital City",
        type: "fiscal",
        status: "pending",
        progress: 20,
        lastActivity: "Hier",
        members: 3,
        documents: 15,
        tasks: { completed: 4, total: 20 }
    },
    {
        id: "WS-004",
        name: "AGE + Modification Statuts",
        client: "SENELEC Partners",
        type: "corporate",
        status: "completed",
        progress: 100,
        lastActivity: "Il y a 3j",
        members: 5,
        documents: 28,
        tasks: { completed: 15, total: 15 }
    },
];

const MOCK_ACTIVITIES: Activity[] = [
    { id: "A1", user: "M. Diallo", action: "a uploadé", target: "Rapport Due Diligence v3.pdf", time: "Il y a 15min" },
    { id: "A2", user: "Mme Koné", action: "a commenté", target: "Clause de garantie", time: "Il y a 1h" },
    { id: "A3", user: "Dr. Ndao", action: "a validé", target: "États financiers 2025", time: "Il y a 2h" },
    { id: "A4", user: "M. Kane", action: "a créé", target: "Workflow de signature", time: "Il y a 3h" },
];

export default function HighQPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [filterType, setFilterType] = useState<string>("all");

    const filteredWorkspaces = workspaces.filter(ws =>
        filterType === "all" || ws.type === filterType
    );

    const activeCount = workspaces.filter(ws => ws.status === "active").length;
    const totalDocs = workspaces.reduce((acc, ws) => acc + ws.documents, 0);
    const totalMembers = new Set(workspaces.flatMap(ws => Array(ws.members).fill(0).map((_, i) => `${ws.id}-${i}`))).size;

    const getTypeColor = (type: string) => {
        switch (type) {
            case "due-diligence": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
            case "contentieux": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "fiscal": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "corporate": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "due-diligence": return "Due Diligence";
            case "contentieux": return "Contentieux";
            case "fiscal": return "Fiscal";
            case "corporate": return "Corporate";
            default: return type;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Workflow className="w-64 h-64 text-cyan-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-cyan-500/20">
                                Collaboration Client • Sécurisée
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Collab
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Client <span className="text-cyan-400">Workspaces</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Portails de collaboration sécurisés pour vos dossiers clients. Partagez documents, tâches et workflows en temps réel.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-cyan-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Nouveau Workspace
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Projets Actifs</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-cyan-400">{activeCount}</span>
                        <Zap className="w-5 h-5 text-cyan-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Documents Partagés</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{totalDocs}</span>
                        <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Collaborateurs</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{totalMembers}</span>
                        <Users className="w-5 h-5 text-slate-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Taux Complétion</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-400">
                            {Math.round(workspaces.reduce((acc, ws) => acc + ws.progress, 0) / workspaces.length)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Workspaces Grid */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filters */}
                    <div className="flex gap-2">
                        {["all", "due-diligence", "contentieux", "fiscal", "corporate"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterType === type
                                        ? "bg-cyan-500 text-white"
                                        : "bg-white/5 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                {type === "all" ? "Tous" : getTypeLabel(type)}
                            </button>
                        ))}
                    </div>

                    {/* Workspace Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredWorkspaces.map(workspace => (
                            <div
                                key={workspace.id}
                                onClick={() => setSelectedWorkspace(workspace)}
                                className={cn(
                                    "glass-card rounded-3xl border p-6 transition-all cursor-pointer hover:scale-[1.02]",
                                    workspace.status === "active" ? "border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/5" :
                                        workspace.status === "completed" ? "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5" :
                                            "border-white/5 hover:border-white/20 bg-slate-900/40"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase border", getTypeColor(workspace.type))}>
                                        {getTypeLabel(workspace.type)}
                                    </span>
                                    {workspace.status === "completed" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : workspace.status === "active" ? (
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-slate-500" />
                                    )}
                                </div>

                                <h4 className="text-lg font-black text-white mb-1 line-clamp-2">{workspace.name}</h4>
                                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> {workspace.client}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Progression</span>
                                        <span className="font-bold text-white">{workspace.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all",
                                                workspace.progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
                                            )}
                                            style={{ width: `${workspace.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {workspace.members}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {workspace.documents}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {workspace.tasks.completed}/{workspace.tasks.total}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-600">{workspace.lastActivity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Activity Feed */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Bell className="w-4 h-4 text-cyan-400" /> Activité Récente
                        </h3>
                        <div className="space-y-4">
                            {MOCK_ACTIVITIES.map(activity => (
                                <div key={activity.id} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                        {activity.user.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-300">
                                            <b className="text-white">{activity.user}</b> {activity.action} <span className="text-cyan-400">{activity.target}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-600">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Actions Rapides</h3>
                        <div className="space-y-2">
                            {[
                                { icon: Upload, label: "Uploader Documents", color: "text-cyan-400" },
                                { icon: MessageSquare, label: "Nouveau Message", color: "text-indigo-400" },
                                { icon: Calendar, label: "Planifier Réunion", color: "text-amber-400" },
                                { icon: Share2, label: "Inviter Collaborateur", color: "text-emerald-400" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                                >
                                    <action.icon className={cn("w-4 h-4", action.color)} />
                                    <span className="text-sm text-slate-300">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="glass-card rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm font-black text-white uppercase">Sécurité</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                            Tous les échanges sont chiffrés de bout en bout. Conformité RGPD et OHADA garantie.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
