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
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JudicialCase {
    id: string;
    caseNumber: string;
    court: string;
    judge: string;
    parties: { plaintiff: string; defendant: string };
    deadline: string;
    status: "nommé" | "investigation" | "pré-rapport" | "finalisé";
}

const MOCK_CASES: JudicialCase[] = [
    {
        id: "1",
        caseNumber: "N° 142/2024",
        court: "Tribunal de Commerce d'Abidjan",
        judge: "M. le Juge Konan",
        parties: { plaintiff: "Telecom SA", defendant: "Global Dev" },
        deadline: "15/06/2024",
        status: "investigation"
    },
    {
        id: "2",
        caseNumber: "N° 088/2023",
        court: "Cour d'Appel de Dakar",
        judge: "Mme Diop",
        parties: { plaintiff: "Banque Atlantique", defendant: "Immo Plus" },
        deadline: "30/04/2024",
        status: "pré-rapport"
    }
];

export default function JudicialExpertPage() {
    const [selectedCase, setSelectedCase] = useState<JudicialCase | null>(MOCK_CASES[0]);
    const [activeStep, setActiveStep] = useState(2);

    const steps = [
        { label: "Désignation", desc: "Ordonnance & Serment" },
        { label: "Accès Pièces", desc: "Réquisition & Dires" },
        { label: "Instruction", desc: "Analyse & Audition" },
        { label: "Rédaction", desc: "Dépôt du rapport" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-amber-500" />
                        Expertise Judiciaire & Arbitrage
                    </h2>
                    <p className="text-slate-400 mt-1">Outils pour missions d'expertises comptables et financières ordonnées par les tribunaux.</p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all">
                        <History className="w-4 h-4" /> Archives Dossiers
                    </button>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all">
                        <Plus className="w-4 h-4" /> Nouveau Dossier
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: Open Cases */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input type="text" placeholder="Rechercher une affaire..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                    </div>

                    <div className="space-y-2">
                        {MOCK_CASES.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCase(c)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all group",
                                    selectedCase?.id === c.id ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-900/20 px-2 py-0.5 rounded border border-amber-500/20">{c.caseNumber}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">{c.status}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                                    {c.parties.plaintiff} vs {c.parties.defendant}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-2 truncate">{c.court}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content: Case Dashboard */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedCase ? (
                        <>
                            {/* Progress Stepper */}
                            <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                                <div className="flex justify-between items-center mb-8">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 relative flex-1">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2",
                                                idx < activeStep ? "bg-emerald-500 border-emerald-500 text-white" :
                                                    idx === activeStep ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30" :
                                                        "bg-slate-900 border-slate-700 text-slate-500"
                                            )}>
                                                {idx < activeStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-[10px] font-bold uppercase", idx === activeStep ? "text-white" : "text-slate-500")}>{step.label}</p>
                                                <p className="text-[8px] text-slate-600 hidden md:block">{step.desc}</p>
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className={cn(
                                                    "absolute h-0.5 w-full top-4 left-1/2 -z-0",
                                                    idx < activeStep ? "bg-emerald-500" : "bg-slate-800"
                                                )} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informations Tribunal</p>
                                        <div className="flex items-center gap-3">
                                            <Scale className="w-5 h-5 text-slate-600" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{selectedCase.judge}</p>
                                                <p className="text-xs text-slate-500">{selectedCase.court}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Délai Légal</p>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-rose-500" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{selectedCase.deadline}</p>
                                                <p className="text-xs text-rose-400 font-bold">J - 45 jours restants</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Forensics & IA Audit Integration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-6">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Terminal className="w-5 h-5 text-indigo-400" />
                                        Forensics & Investigation IA
                                    </h3>
                                    <p className="text-xs text-slate-500">Scanner les flux suspects pour répondre aux questions du Juge.</p>

                                    <div className="space-y-3">
                                        <button className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-left flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <FileSearch className="w-6 h-6 text-indigo-400" />
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white">Recherche Flux Sortants Atypiques</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-700" />
                                        </button>
                                        <button className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-left flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white">Analyse de la solvabilité (Bilan)</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-700" />
                                        </button>
                                    </div>
                                </div>

                                {/* Dires des Parties & Respect du Contradictoire */}
                                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col">
                                    <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                                        <MessageSquare className="w-5 h-5 text-amber-500" />
                                        Log des Dires & Contradictoire
                                    </h3>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                                <UserCheck className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">CONSEIL DÉFENDEUR - 20/05/2024</p>
                                                <p className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                                    Observations sur le calcul des préjudices financiers. Nous contestons le taux d'actualisation...
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Aide à la Réponse (IA)</h4>
                                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                "L'expert peut répondre que le taux utilisé est conforme aux standards du marché UEMOA pour le secteur télécom..."
                                            </p>
                                            <button className="text-[10px] text-indigo-400 font-bold mt-2 hover:underline">Insérer dans projet de rapport</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Generation */}
                            <div className="p-6 bg-gradient-to-r from-amber-600/10 to-transparent border border-amber-600/20 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                                        <Gavel className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Rapport final d'expertise</h4>
                                        <p className="text-xs text-slate-500 italic max-w-sm">
                                            Assurez-vous d'avoir répondu à tous les points de l'ordonnance avant le dépôt définitif au greffe.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
                                        Pré-rapport
                                    </button>
                                    <button className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20">
                                        Dépôt Rapport Final
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-12">
                            <Scale className="w-16 h-16 mb-4 opacity-10" />
                            <p>Sélectionnez un dossier judiciaire pour gérer l'expertise.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
