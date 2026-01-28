"use client";

import { useEffect, useState } from "react";
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
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimeTrackingPage() {
    const [isTracking, setIsTracking] = useState(false);
    const [timer, setTimer] = useState("00:00:00");
    const [entries, setEntries] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalHours: 0, unbilledHours: 0 });
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        fetchClients();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/timesheets");
            const data = await res.json();
            if (data.entries) setEntries(data.entries);
            if (data.stats) setStats(data.stats);
        } catch (error) {
            console.error("Failed to fetch timesheets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();
            if (data.clients) setClients(data.clients);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        }
    };

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
                <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 flex items-center justify-between sm:justify-start gap-4  w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Cumulé :</span>
                    <span className="text-white font-bold text-sm sm:text-base">{stats.totalHours}h <span className="text-indigo-400">/ 160h</span></span>
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
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName}</option>
                                ))}
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
                        <h3 className="font-bold">Entrées Récentes (Réelles)</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-slate-800 rounded text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="text-sm font-medium">Récent</span>
                            <button className="p-1 hover:bg-slate-800 rounded text-slate-500"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden divide-y divide-slate-800/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                <p className="text-slate-500 font-medium">Chargement des temps...</p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">Aucune saisie de temps pour le moment.</div>
                        ) : entries.map((entry) => (
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
                                        <p className="font-bold text-sm sm:text-base text-slate-100 truncate">{entry.client?.companyName || "Client"}</p>
                                        <p className="text-xs text-slate-500 truncate">{entry.mission?.title || entry.description} • {entry.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto">
                                    <div className="text-left sm:text-right">
                                        <p className="font-mono font-bold text-white text-base sm:text-lg">{entry.duration}h</p>
                                        <p className="text-[10px] text-slate-600 uppercase font-bold">{new Date(entry.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap",
                                            entry.status === "facture" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/50 text-slate-500 border-slate-600/50"
                                        )}>
                                            {entry.status}
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
                            <p className="text-2xl font-bold text-white">{(stats.unbilledHours * 25000).toLocaleString()} FCFA</p>
                            <p className="text-[10px] text-indigo-300">Base : 25 000 FCFA / h</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
