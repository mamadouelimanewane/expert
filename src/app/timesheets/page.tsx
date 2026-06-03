"use client";

import { useState } from "react";
import {
    Clock,
    CalendarDays,
    Play,
    Pause,
    Plus,
    BarChart3,
    AlertTriangle,
    CheckCircle2,
    Save,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    Briefcase,
    Zap,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

// Données statiques
const DAYS = ["Lundi 03", "Mardi 04", "Mercredi 05", "Jeudi 06", "Vendredi 07"];

interface TimeEntry {
    client: string;
    mission: string;
    hours: number[]; // Index correspond à DAYS
    budget: number; // en heures
    consumed: number; // en heures avant cette semaine
}

const MOCK_ENTRIES: TimeEntry[] = [
    { client: "Société Ivoirienne de Banque", mission: "Audit Légal Annuel", hours: [7, 8, 4, 0, 0], budget: 120, consumed: 95 },
    { client: "Pharmacie Dior", mission: "Tenue Comptable", hours: [1, 0, 2, 2, 0], budget: 24, consumed: 12 },
    { client: "Groupe SONELEC", mission: "Conseil Fiscal", hours: [0, 0, 2, 6, 4], budget: 15, consumed: 14 }, // Dépassement de budget probable
];

export default function TimesheetsPage() {
    const [entries, setEntries] = useState<TimeEntry[]>(MOCK_ENTRIES);
    const [activeTimer, setActiveTimer] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    const updateHour = (entryIndex: number, dayIndex: number, val: string) => {
        const newEntries = [...entries];
        const numVal = parseFloat(val) || 0;
        newEntries[entryIndex].hours[dayIndex] = numVal > 24 ? 24 : numVal;
        setEntries(newEntries);
    };

    const addRow = () => {
        setEntries([...entries, { client: "", mission: "", hours: [0,0,0,0,0], budget: 0, consumed: 0 }]);
    };

    const totalHoursThisWeek = entries.reduce((acc, entry) => acc + entry.hours.reduce((a,b) => a+b, 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Premium */}
            <div className="bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Clock className="w-64 h-64 text-indigo-400" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                Semaine S23
                            </span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> 03 Juin - 07 Juin 2026
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Suivi des Temps & <span className="text-indigo-400">Rentabilité</span>
                        </h2>
                        <p className="text-slate-400 mt-2 font-medium max-w-xl">
                            Saisissez vos heures pour analyser la rentabilité des missions et facturer le hors-forfait.
                        </p>
                    </div>

                    {/* Timer Widget */}
                    <div className="p-4 bg-slate-950/50 border border-white/10 rounded-3xl flex items-center gap-6 shadow-xl backdrop-blur-xl">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Chronomètre Actif</p>
                            <p className="text-3xl font-mono font-black text-white">
                                {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
                                {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
                                {String(timerSeconds % 60).padStart(2, '0')}
                            </p>
                        </div>
                        <button 
                            onClick={() => setActiveTimer(!activeTimer)}
                            className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                activeTimer ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
                            )}
                        >
                            {activeTimer ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Heures saisies", val: totalHoursThisWeek, sub: "/ 35h attendues", icon: Clock, color: "text-indigo-400 bg-indigo-500/10" },
                    { label: "Taux de facturabilité", val: "88%", sub: "Objectif: 85%", icon: TrendingDown, color: "text-emerald-400 bg-emerald-500/10" },
                    { label: "Alertes Budget", val: "2", sub: "Dossiers en dépassement", icon: AlertTriangle, color: "text-rose-400 bg-rose-500/10" },
                    { label: "Dossiers Actifs", val: "14", sub: "Collaborateur: J. Dupont", icon: Briefcase, color: "text-blue-400 bg-blue-500/10" }
                ].map((k, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={cn("p-3 rounded-2xl", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
                        </div>
                        <h3 className="text-3xl font-black text-white">{k.val}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{k.sub}</p>
                    </div>
                ))}
            </div>

            {/* Grille de Saisie */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/5 bg-slate-900/80 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Feuille de Temps</h3>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto p-6">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/4">Client & Mission</th>
                                {DAYS.map(d => (
                                    <th key={d} className="pb-4 text-[10px] font-black text-slate-400 uppercase text-center w-24">{d}</th>
                                ))}
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-8">État du Budget</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {entries.map((entry, idx) => {
                                const rowTotal = entry.hours.reduce((a,b)=>a+b,0);
                                const totalConsumed = entry.consumed + rowTotal;
                                const budgetPercent = entry.budget > 0 ? (totalConsumed / entry.budget) * 100 : 0;
                                const isOverBudget = budgetPercent > 100;

                                return (
                                    <tr key={idx} className="group">
                                        <td className="py-2 pr-4">
                                            <input 
                                                type="text" 
                                                placeholder="Client..." 
                                                value={entry.client}
                                                onChange={(e) => { const n = [...entries]; n[idx].client = e.target.value; setEntries(n); }}
                                                className="w-full bg-slate-900 border border-white/5 rounded-t-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Mission..." 
                                                value={entry.mission}
                                                onChange={(e) => { const n = [...entries]; n[idx].mission = e.target.value; setEntries(n); }}
                                                className="w-full bg-slate-900/50 border border-t-0 border-white/5 rounded-b-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-indigo-500"
                                            />
                                        </td>
                                        {entry.hours.map((h, dayIdx) => (
                                            <td key={dayIdx} className="py-2 px-1 text-center">
                                                <input 
                                                    type="number" 
                                                    min="0" max="24" step="0.5"
                                                    value={h || ""}
                                                    onChange={(e) => updateHour(idx, dayIdx, e.target.value)}
                                                    className={cn(
                                                        "w-14 h-12 text-center rounded-xl bg-slate-800/50 border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                                                        h > 0 ? "border-indigo-500/50 text-indigo-300 font-black bg-indigo-500/10" : "border-white/5 text-slate-500"
                                                    )}
                                                />
                                            </td>
                                        ))}
                                        <td className="py-2 px-4 text-right">
                                            <span className="font-mono text-lg font-black text-white">{rowTotal}h</span>
                                        </td>
                                        <td className="py-2 pl-8">
                                            {entry.budget > 0 ? (
                                                <div className="space-y-2 w-48">
                                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                                        <span className={isOverBudget ? "text-rose-400" : "text-emerald-400"}>
                                                            {totalConsumed}h / {entry.budget}h
                                                        </span>
                                                        <span className="text-slate-500">{Math.round(budgetPercent)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={cn("h-full rounded-full transition-all duration-1000", isOverBudget ? "bg-rose-500" : budgetPercent > 80 ? "bg-amber-500" : "bg-emerald-500")}
                                                            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                    {isOverBudget && (
                                                        <p className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> Dépassement ! Facturer hors-forfait.
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Non budgété</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={6} className="pt-6">
                                    <button 
                                        onClick={addRow}
                                        className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-300 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Ajouter une ligne
                                    </button>
                                </td>
                                <td colSpan={2} className="pt-6 text-right">
                                    <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center gap-2 ml-auto">
                                        <Save className="w-4 h-4" /> Enregistrer la semaine
                                    </button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* AI Insights */}
            <div className="p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-[32px] flex items-start gap-4 shadow-xl">
                <div className="p-3 bg-indigo-500/20 rounded-2xl shrink-0 mt-1">
                    <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-2">Nexus IA — Analyse de Rentabilité</h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
                        Le dossier <strong>Groupe SONELEC</strong> a consommé <span className="text-rose-400 font-bold">113%</span> de son budget initial (15h). 
                        Vous avez saisi 12h cette semaine. Il est recommandé de déclencher une facturation complémentaire ou de revoir la lettre de mission avec le client.
                    </p>
                    <button className="mt-4 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-black transition-colors">
                        Générer Facture Hors-Forfait
                    </button>
                </div>
            </div>

        </div>
    );
}
