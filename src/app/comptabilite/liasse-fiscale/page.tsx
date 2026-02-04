"use client";

import { useState } from "react";
import {
    FileSpreadsheet,
    BrainCircuit,
    CheckCircle2,
    AlertTriangle,
    Download,
    Eye,
    RefreshCw,
    ShieldCheck,
    ArrowRight,
    Search,
    Filter,
    Layers,
    Table as TableIcon,
    FileText,
    Sparkles,
    ChevronRight,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiasseSection {
    id: string;
    title: string;
    code: string;
    status: "Complété" | "En cours" | "Anomalie" | "Vide";
    progress: number;
}

const SECTIONS: LiasseSection[] = [
    { id: "1", title: "Bilan Actif", code: "Tableau 1", status: "Complété", progress: 100 },
    { id: "2", title: "Bilan Passif", code: "Tableau 2", status: "Complété", progress: 100 },
    { id: "3", title: "Compte de Résultat", code: "Tableau 3", status: "Anomalie", progress: 85 },
    { id: "4", title: "Tableau des Flux de Trésorerie", code: "Tableau 4", status: "En cours", progress: 40 },
    { id: "5", title: "Notes Annexes (1-36)", code: "Annexes", status: "Vide", progress: 0 },
];

export default function LiasseFiscalePage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - DSF OHADA */}
            <div className="bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <FileSpreadsheet className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                DSF Automatisée OHADA
                            </span>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                SYSCOHADA Révisé
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Liasse Fiscale <span className="text-indigo-400">Intelligente</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Générez vos liasses fiscales OHADA (DSF) en un clic à partir de votre balance. L'IA Nexus assure la cohérence des tableaux et détecte les anomalies fiscales.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Générer la DSF 2023
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Control Center */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Status Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Contrôle de Progression</h3>
                        <div className="space-y-4">
                            {SECTIONS.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedSection(s)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer group",
                                        selectedSection.id === s.id ? "bg-white/10 border-indigo-500/50" : "bg-white/5 border-transparent hover:border-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-white group-hover:text-indigo-400">{s.title}</span>
                                        <StatusTag status={s.status} />
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-1000", s.progress === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                                            style={{ width: `${s.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute -top-6 -right-6 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-white font-black text-sm uppercase mb-2 relative z-10 tracking-widest">Score de Cohérence IA</h4>
                        <div className="flex items-baseline gap-2 relative z-10 mb-4">
                            <span className="text-4xl font-black text-emerald-400">92%</span>
                            <span className="text-xs text-slate-500 font-bold">Optimal</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium relative z-10">
                            3 points de contrôle nécessitent votre attention dans le Compte de Résultat.
                        </p>
                    </div>
                </div>

                {/* Main Content Area - Table Preview */}
                <div className="lg:col-span-3 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                                <TableIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{selectedSection.title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedSection.code} - Système Normal</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white border border-white/5 transition-all">
                                <History className="w-4 h-4" />
                            </button>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" /> Télécharger (XML DGID)
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 space-y-6">
                        {isGenerating ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
                                <BrainCircuit className="w-16 h-16 text-indigo-400 animate-spin" />
                                <div className="text-center">
                                    <h4 className="text-xl font-black text-white uppercase tracking-widest">Analyse SYSCOHADA en cours...</h4>
                                    <p className="text-sm text-slate-500 mt-2">Récupération des comptes 6 et 7 pour le Tableau 3</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* AI Insight Box */}
                                {selectedSection.status === "Anomalie" && (
                                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[32px] flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Alerte de Cohérence</h4>
                                            <p className="text-xs text-rose-200/60 leading-relaxed">
                                                Le solde du compte <b className="text-rose-400">601 (Achats de marchandises)</b> ne correspond pas à la variation de stock au Tableau 18. Différence : <b className="text-white">1.250.000 FCFA</b>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Table Mockup */}
                                <div className="border border-white/5 rounded-3xl overflow-hidden bg-slate-950/20">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4">Désignation</th>
                                                <th className="px-6 py-4">Code</th>
                                                <th className="px-6 py-4 text-right">Brut (N)</th>
                                                <th className="px-6 py-4 text-right">Amort/Prov</th>
                                                <th className="px-6 py-4 text-right">Net (N)</th>
                                                <th className="px-6 py-4 text-right">Net (N-1)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 font-medium text-slate-300">
                                            <tr className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">ACTIF IMMOBILISE</td>
                                                <td className="px-6 py-4">AA</td>
                                                <td className="px-6 py-4 text-right"></td>
                                                <td className="px-6 py-4 text-right"></td>
                                                <td className="px-6 py-4 text-right font-bold">145.200.000</td>
                                                <td className="px-6 py-4 text-right text-slate-500">132.800.000</td>
                                            </tr>
                                            <tr className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 pl-10">Immobilisations Incorporelles</td>
                                                <td className="px-6 py-4">AB</td>
                                                <td className="px-6 py-4 text-right">25.000.000</td>
                                                <td className="px-6 py-4 text-right">12.000.000</td>
                                                <td className="px-6 py-4 text-right">13.000.000</td>
                                                <td className="px-6 py-4 text-right text-slate-500">14.500.000</td>
                                            </tr>
                                            <tr className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 pl-10">Terrains</td>
                                                <td className="px-6 py-4">AD</td>
                                                <td className="px-6 py-4 text-right">80.000.000</td>
                                                <td className="px-6 py-4 text-right">0</td>
                                                <td className="px-6 py-4 text-right">80.000.000</td>
                                                <td className="px-6 py-4 text-right text-slate-500">80.000.000</td>
                                            </tr>
                                            <tr className="bg-indigo-600/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">TOTAL ACTIF</td>
                                                <td className="px-6 py-4 font-bold">BZ</td>
                                                <td className="px-6 py-4 text-right font-black">280.500.000</td>
                                                <td className="px-6 py-4 text-right font-black">45.300.000</td>
                                                <td className="px-6 py-4 text-right font-black text-indigo-400">235.200.000</td>
                                                <td className="px-6 py-4 text-right text-slate-500 font-black">218.400.000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusTag({ status }: { status: LiasseSection["status"] }) {
    return (
        <span className={cn(
            "text-[8px] px-2 py-0.5 rounded-full font-black uppercase border",
            status === "Complété" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                status === "Anomalie" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    status === "En cours" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        "bg-slate-800 text-slate-500 border-white/5"
        )}>
            {status}
        </span>
    );
}
