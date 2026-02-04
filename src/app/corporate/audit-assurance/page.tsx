"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Search,
    Filter,
    ClipboardCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Users,
    Building2,
    Calendar,
    Download,
    History,
    RefreshCw,
    Plus,
    LayoutGrid,
    Target,
    Zap,
    Scale,
    Activity,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditProject {
    id: string;
    title: string;
    department: string;
    type: "internal" | "esg" | "compliance" | "it";
    status: "planning" | "fieldwork" | "review" | "finalized";
    riskLevel: "low" | "medium" | "high";
    progress: number;
    leadAuditor: string;
    dueDate: string;
    findings: { critical: number; medium: number };
}

const MOCK_AUDITS: AuditProject[] = [
    {
        id: "AUD-2501",
        title: "Audit de l'Approvisionnement - Zone Ouest",
        department: "Logistique & Achat",
        type: "internal",
        status: "fieldwork",
        riskLevel: "high",
        progress: 65,
        leadAuditor: "Mamadou Sy",
        dueDate: "2026-03-15",
        findings: { critical: 2, medium: 5 }
    },
    {
        id: "AUD-2502",
        title: "Vérification de Conformité ESG 2025",
        department: "RSE & Direction Générale",
        type: "esg",
        status: "planning",
        riskLevel: "medium",
        progress: 20,
        leadAuditor: "Aminata Kane",
        dueDate: "2026-04-10",
        findings: { critical: 0, medium: 0 }
    },
    {
        id: "AUD-2498",
        title: "Audit Cybersécurité & Données",
        department: "SI / IT",
        type: "it",
        status: "review",
        riskLevel: "high",
        progress: 90,
        leadAuditor: "Fatou Diop",
        dueDate: "2026-02-28",
        findings: { critical: 1, medium: 8 }
    },
    {
        id: "AUD-2495",
        title: "Audit Paie & Social",
        department: "Ressources Humaines",
        type: "compliance",
        status: "finalized",
        riskLevel: "low",
        progress: 100,
        leadAuditor: "Saliou Ndao",
        dueDate: "2026-02-01",
        findings: { critical: 0, medium: 3 }
    }
];

export default function NexusAuditPage() {
    const [audits, setAudits] = useState<AuditProject[]>(MOCK_AUDITS);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredAudits = audits.filter(a => filterStatus === "all" || a.status === filterStatus);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ClipboardCheck className="w-64 h-64 text-blue-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Audit & Assurance Hub
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-blue-400">Audit Management</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Gestion collaborative du cycle d'audit complet : de la planification basée sur les risques au suivi des recommandations.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-blue-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Nouvelle Mission
                    </button>
                </div>
            </div>

            {/* Dashboard Overview */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: "Missions Actives", value: "12", icon: Activity, color: "text-blue-400" },
                    { label: "Observations Critiques", value: "3", icon: AlertCircle, color: "text-rose-400" },
                    { label: "Audit-Days Utilisés", value: "154", icon: Clock, color: "text-amber-400" },
                    { label: "Taux de Clôture Recommandations", value: "88%", icon: CheckCircle2, color: "text-emerald-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-3xl bg-slate-900/40 border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Audit List */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {["all", "planning", "fieldwork", "review", "finalized"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filterStatus === status ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-white/5 text-slate-500 hover:bg-white/10"
                                    )}
                                >
                                    {status === "all" ? "Touts" : status}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une mission..."
                                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAudits.map(audit => (
                            <div
                                key={audit.id}
                                className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6 group hover:border-blue-500/20 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            audit.status === "finalized" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                                        )}>
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">{audit.id}</p>
                                            <h4 className="text-md font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1">{audit.title}</h4>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                        audit.riskLevel === "high" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                            audit.riskLevel === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    )}>
                                        Risque {audit.riskLevel}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 mb-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Progression de la Mission</span>
                                            <span className="text-white font-bold">{audit.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${audit.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2 shrink-0">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                U{i}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Observations</p>
                                        <div className="flex gap-3">
                                            <span className="text-xs font-bold text-rose-400">{audit.findings.critical} Critiques</span>
                                            <span className="text-xs font-bold text-slate-400">{audit.findings.medium} Moyennes</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Échéance</p>
                                        <p className="text-xs font-bold text-white">{audit.dueDate}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase">
                                            <Building2 className="w-3 h-3" /> {audit.department}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase">
                                            <User className="w-3 h-3" /> {audit.leadAuditor}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20">
                                            Ouvrir Audit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
