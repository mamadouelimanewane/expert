"use client";

import { useState } from "react";
import {
    Star,
    Users,
    BookOpen,
    Award,
    Play,
    Globe,
    Linkedin,
    Mail,
    ChevronRight,
    TrendingUp,
    Calendar,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const INSTRUCTORS = [
    {
        id: "INS-001",
        name: "Prof. Amadou Koné",
        title: "Expert-Comptable Diplômé, PhD Finance",
        avatar: "AK",
        color: "from-teal-500 to-emerald-600",
        rating: 4.9,
        students: 2450,
        courses: 8,
        reviews: 456,
        specialties: ["Consolidation", "IFRS", "Audit"],
        bio: "25 ans d'expérience en audit et consolidation. Ancien associé EY Afrique de l'Ouest. Auteur de 'La Consolidation en Zone OHADA'. Formateur certifié CNCC.",
        featured: true
    },
    {
        id: "INS-002",
        name: "Me. Fatou Diallo",
        title: "Avocate Fiscaliste, LLM Droit des Affaires",
        avatar: "FD",
        color: "from-violet-500 to-purple-600",
        rating: 4.8,
        students: 1890,
        courses: 6,
        reviews: 312,
        specialties: ["Fiscalité", "Contentieux", "Droit OHADA"],
        bio: "Spécialiste du contentieux fiscal. 18 ans d'exercice au Barreau de Dakar. Conseille les grandes entreprises sur les montages fiscaux complexes.",
        featured: true
    },
    {
        id: "INS-003",
        name: "Dr. Ibrahim Touré",
        title: "Docteur en Gestion, Maître de Conférences",
        avatar: "IT",
        color: "from-amber-500 to-orange-600",
        rating: 4.7,
        students: 1250,
        courses: 5,
        reviews: 198,
        specialties: ["Contrôle de Gestion", "Tableaux de Bord", "Excel Avancé"],
        bio: "Enseignant-chercheur à l'Université Cheikh Anta Diop. Expert en Business Intelligence et pilotage de la performance. Consultant pour les PME.",
        featured: false
    },
    {
        id: "INS-004",
        name: "Mariama Bah",
        title: "Experte Paie & Social, RH",
        avatar: "MB",
        color: "from-rose-500 to-pink-600",
        rating: 4.9,
        students: 980,
        courses: 4,
        reviews: 145,
        specialties: ["Paie Sénégal", "Droit Social", "CNPS/CSS"],
        bio: "15 ans d'expérience en gestion de la paie. Ancienne DRH de multinationale. Formatrice agréée pour les professionnels du chiffre.",
        featured: false
    },
    {
        id: "INS-005",
        name: "Jean-Pierre Mensah",
        title: "Expert IT & Cybersécurité",
        avatar: "JM",
        color: "from-sky-500 to-blue-600",
        rating: 4.6,
        students: 750,
        courses: 3,
        reviews: 89,
        specialties: ["Cybersécurité", "RGPD", "Transformation Digitale"],
        bio: "Ingénieur en sécurité informatique. Certifié CISSP et ISO 27001. Accompagne les cabinets dans leur transformation numérique.",
        featured: false
    }
];

export default function InstructorsPage() {
    const [selectedInstructor, setSelectedInstructor] = useState(INSTRUCTORS[0]);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-teal-500/20">
                        <Users className="w-3 h-3" /> Nos Formateurs
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Experts & Instructeurs
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Des professionnels reconnus pour vous transmettre leur expertise.
                        Plus de <span className="text-teal-400 font-bold">50 ans d'expérience cumulée</span> au service de votre formation.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-white">{INSTRUCTORS.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Formateurs</p>
                    </div>
                    <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <p className="text-2xl font-black text-teal-400">26</p>
                        <p className="text-[10px] text-slate-500 uppercase">Formations</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Instructors List */}
                <div className="lg:col-span-5 space-y-4">
                    {INSTRUCTORS.map((instructor) => (
                        <div
                            key={instructor.id}
                            onClick={() => setSelectedInstructor(instructor)}
                            className={cn(
                                "p-5 rounded-[24px] border cursor-pointer transition-all group relative overflow-hidden",
                                selectedInstructor.id === instructor.id ? "bg-slate-800/80 border-teal-500/40 shadow-xl" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-black text-white shrink-0 shadow-lg",
                                    instructor.color
                                )}>
                                    {instructor.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors truncate">{instructor.name}</h3>
                                        {instructor.featured && (
                                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-black rounded-full uppercase">Top</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-1">{instructor.title}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-xs">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-white font-bold">{instructor.rating}</span>
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <Users className="w-3 h-3" /> {instructor.students}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <BookOpen className="w-3 h-3" /> {instructor.courses} cours
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instructor Detail */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Profile Card */}
                    <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                        {/* Header Banner */}
                        <div className={cn("h-32 bg-gradient-to-r relative", selectedInstructor.color)}>
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <div className="p-8 -mt-16 relative">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                <div className={cn(
                                    "w-28 h-28 rounded-3xl bg-gradient-to-br flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-slate-900 shrink-0",
                                    selectedInstructor.color
                                )}>
                                    {selectedInstructor.avatar}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-white">{selectedInstructor.name}</h2>
                                    <p className="text-slate-400 text-sm">{selectedInstructor.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                        <Linkedin className="w-5 h-5 text-sky-400" />
                                    </button>
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mt-8">
                                {[
                                    { label: "Note", value: selectedInstructor.rating, icon: Star, color: "text-amber-400" },
                                    { label: "Étudiants", value: selectedInstructor.students, icon: Users, color: "text-teal-400" },
                                    { label: "Formations", value: selectedInstructor.courses, icon: BookOpen, color: "text-violet-400" },
                                    { label: "Avis", value: selectedInstructor.reviews, icon: MessageSquare, color: "text-rose-400" }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center p-4 bg-slate-800/50 rounded-2xl">
                                        <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                                        <p className="text-lg font-black text-white">{stat.value}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bio */}
                            <div className="mt-8">
                                <h3 className="font-bold text-white mb-3">À propos</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{selectedInstructor.bio}</p>
                            </div>

                            {/* Specialties */}
                            <div className="mt-6">
                                <h3 className="font-bold text-white mb-3">Expertises</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedInstructor.specialties.map((spec, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-white/5">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses by Instructor */}
                    <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-teal-400" /> Formations par {selectedInstructor.name.split(' ')[1]}
                        </h3>
                        <div className="space-y-3">
                            {[
                                { title: "Consolidation OHADA - Niveau Avancé", students: 1250, duration: "12h", rating: 4.8 },
                                { title: "Introduction aux IFRS", students: 890, duration: "8h", rating: 4.7 },
                                { title: "Audit des Comptes Consolidés", students: 310, duration: "6h", rating: 4.9 }
                            ].map((course, i) => (
                                <Link href="/training/courses" key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl border border-white/5 transition-all group cursor-pointer">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0",
                                        selectedInstructor.color
                                    )}>
                                        <Play className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors truncate">{course.title}</h4>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                            <span><Users className="w-3 h-3 inline mr-1" />{course.students}</span>
                                            <span><Calendar className="w-3 h-3 inline mr-1" />{course.duration}</span>
                                            <span><Star className="w-3 h-3 inline mr-1 text-amber-400 fill-amber-400" />{course.rating}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
