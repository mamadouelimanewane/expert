"use client";

import { useState } from "react";
import {
    Clock,
    Play,
    Pause,
    RotateCcw,
    Save,
    Calendar as CalendarIcon,
    User,
    Briefcase,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeEntry {
    id: string;
    client: string;
    mission: string;
    category: "Production" | "Conseil" | "Audit" | "Déplacement";
    duration: string; // "02:30"
    date: string;
    status: "facture" | "en_attente";
}

const MOCK_TIME_ENTRIES: TimeEntry[] = [
    { id: "1", client: "Société Ivoirienne de Banque", mission: "Audit annuel", category: "Audit", duration: "04:00", date: "24/05/2024", status: "en_attente" },
    { id: "2", client: "Traoré Import-Export", mission: "TVA Mensuelle", category: "Production", duration: "01:30", date: "24/05/2024", status: "facture" },
    { id: "3", client: "Boulangerie du Plateau", mission: "Réunion Stratégique", category: "Conseil", duration: "02:00", date: "23/05/2024", status: "en_attente" },
];

export default function TimeTrackingPage() {
    const [isTracking, setIsTracking] = useState(false);
    const [timer, setTimer] = useState("00:00:00");
    const [selectedClient, setSelectedClient] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Saisie des Temps
                        </h2>
                        <p className="text-slate-400 mt-1 text-sm sm:text-base">Suivi de la productivité et rentabilité des missions client.</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase">Ce mois :</span>
                    <span className="text-white font-bold text-sm sm:text-base">142h <span className="text-indigo-400">/ 160h</span></span>
                </div>
            </div>

            {/* Active Timer Bar */}
            <div className={cn(
                "glass-card p-4 sm:p-6 rounded-2xl border transition-all duration-500",
                isTracking ? "border-indigo-500 shadow-lg shadow-indigo-500/10 bg-indigo-500/5" : "border-slate-700/50"
            )}>
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Client</label>
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none">
                                <option>Choisir un client...</option>
                                <option>Société Ivoirienne de Banque</option>
                                <option>Traoré Import-Export</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mission</label>
                            <input type="text" placeholder="Sur quoi travaillez-vous ?" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie</label>
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none">
                                <option>Production</option>
                                <option>Audit</option>
                                <option>Conseil</option>
                                <option>Déplacement</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-center gap-6 sm:col-span-2 lg:col-span-1">
                            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">{timer}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center sm:justify-end">
                        {isTracking ? (
                            <button
                                onClick={() => setIsTracking(false)}
                                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 transition-all active:scale-90"
                            >
                                <Pause className="w-6 h-6" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsTracking(true)}
                                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-90"
                            >
                                <Play className="w-6 h-6 fill-current" />
                            </button>
                        )}
                        <button className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 transition-all">
                            <Save className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 text-white">
                {/* Recent Entries */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-3">
                        <h3 className="font-bold">Entrées Récentes</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-slate-800 rounded text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="text-sm font-medium">Aujourd'hui</span>
                            <button className="p-1 hover:bg-slate-800 rounded text-slate-500"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden divide-y divide-slate-800/50">
                        {MOCK_TIME_ENTRIES.map((entry) => (
                            <div key={entry.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:bg-slate-800/30 transition-colors group">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                                        entry.category === "Audit" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                            entry.category === "Conseil" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    )}>
                                        {entry.category === "Audit" ? <Briefcase className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm sm:text-base text-slate-100 truncate">{entry.client}</p>
                                        <p className="text-xs text-slate-500 truncate">{entry.mission} • {entry.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto">
                                    <div className="text-left sm:text-right">
                                        <p className="font-mono font-bold text-white text-base sm:text-lg">{entry.duration}</p>
                                        <p className="text-[10px] text-slate-600 uppercase font-bold">{entry.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap",
                                            entry.status === "facture" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/50 text-slate-500 border-slate-600/50"
                                        )}>
                                            {entry.status === "facture" ? "Facturé" : "Non Facturé"}
                                        </span>
                                        <button className="hidden sm:block opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition-all">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profitability Stats */}
                <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/50 space-y-6 sm:space-y-8 bg-gradient-to-br from-slate-900 to-indigo-900/10">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Rentabilité des Missions
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Audit Annuel SIB", val: 85, color: "bg-indigo-500" },
                                { label: "Tenue Traoré", val: 62, color: "bg-amber-500" },
                                { label: "Conseil Fiscal Tech", val: 94, color: "bg-emerald-400" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400 uppercase tracking-tighter">{item.label}</span>
                                        <span className="text-white">{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-center space-y-1 shadow-xl shadow-indigo-600/20">
                            <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest">Temps Valorisé</p>
                            <p className="text-2xl font-bold text-white">4 250 000 FCFA</p>
                            <p className="text-[10px] text-indigo-300">Valeur totale des heures non facturées</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
