"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    Play,
    Pause,
    CheckCircle2,
    Clock,
    FileText,
    Award,
    ChevronRight,
    BookOpen,
    Download,
    Lock,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lesson { id: string; title: string; duration: string | null; type: string; }
interface ModuleT { id: string; title: string; duration: string | null; lessons: Lesson[]; }
interface CourseDetail {
    id: string; title: string; subtitle: string | null; instructorName: string | null;
    durationLabel: string | null; cpfHours: number; level: string; isCertifying: boolean;
    skills: string[]; modules: ModuleT[]; quiz: { id: string; title: string } | null; studentsCount: number;
}

function CoursePlayerInner() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            let id = courseId;
            if (!id) {
                const listRes = await fetch("/api/training/courses");
                const listData = await listRes.json();
                id = listData.courses?.[0]?.id ?? null;
            }
            if (!id) { setLoading(false); return; }
            const res = await fetch(`/api/training/courses/${id}`);
            const data = await res.json();
            setCourse(data.course ?? null);
            setProgress(data.enrollment?.progress ?? 0);
            setLoading(false);
        }
        load();
    }, [courseId]);

    const allLessons = useMemo(() => course?.modules.flatMap(m => m.lessons) ?? [], [course]);
    const totalLessons = allLessons.length;
    const completedCount = Math.floor((progress / 100) * totalLessons);

    useEffect(() => {
        if (allLessons.length > 0 && !activeLessonId) {
            const nextIdx = Math.min(completedCount, allLessons.length - 1);
            setActiveLessonId(allLessons[nextIdx].id);
        }
    }, [allLessons, completedCount, activeLessonId]);

    const activeLesson = allLessons.find(l => l.id === activeLessonId) ?? null;
    const activeIndex = allLessons.findIndex(l => l.id === activeLessonId);

    const persistProgress = useCallback(async (newProgress: number) => {
        if (!course) return;
        setSaving(true);
        try {
            const res = await fetch("/api/training/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId: course.id, progress: newProgress }),
            });
            if (res.ok) setProgress(newProgress);
        } finally {
            setSaving(false);
        }
    }, [course]);

    const markCurrentDone = () => {
        if (totalLessons === 0 || activeIndex < 0) return;
        const newProgress = Math.round(((activeIndex + 1) / totalLessons) * 100);
        persistProgress(newProgress);
        if (activeIndex + 1 < allLessons.length) {
            setActiveLessonId(allLessons[activeIndex + 1].id);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex items-center justify-center">
                <p className="text-slate-500">Aucune formation disponible pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex">
            <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "mr-[400px]" : "")}>
                <div className="relative bg-black aspect-video max-h-[60vh] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                        <div className="text-center">
                            <div
                                className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-2" />}
                            </div>
                            <h3 className="text-xl font-bold text-white">{activeLesson?.title ?? "—"}</h3>
                            <p className="text-slate-500 text-sm mt-2">Durée : {activeLesson?.duration ?? "—"}</p>
                        </div>
                        <div className="absolute bottom-6 right-6 w-40 h-40 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-black text-white shadow-2xl border-4 border-slate-900">
                            {course.instructorName?.slice(0, 2).toUpperCase() || "—"}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="page-title">{course.title}</h1>
                            <p className="page-subtitle">{course.subtitle}</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={markCurrentDone}
                                disabled={saving || progress >= 100}
                                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> {progress >= 100 ? "Terminé" : "Marquer terminé"}
                            </button>
                            {course.quiz && (
                                <Link href={`/training/quiz?quizId=${course.quiz.id}`} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-lg shadow-amber-600/20">
                                    <FileText className="w-4 h-4" /> Passer le Quiz
                                </Link>
                            )}
                            {course.isCertifying && (
                                <Link href="/training/certificates" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-500 transition-colors flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Mes Certificats
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-[24px] flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-xl font-black text-white shrink-0">
                            {course.instructorName?.slice(0, 2).toUpperCase() || "—"}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{course.instructorName || "Formateur à confirmer"}</h3>
                            <p className="text-sm text-slate-500">{course.studentsCount} inscrit{course.studentsCount !== 1 ? "s" : ""}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Durée Totale", value: course.durationLabel || "—", icon: Clock },
                            { label: "Modules", value: course.modules.length, icon: BookOpen },
                            { label: "Leçons", value: totalLessons, icon: Play },
                            { label: "Heures CPF", value: `${course.cpfHours}h`, icon: Award }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-center">
                                <stat.icon className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                                <p className="text-xl font-black text-white">{stat.value}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {course.skills.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-white uppercase text-xs tracking-widest text-teal-500">Compétences visées</h3>
                            <div className="flex flex-wrap gap-2">
                                {course.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-900 text-slate-400 text-xs rounded-full border border-white/5">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn(
                "fixed right-0 top-0 bottom-0 w-[400px] bg-slate-900 border-l border-white/5 overflow-y-auto transition-transform duration-300 z-50",
                sidebarOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b border-white/5 sticky top-0 bg-slate-900 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-white">Contenu du cours</h2>
                        <span className="text-xs text-teal-400 font-bold">{progress}% complété</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {course.modules.map((module, mIdx) => {
                        const moduleLessonStartIdx = course.modules.slice(0, mIdx).reduce((s, m) => s + m.lessons.length, 0);
                        const isLocked = moduleLessonStartIdx > completedCount;
                        const isCurrent = activeLesson ? module.lessons.some(l => l.id === activeLesson.id) : false;
                        return (
                            <div key={module.id} className={cn(
                                "rounded-2xl border transition-all",
                                isCurrent ? "bg-slate-800/50 border-teal-500/30" :
                                    isLocked ? "bg-slate-900/30 border-white/5 opacity-60" : "bg-slate-800/20 border-white/5"
                            )}>
                                <div className="p-4 flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        isLocked ? "bg-slate-800 text-slate-600" : isCurrent ? "bg-teal-500/20 text-teal-400" : "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {isLocked ? <Lock className="w-5 h-5" /> : <span className="font-bold">{mIdx + 1}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">{module.title}</h3>
                                        <p className="text-xs text-slate-500">{module.duration || "—"}</p>
                                    </div>
                                    <ChevronRight className={cn("w-4 h-4 text-slate-500 transition-transform", isCurrent && "rotate-90")} />
                                </div>

                                {!isLocked && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {module.lessons.map((lesson, lIdx) => {
                                            const globalIdx = moduleLessonStartIdx + lIdx;
                                            const done = globalIdx < completedCount;
                                            const current = lesson.id === activeLessonId;
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => setActiveLessonId(lesson.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                                                        current ? "bg-teal-500/20 border border-teal-500/30" : "hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                                        done ? "bg-emerald-500 text-white" : current ? "bg-teal-500 text-white" : "bg-slate-700 text-slate-400"
                                                    )}>
                                                        {done ? <CheckCircle2 className="w-3 h-3" /> :
                                                            lesson.type === "video" ? <Play className="w-3 h-3" /> :
                                                                lesson.type === "quiz" ? <FileText className="w-3 h-3" /> :
                                                                    <Download className="w-3 h-3" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-xs font-medium truncate", current ? "text-teal-400" : "text-slate-300")}>{lesson.title}</p>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{lesson.duration || "—"}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed right-4 bottom-4 w-12 h-12 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-teal-500 transition-colors"
            >
                <BookOpen className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function CoursePlayerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>}>
            <CoursePlayerInner />
        </Suspense>
    );
}
