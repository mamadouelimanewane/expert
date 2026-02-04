"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Microscope,
    Scale,
    FileCheck,
    MailCheck,
    BarChart,
    AlertCircle,
    CheckCircle2,
    Settings,
    ArrowRight,
    Users,
    FileText,
    PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const MATERIALITY_BASES = [
    { label: "Produits d'Exploitation", value: "2 450 600 000", rate: "1.5%", result: "36 759 000" },
    { label: "Résultat Courant", value: "185 400 000", rate: "10%", result: "18 540 000" },
    { label: "Capitaux Propres", value: "980 000 000", rate: "3%", result: "29 400 000" }
];

const CIRCULARIZATIONS = [
    { id: "C001", type: "Banque", name: "SGB CI", status: "Reçue", drift: "0 %" },
    { id: "C002", type: "Avocat", name: "Cabinet Me. Fall", status: "En attente", drift: "-" },
    { id: "C003", type: "Client", name: "Orange CI", status: "Reçue", drift: "+2.4 %" },
    { id: "C004", type: "Fournisseur", name: "Total Energy", status: "Relancée", drift: "-" }
];

export default function CACSuitePage() {
    const [selectedThreshold, setSelectedThreshold] = useState(1); // Default to Résultat Courant

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header: Professional Audit Workbench */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-slate-900/40 rounded-[32px] px-10 border-t border-t-indigo-500/20 shadow-2xl">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-indigo-500/20">
                        <Microscope className="w-3 h-3" /> Suite Commissariat aux Comptes (CAC)
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        CAC Workbench <span className="text-indigo-500/50 font-light">| Smart Audit</span>
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Plateforme intégrée pour l'audit légal. Détermination des seuils, circularisation automatisée et matrice des risques.
                    </p>
                </div>

                <div className="flex gap-3 z-10">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2 text-sm">
                        <FileCheck className="w-4 h-4 text-emerald-400" /> Dossier de Travail
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 text-sm group">
                        Signer le Rapport <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Planning & Risk */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Materiality Calculator */}
                    <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-950/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <Scale className="w-5 h-5 text-indigo-400" /> Seuils de Signification
                        </h3>
                        <div className="space-y-3">
                            {MATERIALITY_BASES.map((base, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedThreshold(i)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer group",
                                        selectedThreshold === i ? "bg-indigo-500/10 border-indigo-500/40" : "bg-slate-900/20 border-white/5 hover:bg-slate-900/40"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-slate-500 font-bold uppercase">{base.label}</span>
                                        <span className="text-[10px] font-mono text-indigo-400">{base.rate}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-400 font-mono">{base.value}</span>
                                        <span className="text-lg font-black text-white">{base.result} <span className="text-[10px] text-slate-500">F</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-indigo-600 rounded-2xl text-center shadow-lg shadow-indigo-600/20">
                            <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">Seuil Retenu</p>
                            <div className="text-2xl font-black text-white">{MATERIALITY_BASES[selectedThreshold].result} FCFA</div>
                        </div>
                    </div>

                    {/* Risk Matrix Preview */}
                    <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-950/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500" /> Matrice des Risques
                        </h3>
                        <div className="grid grid-cols-3 gap-2 h-40">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "rounded-lg flex items-center justify-center border border-white/5",
                                        i === 0 ? "bg-rose-500/40 border-rose-500/50" :
                                            i < 3 ? "bg-amber-500/20" : "bg-emerald-500/10"
                                    )}
                                >
                                    {i === 0 && <AlertCircle className="w-6 h-6 text-rose-400 animate-pulse" />}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-black text-slate-500 uppercase">
                            <span>Impact Faible</span>
                            <span>Impact Critique</span>
                        </div>
                    </div>
                </div>

                {/* Right: Execution area */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Circularization Manager */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <MailCheck className="w-6 h-6 text-sky-400" /> Circularisations
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Suivi des confirmations externes automatiques.</p>
                            </div>
                            <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all border border-white/10">
                                Nouvelle Demande
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="pb-4 px-4 font-black">Type</th>
                                        <th className="pb-4 px-4 font-black">Tiers</th>
                                        <th className="pb-4 px-4 font-black">Statut</th>
                                        <th className="pb-4 px-4 font-black text-right">Écart constaté</th>
                                        <th className="pb-4 px-4 font-black text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {CIRCULARIZATIONS.map((c) => (
                                        <tr key={c.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-400">{c.type}</td>
                                            <td className="py-4 px-4 text-white font-bold">{c.name}</td>
                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    c.status === "Reçue" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                        c.status === "Attente" ? "bg-slate-800 text-slate-400 border border-white/5" :
                                                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                )}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className={cn("py-4 px-4 text-right font-mono", c.drift !== "-" && c.drift !== "0 %" ? "text-rose-400" : "text-slate-500")}>
                                                {c.drift}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="p-2 text-slate-500 hover:text-white"><ArrowRight className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sampling & Methodology */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-950/60 border border-white/5 rounded-[32px] flex flex-col justify-between">
                            <div>
                                <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                                    <BarChart className="w-5 h-5 text-indigo-400" />
                                    Sondages Statistiques
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Calcul de la taille d'échantillon optimisée par la loi normale (Niveau de confiance 95%).
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold">Échantillon Proposé</p>
                                    <p className="text-2xl font-black text-white">142 <span className="text-xs text-slate-500">lignes</span></p>
                                </div>
                                <button className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] flex flex-col justify-between">
                            <div>
                                <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                    Équipe Audit
                                </h4>
                                <div className="flex -space-x-3 mt-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            A{i}
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                        +2
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3 bg-white text-indigo-900 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                Assigner les Cycles
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
