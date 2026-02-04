"use client";

import { useState } from "react";
import {
    CalendarDays,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    FileText,
    Bell,
    Users,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Obligation {
    id: string;
    title: string;
    deadline: string;
    type: "Fiscale" | "Sociale" | "Légale";
    priority: "Haute" | "Moyenne" | "Basse";
    status: "TODO" | "EN_COURS" | "VALIDE";
    assignedTo: string;
}

const MOCK_OBLIGATIONS: Obligation[] = [
    { id: "1", title: "Déclaration TVA (Janvier)", deadline: "2024-02-15", type: "Fiscale", priority: "Haute", status: "VALIDE", assignedTo: "A. Diop" },
    { id: "2", title: "Versement ITS & VRS", deadline: "2024-02-15", type: "Sociale", priority: "Haute", status: "EN_COURS", assignedTo: "F. Kouyaté" },
    { id: "3", title: "Déclaration Précompte sur Loyer", deadline: "2024-02-20", type: "Fiscale", priority: "Moyenne", status: "TODO", assignedTo: "M. Sarr" },
    { id: "4", title: "Clôture Bilan (DSF)", deadline: "2024-04-30", type: "Légale", priority: "Haute", status: "TODO", assignedTo: "J. Mendy" },
];

export default function FiscalCalendarPage() {
    const [view, setView] = useState<"calendar" | "list">("list");

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Tempolia Inspired */}
            <div className="bg-slate-900/60 p-10 rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <CalendarDays className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                Période Fiscale Seraine
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Calendrier des <span className="text-indigo-400">Obligations OHADA</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Ne subissez plus les pics d'activité. Anticipez vos échéances fiscales et sociales pour une gestion fluide du cabinet.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                            <Bell className="w-4 h-4 text-amber-400" /> Relancer Équipe
                        </button>
                    </div>
                </div>
            </div>

            {/* View Selector */}
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                <div className="flex gap-4">
                    <button
                        onClick={() => setView("calendar")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            view === "calendar" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white"
                        )}
                    >
                        Vue Calendrier
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            view === "list" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white"
                        )}
                    >
                        Vue Liste (Échéancier)
                    </button>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Urgent
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Moyen
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" /> Planifié
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {view === "list" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {MOCK_OBLIGATIONS.map((ob) => (
                            <div
                                key={ob.id}
                                className="glass-card p-8 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-white/[0.02] transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-8">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                        ob.priority === "Haute" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/5 text-slate-500"
                                    )}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{ob.title}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ob.type}</span>
                                            <span className="text-xs font-mono font-bold text-slate-400">Échéance : {ob.deadline}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">Assigné à</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-white">{ob.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                                            <span className="text-xs font-bold text-slate-300">{ob.assignedTo}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase border",
                                        ob.status === "VALIDE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            ob.status === "EN_COURS" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-slate-800 text-slate-500 border-white/5"
                                    )}>
                                        {ob.status.replace('_', ' ')}
                                    </div>
                                    <button className="p-3 hover:bg-white/10 rounded-xl text-slate-500 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Workload Insights */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-8">Plan de Charge (RH)</h3>
                            <div className="space-y-6">
                                <WorkloadItem name="Moussa Sarr" load={92} color="bg-indigo-500" />
                                <WorkloadItem name="Aissatou Diop" load={112} color="bg-rose-500" status="Attention" />
                                <WorkloadItem name="Fatima Kouyaté" load={75} color="bg-emerald-500" />
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pic de Mars Anticipé</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                Le volume de DSF (Déclarations Statistiques & Fiscales) sera 20% supérieur à l'an dernier. Prévoyez 2 stagiaires renfort.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-20 rounded-[48px] border border-white/5 bg-slate-900/20 text-center">
                    <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-white mb-2">Génération du Calendrier Dynamique...</h3>
                    <p className="text-slate-500">Intégration des obligations fiscales OHADA 2024 en cours.</p>
                </div>
            )}
        </div>
    );
}

function WorkloadItem({ name, load, color, status }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-white">{name}</span>
                <span className={cn(status === "Attention" ? "text-rose-400" : "text-slate-500")}>{load}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all", color)} style={{ width: `${Math.min(100, load)}%` }} />
            </div>
        </div>
    );
}
