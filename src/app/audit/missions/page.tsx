"use client";

import { useState } from "react";
import {
    Briefcase,
    CheckCircle2,
    AlertCircle,
    FileSearch,
    Search,
    ArrowRight,
    ClipboardList,
    Target,
    FileText,
    ShieldCheck,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditStep {
    id: string;
    title: string;
    description: string;
    status: "todo" | "doing" | "done" | "warning";
    norms: string;
}

const CAC_CHECKLIST: AuditStep[] = [
    { id: "1", title: "Acceptation de la mission", description: "Vérification de l'indépendance et lettre d'acceptation.", status: "done", norms: "ISA 210" },
    { id: "2", title: "Compréhension de l'entité", description: "Évaluation des risques et contrôle interne.", status: "doing", norms: "ISA 315" },
    { id: "3", title: "Planification d'audit", description: "Seuil de significativité et calendrier des travaux.", status: "todo", norms: "ISA 300" },
    { id: "4", title: "Circularisation Tiers", description: "Confirmation directe des soldes banques, clients, four.", status: "warning", norms: "ISA 505" },
    { id: "5", title: "Examen des comptes annuels", description: "Contrôle de conformité Syscohada révisé.", status: "todo", norms: "Normes OHADA" },
];

export default function CACPage() {
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        Commissariat aux Comptes (CAC)
                    </h2>
                    <p className="text-slate-400 mt-1">Plateforme spécialisée d'audit légal et contractuel conforme aux normes ISA & OHADA.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                    <label className="text-xs font-bold text-slate-500 uppercase px-2">Mission:</label>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="bg-transparent text-white font-bold border-none outline-none focus:ring-0 text-sm"
                    >
                        <option value="Société Ivoirienne de Banque">SIB - Audit 2024</option>
                        <option value="Traoré Import-Export">Traoré - CAC 2023</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Stats Column */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avancement Mission</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">40%</span>
                            <span className="text-sm text-slate-500">complété</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/5 bg-emerald-500 rounded-full" />
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Seuils significativité</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 tracking-tight">Seuil global (0.5% CA)</span>
                                <span className="text-white font-mono">22.5M FCFA</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 tracking-tight">Erreur tolérable</span>
                                <span className="text-white font-mono">1.2M FCFA</span>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors">Modifier seuils</button>
                    </div>
                </div>

                {/* Main Checklist / Process Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-indigo-400" />
                            Plan d'Audit & Questionnaire
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-all">
                                <Zap className="w-4 h-4" /> Analyse IA Risques
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {CAC_CHECKLIST.map((step) => (
                            <div key={step.id} className="glass-card rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group flex gap-5 items-start">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0",
                                    step.status === "done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        step.status === "doing" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]" :
                                            step.status === "warning" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                "bg-slate-800 text-slate-500 border-slate-700"
                                )}>
                                    {step.status === "done" ? <CheckCircle2 className="w-6 h-6" /> :
                                        step.status === "doing" ? <FileSearch className="w-6 h-6 animate-pulse" /> :
                                            step.status === "warning" ? <AlertCircle className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-200 group-hover:text-white group-hover:translate-x-1 transition-all flex items-center gap-3">
                                            {step.title}
                                            <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full font-mono">{step.norms}</span>
                                        </h4>
                                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2">{step.description}</p>

                                    {step.id === "2" && (
                                        <div className="mt-4 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-400">Documentation Control Interne (Cycle Achat)</p>
                                                <div className="h-1 w-full bg-slate-800 rounded-full mt-2">
                                                    <div className="h-full w-3/4 bg-indigo-500 rounded-full" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400">75%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Report Generation Footer */}
                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Rapport d'audit préliminaire</h4>
                                <p className="text-xs text-slate-500">Généré automatiquement à partir de votre dossier de travail.</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
                            Générer Rapport Final
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
