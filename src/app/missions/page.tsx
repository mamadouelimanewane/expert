export const dynamic = 'force-dynamic';

import Link from "next/link";
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
import { Mission, Client, User } from "@/types/prisma";

type MissionWithRelations = Mission & { client: Client | null; assignedTo: User | null };

export default async function MissionsPage({ searchParams }: { searchParams?: Promise<{ q?: string; type?: string; clientId?: string }> }) {
    const params = (await searchParams) ?? {};
    const q = params.q?.trim() ?? "";
    const type = params.type?.trim() ?? "";
    const filtreClientId = params.clientId?.trim() ?? "";

    // Récupération des missions de la DB
    const allMissions = await prisma.mission.findMany({
        where: {
            ...(type ? { type: type as Mission["type"] } : {}),
            ...(filtreClientId ? { clientId: filtreClientId } : {}),
        },
        include: {
            client: true,
            assignedTo: true
        },
        orderBy: {
            deadline: 'asc'
        }
    });

    // La recherche était auparavant un champ sans onChange, purement decoratif.
    const missions = q
        ? allMissions.filter((m: MissionWithRelations) => {
              const clientName = m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim();
              return m.title.toLowerCase().includes(q.toLowerCase()) || clientName.toLowerCase().includes(q.toLowerCase());
          })
        : allMissions;

    // Organisation en colonnes pour le Kanban (statuts du schéma Prisma)
    const columns = [
        { id: "todo", title: "À Faire / Draft", color: "bg-slate-500", status: "DRAFT" },
        { id: "in-progress", title: "En Cours", color: "bg-primary", status: "IN_PROGRESS" },
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
                    <h2 className="page-title flex items-center gap-3 text-xl sm:text-2xl font-bold">
                        <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        Management des Missions
                    </h2>
                    <p className="page-subtitle text-sm text-muted-foreground mt-1">Pilotage de la production comptable et suivi des échéances légales.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <form className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Rechercher une mission..."
                            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-card border border-border rounded-xl sm:rounded-2xl text-sm text-foreground focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </form>
                    <Link href="/missions/new" className="px-5 py-2.5 sm:py-3 bg-primary hover:brightness-110 text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Nouvelle Mission
                    </Link>
                </div>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
                <div className="flex gap-4 sm:gap-6 h-full min-w-[320px] sm:min-w-[1200px]">
                    {columns.map((col) => {
                        const colMissions = getMissionsForStatus(col.status);

                        return (
                            <div key={col.id} className="w-72 sm:w-80 flex-shrink-0 flex flex-col gap-4">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", col.color)} />
                                        <h3 className="font-extrabold text-foreground uppercase tracking-wider text-xs">{col.title}</h3>
                                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{colMissions.length}</span>
                                    </div>
                                    <button disabled title="Non implémenté" className="p-1 rounded-lg text-muted-foreground cursor-not-allowed opacity-50">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Tasks List */}
                                <div className="flex-1 bg-muted/40 rounded-2xl sm:rounded-3xl p-3 space-y-3 sm:space-y-4 overflow-y-auto border border-border/60">
                                    {colMissions.length > 0 ? colMissions.map((mission: MissionWithRelations) => (
                                        <div key={mission.id} className="group p-4 sm:p-5 bg-card hover:bg-card/90 rounded-xl sm:rounded-2xl border border-border hover:border-primary/40 cursor-pointer transition-all shadow-sm hover:shadow-md relative overflow-hidden">
                                            {/* Accent Gradient */}
                                            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60", col.color)} />

                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider border border-primary/20">
                                                        #{mission.id.slice(-4)}
                                                    </span>
                                                </div>
                                                <button disabled title="Non implémenté" className="text-muted-foreground opacity-50 cursor-not-allowed">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">{mission.title}</h4>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full inline-block" />
                                                {mission.client?.companyName}
                                            </span>

                                            <div className="flex items-center justify-between pt-3 border-t border-border/60">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                                                    mission.deadline && new Date(mission.deadline) < new Date() ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                                                )}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {mission.deadline ? format(new Date(mission.deadline), 'dd MMM yyyy', { locale: fr }) : 'Pas d\'échéance'}
                                                </div>

                                                {mission.assignedTo && (
                                                    <div
                                                        className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
                                                        title={[mission.assignedTo.firstName, mission.assignedTo.lastName].filter(Boolean).join(" ")}
                                                    >
                                                        {mission.assignedTo.firstName?.[0] || 'A'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-32 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                                            <Briefcase className="w-6 h-6 opacity-40" />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Aucun dossier</span>
                                        </div>
                                    )}

                                    {/* Quick Add Button at bottom of column */}
                                    <Link href="/missions/new" className="w-full py-3 border border-dashed border-border hover:border-primary/40 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                                        + Nouvelle Mission
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}




