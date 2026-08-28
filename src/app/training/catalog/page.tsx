"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    Clock,
    Award,
    Search,
    ChevronRight,
    GraduationCap,
    Calculator,
    Target,
    Monitor,
    Brain,
    Shield,
    Coins,
    Users,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Course {
    id: string;
    title: string;
    subtitle: string | null;
    category: string;
    level: string;
    durationLabel: string | null;
    price: number;
    cpfHours: number;
    isCertifying: boolean;
    isPopular: boolean;
    instructorName: string | null;
    color: string | null;
    skills: string[];
    studentsCount: number;
}

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
    syscohada: { label: "SYSCOHADA", icon: Calculator },
    consolidation: { label: "Consolidation", icon: Target },
    fiscal: { label: "Fiscalité", icon: Coins },
    audit: { label: "Audit & CAC", icon: Shield },
    social: { label: "Paie & Social", icon: Users },
    digital: { label: "Digital & IA", icon: Monitor },
    soft: { label: "Soft Skills", icon: Brain },
};
const LEVEL_LABEL: Record<string, string> = { DEBUTANT: "Débutant", INTERMEDIAIRE: "Intermédiaire", AVANCE: "Avancé", EXPERT: "Expert" };
const LEVELS = ["Tous", "DEBUTANT", "INTERMEDIAIRE", "AVANCE", "EXPERT"];

export default function TrainingCatalogPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch("/api/training/courses")
            .then(res => res.json())
            .then(data => setCourses(data.courses || []))
            .finally(() => setLoading(false));
    }, []);

    const categories = Array.from(new Set(courses.map(c => c.category))).map(id => ({
        id, label: CATEGORY_META[id]?.label || id, icon: CATEGORY_META[id]?.icon || BookOpen,
        count: courses.filter(c => c.category === id).length,
    }));

    const filtered = courses.filter(c =>
        (selectedCategory === "all" || c.category === selectedCategory) &&
        (selectedLevel === "Tous" || c.level === selectedLevel) &&
        (searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-teal-500/20">
                        <BookOpen className="w-3 h-3" /> Catalogue
                    </div>
                    <h1 className="page-title-dark">
                        Toutes nos Formations
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        <span className="text-teal-400 font-bold">{courses.length} formation{courses.length !== 1 ? "s" : ""}</span> pour les professionnels du chiffre en zone OHADA.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link href="/training/academy" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Mon Espace
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                    <Search className="w-5 h-5 text-slate-500 ml-2" />
                    <input
                        type="text"
                        placeholder="Rechercher une formation, un sujet..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {LEVELS.map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                selectedLevel === level ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                            )}
                        >
                            {level === "Tous" ? "Tous" : LEVEL_LABEL[level]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                        selectedCategory === "all" ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/5"
                    )}
                >
                    <BookOpen className="w-4 h-4" /> Tous
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px]", selectedCategory === "all" ? "bg-white/20" : "bg-slate-800")}>{courses.length}</span>
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                            selectedCategory === cat.id ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/5"
                        )}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px]", selectedCategory === cat.id ? "bg-white/20" : "bg-slate-800")}>{cat.count}</span>
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course) => (
                    <Link href={`/training/courses?courseId=${course.id}`} key={course.id} className="group block rounded-[32px] bg-slate-900/40 border border-white/5 hover:border-teal-500/30 transition-all overflow-hidden">
                        <div className={cn("h-32 bg-gradient-to-br relative", course.color || "from-slate-700 to-slate-800")}>
                            {course.isPopular && (
                                <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase">
                                    Populaire
                                </span>
                            )}
                            {course.isCertifying && (
                                <span className="absolute top-4 left-4 px-2 py-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Certifiant
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors mb-2">{course.title}</h3>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{course.subtitle}</p>

                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white", course.color || "from-slate-700 to-slate-800")}>
                                    {course.instructorName?.slice(0, 2).toUpperCase() || "—"}
                                </div>
                                <span className="text-xs text-slate-400">{course.instructorName || "Formateur à confirmer"}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {course.skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded-lg">{skill}</span>
                                ))}
                                {course.skills.length > 3 && (
                                    <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] rounded-lg">+{course.skills.length - 3}</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.durationLabel || "—"}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.studentsCount} inscrit{course.studentsCount !== 1 ? "s" : ""}</span>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div>
                                    <span className="text-xl font-black text-white">{course.price.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 ml-1">FCFA</span>
                                </div>
                                <span className="px-4 py-2 bg-teal-600 group-hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                                    Voir <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                {!loading && filtered.length === 0 && (
                    <p className="col-span-3 text-center text-slate-500 py-10">Aucune formation ne correspond à ces critères.</p>
                )}
            </div>

            {/* Masterclasses — honnête, pas encore de module de planification live */}
            <div className="p-6 bg-gradient-to-r from-rose-500/10 to-violet-500/10 border border-rose-500/20 rounded-[32px] flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/50 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Masterclasses en Direct</h3>
                    <p className="text-sm text-slate-400">La planification de sessions live n'est pas encore disponible dans l'application.</p>
                </div>
            </div>
        </div>
    );
}
