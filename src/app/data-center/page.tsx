"use client";

import { useState, useEffect } from "react";
import {
    FileSpreadsheet,
    FileText,
    Download,
    Share2,
    Printer,
    Database,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    Filter,
    Table as TableIcon,
    BarChart3,
    Layers,
    History,
    MoreVertical,
    Smartphone,
    Mail,
    MessagesSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportJob {
    id: string;
    name: string;
    type: "Excel" | "CSV" | "PDF" | "JSON";
    status: "Terminé" | "En cours" | "Échec";
    date: string;
    size: string;
}

const MOCK_JOBS: ExportJob[] = [
    { id: "EXP-001", name: "Grand Livre Annuel 2023", type: "Excel", status: "Terminé", date: "27/05/2024 14:20", size: "4.2 MB" },
    { id: "EXP-002", name: "Balance Générale Q1", type: "CSV", status: "Terminé", date: "26/05/2024 09:15", size: "1.1 MB" },
    { id: "EXP-003", name: "Rapport Gouvernance - SIB", type: "PDF", status: "En cours", date: "27/05/2024 15:45", size: "--" },
];

export default function DataCenterPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const startGlobalExport = () => {
        setIsExporting(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsExporting(false), 1000);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Database className="w-56 h-56 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                            <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        Data Center & Éditions
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                        Exportez vos données au format Excel/CSV et automatisez vos rapports périodiques.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={startGlobalExport}
                        disabled={isExporting}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30"
                    >
                        {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Global (Comprenant Tout)
                    </button>
                </div>
            </div>

            {isExporting && (
                <div className="glass-card p-8 rounded-[30px] border border-indigo-500/30 bg-indigo-500/5 animate-pulse">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Génération du package de données...</span>
                        <span className="text-xs font-black text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Automations Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Automatisations Actives
                        </h3>
                        <div className="space-y-4">
                            <AutomationItem
                                title="Reporting Hebdo Email"
                                desc="Envoi auto tous les lundis à 08h00"
                                icon={Mail}
                                status="On"
                            />
                            <AutomationItem
                                title="Synchro Drive Client"
                                desc="Export PDF dès signature d'acte"
                                icon={Share2}
                                status="On"
                            />
                            <AutomationItem
                                title="Nudge WhatsApp"
                                desc="Relance auto factures > 15j"
                                icon={MessagesSquare}
                                status="On"
                            />
                            <AutomationItem
                                title="Backup Cloud"
                                desc="Export JSON complet quotidien"
                                icon={History}
                                status="Off"
                            />
                        </div>
                        <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all">
                            + Configurer une Automation
                        </button>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/5">
                        <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Statut Data Warehouse</h4>
                        <p className="text-white text-2xl font-black">1.2 TB <span className="text-xs text-slate-500">Stockés</span></p>
                        <div className="mt-6 flex gap-2">
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-bold text-slate-400">99.9% Disponibilité</div>
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-bold text-slate-400">Chiffrement AES-256</div>
                        </div>
                    </div>
                </div>

                {/* Exports & Reports List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Format Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormatCard title="Excel (.xlsx)" icon={FileSpreadsheet} color="text-emerald-400" />
                        <FormatCard title="Comma Separated (.csv)" icon={TableIcon} color="text-cyan-400" />
                        <FormatCard title="Archive Rapport (.pdf)" icon={FileText} color="text-rose-400" />
                    </div>

                    {/* Historical Exports */}
                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <History className="w-5 h-5 text-indigo-400" />
                                Historique des Downloads
                            </h3>
                            <button className="p-2.5 bg-slate-800 rounded-xl text-slate-400">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-6">Rapport / Fichier</th>
                                        <th className="px-6 py-6 font-black">Format</th>
                                        <th className="px-6 py-6 font-black">Statut</th>
                                        <th className="px-6 py-6 font-black">Date</th>
                                        <th className="px-8 py-6 font-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {MOCK_JOBS.map((job) => (
                                        <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <span className="font-bold text-white block">{job.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{job.size}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={cn(
                                                    "text-[9px] px-2 py-0.5 rounded-md font-black border",
                                                    job.type === "Excel" ? "border-emerald-500/20 text-emerald-400" :
                                                        job.type === "PDF" ? "border-rose-500/20 text-rose-400" : "border-slate-700 text-slate-500"
                                                )}>
                                                    {job.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={cn(
                                                    "flex items-center gap-2 text-[10px] font-black uppercase",
                                                    job.status === "Terminé" ? "text-emerald-400" : "text-amber-400"
                                                )}>
                                                    {job.status === "Terminé" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 animate-spin" />}
                                                    {job.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-slate-500 font-mono">
                                                {job.date}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AutomationItem({ title, desc, icon: Icon, status }: any) {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">{title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
                </div>
            </div>
            <div className={cn(
                "w-10 h-5 rounded-full relative transition-all",
                status === "On" ? "bg-indigo-600" : "bg-slate-800"
            )}>
                <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    status === "On" ? "right-1" : "left-1"
                )} />
            </div>
        </div>
    );
}

function FormatCard({ title, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group cursor-pointer text-center flex flex-col items-center">
            <div className={cn("p-4 rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">{title}</h4>
            <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase">Générer maintenant</p>
        </div>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
