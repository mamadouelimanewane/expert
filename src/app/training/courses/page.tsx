"use client";

import { useState } from "react";
import {
    Play,
    Pause,
    Volume2,
    Maximize,
    SkipForward,
    SkipBack,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    Award,
    ChevronRight,
    BookOpen,
    Users,
    Star,
    Download,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const COURSE_DATA = {
    id: "OHADA-CONSOL-2026",
    title: "Consolidation OHADA - Niveau Avancé",
    subtitle: "Maîtrisez les techniques de consolidation selon le SYSCOHADA révisé",
    instructor: {
        name: "Prof. Amadou Koné",
        title: "Expert-Comptable Diplômé, PhD Finance",
        avatar: "AK",
        rating: 4.9,
        students: 2450,
        bio: "25 ans d'expérience en audit et consolidation. Ancien associé Big 4. Auteur de 'La Consolidation en Zone OHADA'."
    },
    stats: {
        duration: "12h 30min",
        modules: 8,
        lessons: 42,
        quizzes: 8,
        cpfHours: 12,
        level: "Avancé",
        language: "Français",
        lastUpdate: "Janvier 2026"
    },
    rating: 4.8,
    enrollments: 1250,
    modules: [
        {
            id: 1,
            title: "Introduction à la Consolidation",
            duration: "1h 15min",
            lessons: [
                { id: 1, title: "Périmètre et notions fondamentales", duration: "18:30", completed: true, type: "video" },
                { id: 2, title: "Le cadre réglementaire SYSCOHADA", duration: "22:15", completed: true, type: "video" },
                { id: 3, title: "Ressources téléchargeables", duration: "-", completed: true, type: "doc" },
                { id: 4, title: "Quiz Module 1", duration: "10 questions", completed: true, type: "quiz" }
            ],
            completed: true
        },
        {
            id: 2,
            title: "Méthodes de Consolidation",
            duration: "2h 45min",
            lessons: [
                { id: 5, title: "Intégration Globale (IG)", duration: "35:20", completed: true, type: "video" },
                { id: 6, title: "Intégration Proportionnelle", duration: "28:45", completed: true, type: "video" },
                { id: 7, title: "Mise en Équivalence", duration: "32:10", completed: false, current: true, type: "video" },
                { id: 8, title: "Exercice pratique : Choix de méthode", duration: "25:00", completed: false, type: "video" },
                { id: 9, title: "Quiz Module 2", duration: "15 questions", completed: false, type: "quiz" }
            ],
            completed: false,
            current: true
        },
        {
            id: 3,
            title: "Écritures de Retraitement",
            duration: "2h 30min",
            lessons: [
                { id: 10, title: "Homogénéisation des comptes", duration: "30:00", completed: false, type: "video" },
                { id: 11, title: "Élimination des opérations intra-groupe", duration: "35:00", completed: false, type: "video" },
                { id: 12, title: "Traitement des écarts de conversion", duration: "28:00", completed: false, type: "video" }
            ],
            completed: false,
            locked: true
        },
        {
            id: 4,
            title: "Goodwill & Écarts d'Acquisition",
            duration: "1h 45min",
            lessons: [],
            completed: false,
            locked: true
        },
        {
            id: 5,
            title: "États Financiers Consolidés",
            duration: "2h 00min",
            lessons: [],
            completed: false,
            locked: true
        }
    ]
};

export default function CoursePlayerPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(COURSE_DATA.modules[1].lessons[2]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const overallProgress = 35;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 flex">

            {/* Main Content */}
            <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "mr-[400px]" : "")}>

                {/* Video Player Area */}
                <div className="relative bg-black aspect-video max-h-[60vh] overflow-hidden group">
                    {/* Simulated Video */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform group/play"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? (
                                    <Pause className="w-10 h-10 text-white" />
                                ) : (
                                    <Play className="w-10 h-10 text-white ml-2" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white">{currentLesson?.title}</h3>
                            <p className="text-slate-500 text-sm mt-2">Durée : {currentLesson?.duration}</p>
                        </div>

                        {/* Instructor PiP */}
                        <div className="absolute bottom-6 right-6 w-40 h-40 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-slate-900">
                            {COURSE_DATA.instructor.avatar}
                        </div>
                    </div>

                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group/progress">
                            <div className="h-full w-[35%] bg-teal-500 rounded-full relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <SkipBack className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <SkipForward className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-mono text-slate-400">12:45 / {currentLesson?.duration}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <Volume2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <Maximize className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <div className="p-8 space-y-8">
                    {/* Title & Actions */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-white">{COURSE_DATA.title}</h1>
                            <p className="text-slate-400 mt-2">{COURSE_DATA.subtitle}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" /> Ressources
                            </button>
                            <Link href="/training/quiz" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-lg shadow-amber-600/20">
                                <FileText className="w-4 h-4" /> Passer le Quiz
                            </Link>
                            <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-500 transition-colors flex items-center gap-2">
                                <Award className="w-4 h-4" /> Obtenir Certificat
                            </button>
                        </div>
                    </div>

                    {/* Instructor Card */}
                    <Link href="/training/instructors" className="block p-6 bg-slate-900/50 border border-white/5 rounded-[24px] hover:border-teal-500/30 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
                                {COURSE_DATA.instructor.avatar}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{COURSE_DATA.instructor.name}</h3>
                                <p className="text-sm text-slate-500">{COURSE_DATA.instructor.title}</p>
                                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{COURSE_DATA.instructor.bio}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-white">{COURSE_DATA.instructor.rating}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{COURSE_DATA.instructor.students} étudiants</p>
                            </div>
                        </div>
                    </Link>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Durée Totale", value: COURSE_DATA.stats.duration, icon: Clock },
                            { label: "Modules", value: COURSE_DATA.stats.modules, icon: BookOpen },
                            { label: "Leçons", value: COURSE_DATA.stats.lessons, icon: Play },
                            { label: "Heures CPF", value: `${COURSE_DATA.stats.cpfHours}h`, icon: Award }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-center">
                                <stat.icon className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                                <p className="text-xl font-black text-white">{stat.value}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs / Multi-view Section */}
                    <div className="space-y-6">
                        <div className="flex gap-4 border-b border-white/5">
                            <button className="pb-4 px-2 border-b-2 border-teal-500 text-white font-bold text-sm">Description</button>
                            <button className="pb-4 px-2 text-slate-500 hover:text-white font-bold text-sm transition-colors">Avis & Notes</button>
                            <button className="pb-4 px-2 text-slate-500 hover:text-white font-bold text-sm transition-colors">Documents Liés</button>
                            <button className="pb-4 px-2 text-slate-500 hover:text-white font-bold text-sm transition-colors">FAQ</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Detailed Description */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-white uppercase text-xs tracking-widest text-teal-500">Objectifs du cours</h3>
                                <ul className="space-y-2">
                                    {[
                                        "Comprendre les critères de définition du périmètre de consolidation",
                                        "Maîtriser les écritures d'élimination des opérations réciproques",
                                        "Savoir traiter les écarts d'acquisition et les écarts d'évaluation",
                                        "Établir un bilan et un compte de résultat consolidé complet"
                                    ].map((obj, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-400 leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {obj}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Reviews Preview */}
                            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white uppercase text-xs tracking-widest text-teal-500">Derniers Avis</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-white font-black text-lg">4.8</span>
                                        <span className="text-slate-500 text-xs ml-1">(124 avis)</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { user: "Mamadou S.", note: 5, date: "Hier", text: "Excellente pédagogie, les exemples sur le Goodwill sont très clairs." },
                                        { user: "Aïcha D.", note: 4, date: "Il y a 3 jours", text: "Très complet, peut-être un peu rapide sur les écritures complexes." }
                                    ].map((rev, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-xs font-bold text-white">{rev.user}</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, star) => (
                                                        <Star key={star} className={cn("w-2 h-2", star < rev.note ? "text-amber-400 fill-amber-400" : "text-slate-700")} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 italic leading-relaxed">"{rev.text}"</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all">
                                    Voir tous les avis
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Discussion Section */}
                    <div className="p-6 bg-slate-900/30 border border-white/5 rounded-[24px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-teal-400" /> Discussion (24 commentaires)
                        </h3>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">ME</div>
                            <input
                                type="text"
                                placeholder="Poser une question au formateur..."
                                className="flex-1 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-teal-500/50 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Course Content */}
            <div className={cn(
                "fixed right-0 top-0 bottom-0 w-[400px] bg-slate-900 border-l border-white/5 overflow-y-auto transition-transform duration-300 z-50",
                sidebarOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b border-white/5 sticky top-0 bg-slate-900 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-white">Contenu du cours</h2>
                        <span className="text-xs text-teal-400 font-bold">{overallProgress}% complété</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {COURSE_DATA.modules.map((module) => (
                        <div key={module.id} className={cn(
                            "rounded-2xl border transition-all",
                            module.current ? "bg-slate-800/50 border-teal-500/30" :
                                module.locked ? "bg-slate-900/30 border-white/5 opacity-60" : "bg-slate-800/20 border-white/5"
                        )}>
                            <div className="p-4 flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    module.completed ? "bg-emerald-500/20 text-emerald-400" :
                                        module.current ? "bg-teal-500/20 text-teal-400" :
                                            module.locked ? "bg-slate-800 text-slate-600" : "bg-slate-800 text-slate-400"
                                )}>
                                    {module.completed ? <CheckCircle2 className="w-5 h-5" /> :
                                        module.locked ? <Lock className="w-5 h-5" /> :
                                            <span className="font-bold">{module.id}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-sm truncate">{module.title}</h3>
                                    <p className="text-xs text-slate-500">{module.duration}</p>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 text-slate-500 transition-transform", module.current && "rotate-90")} />
                            </div>

                            {module.current && module.lessons.length > 0 && (
                                <div className="px-4 pb-4 space-y-2">
                                    {module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            onClick={() => setCurrentLesson(lesson)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                                                lesson.current ? "bg-teal-500/20 border border-teal-500/30" : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                                lesson.completed ? "bg-emerald-500 text-white" :
                                                    lesson.current ? "bg-teal-500 text-white" : "bg-slate-700 text-slate-400"
                                            )}>
                                                {lesson.completed ? <CheckCircle2 className="w-3 h-3" /> :
                                                    lesson.type === "video" ? <Play className="w-3 h-3" /> :
                                                        lesson.type === "quiz" ? <FileText className="w-3 h-3" /> :
                                                            <Download className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-medium truncate", lesson.current ? "text-teal-400" : "text-slate-300")}>{lesson.title}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono shrink-0">{lesson.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Toggle Sidebar Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed right-4 bottom-4 w-12 h-12 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-teal-500 transition-colors"
            >
                <BookOpen className="w-5 h-5" />
            </button>
        </div>
    );
}
