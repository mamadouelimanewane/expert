"use client";

import { useState, useEffect } from "react";
import {
    GraduationCap,
    BookOpen,
    Play,
    CheckCircle2,
    Clock,
    Award,
    Bell,
    Search,
    Filter,
    Zap,
    Users,
    Map as MapIcon,
    Trophy,
    MessageSquare,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EnrolledCourse { id: string; title: string; category: string; duration: number; progress: number; status: string; }
interface Certificate { id: string; title: string; issueDate: string; }

export default function TrainingAcademyPage() {
    const [activeTab, setActiveTab] = useState<"courses" | "alerts">("courses");
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState<{ completedHours: number; requiredHours: number; period: string } | null>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [availableCourses, setAvailableCourses] = useState<{ id: string; title: string }[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/academy/progress").then(r => r.json()),
            fetch("/api/training/certificates").then(r => r.json()),
            fetch("/api/training/courses").then(r => r.json()),
        ]).then(([progress, certs, courses]) => {
            setUserStats(progress.user);
            setEnrolledCourses(progress.courses ?? []);
            setCertificates(certs.certificates ?? []);
            setAvailableCourses((courses.courses ?? []).map((c: any) => ({ id: c.id, title: c.title })));
        }).finally(() => setLoading(false));
    }, []);

    const enrolledIds = new Set(enrolledCourses.map(c => c.id));
    const notStarted = availableCourses.filter(c => !enrolledIds.has(c.id));

    const filteredEnrolled = enrolledCourses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    const inProgress = enrolledCourses.find(c => c.status === "in_progress");
    const pctHours = userStats ? Math.min(100, Math.round((userStats.completedHours / (userStats.requiredHours || 1)) * 100)) : 0;

    if (loading) {
        return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-teal-500/5 via-transparent to-transparent rounded-[32px] px-10">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-teal-500/20">
                        <GraduationCap className="w-3 h-3" /> Formation & Veille
                    </div>
                    <h1 className="page-title">
                        Cabinet Academy
                    </h1>
                    <p className="page-subtitle max-w-2xl text-lg">
                        Formations certifiantes et suivi des heures de formation continue.
                    </p>
                </div>

                <div className="flex gap-4 z-10 items-center">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Heures {userStats?.period}</p>
                        <p className="text-2xl font-black text-white">{userStats?.completedHours ?? 0}<span className="text-teal-400">/{userStats?.requiredHours ?? 40}</span></p>
                    </div>
                    {inProgress ? (
                        <Link href={`/training/courses?courseId=${inProgress.id}`} className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/25 flex items-center gap-2">
                            <Play className="w-4 h-4" /> Reprendre Formation
                        </Link>
                    ) : (
                        <Link href="/training/catalog" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/25 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Voir le Catalogue
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab("courses")}
                        className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                            activeTab === "courses" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <BookOpen className="w-4 h-4" /> Mes Formations
                    </button>
                    <button
                        onClick={() => setActiveTab("alerts")}
                        className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                            activeTab === "alerts" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Bell className="w-4 h-4" /> Veille Réglementaire
                    </button>
                </div>

                <div className="flex gap-2 ml-auto">
                    <Link href="/training/community" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Communauté
                    </Link>
                    <Link href="/training/roadmaps" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2">
                        <MapIcon className="w-4 h-4" /> Roadmaps
                    </Link>
                    <Link href="/training/instructors" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-400" /> Formateurs
                    </Link>
                    <Link href="/training/certificates" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Certificats
                    </Link>
                </div>
            </div>

            {activeTab === "courses" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                            <Search className="w-4 h-4 text-slate-500 ml-2" />
                            <input
                                type="text"
                                placeholder="Rechercher une formation..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button className="p-2 text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                        </div>

                        {filteredEnrolled.length === 0 ? (
                            <div className="p-10 bg-slate-900/30 border border-white/5 rounded-[24px] text-center">
                                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold text-sm">Vous n'êtes inscrit à aucune formation</p>
                                <Link href="/training/catalog" className="text-teal-400 text-xs font-bold mt-2 inline-block hover:underline">Parcourir le catalogue →</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredEnrolled.map((course) => (
                                    <Link href={`/training/courses?courseId=${course.id}`} key={course.id} className="group block p-6 rounded-[24px] bg-slate-900/40 border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                    course.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                        course.status === "in_progress" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                                                )}>
                                                    {course.status === "completed" ? <CheckCircle2 className="w-6 h-6" /> :
                                                        course.status === "in_progress" ? <Play className="w-6 h-6" /> :
                                                            <BookOpen className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{course.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{course.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Award className="w-3 h-3" /> {course.duration}h CPF
                                            </div>
                                        </div>

                                        {course.status === "in_progress" && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-slate-500">Progression</span>
                                                    <span className="text-amber-400 font-bold">{course.progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${course.progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {notStarted.length > 0 && (
                            <div className="pt-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Autres formations disponibles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {notStarted.slice(0, 6).map(c => (
                                        <Link key={c.id} href={`/training/courses?courseId=${c.id}`} className="px-3 py-2 bg-slate-900/40 border border-white/5 rounded-xl text-xs text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all">
                                            {c.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-teal-400" /> Progression Annuelle
                            </h3>
                            <div className="relative w-40 h-40 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#14b8a6" strokeWidth="12"
                                        strokeDasharray="440" strokeDashoffset={440 - (440 * pctHours) / 100} className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{pctHours}%</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Objectif Heures</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" /> Certifications Obtenues
                            </h3>
                            {certificates.length === 0 ? (
                                <p className="text-xs text-slate-500">Aucune certification obtenue pour l'instant.</p>
                            ) : (
                                <div className="space-y-3">
                                    {certificates.map((cert) => (
                                        <div key={cert.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                                <Award className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <span className="text-sm font-bold text-white line-clamp-1">{cert.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-[32px] border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-indigo-400" /> Classement Cabinet
                            </h3>
                            <p className="text-xs text-slate-500">Le classement inter-collaborateurs n'est pas encore disponible dans l'application.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-10 bg-slate-900/30 border border-white/5 rounded-[32px] text-center">
                        <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">Veille réglementaire non configurée</p>
                        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                            Le flux d'alertes légales et fiscales en temps réel nécessite une intégration avec une source réglementaire externe, pas encore branchée.
                        </p>
                    </div>

                    <div className="p-8 bg-teal-600/10 border border-teal-500/20 rounded-[32px] text-center mt-8">
                        <Zap className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Alertes Personnalisées</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            Cette fonctionnalité sera activée une fois la source de veille réglementaire configurée.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
