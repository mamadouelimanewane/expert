"use client";

import { useState } from "react";
import {
    ClipboardCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Filter,
    Search,
    Download,
    FileText,
    TrendingUp,
    ShieldCheck,
    Lock,
    Eye,
    ChevronDown,
    MoreVertical,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewSection {
    id: string;
    title: string;
    description: string;
    status: "done" | "pending" | "alert";
    tasks: { id: string; label: string; completed: boolean }[];
}

const REVIEW_DATA: ReviewSection[] = [
    {
        id: "s1",
        title: "Trésorerie & Banque",
        description: "Vérification des soldes bancaires et rapprochements.",
        status: "done",
        tasks: [
            { id: "t1", label: "Contrôle des soldes de clôture", completed: true },
            { id: "t2", label: "Vérification des suspens de rapprochement", completed: true },
            { id: "t3", label: "État des cautions et garanties", completed: true }
        ]
    },
    {
        id: "s2",
        title: "Cycles Ventes & Clients",
        description: "Analyse du poste clients et des facturations.",
        status: "pending",
        tasks: [
            { id: "t4", label: "Coupure des ventes (Cut-off)", completed: true },
            { id: "t5", label: "Analyse des créances douteuses", completed: false },
            { id: "t6", label: "Circularisation clients", completed: false }
        ]
    },
    {
        id: "s3",
        title: "Cycles Achats & Fournisseurs",
        description: "Contrôle des charges et dettes fournisseurs.",
        status: "alert",
        tasks: [
            { id: "t7", label: "Vérification des factures non parvenues", completed: false },
            { id: "t8", label: "Contrôle des doublons fournisseurs", completed: true },
            { id: "t9", label: "Analyse des anomalies de TVA sur achats", completed: false }
        ]
    }
];

export default function RevisionPage() {
    const [expandedSections, setExpandedSections] = useState<string[]>(["s1", "s2"]);

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header SEPTEO Style */}
            <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <ClipboardCheck className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                            <div className="p-4 bg-indigo-600 rounded-[24px] shadow-2xl shadow-indigo-600/30">
                                <ClipboardCheck className="w-8 h-8 text-white" />
                            </div>
                            Révision & Certification
                        </h2>
                        <p className="text-slate-400 mt-3 max-w-2xl font-medium text-lg leading-relaxed">
                            Processus de vérification automatisé et manuel pour la clôture des comptes conforme aux normes OHADA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                            <Download className="w-4 h-4" /> Rapport de Révision
                        </button>
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <ShieldCheck className="w-5 h-5" /> Certifier les Comptes
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Avancement Global</p>
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90">
                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={226} strokeDashoffset={226 * (1 - 0.65)} className="text-indigo-500" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-black text-white text-lg">65%</span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white">Prêt pour Clôture</h4>
                            <p className="text-xs text-slate-500 font-medium">12 sections vérifiées sur 18</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Anomalies Détectées</p>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-rose-400">04 Alertes</h4>
                            <p className="text-xs text-slate-500 font-medium">Nécéssitent une correction immédiate</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col justify-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Lock className="w-16 h-16 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Souveraineté & Compliance
                    </p>
                    <h4 className="text-xl font-black text-white">Données Sécurisées</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Hébergement certifié SecNumCloud & RGPD. Tous vos processus de révision sont tracés.
                    </p>
                </div>
            </div>

            {/* Main Review Workflow */}
            <div className="space-y-6">
                {REVIEW_DATA.map((section) => (
                    <div key={section.id} className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden transition-all">
                        <div
                            className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                    section.status === "done" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                        section.status === "alert" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                            "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                )}>
                                    {section.status === "done" ? <CheckCircle2 className="w-6 h-6" /> :
                                        section.status === "alert" ? <AlertCircle className="w-6 h-6" /> :
                                            <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{section.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{section.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Complétion</p>
                                    <p className="font-mono font-bold text-white">
                                        {section.tasks.filter(t => t.completed).length} / {section.tasks.length}
                                    </p>
                                </div>
                                <ChevronDown className={cn("w-6 h-6 text-slate-600 transition-transform", expandedSections.includes(section.id) && "rotate-180")} />
                            </div>
                        </div>

                        {expandedSections.includes(section.id) && (
                            <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4",
                                                task.completed
                                                    ? "bg-emerald-500/5 border-emerald-500/10"
                                                    : "bg-slate-800/30 border-white/5 hover:border-indigo-500/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                                task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-900 border-white/10 text-transparent group-hover:border-indigo-500"
                                            )}>
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-xs font-bold leading-tight", task.completed ? "text-slate-300" : "text-white")}>
                                                    {task.label}
                                                </p>
                                            </div>
                                            <MoreVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                    <button className="p-5 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all">
                                        + Ajouter un contrôle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Smart Audit Insights (AI) */}
            <div className="glass-card rounded-[48px] p-10 border border-white/5 bg-gradient-to-br from-slate-900 to-indigo-900/10">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                    Analytique & Points de Vigilance IA
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full">Anomalie Critique</span>
                            <span className="text-xs text-slate-500 font-bold font-mono">27/01/2024</span>
                        </div>
                        <h4 className="font-bold text-white text-lg">Incohérence TVA / Chiffre d'Affaires</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            L'IA a détecté un écart de 2.4% entre la TVA collectée déclarée et le volume des factures de ventes enregistrées ce mois-ci. Vérifiez le compte 4431.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:underline">Analyser le détail</button>
                            <button className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Ignorer</button>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 space-y-4 opacity-70">
                        <div className="flex justify-between items-start">
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">Optimisation</span>
                            <span className="text-xs text-slate-500 font-bold font-mono">25/01/2024</span>
                        </div>
                        <h4 className="font-bold text-white text-lg">Poste Fournisseurs Débiteurs</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            Présence de soldes débiteurs inhabituels sur 3 comptes fournisseurs. Probabilité de double paiement identifiée.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:underline">Consulter les comptes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
