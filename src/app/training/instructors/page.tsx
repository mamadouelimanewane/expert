"use client";

import { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    Play,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Instructor {
    name: string;
    color: string | null;
    coursesCount: number;
    studentsCount: number;
    courses: { id: string; title: string; durationLabel: string | null; studentsCount: number }[];
    specialties: string[];
}

export default function InstructorsPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [selected, setSelected] = useState<Instructor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/training/instructors")
            .then(r => r.json())
            .then(d => {
                setInstructors(d.instructors ?? []);
                setSelected(d.instructors?.[0] ?? null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>;
    }

    const totalCourses = instructors.reduce((s, i) => s + i.coursesCount, 0);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-teal-500/20">
                        <Users className="w-3 h-3" /> Nos Formateurs
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                        Experts & Instructeurs
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Les intervenants associés aux formations du catalogue.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">{instructors.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Formateurs</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-teal-400">{totalCourses}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Formations</p>
                    </div>
                </div>
            </div>

            {instructors.length === 0 ? (
                <p className="text-center text-slate-500 py-20">Aucun formateur enregistré.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-4">
                        {instructors.map((instructor) => (
                            <div
                                key={instructor.name}
                                onClick={() => setSelected(instructor)}
                                className={cn(
                                    "p-5 rounded-[24px] border cursor-pointer transition-all group relative overflow-hidden",
                                    selected?.name === instructor.name ? "bg-slate-800/80 border-teal-500/40 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-black text-white shrink-0 shadow-lg", instructor.color || "from-slate-700 to-slate-800")}>
                                        {instructor.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors truncate">{instructor.name}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Users className="w-3 h-3" /> {instructor.studentsCount} inscrit{instructor.studentsCount !== 1 ? "s" : ""}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <BookOpen className="w-3 h-3" /> {instructor.coursesCount} cours
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        {selected && (
                            <>
                                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                                    <div className={cn("h-32 bg-gradient-to-r relative", selected.color || "from-slate-700 to-slate-800")}>
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>

                                    <div className="p-8 -mt-16 relative">
                                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                            <div className={cn("w-28 h-28 rounded-3xl bg-gradient-to-br flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-black text-white shadow-2xl border-4 border-slate-900 shrink-0", selected.color || "from-slate-700 to-slate-800")}>
                                                {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-black text-white">{selected.name}</h2>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            {[
                                                { label: "Étudiants", value: selected.studentsCount, icon: Users, color: "text-teal-400" },
                                                { label: "Formations", value: selected.coursesCount, icon: BookOpen, color: "text-violet-400" },
                                            ].map((stat, i) => (
                                                <div key={i} className="text-center p-4 bg-slate-800/50 rounded-2xl">
                                                    <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                                                    <p className="text-lg font-black text-white">{stat.value}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {selected.specialties.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="font-bold text-white mb-3">Expertises</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selected.specialties.map((spec, i) => (
                                                        <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-white/5">{spec}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                        <Play className="w-5 h-5 text-teal-400" /> Formations de {selected.name}
                                    </h3>
                                    <div className="space-y-3">
                                        {selected.courses.map((course) => (
                                            <Link href={`/training/courses?courseId=${course.id}`} key={course.id} className="flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl border border-white/5 transition-all group cursor-pointer">
                                                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0", selected.color || "from-slate-700 to-slate-800")}>
                                                    <Play className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors truncate">{course.title}</h4>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                        <span><Users className="w-3 h-3 inline mr-1" />{course.studentsCount}</span>
                                                        {course.durationLabel && <span>{course.durationLabel}</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
