"use client";

import { useState } from "react";
import {
    Gavel,
    Scale,
    FileSearch,
    Plus,
    Search,
    Clock,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    ShieldCheck,
    History,
    Download,
    Terminal,
    ArrowRight,
    UserCheck,
    Briefcase,
    Globe,
    FileText,
    Zap,
    Scale as ScaleIcon,
    Balance,
    Fingerprint,
    SearchCode,
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockClients } from "@/data/mock-clients";

interface JudicialCase {
    id: string;
    caseNumber: string;
    court: string;
    judge: string;
    parties: { plaintiff: string; defendant: string };
    deadline: string;
    status: "nommé" | "investigation" | "pré-rapport" | "finalisé";
    progress: number;
    priority: "high" | "medium" | "low";
}

const MOCK_CASES: JudicialCase[] = [
    {
        id: "JUD-CI-2024-142",
        caseNumber: "N° 142/2024",
        court: "Tribunal de Commerce d'Abidjan",
        judge: "M. le Juge Konan",
        parties: { plaintiff: "Telecom SA (Côte d'Ivoire)", defendant: "Global Dev Group" },
        deadline: "15 Juin 2026",
        status: "investigation",
        progress: 45,
        priority: "high"
    },
    {
        id: "JUD-SN-2024-088",
        caseNumber: "N° 088/2023",
        court: "Cour d'Appel de Dakar",
        judge: "Mme Fatou Diop",
        parties: { plaintiff: "Banque Atlantique Sénégal", defendant: "Immoland SAS" },
        deadline: "30 Avril 2026",
        status: "pré-rapport",
        progress: 85,
        priority: "medium"
    },
    {
        id: "JUD-ML-2024-005",
        caseNumber: "N° 005/2026",
        court: "TGI de Bamako",
        judge: "M. Sidibé",
        parties: { plaintiff: "Mali Logistique", defendant: "Mining Corp North" },
        deadline: "12 Juillet 2026",
        status: "nommé",
        progress: 10,
        priority: "low"
    }
];

