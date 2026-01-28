import prisma from "@/lib/prisma";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Plus,
    ArrowRight,
    Briefcase,
    Calendar,
    Search,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mission, Client, User } from "@prisma/client";

type MissionWithRelations = Mission & { client: Client | null; assignedTo: User | null };

export default async function MissionsPage() {
    // Récupération des missions de la DB
    const missions = await prisma.mission.findMany({
        include: {
            client: true,
            assignedTo: true
        },
        orderBy: {
            deadline: 'asc'
        }
    });

    // Organisation en colonnes pour le Kanban (statuts du schéma Prisma)
    const columns = [
        { id: "todo", title: "À Faire / Draft", color: "bg-slate-500", status: "DRAFT" },
        { id: "in-progress", title: "En Cours", color: "bg-indigo-500", status: "IN_PROGRESS" },
        { id: "review", title: "Révision Expert", color: "bg-amber-500", status: "PENDING_REVIEW" },
        { id: "done", title: "Terminé / Archivé", color: "bg-emerald-500", status: "COMPLETED" }
    ];

    const getMissionsForStatus = (status: string) => {
        return missions.filter((m: MissionWithRelations) => m.status === status);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header Premium */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Briefcase className="w-10 h-10 text-indigo-500" />
                        Management des Missions
                    </h2>
                    <p className="text-slate-400 mt-1 font-medium">Pilotage de la production comptable et suivi des échéances légales.</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher une mission..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95">
                        <Plus className="w-5 h-5" />
                        Nouvelle Misson
                    </button>
                </div>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="flex gap-6 h-full min-w-[1200px]">
                    {columns.map((col) => {
                        const colMissions = getMissionsForStatus(col.status);

                        return (
                            <div key={col.id} className="w-80 flex flex-col gap-5">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", col.color)} />
                                        <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">{col.title}</h3>
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-white/5">{colMissions.length}</span>
                                    </div>
                                    <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Tasks List */}
                                <div className="flex-1 bg-slate-900/40 rounded-[32px] p-3 space-y-4 overflow-y-auto border border-white/5 shadow-inner backdrop-blur-sm">
                                    {colMissions.length > 0 ? colMissions.map((mission: MissionWithRelations) => (
                                        <div key={mission.id} className="group p-5 bg-slate-800/50 hover:bg-slate-800/80 rounded-2xl border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/10 relative overflow-hidden">
                                            {/* Accent Gradient */}
                                            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50", col.color)} />

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">
                                                        #{mission.id.slice(-4)}
                                                    </span>
                                                </div>
                                                <button className="text-slate-600 hover:text-white transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors text-sm sm:text-base leading-tight">{mission.title}</h4>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                                <div className="w-1 h-1 bg-slate-600 rounded-full" />
                                                {mission.client?.companyName}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                                                    mission.deadline && new Date(mission.deadline) < new Date() ? "text-rose-400" : "text-amber-400"
                                                )}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {mission.deadline ? format(new Date(mission.deadline), 'dd MMM yyyy', { locale: fr }) : 'Pas d\'échéance'}
                                                </div>

                                                <div className="flex -space-x-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[8px] font-black text-white shadow-xl">
                                                        {mission.assignedTo?.firstName?.[0] || 'A'}
                                                    </div>
                                                    <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-[8px] font-black text-white shadow-xl">
                                                        AI
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-[28px] flex flex-col items-center justify-center text-slate-600 gap-2">
                                            <Briefcase className="w-6 h-6 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Aucun dossier</span>
                                        </div>
                                    )}

                                    {/* Quick Add Button at bottom of column */}
                                    <button className="w-full py-4 border border-dashed border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition-all">
                                        + Ajouter une étape
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

