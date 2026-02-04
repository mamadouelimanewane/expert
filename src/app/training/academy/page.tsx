"use client";

import { useState } from "react";
import {
    GraduationCap,
    BookOpen,
    Play,
    CheckCircle2,
    Clock,
    Award,
    Bell,
    AlertTriangle,
    FileText,
    Calendar,
    TrendingUp,
    Filter,
    Search,
    ExternalLink,
    Zap,
    Users,
    Map as MapIcon,
    Trophy,
    Star,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const COURSES = [
    {
        id: "C001",
        title: "Loi de Finances 2026 - Impacts Entreprises",
        type: "Webinar",
        duration: "2h",
        cpf: 2,
        status: "new",
        category: "Fiscal",
        instructor: "Me. Diallo"
    },
    {
        id: "C002",
        title: "Consolidation OHADA - Niveau Avancé",
        type: "E-Learning",
        duration: "8h",
        cpf: 8,
        status: "in_progress",
        progress: 45,
        category: "Comptabilité",
        instructor: "Prof. Koné"
    },
    {
        id: "C003",
        title: "IFRS 16 - Contrats de Location",
        type: "E-Learning",
        duration: "4h",
        cpf: 4,
        status: "completed",
        category: "Normes",
        instructor: "Cabinet BDO"
    },
    {
        id: "C004",
        title: "Cybersécurité pour Cabinets",
        type: "Atelier",
        duration: "3h",
        cpf: 3,
        status: "upcoming",
        date: "15 Fév 2026",
        category: "Digital",
        instructor: "Expert ANSSI"
    }
];

const LEGAL_ALERTS = [
    { id: 1, title: "Décret 2026-045 : Nouveau barème IR", date: "02/02/2026", severity: "high", read: false },
    { id: 2, title: "Modification taux TVA hôtellerie (5.5% → 10%)", date: "28/01/2026", severity: "high", read: false },
    { id: 3, title: "OHADA : Acte Uniforme Comptabilité révisé", date: "15/01/2026", severity: "medium", read: true },
    { id: 4, title: "Rappel : Date limite DSF 30 Avril", date: "10/01/2026", severity: "info", read: true }
];

export default function TrainingAcademyPage() {
    const [activeTab, setActiveTab] = useState<"courses" | "alerts">("courses");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-teal-500/5 via-transparent to-transparent rounded-[32px] px-10">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-teal-500/20">
                        <GraduationCap className="w-3 h-3" /> Formation & Veille
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Cabinet Academy
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Formations certifiantes, suivi CPF et alertes réglementaires en temps réel.
                        <span className="text-teal-400 font-bold ml-2">Restez à jour, toujours.</span>
                    </p>
                </div>

                <div className="flex gap-4 z-10 items-center">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Heures CPF 2026</p>
                        <p className="text-2xl font-black text-white">24<span className="text-teal-400">/40</span></p>
                    </div>
                    <button className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/25 flex items-center gap-2">
                        <Play className="w-4 h-4" /> Reprendre Formation
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab("courses")}
                        className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                            activeTab === "courses" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <BookOpen className="w-4 h-4" /> Catalogue Formations
                    </button>
                    <button
                        onClick={() => setActiveTab("alerts")}
                        className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 relative",
                            activeTab === "alerts" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Bell className="w-4 h-4" /> Veille Réglementaire
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">2</span>
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
                    {/* Course List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                            <Search className="w-4 h-4 text-slate-500 ml-2" />
                            <input type="text" placeholder="Rechercher une formation..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
                            <button className="p-2 text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4">
                            {COURSES.map((course) => (
                                <Link href="/training/courses" key={course.id} className="group block p-6 rounded-[24px] bg-slate-900/40 border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                course.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                                                    course.status === "in_progress" ? "bg-amber-500/10 text-amber-400" :
                                                        course.status === "new" ? "bg-teal-500/10 text-teal-400" : "bg-slate-800 text-slate-400"
                                            )}>
                                                {course.status === "completed" ? <CheckCircle2 className="w-6 h-6" /> :
                                                    course.status === "in_progress" ? <Play className="w-6 h-6" /> :
                                                        <BookOpen className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{course.title}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{course.instructor} • {course.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase">{course.category}</span>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" /> {course.duration}
                                                <Award className="w-3 h-3 ml-2" /> {course.cpf}h CPF
                                            </div>
                                        </div>
                                    </div>

                                    {course.status === "in_progress" && course.progress && (
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

                                    {course.status === "upcoming" && (
                                        <div className="mt-4 p-3 bg-slate-800/50 rounded-xl flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs text-slate-400">Session prévue le <span className="text-white font-bold">{course.date}</span></span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Stats & Badges */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-teal-400" /> Progression Annuelle
                            </h3>
                            <div className="relative w-40 h-40 mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#14b8a6" strokeWidth="12" strokeDasharray="440" strokeDashoffset="176" className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-black text-white">60%</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Objectif CPF</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" /> Certifications Obtenues
                            </h3>
                            <div className="space-y-3">
                                {["IFRS Foundation", "Expert OHADA", "Audit COSO"].map((cert, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <Award className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white">{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard / Gamification */}
                        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-indigo-400" /> Classement Cabinet
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { name: "Saliou Diop", points: 4500, avatar: "SD", rank: 1, current: false },
                                    { name: "Mamadou Wane", points: 4250, avatar: "MW", rank: 2, current: true },
                                    { name: "Fatou Fall", points: 3800, avatar: "FF", rank: 3, current: false },
                                ].map((user, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center gap-3 p-3 rounded-2xl transition-all",
                                        user.current ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-900/40"
                                    )}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                                            user.rank === 1 ? "bg-amber-500 text-black" :
                                                user.rank === 2 ? "bg-slate-300 text-black" : "bg-orange-700 text-white"
                                        )}>
                                            {user.rank}
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">{user.name}</p>
                                            <p className="text-[10px] text-slate-500">{user.points} pts</p>
                                        </div>
                                        {user.current && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all">
                                Voir le classement complet
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {LEGAL_ALERTS.map((alert) => (
                        <div
                            key={alert.id}
                            className={cn(
                                "p-6 rounded-[24px] border transition-all cursor-pointer group flex items-center gap-6",
                                alert.read ? "bg-slate-900/20 border-white/5" : "bg-slate-900/60 border-amber-500/20 shadow-lg",
                                !alert.read && "hover:border-amber-500/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                alert.severity === "high" ? "bg-rose-500/10 text-rose-400" :
                                    alert.severity === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-sky-500/10 text-sky-400"
                            )}>
                                {alert.severity === "high" ? <AlertTriangle className="w-6 h-6" /> :
                                    alert.severity === "medium" ? <Bell className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">{alert.title}</h3>
                                    {!alert.read && <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-full">NOUVEAU</span>}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{alert.date}</p>
                            </div>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    ))}

                    <div className="p-8 bg-teal-600/10 border border-teal-500/20 rounded-[32px] text-center mt-8">
                        <Zap className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Alertes Personnalisées</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                            Configurez vos alertes pour recevoir uniquement les actualités pertinentes : Fiscal, Social, OHADA, Secteurs spécifiques...
                        </p>
                        <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all">
                            Configurer mes Alertes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
