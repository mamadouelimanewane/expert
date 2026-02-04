"use client";

import { useState } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Users,
    Briefcase,
    Clock,
    AlertCircle,
    CheckCircle2,
    Filter,
    Search,
    Plus,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLLABORATORS = [
    { id: "1", name: "Moussa Sarr", role: "Expert Principal", avatar: "MS", color: "bg-indigo-500" },
    { id: "2", name: "Aissatou Diop", role: "Chef de Mission", avatar: "AD", color: "bg-purple-500" },
    { id: "3", name: "Jean-Paul Mendy", role: "Auditeur Senior", avatar: "JM", color: "bg-blue-500" },
    { id: "4", name: "Fatima Kouyaté", role: "Assistante", avatar: "FK", color: "bg-amber-500" },
];

const TASKS = [
    { id: "t1", colId: "1", title: "Audit SIB", days: [2, 3, 4, 5], status: "IN_PROGRESS" },
    { id: "t2", colId: "1", title: "Gouvernance GIT", days: [8, 9], status: "TODO" },
    { id: "t3", colId: "2", title: "Bilan Traoré", days: [1, 2, 3, 4, 10, 11], status: "IN_PROGRESS" },
    { id: "t4", colId: "3", title: "Commissariat CAC", days: [5, 6, 7, 8, 9], status: "TODO" },
    { id: "t5", colId: "4", title: "Saisie Portuaire", days: [1, 2, 5, 8, 9, 12, 13], status: "DONE" },
];

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export default function ResourcePlanningPage() {
    const [currentMonth, setCurrentMonth] = useState("Février 2024");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                            <CalendarIcon className="w-8 h-8 text-white" />
                        </div>
                        Planning & Charge de Travail
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Visualisez la disponibilité des collaborateurs et gérez l'affectation des missions.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="flex bg-slate-800 rounded-2xl p-1 border border-white/5">
                        <button className="p-2 text-slate-500 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="px-4 py-2 text-xs font-black text-white uppercase tracking-widest flex items-center">{currentMonth}</span>
                        <button className="p-2 text-slate-500 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30">
                        <Plus className="w-4 h-4" />
                        Affecter Mission
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox icon={Users} label="Capacité d'équipe" value="85%" color="text-indigo-400" />
                <StatBox icon={Clock} label="Heures Planifiées" value="640h" color="text-amber-400" />
                <StatBox icon={BarChart3} label="Rentabilité Prévue" value="92%" color="text-emerald-400" />
            </div>

            {/* Resource Grid (AXONAUT INSPIRED) */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">Collaborateurs</h3>
                        <div className="flex gap-2">
                            {["Tous", "Experts", "Auditeurs", "Assistants"].map(tag => (
                                <button key={tag} className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mr-4">
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm" /> Audit
                            <div className="w-3 h-3 bg-purple-500 rounded-sm ml-2" /> Bilan
                            <div className="w-3 h-3 bg-amber-500 rounded-sm ml-2" /> Saisie
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60">
                                <th className="sticky left-0 z-20 bg-slate-900 p-6 text-left border-r border-white/5 min-w-[250px]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom / Rôle</span>
                                </th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 border-r border-white/5 min-w-[60px] text-center">
                                        <p className="text-[10px] font-black text-slate-500 mb-1">{day === 7 || day === 14 ? "DIM" : day === 6 || day === 13 ? "SAM" : "LUN"}</p>
                                        <p className={cn("text-xs font-bold", day === 7 || day === 14 ? "text-rose-500" : "text-white")}>{day}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COLLABORATORS.map((col) => (
                                <tr key={col.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="sticky left-0 z-20 bg-slate-900/80 backdrop-blur-md p-6 border-r border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg", col.color)}>
                                                {col.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{col.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{col.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {DAYS.map(day => {
                                        const task = TASKS.find(t => t.colId === col.id && t.days.includes(day));
                                        return (
                                            <td key={day} className="p-1 border-r border-white/5 relative h-20">
                                                {task && (
                                                    <div className={cn(
                                                        "absolute inset-1 rounded-lg p-2 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg",
                                                        col.color,
                                                        "bg-opacity-20 border border-current"
                                                    )}>
                                                        <p className="text-[8px] font-black uppercase text-white truncate">{task.title}</p>
                                                        <div className="flex justify-end">
                                                            <div className="w-2 h-2 rounded-full bg-white opacity-40 animate-pulse" />
                                                        </div>
                                                    </div>
                                                )}
                                                {day === 7 || day === 14 ? (
                                                    <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Planning Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        Alertes de Surcharge
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-black">AD</div>
                                <div>
                                    <p className="text-sm font-bold text-white">Aissatou Diop</p>
                                    <p className="text-[10px] text-amber-500 uppercase font-black">112% de charge prévue</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase rounded-xl">Réallouer</button>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        Missions à Venir (Non affectées)
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <div>
                                <p className="text-sm font-bold text-white">Audit Annuel BIDC</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black">Début: 15 Fév • 120h estimées</p>
                            </div>
                            <button className="p-2 bg-indigo-600 rounded-xl text-white">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-2xl">
                <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
                <h4 className="text-3xl font-black text-white">{value}</h4>
            </div>
        </div>
    );
}
