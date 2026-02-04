"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Search,
    AlertTriangle,
    FileText,
    CheckCircle2,
    XCircle,
    Globe,
    UserCheck,
    Lock,
    Eye,
    RefreshCw,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

const KYC_CASES = [
    {
        id: "1",
        entity: "Société Ivoirienne de Banque",
        type: "Personne Morale",
        riskLevel: "Low",
        score: 95,
        status: "Compliant",
        lastCheck: "27/01/2026",
        flags: 0
    },
    {
        id: "2",
        entity: "M. Jean KOUASSI",
        type: "Personne Physique (Dirigeant)",
        riskLevel: "Medium",
        score: 65,
        status: "Review Required",
        lastCheck: "25/01/2026",
        flags: 2 // PPE (Personne Politiquement Exposée) ?
    },
    {
        id: "3",
        entity: "Global Trade Import",
        type: "Personne Morale",
        riskLevel: "High",
        score: 30,
        status: "Blocked",
        lastCheck: "20/01/2026",
        flags: 4 // Sanctions List match ?
    }
];

export default function KycScreeningPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header Kanta Style */}
            <div className="bg-slate-900/40 p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-emerald-500/20">
                            Conformité LCB-FT
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                            <UserCheck className="w-10 h-10 text-emerald-500" />
                            Screening KYC & Risques
                        </h1>
                        <p className="text-slate-400 mt-3 text-lg max-w-2xl leading-relaxed">
                            Contrôle automatisé des bénéficiaires effectifs, listes de sanctions et PPE.
                            Mise à jour en temps réel via <span className="text-emerald-400 font-bold">Kanta API</span>.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-600/25 flex items-center gap-3 active:scale-95">
                            <Search className="w-4 h-4" /> Nouveau Screening
                        </button>
                    </div>
                </div>
            </div>

            {/* Risk Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Conformité Portefeuille</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-white">92%</h3>
                        <span className="text-emerald-400 font-bold mb-1.5">+4%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[92%]" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dossiers à Risque</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-rose-500">3</h3>
                        <span className="text-slate-500 text-xs font-bold mb-1.5 font-mono">CRITICAL</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 lg:col-span-2 flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-1">Mise à jour Réglementaire</h4>
                        <p className="text-xs text-slate-400 max-w-md">
                            Dernière synchro avec les listes UN, EU, et OFAC effectuée il y a 2 heures.
                            Base de données à jour.
                        </p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-full animate-spin-slow">
                        <RefreshCw className="w-6 h-6 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Active Monitoring List */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/60">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        Surveillance Active
                    </h3>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Rechercher une entité..." className="bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950/50">
                            <tr>
                                <th className="px-8 py-5">Entité / Personne</th>
                                <th className="px-6 py-5">Niveau de Risque</th>
                                <th className="px-6 py-5">KYC Score</th>
                                <th className="px-6 py-5">Statut</th>
                                <th className="px-6 py-5">Dernier Scan</th>
                                <th className="px-8 py-5 text-right">Rapport</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {KYC_CASES.map((kyc) => (
                                <tr key={kyc.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-white">{kyc.entity}</div>
                                        <div className="text-xs text-slate-500">{kyc.type}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full",
                                                kyc.riskLevel === "Low" ? "bg-emerald-500" :
                                                    kyc.riskLevel === "Medium" ? "bg-amber-500" : "bg-rose-500"
                                            )} />
                                            <span className={cn("text-xs font-bold",
                                                kyc.riskLevel === "Low" ? "text-emerald-400" :
                                                    kyc.riskLevel === "Medium" ? "text-amber-400" : "text-rose-400"
                                            )}>{kyc.riskLevel}</span>
                                        </div>
                                        {kyc.flags > 0 && (
                                            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[9px] font-black uppercase">
                                                <AlertTriangle className="w-3 h-3" /> {kyc.flags} Alertes
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-16 h-16 relative flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                                                <circle cx="32" cy="32" r="28" fill="transparent" stroke={kyc.score > 80 ? "#10b981" : kyc.score > 50 ? "#f59e0b" : "#f43f5e"} strokeWidth="4" strokeDasharray={175} strokeDashoffset={175 * (1 - kyc.score / 100)} />
                                            </svg>
                                            <span className="absolute text-xs font-bold text-white">{kyc.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                            kyc.status === "Compliant" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                kyc.status === "Review Required" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            {kyc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-mono text-slate-400">{kyc.lastCheck}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
