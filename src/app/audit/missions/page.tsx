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
    Zap,
    Scale,
    Layers,
    Activity,
    Cpu,
    Fingerprint,
    History,
    Download,
    BarChart3,
    SearchCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClients } from "@/data/mock-clients";

interface AuditStep {
    id: string;
    title: string;
    description: string;
    status: "todo" | "doing" | "done" | "warning";
    norms: string;
    progress?: number;
}

const CAC_CHECKLIST: AuditStep[] = [
    { id: "1", title: "Acceptation & Indépendance", description: "Vérification des incompatibilités OHADA et lettre d'acceptation.", status: "done", norms: "ISA 210" },
    { id: "2", title: "Contrôle Interne (Cycle Ventes)", description: "Évaluation des risques SI et procédures d'autorisation.", status: "doing", norms: "ISA 315", progress: 75 },
    { id: "3", title: "Planification Stratégique", description: "Seuils de significativité et calendrier ISA 300.", status: "todo", norms: "ISA 300" },
    { id: "4", title: "Circularisation Tiers (Banques)", description: "Confirmation directe des soldes OHADA (Directrice UEMOA).", status: "warning", norms: "ISA 505" },
    { id: "5", title: "Examen des États Financiers", description: "Audit de conformité SYSCOHADA Révisé (AUDCIF).", status: "todo", norms: "OHADA v2026" },
];

export default function NexusAuditAssurancePage() {
    const [selectedClient, setSelectedClient] = useState(mockClients[1]); // Let's pick a Corporate client
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const runIAAudit = () => {
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Global Audit & Assurance
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-emerald-400">Audit & Assurance</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Dossier de travail numérique conforme aux normes ISA et Acte Uniforme OHADA. Audit légal assisté par IA.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedClient.id}
                            onChange={(e) => setSelectedClient(mockClients.find(c => c.id === e.target.value) || mockClients[0])}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-emerald-500 outline-none transition-all hover:bg-white/10 shadow-xl"
                        >
                            {mockClients.map(client => (
                                <option key={client.id} value={client.id} className="bg-slate-900">{client.name} - CAC 2026</option>
                            ))}
                        </select>
                        <button
                            onClick={runIAAudit}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl transition-all shadow-emerald-600/30">
                            {isAnalyzing ? <Cpu className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            {isAnalyzing ? "Analyse Risques..." : "IA Risk Scanning"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Audit KPI & Metadata */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Statut de la Mission</h3>
                            <Activity className="w-4 h-4 text-emerald-400" />
                        </div>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-5xl font-black text-white">40<span className="text-xl text-slate-500">%</span></span>
                            <div className="flex flex-col mb-1">
                                <span className="text-[10px] font-black text-emerald-400 uppercase leading-none">On Track</span>
                                <span className="text-[9px] text-slate-500 uppercase leading-none mt-1">Completion rate</span>
                            </div>
                        </div>

                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: '40%' }} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Heures Audit</p>
                                <p className="text-sm font-black text-white">124h / 300h</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Points en suspens</p>
                                <p className="text-sm font-black text-rose-400">12 Points</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Seuils de Significativité</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Seuil Global (0.5% CA)", val: "22.5M FCFA", color: "text-white" },
                                { label: "Erreur Tolérable (75%)", val: "16.8M FCFA", color: "text-emerald-400" },
                                { label: "Seuil de Remontée", val: "1.1M FCFA", color: "text-amber-500" },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[11px] font-black text-slate-500 group-hover:text-white transition-colors">{s.label}</span>
                                    <span className={cn("text-sm font-black font-mono", s.color)}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all">Réévaluer les Seuils</button>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                        <Fingerprint className="w-24 h-24 text-indigo-400/10 absolute -bottom-4 -right-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4">Audit Traceability</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Tous les travaux sont horodatés et chiffrés sur la blockchain Nexus pour garantir l'indépendance de l'auditeur.
                        </p>
                    </div>
                </div>

                {/* Right Panel: Audit Checklist */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Plan d'Audit & Scrutin des Cycles</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{selectedClient.name} • Audit Légal 2026</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><BarChart3 className="w-5 h-5" /></button>
                            <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><SearchCode className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {CAC_CHECKLIST.map((step) => (
                            <div key={step.id} className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group flex gap-8 items-center relative overflow-hidden">
                                {step.status === 'doing' && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                )}

                                <div className={cn(
                                    "w-16 h-16 rounded-[24px] flex items-center justify-center border transition-all",
                                    step.status === "done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        step.status === "doing" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]" :
                                            step.status === "warning" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" :
                                                "bg-slate-800 text-slate-500 border-slate-700"
                                )}>
                                    {step.status === "done" ? <CheckCircle2 className="w-8 h-8" /> :
                                        step.status === "doing" ? <FileSearch className="w-8 h-8" /> :
                                            step.status === "warning" ? <AlertCircle className="w-8 h-8" /> : <Target className="w-8 h-8" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-4">
                                            <h4 className="text-xl font-black text-slate-200 group-hover:text-emerald-400 transition-all uppercase tracking-tight">
                                                {step.title}
                                            </h4>
                                            <span className="text-[9px] font-black text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">{step.norms}</span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-800 group-hover:text-emerald-400 transition-all transform group-hover:translate-x-1" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{step.description}</p>

                                    {step.progress && (
                                        <div className="mt-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-6">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Revue de Procédures Active</p>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full">
                                                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${step.progress}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-emerald-400">{step.progress}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Report Generation Footer Elite */}
                    <div className="p-10 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 rounded-[50px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl">
                        <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center border border-white/5">
                                <FileText className="w-8 h-8 text-slate-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-2">Rapport d'Audit (Draft)</h4>
                                <p className="text-xs text-slate-500 font-medium max-w-sm">
                                    Auto-génération des conclusions d'audit basée sur les travaux documentés. Conforme AUDCIF.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all">
                                <History className="w-4 h-4 inline mr-2" /> Dossier N-1
                            </button>
                            <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/30 transition-all active:scale-95">
                                Générer Rapport Final
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
