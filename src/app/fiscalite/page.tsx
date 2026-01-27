"use client";

import Link from "next/link";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Flag,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const fiscalEvents = [
    { day: 15, title: "Déclaration TVA", entities: ["CI", "SN", "BJ"], type: "fiscale" },
    { day: 15, title: "Cotisations Sociales (IPRES/CSS)", entities: ["SN"], type: "sociale" },
    { day: 20, title: "Acompte IS", entities: ["CM", "GA"], type: "fiscale" },
    { day: 30, title: "Retenue à la source BNC", entities: ["CI"], type: "fiscale" },
];

export default function FiscalitePage() {
    const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1); // Juin
    const currentMonth = "Juin 2024";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Fiscalité OHADA</h2>
                    <p className="text-slate-400 mt-1">Calendrier des obligations fiscales et sociales par pays.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/fiscalite/optimization" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all">
                        <Zap className="w-4 h-4 fill-current" />
                        Accéder à l'Optimisation
                    </Link>
                    <div className="flex items-center gap-4 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-white px-2 min-w-[100px] text-center">{currentMonth}</span>
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                        <div key={d} className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {/* Empty cells for start of month padding (just 2 for demo) */}
                    <div className="h-32 rounded-xl bg-slate-900/30 border border-transparent"></div>
                    <div className="h-32 rounded-xl bg-slate-900/30 border border-transparent"></div>

                    {daysInMonth.map(day => {
                        const events = fiscalEvents.filter(e => e.day === day);

                        return (
                            <div key={day} className={cn(
                                "h-32 rounded-xl border p-3 flex flex-col gap-2 transition-all hover:bg-slate-800/50 relative overflow-hidden group",
                                events.length > 0 ? "bg-slate-800/20 border-slate-700" : "bg-slate-900/30 border-transparent text-slate-600"
                            )}>
                                <span className={cn(
                                    "font-bold text-lg",
                                    events.length > 0 ? "text-white" : "text-slate-600"
                                )}>{day}</span>

                                <div className="space-y-1 overflow-y-auto custom-scrollbar">
                                    {events.map((event, i) => (
                                        <div key={i} className={cn(
                                            "text-[10px] p-1.5 rounded border leading-tight",
                                            event.type === "fiscale"
                                                ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                                                : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                                        )}>
                                            <p className="font-semibold truncate">{event.title}</p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {event.entities.map(country => (
                                                    <span key={country} className="px-1 py-0.5 bg-slate-900/50 rounded text-[9px] text-slate-400 font-mono">
                                                        {country}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                        <Flag className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Alertes Fiscales</h4>
                        <p className="text-sm text-slate-400">Les déclarations de TVA en Côte d'Ivoire sont prioritaires ce mois-ci (+12% de volume).</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-200">Synchronisation</h4>
                        <p className="text-sm text-slate-400">Le calendrier est synchronisé avec les portails e-Impôts locaux (via API).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
