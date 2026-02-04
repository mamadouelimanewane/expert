"use client";

import { useState } from "react";
import {
    Calendar as CalendarIcon,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    UserCircle,
    Briefcase,
    Zap,
    Sparkles,
    LayoutGrid,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
    id: string;
    name: string;
    avatar: string;
    role: string;
    capacity: number; // percentage
    tasks: Task[];
}

interface Task {
    id: string;
    client: string;
    mission: string;
    startDay: number; // 1 to 5 (Mo-Fr)
    duration: number; // in days
    status: "done" | "in-progress" | "warning";
}

const MOCK_RESOURCES: Resource[] = [
    {
        id: "R1", name: "Moussa Sarr", avatar: "MS", role: "Expert-Comptable", capacity: 95,
        tasks: [
            { id: "T1", client: "SIB Senegal", mission: "Audit CAC", startDay: 1, duration: 3, status: "in-progress" },
            { id: "T2", client: "Orange CI", mission: "Conseil", startDay: 4, duration: 1, status: "warning" }
        ]
    },
    {
        id: "R2", name: "Awa Diop", avatar: "AD", role: "Chef de Mission", capacity: 70,
        tasks: [
            { id: "T3", client: "Dakar Digital", mission: "TVA", startDay: 1, duration: 1, status: "done" },
            { id: "T4", client: "Total", mission: "Consolidation", startDay: 2, duration: 3, status: "in-progress" }
        ]
    },
    {
        id: "R3", name: "Jean-Paul Mendy", avatar: "JM", role: "Collaborateur Senior", capacity: 40,
        tasks: [
            { id: "T5", client: "Logistics Ex.", mission: "Bilan", startDay: 3, duration: 2, status: "in-progress" }
        ]
    },
    {
        id: "R4", name: "Fatima Kouyaté", avatar: "FK", role: "Juriste", capacity: 85,
        tasks: [
            { id: "T6", client: "Bolloré", mission: "Secretariat", startDay: 1, duration: 4, status: "in-progress" }
        ]
    }
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

export default function ResourcesPlanning() {
    const [selectedWeek, setSelectedWeek] = useState("Semaine 06 - 2024");

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header: Resource Planning */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <CalendarIcon className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Resource Management (GPAO)
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Planning & <span className="text-indigo-400">Charge de Travail</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Visualisez et optimisez l'allocation de vos experts. Gérez les pics d'activité et évitez le surmenage de vos équipes.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-3 p-1.5 bg-slate-800 border border-white/5 rounded-2xl">
                            <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="text-xs font-black text-white uppercase tracking-widest px-4">{selectedWeek}</span>
                            <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <Plus className="w-5 h-5" /> Allouer Resource
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Main Resource Grid (Gantt-like) */}
                <div className="lg:col-span-12 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <LayoutGrid className="w-6 h-6 text-indigo-400" />
                            Vue Hebdomadaire des Équipes
                        </h3>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-5 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Terminé</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">En cours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Alerte</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planning Table */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                            {/* Days Header */}
                            <div className="grid grid-cols-6 gap-4 mb-8">
                                <div className="col-span-1" />
                                {DAYS.map(day => (
                                    <div key={day} className="text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{day}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Resource Rows */}
                            <div className="space-y-6">
                                {MOCK_RESOURCES.map(resource => (
                                    <div key={resource.id} className="grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-1 flex items-center gap-4 group">
                                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-sm font-black text-white border border-white/5 group-hover:scale-110 transition-transform">
                                                {resource.avatar}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white truncate w-24 uppercase">{resource.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden w-16">
                                                        <div className={cn("h-full", resource.capacity > 90 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${resource.capacity}%` }} />
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-500">{resource.capacity}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Task Bars Overlay Container */}
                                        <div className="col-span-5 grid grid-cols-5 gap-4 relative h-16 bg-white/[0.01] rounded-2xl border border-white/5">
                                            {/* Vertical Lines */}
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="absolute top-0 bottom-0 w-[1px] bg-white/5" style={{ left: `${(i / 5) * 100}%` }} />
                                            ))}

                                            {/* Individual Tasks */}
                                            {resource.tasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "absolute h-10 top-3 rounded-xl border p-2 flex flex-col justify-center overflow-hidden cursor-pointer hover:scale-[1.02] transition-all",
                                                        task.status === "done" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                            task.status === "warning" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                                                "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                                                    )}
                                                    style={{
                                                        left: `calc(${(task.startDay - 1) * 20}% + 4px)`,
                                                        width: `calc(${task.duration * 20}% - 8px)`
                                                    }}
                                                >
                                                    <p className="text-[8px] font-black uppercase tracking-tighter truncate">{task.client}</p>
                                                    <p className="text-[7px] font-bold opacity-70 truncate">{task.mission}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions Footer */}
                    <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-600 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">Nexus Optimization Suggestions</h4>
                                <p className="text-slate-400 text-xs font-medium">Moussa Sarr est en surcharge (95%). Fatima Diop est disponible à partir de Jeudi pour la mission Bolloré.</p>
                            </div>
                        </div>
                        <button className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all active:scale-95">
                            Équilibrer la Charge
                        </button>
                    </div>
                </div>

                {/* 2. Side Panel - Team Stats & Alerts */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-400" /> Taux d'Occupation Équipe
                        </h3>
                        <div className="flex items-center justify-center p-6 border-b border-white/5 mb-6">
                            <div className="text-center">
                                <p className="text-5xl font-black text-white">72.4%</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Moyenne Cabinet</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <ExpertHealth name="Audit Team" score={85} />
                            <ExpertHealth name="Fiscal Team" score={42} color="text-rose-400" />
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Prochains Congés / Absences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black">AD</div>
                                    <div>
                                        <p className="text-[10px] font-black text-white">Awa Diop</p>
                                        <p className="text-[8px] text-slate-500 uppercase">Congés Annuels</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-indigo-400 underline uppercase">12 - 19 Fév</span>
                            </div>
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <p className="text-[9px] font-bold text-amber-500 uppercase leading-relaxed">Attention: 2 ressources clés absentes en Semaine 7.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col justify-center items-center text-center gap-4">
                        <Zap className="w-12 h-12 text-indigo-400 animate-pulse" />
                        <h4 className="text-white font-black uppercase text-xs tracking-widest">Planificateur Automatique</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
                            Laissez Nexus générer <br /> le planning idéal pour T1.
                        </p>
                        <button className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] hover:scale-105 transition-transform">Lancer la Simulation</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExpertHealth({ name, score, color = "text-emerald-400" }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase">{name}</span>
            <span className={cn("text-xs font-black", color)}>{score}%</span>
        </div>
    );
}