export default function NexusJudicialCommandPage() {
    const [selectedCase, setSelectedCase] = useState<JudicialCase | null>(MOCK_CASES[0]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "investigation" | "reporting">("overview");

    const steps = [
        { label: "Désignation", desc: "Ordonnance & Serment" },
        { label: "Instruction", desc: "Réquisition & Dires" },
        { label: "Expertise", desc: "Analyse & Audition" },
        { label: "Dépôt", desc: "Clôture du rapport" }
    ];

    const currentStep = selectedCase ? (
        selectedCase.status === "nommé" ? 0 :
            selectedCase.status === "investigation" ? 1 :
                selectedCase.status === "pré-rapport" ? 2 : 3
    ) : 0;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Gavel className="w-64 h-64 text-amber-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Judicial Expertise & Arb.
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-amber-400">Judicial Command</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Gestion centralisée des missions d'expertise judiciaire OHADA. Intelligence Investigation, respect du contradictoire et rédaction assistée.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-amber-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Enregistrer une Ordonnance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Case Portfolio */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Portefeuille Affaires</h3>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {MOCK_CASES.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCase(c)}
                                className={cn(
                                    "glass-card rounded-[32px] border p-6 cursor-pointer transition-all group",
                                    selectedCase?.id === c.id
                                        ? "bg-amber-500/10 border-amber-500/30 shadow-2xl shadow-amber-900/10 translate-x-1"
                                        : "bg-slate-900/40 border-white/5 hover:border-amber-500/20"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        {c.caseNumber}
                                    </span>
                                    {c.priority === 'high' && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />}
                                </div>
                                <h4 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors">
                                    {c.parties.plaintiff} <span className="text-slate-600 font-medium">vs</span> {c.parties.defendant}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <Globe className="w-3 h-3" /> {c.court}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex-1 max-w-[120px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${c.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">{c.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Dashboard */}
                <div className="lg:col-span-8 space-y-8">
                    {selectedCase ? (
                        <>
                            {/* Upper Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <ScaleIcon className="w-6 h-6 text-amber-400" />
                                        <span className="text-[9px] text-emerald-400 font-black uppercase">Juge en Charge</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{selectedCase.judge}</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase mt-1">Titulaire du Siège</div>
                                </div>
                                <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <Clock className="w-6 h-6 text-rose-500" />
                                        <span className="text-[9px] text-rose-500 font-black uppercase">Délai Légal</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{selectedCase.deadline}</div>
                                    <div className="text-[10px] text-rose-400/60 font-black uppercase mt-1 italic">Dépôt URGENT (J-15)</div>
                                </div>
                                <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <Cpu className="w-6 h-6 text-indigo-400" />
                                        <span className="text-[9px] text-indigo-400 font-black uppercase">Scan Intel</span>
                                    </div>
                                    <div className="text-lg font-black text-white">850 Pièces</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase mt-1">Indexation Active</div>
                                </div>
                            </div>

                            {/* Progress Stepper Elite */}
                            <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                                <div className="flex justify-between items-center mb-12">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-3 relative flex-1">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black z-10 border-2 transition-all",
                                                idx < currentStep ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                                    idx === currentStep ? "bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-600/30 scale-110" :
                                                        "bg-slate-900 border-white/10 text-slate-600"
                                            )}>
                                                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-[10px] font-black uppercase tracking-tight", idx === currentStep ? "text-white" : "text-slate-600")}>{step.label}</p>
                                                <p className="text-[9px] text-slate-500 italic mt-0.5">{step.desc}</p>
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className={cn(
                                                    "absolute h-[2px] w-[calc(100%-40px)] top-5 left-[calc(50%+20px)] -z-0",
                                                    idx < currentStep ? "bg-gradient-to-r from-emerald-500 to-amber-600" : "bg-white/5"
                                                )} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
                                    {/* Forensic Tools */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <SearchCode className="w-4 h-4 text-amber-500" /> Investigation Center
                                        </h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Analyse Flux Financiers Suspices", icon: Fingerprint, color: "text-rose-400" },
                                                { label: "Vérification Facturation OHADA", icon: FileSearch, color: "text-indigo-400" },
                                                { label: "Audit de Solvabilité Parties", icon: Balance, color: "text-emerald-400" },
                                            ].map((tool, i) => (
                                                <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <tool.icon className={cn("w-5 h-5", tool.color)} />
                                                        <span className="text-[11px] font-black text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">{tool.label}</span>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Paradox / Dires */}
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-sky-400" /> Respect du Contradictoire
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="p-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group hover:border-sky-500/30 transition-all">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <Zap className="w-4 h-4 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 text-[10px] font-black italic">D</div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Dernier Dire • Conseil Défendeur</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-sky-500/50 pl-4">
                                                    "Nous contestons formellement l'utilisation d'un taux d'actualisation de 12% pour le calcul des préjudices..."
                                                </p>
                                                <div className="mt-4 flex gap-2">
                                                    <button className="px-4 py-2 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 text-[9px] font-black rounded-lg transition-all border border-sky-500/20">
                                                        Répondre dans le Rapport
                                                    </button>
                                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black rounded-lg transition-all border border-white/10">
                                                        IA Draft
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Action Bar Elite */}
                            <div className="bg-gradient-to-r from-amber-600/20 to-transparent p-8 rounded-[40px] border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex gap-6 items-center">
                                    <div className="w-16 h-16 rounded-[24px] bg-amber-600 flex items-center justify-center shadow-2xl shadow-amber-600/30">
                                        <FileText className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Rapport de Synthèse</h4>
                                        <p className="text-xs text-slate-500 max-w-sm">
                                            Compilez l'ordonnance, les investigations IA et les réponses aux dires en un rapport normé OHADA.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all">
                                        Pré-Rapport (Audit)
                                    </button>
                                    <button className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-amber-600/25">
                                        Dépôt Rapport Final
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[600px] glass-card rounded-[50px] border border-white/5 bg-slate-900/40 flex flex-col items-center justify-center text-center p-20">
                            <Balance className="w-20 h-20 text-slate-800 mb-6" />
                            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-widest">Nexus Command Center</h3>
                            <p className="text-slate-700 mt-2 max-w-sm">Sélectionnez une affaire judiciaire dans le portfolio pour piloter votre mission d'expertise.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
