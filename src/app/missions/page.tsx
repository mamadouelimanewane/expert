"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Plus,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "Haute" | "Moyenne" | "Basse";

interface Task {
    id: string;
    title: string;
    client: string;
    deadline: string;
    priority: Priority;
    tags: string[];
}

interface Column {
    id: string;
    title: string;
    tasks: Task[];
    color: string;
}

const initialColumns: Column[] = [
    {
        id: "todo",
        title: "À Faire / Reçu",
        color: "bg-slate-500",
        tasks: [
            { id: "1", title: "Réception pièces comptables", client: "Traoré Import-Export", deadline: "Demain", priority: "Haute", tags: ["Saisie", "Juin"] },
            { id: "2", title: "Questionnaire Onboarding", client: "Boulangerie du Plateau", deadline: "30 Juin", priority: "Moyenne", tags: ["Juridique"] },
        ]
    },
    {
        id: "in-progress",
        title: "En Cours / Saisie",
        color: "bg-indigo-500",
        tasks: [
            { id: "3", title: "Déclaration TVA Mensuelle", client: "Société Ivoirienne de Banque", deadline: "15 Juin", priority: "Haute", tags: ["Fiscal", "Urgent"] },
        ]
    },
    {
        id: "review",
        title: "Révision Expert",
        color: "bg-amber-500",
        tasks: [
            { id: "4", title: "Validation Liasse Fiscale", client: "Tech Solutions Bénin", deadline: "20 Juin", priority: "Haute", tags: ["Bilan", "2023"] },
        ]
    },
    {
        id: "done",
        title: "Terminé / Archivé",
        color: "bg-emerald-500",
        tasks: [
            { id: "5", title: "Lettre de Mission signée", client: "Boulangerie du Plateau", deadline: "-", priority: "Basse", tags: ["Administratif"] },
        ]
    }
];

export default function MissionsPage() {
    const [columns, setColumns] = useState(initialColumns);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Missions & Tâches</h2>
                    <p className="text-slate-400 mt-1">Suivi de la production et des échéances du cabinet.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nouvelle Tâche
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {columns.map((col) => (
                        <div key={col.id} className="w-80 flex flex-col gap-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", col.color)} />
                                    <h3 className="font-bold text-slate-200">{col.title}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{col.tasks.length}</span>
                                </div>
                                <button className="text-slate-500 hover:text-white">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tasks List */}
                            <div className="flex-1 bg-slate-900/40 rounded-xl p-2 space-y-3 overflow-y-auto border border-slate-800/50">
                                {col.tasks.map((task) => (
                                    <div key={task.id} className="group p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 cursor-grab active:cursor-grabbing transition-all shadow-sm">
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {task.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h4 className="font-semibold text-slate-200 mb-1 group-hover:text-indigo-300 transition-colors">{task.title}</h4>
                                        <p className="text-sm text-slate-500 mb-4">{task.client}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {task.deadline}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {task.priority === "Haute" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] flex items-center justify-center text-white font-bold">
                                                    EX
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {col.tasks.length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm">
                                        Aucune tâche
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
