"use client";

import { useState } from "react";
import {
    Map as MapIcon,
    ChevronRight,
    Trophy,
    Target,
    Zap,
    BookOpen,
    Award,
    Clock,
    CheckCircle2,
    Lock,
    Users,
    TrendingUp,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ROADMAPS = [
    {
        id: "RM-001",
        title: "Expertise SYSCOHADA",
        description: "Devenez une référence sur le plan comptable OHADA révisé.",
        level: "Débutant à Expert",
        duration: "120h",
        steps: [
            { id: 1, title: "Fondamentaux du SYSCOHADA", status: "completed", type: "course" },
            { id: 2, title: "Opérations Complexes & Provisions", status: "current", type: "course" },
            { id: 3, title: "États Financiers Annuels (DSF)", status: "locked", type: "course" },
            { id: 4, title: "Examen de Certification N1", status: "locked", type: "exam" }
        ],
        students: 1240,
        color: "from-teal-500 to-emerald-600"
    },
    {
        id: "RM-002",
        title: "Directeur de Consolidation",
        description: "Maîtrisez les groupes complexes et les normes internationales.",
        level: "Confirmé",
        duration: "85h",
        steps: [
            { id: 1, title: "Bases de la Consolidation", status: "completed", type: "course" },
            { id: 2, title: "Techniques Avancées & Périmètres", status: "locked", type: "course" },
            { id: 3, title: "Reporting sous IFRS", status: "locked", type: "course" },
            { id: 4, title: "Projet Pratique : Groupe Multi-pays", status: "locked", type: "project" }
        ],
        students: 540,
        color: "from-violet-500 to-purple-600"
    },
    {
        id: "RM-003",
        title: "Spécialiste Audit & Contrôle",
        description: "Audit interne, externe et gestion des risques.",
        level: "Intermédiaire",
        duration: "150h",
        steps: [
            { id: 1, title: "Méthodologie d'Audit", status: "completed", type: "course" },
            { id: 2, title: "Audit Fiscal & Social", status: "locked", type: "course" },
            { id: 3, title: "Contrôle Interne & COSO", status: "locked", type: "course" },
            { id: 4, title: "Certification CAC", status: "locked", type: "exam" }
        ],
        students: 890,
        color: "from-amber-500 to-orange-600"
    }
];

export default function RoadmapsPage() {
    const [selectedRoadmap, setSelectedRoadmap] = useState(ROADMAPS[0]);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-violet-500/20">
                        <MapIcon className="w-3 h-3" /> Parcours de Carrière
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Roadmaps Apprentissage
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Suivez des parcours structurés pour atteindre vos objectifs professionnels.
                        <span className="text-violet-400 font-bold"> Guidez votre progression.</span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-violet-400">12</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Spécialisations</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">4.2k</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Apprenants Enrôlés</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* List of Roadmaps */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-400" /> Choisissez votre voie
                    </h3>
                    <div className="space-y-3">
                        {ROADMAPS.map((rm) => (
                            <button
                                key={rm.id}
                                onClick={() => setSelectedRoadmap(rm)}
                                className={cn(
                                    "w-full p-6 text-left rounded-[32px] border transition-all relative overflow-hidden group",
                                    selectedRoadmap.id === rm.id
                                        ? "bg-slate-800/80 border-white/10 shadow-xl"
                                        : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b opacity-0 transition-opacity",
                                    rm.color,
                                    selectedRoadmap.id === rm.id ? "opacity-100" : ""
                                )} />

                                <h4 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{rm.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1 mb-4">{rm.description}</p>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                        <Clock className="w-3 h-3" /> {rm.duration}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                        <Users className="w-3 h-3" /> {rm.students}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20 rounded-[32px]">
                        <Sparkles className="w-8 h-8 text-violet-400 mb-4" />
                        <h4 className="font-bold text-white mb-2">Parcours Personnalisé ?</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Nos conseillers pédagogiques peuvent vous aider à créer une roadmap sur mesure selon vos besoins spécifiques.
                        </p>
                        <button className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all">
                            Contacter un Coach
                        </button>
                    </div>
                </div>

                {/* Detailed View */}
                <div className="lg:col-span-8">
                    <div className={cn(
                        "rounded-[48px] p-10 border border-white/5 relative overflow-hidden min-h-[600px] flex flex-col",
                        "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl"
                    )}>
                        {/* Background Decoration */}
                        <div className={cn(
                            "absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br opacity-5 blur-[100px] rounded-full",
                            selectedRoadmap.color
                        )} />

                        <div className="relative z-10 flex-1">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{selectedRoadmap.title}</h2>
                                    <p className="text-slate-400 max-w-xl text-lg leading-relaxed">{selectedRoadmap.description}</p>
                                </div>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl bg-gradient-to-br text-white text-xs font-black uppercase tracking-widest",
                                    selectedRoadmap.color
                                )}>
                                    Certifiant
                                </div>
                            </div>

                            {/* Progress Tracking */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">25%</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Complété</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-teal-500 w-1/4 rounded-full" />
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">12h</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Effectuées</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-4 leading-relaxed font-bold italic">Continuer : Opérations Complexes</p>
                                </div>
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">1</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Certificat Final</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-4 leading-relaxed font-bold italic">Inscrit à l'ordre OHADA</p>
                                </div>
                            </div>

                            {/* Steps / Roadmap Visualization */}
                            <div className="space-y-6 relative ml-6">
                                {/* Vertical connection line */}
                                <div className="absolute top-0 bottom-0 left-[18px] w-1 bg-slate-800 rounded-full" />

                                {selectedRoadmap.steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-8 group/step relative">
                                        {/* Connector Circle */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center z-10 border-[6px] border-[#0a0c10] transition-all group-hover/step:scale-110 shadow-lg",
                                            step.status === "completed" ? "bg-emerald-500 text-white" :
                                                step.status === "current" ? "bg-teal-500 text-white animate-pulse" :
                                                    "bg-slate-800 text-slate-600"
                                        )}>
                                            {step.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                                                step.status === "current" ? <div className="w-2.5 h-2.5 bg-white rounded-full" /> :
                                                    <Lock className="w-4 h-4" />}
                                        </div>

                                        {/* Step Card */}
                                        <div className={cn(
                                            "flex-1 p-6 rounded-3xl border transition-all duration-500 flex justify-between items-center group/card",
                                            step.status === "completed" ? "bg-emerald-500/5 border-emerald-500/10 italic" :
                                                step.status === "current" ? "bg-teal-500/10 border-teal-500/20 shadow-lg shadow-teal-500/5 -translate-y-1" :
                                                    "bg-slate-900/50 border-white/5 opacity-60"
                                        )}>
                                            <div className="flex gap-4 items-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    step.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                        step.status === "current" ? "bg-teal-500/10 text-teal-400" :
                                                            "bg-slate-800 text-slate-500"
                                                )}>
                                                    {step.type === "course" ? <BookOpen className="w-5 h-5" /> :
                                                        step.type === "exam" ? <Trophy className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h5 className={cn(
                                                        "font-bold text-sm mb-0.5",
                                                        step.status === "current" ? "text-teal-400" : "text-white"
                                                    )}>{step.title}</h5>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{step.type}</p>
                                                </div>
                                            </div>

                                            {step.status === "current" ? (
                                                <Link href="/training/courses" className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black transition-all group-hover/card:scale-105">
                                                    Continuer
                                                </Link>
                                            ) : step.status === "completed" ? (
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">Validé</span>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Summary */}
                        <div className="mt-auto pt-10 border-t border-white/5 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-black">Certificat Cible</span>
                                        <span className="text-white font-bold">Expert {selectedRoadmap.title}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-white/10 pl-4">
                                        <span className="text-[10px] text-slate-500 uppercase font-black">Reconissance</span>
                                        <span className="text-white font-bold">Ordre National, OHADA</span>
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-white text-black rounded-[24px] font-black transition-all hover:bg-slate-200 shadow-xl flex items-center gap-3">
                                    Télécharger le Syllabus <TrendingUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
