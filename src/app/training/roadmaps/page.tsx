"use client";

import { useState, useEffect } from "react";
import {
    Map as MapIcon,
    Trophy,
    Target,
    BookOpen,
    Award,
    Clock,
    CheckCircle2,
    Lock,
    Users,
    TrendingUp,
    Sparkles,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Step { id: string; title: string; status: "completed" | "current" | "locked"; type: "course"; }
interface Roadmap {
    id: string; title: string; description: string; level: string; color: string;
    duration: string; students: number; steps: Step[]; progressPct: number; completedHours: number;
}

export default function RoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [selected, setSelected] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/training/roadmaps")
            .then(r => r.json())
            .then(d => {
                setRoadmaps(d.roadmaps ?? []);
                setSelected(d.roadmaps?.[0] ?? null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
    }

    const enrolledSum = roadmaps.reduce((s, r) => s + r.students, 0);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-violet-500/20">
                        <MapIcon className="w-3 h-3" /> Parcours de Carrière
                    </div>
                    <h1 className="page-title-dark">
                        Roadmaps Apprentissage
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Suivez des parcours structurés combinant plusieurs formations du catalogue.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-violet-400">{roadmaps.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Parcours</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">{enrolledSum}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Inscriptions cumulées</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-400" /> Choisissez votre voie
                    </h3>
                    <div className="space-y-3">
                        {roadmaps.map((rm) => (
                            <button
                                key={rm.id}
                                onClick={() => setSelected(rm)}
                                className={cn(
                                    "w-full p-6 text-left rounded-[32px] border transition-all relative overflow-hidden group",
                                    selected?.id === rm.id ? "bg-slate-800/80 border-white/10 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className={cn("absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b opacity-0 transition-opacity", rm.color, selected?.id === rm.id ? "opacity-100" : "")} />
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
                </div>

                <div className="lg:col-span-8">
                    {selected && (
                        <div className="rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] p-4 sm:p-6 lg:p-10 border border-white/5 relative overflow-hidden min-h-[350px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
                            <div className={cn("absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br opacity-5 blur-[100px] rounded-full", selected.color)} />

                            <div className="relative z-10 flex-1">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">{selected.title}</h2>
                                        <p className="text-slate-400 max-w-xl text-lg leading-relaxed">{selected.description}</p>
                                    </div>
                                    <div className={cn("px-4 py-2 rounded-2xl bg-gradient-to-br text-white text-xs font-black uppercase tracking-widest", selected.color)}>
                                        {selected.level}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{selected.progressPct}%</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Complété</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${selected.progressPct}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{selected.completedHours}h</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Heures validées</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{selected.students}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Inscrits</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 relative ml-6">
                                    <div className="absolute top-0 bottom-0 left-[18px] w-1 bg-slate-800 rounded-full" />
                                    {selected.steps.map((step) => (
                                        <div key={step.id} className="flex items-center gap-8 relative">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center z-10 border-[6px] border-[#0a0c10] transition-all shadow-lg",
                                                step.status === "completed" ? "bg-emerald-500 text-white" :
                                                    step.status === "current" ? "bg-teal-500 text-white animate-pulse" : "bg-slate-800 text-slate-600"
                                            )}>
                                                {step.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                                                    step.status === "current" ? <div className="w-2.5 h-2.5 bg-white rounded-full" /> : <Lock className="w-4 h-4" />}
                                            </div>

                                            <div className={cn(
                                                "flex-1 p-6 rounded-3xl border transition-all duration-500 flex justify-between items-center",
                                                step.status === "completed" ? "bg-emerald-500/5 border-emerald-500/10" :
                                                    step.status === "current" ? "bg-teal-500/10 border-teal-500/20 shadow-lg shadow-teal-500/5 -translate-y-1" :
                                                        "bg-slate-900/50 border-white/5 opacity-60"
                                            )}>
                                                <div className="flex gap-4 items-center">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        step.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                            step.status === "current" ? "bg-teal-500/10 text-teal-400" : "bg-slate-800 text-slate-500"
                                                    )}>
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h5 className={cn("font-bold text-sm mb-0.5", step.status === "current" ? "text-teal-400" : "text-white")}>{step.title}</h5>
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Formation</p>
                                                    </div>
                                                </div>

                                                {step.status === "current" ? (
                                                    <Link href={`/training/courses?courseId=${step.id}`} className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black transition-all">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
