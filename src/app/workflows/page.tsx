"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle2,
    Clock,
    Layers,
    Activity,
    UserCheck,
    Loader2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowMission {
    id: string;
    client: string;
    mission: string;
    status: string;
    uiStatus: "Normal" | "Urgent" | "En retard" | "Terminé" | "Annulé";
    collaborator: string;
    daysActive: number;
    deadline: string | null;
}

interface WorkflowColumn {
    status: string;
    title: string;
    missions: WorkflowMission[];
}

interface WorkflowData {
    columns: WorkflowColumn[];
    cancelledCount: number;
    total: number;
}

const COLUMN_ICONS: Record<string, any> = {
    DRAFT: FileText,
    IN_PROGRESS: Activity,
    PENDING_REVIEW: UserCheck,
    COMPLETED: CheckCircle2,
};

const COLUMN_STYLES: Record<string, string> = {
    DRAFT: "border-slate-800 bg-slate-900/10",
    IN_PROGRESS: "border-indigo-500/10 bg-indigo-500/[0.02]",
    PENDING_REVIEW: "border-amber-500/10 bg-amber-500/[0.02]",
    COMPLETED: "border-emerald-500/10 bg-emerald-500/[0.02]",
};

export default function AutomationPage() {
    const [data, setData] = useState<WorkflowData | null>(null);

    useEffect(() => {
        fetch("/api/workflows")
            .then((r) => r.json())
            .then(setData)
            .catch(() => setData({ columns: [], cancelledCount: 0, total: 0 }));
    }, []);

    if (!data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                <div>
                    <h2 className="page-title flex items-center gap-4">
                        <Layers className="w-10 h-10 text-cyan-400" />
                        Pipeline de Mission
                    </h2>
                    <p className="page-subtitle">
                        Suivi en temps réel de la production comptable. Gérez les cycles de validation
                        du collaborateur à l'expert-comptable signataire.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-slate-800 rounded-2xl text-sm font-black text-white flex items-center gap-2">
                        <span className="text-cyan-400">{data.total}</span> missions
                    </div>
                    {data.cancelledCount > 0 && (
                        <div className="px-6 py-3 bg-slate-800/60 rounded-2xl text-sm font-black text-slate-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            {data.cancelledCount} annulée{data.cancelledCount > 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {data.columns.map((col) => (
                    <PipelineColumn
                        key={col.status}
                        title={col.title}
                        count={col.missions.length}
                        icon={COLUMN_ICONS[col.status] || FileText}
                        className={COLUMN_STYLES[col.status] || "border-slate-800 bg-slate-900/10"}
                    >
                        {col.missions.length === 0 && (
                            <p className="text-center text-slate-600 text-xs py-8">Aucune mission</p>
                        )}
                        {col.missions.map((m) => <MissionCard key={m.id} mission={m} />)}
                    </PipelineColumn>
                ))}
            </div>
        </div>
    );
}

function PipelineColumn({ title, count, icon: Icon, children, className }: any) {
    return (
        <div className={cn("flex flex-col min-h-[350px] sm:h-[450px] lg:h-[600px] rounded-3xl border border-white/5 p-4 overflow-y-auto", className)}>
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{title}</h3>
                </div>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
            </div>
            <div className="space-y-4 flex-1">
                {children}
            </div>
        </div>
    );
}

function MissionCard({ mission }: { mission: WorkflowMission }) {
    return (
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:scale-[1.02] transition-all group shadow-xl">
            <div className="flex justify-between items-start mb-3">
                <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                    mission.uiStatus === "Urgent" ? "bg-rose-500 text-white" :
                        mission.uiStatus === "En retard" ? "bg-amber-500 text-slate-900" :
                            mission.uiStatus === "Terminé" ? "bg-emerald-500 text-white" :
                                mission.uiStatus === "Annulé" ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-400"
                )}>
                    {mission.uiStatus}
                </span>
            </div>
            <h4 className="font-extrabold text-white text-sm line-clamp-1">{mission.client}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{mission.mission}</p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                        {mission.collaborator[0] || "?"}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span>{mission.daysActive}j</span>
                </div>
            </div>

            {mission.deadline && (
                <p className="mt-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    Échéance : {new Date(mission.deadline).toLocaleDateString("fr-FR")}
                </p>
            )}
        </div>
    );
}
