"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    Play,
    Pause,
    Save,
    Calendar,
    Briefcase,
    Users,
    TrendingUp,
    FileText,
    CheckCircle2,
    X,
    Plus,
    History,
    Timer,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeEntry {
    id: string;
    client: string;
    mission: string;
    task: string;
    duration: number; // in seconds
    date: string;
    status: "billed" | "pending" | "draft";
}

const MOCK_ENTRIES: TimeEntry[] = [
    { id: "1", client: "Société Ivoirienne de Banque", mission: "Audit Annuel", task: "Vérification des immobilisations", duration: 7200, date: "2024-05-27", status: "pending" },
    { id: "2", client: "Orange Sénégal", mission: "Conseil Fiscal", task: "Analyse des retenues à la source", duration: 3600, date: "2024-05-27", status: "pending" },
    { id: "3", client: "Traoré Import-Export", mission: "Tenue Comptable", task: "Saisie des factures achats", duration: 5400, date: "2024-05-26", status: "billed" },
];

export default function TimesheetsPage() {
    const [entries, setEntries] = useState<TimeEntry[]>(MOCK_ENTRIES);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [activeClient, setActiveClient] = useState("Orange Sénégal");
    const [activeMission, setActiveMission] = useState("Conseil Fiscal");

    useEffect(() => {
        let interval: any;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSaveTimer = () => {
        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            client: activeClient,
            mission: activeMission,
            task: "Travaux en cours",
            duration: elapsedTime,
            date: new Date().toISOString().split('T')[0],
            status: "pending"
        };
        setEntries([newEntry, ...entries]);
        setIsTimerRunning(false);
        setElapsedTime(0);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Current Timer */}
            <div className="bg-slate-900/60 p-10 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Timer className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-4">
                            <Clock className="w-10 h-10 text-indigo-500" />
                            Gestion des Temps
                        </h2>
                        <p className="text-slate-400 mt-3 max-w-xl font-medium text-lg leading-relaxed">
                            Suivez vos heures passées par client et optimisez la rentabilité de vos missions.
                        </p>
                    </div>

                    <div className="bg-slate-950/80 p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center gap-6 min-w-[400px]">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Chronomètre Actif</p>
                            <span className="text-6xl font-black text-white font-mono tracking-tighter tabular-nums">
                                {formatTime(elapsedTime)}
                            </span>
                            <p className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                                {activeClient} — {activeMission}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90",
                                    isTimerRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                )}
                            >
                                {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                            </button>
                            <button
                                onClick={handleSaveTimer}
                                className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90"
                                disabled={elapsedTime === 0}
                            >
                                <Save className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Semaine" value="32h 45m" subtext="+4h vs semaine dernière" color="text-indigo-400" />
                <SummaryCard title="Heures Facturables" value="28h 10m" subtext="86% du temps total" color="text-emerald-400" />
                <SummaryCard title="Rentabilité Moyenne" value="45 000" subtext="FCFA / Heure" color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entries List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                Entrées Récentes
                            </h3>
                            <div className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input type="text" placeholder="Rechercher..." className="w-full bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {entries.map((entry) => (
                                <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black border border-white/5">
                                            {formatTime(entry.duration).split(':')[0]}h
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{entry.client}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{entry.mission} — {entry.task}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white font-mono">{formatTime(entry.duration)}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase">{entry.date}</p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            entry.status === "billed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        )}>
                                            {entry.status === "billed" ? "Facturé" : "À Facturer"}
                                        </span>
                                        <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-white transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Missions Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-black text-white mb-6">Missions en cours</h3>
                        <div className="space-y-4">
                            {["Audit Annuel", "Conseil Fiscal", "TVA Janvier", "Tenue Mensuelle"].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setActiveMission(m)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center group",
                                        activeMission === m ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-indigo-500/30"
                                    )}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{m}</span>
                                    <Clock className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", activeMission === m && "opacity-100")} />
                                </button>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                            Voir toutes les missions
                        </button>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Alerte Rentabilité</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            La mission <span className="text-white font-bold">Audit Annuel</span> dépasse de 15% le budget temps initial. Prévoyez une facturation complémentaire.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, subtext, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition-all">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className={cn("text-3xl font-black mb-2", color)}>{value}</h3>
            <p className="text-xs text-slate-600 font-bold">{subtext}</p>
        </div>
    );
}
