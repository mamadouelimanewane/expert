"use client";

import { useState } from "react";
import {
    BookOpen,
    Clock,
    Award,
    Users,
    Star,
    Filter,
    Search,
    ChevronRight,
    Play,
    GraduationCap,
    Calculator,
    Scale,
    Briefcase,
    Monitor,
    Brain,
    Target,
    TrendingUp,
    Shield,
    Coins,
    FileText,
    Zap,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Full Course Catalog
const CATEGORIES = [
    { id: "all", label: "Tous", icon: BookOpen, count: 45 },
    { id: "syscohada", label: "SYSCOHADA", icon: Calculator, count: 8 },
    { id: "consolidation", label: "Consolidation", icon: Target, count: 6 },
    { id: "fiscal", label: "Fiscalité", icon: Coins, count: 9 },
    { id: "audit", label: "Audit & CAC", icon: Shield, count: 8 },
    { id: "social", label: "Paie & Social", icon: Users, count: 5 },
    { id: "digital", label: "Digital & IA", icon: Monitor, count: 6 },
    { id: "soft", label: "Soft Skills", icon: Brain, count: 4 }
];

const LEVELS = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Expert"];

const CURRICULA = [
    {
        id: "CURR-001",
        title: "Expert SYSCOHADA Révisé",
        subtitle: "Maîtrisez le plan comptable OHADA de A à Z",
        category: "syscohada",
        level: "Intermédiaire",
        duration: "40h",
        modules: 8,
        lessons: 56,
        students: 2450,
        rating: 4.9,
        price: "150 000",
        cpf: 40,
        isCertifying: true,
        isPopular: true,
        instructor: { name: "Prof. Koné", avatar: "AK" },
        color: "from-teal-500 to-emerald-600",
        skills: ["Plan Comptable", "Écritures", "États Financiers", "Annexes"]
    },
    {
        id: "CURR-002",
        title: "Maîtriser la Consolidation",
        subtitle: "Des bases aux techniques avancées de consolidation groupe",
        category: "consolidation",
        level: "Avancé",
        duration: "25h",
        modules: 6,
        lessons: 42,
        students: 1250,
        rating: 4.8,
        price: "200 000",
        cpf: 25,
        isCertifying: true,
        isPopular: true,
        instructor: { name: "Prof. Koné", avatar: "AK" },
        color: "from-violet-500 to-purple-600",
        skills: ["IG", "IP", "MEE", "Goodwill", "Éliminations"]
    },
    {
        id: "CURR-003",
        title: "Fiscalité Entreprise UEMOA",
        subtitle: "IS, IR, TVA et optimisation fiscale légale",
        category: "fiscal",
        level: "Intermédiaire",
        duration: "30h",
        modules: 7,
        lessons: 48,
        students: 1890,
        rating: 4.8,
        price: "175 000",
        cpf: 30,
        isCertifying: true,
        isPopular: false,
        instructor: { name: "Me. Diallo", avatar: "FD" },
        color: "from-amber-500 to-orange-600",
        skills: ["TVA", "IS", "IR", "Contentieux", "Optimisation"]
    },
    {
        id: "CURR-004",
        title: "Audit & CAC Niveau 1",
        subtitle: "Fondamentaux du commissariat aux comptes",
        category: "audit",
        level: "Intermédiaire",
        duration: "35h",
        modules: 8,
        lessons: 52,
        students: 980,
        rating: 4.7,
        price: "225 000",
        cpf: 35,
        isCertifying: true,
        isPopular: false,
        instructor: { name: "Cabinet BDO", avatar: "BD" },
        color: "from-rose-500 to-pink-600",
        skills: ["Planification", "Seuils", "Tests", "Rapport"]
    },
    {
        id: "CURR-005",
        title: "Transformation Digitale Cabinet",
        subtitle: "Modernisez votre cabinet : outils, process et stratégie",
        category: "digital",
        level: "Débutant",
        duration: "15h",
        modules: 4,
        lessons: 24,
        students: 650,
        rating: 4.6,
        price: "100 000",
        cpf: 15,
        isCertifying: false,
        isPopular: false,
        instructor: { name: "J-P Mensah", avatar: "JM" },
        color: "from-sky-500 to-blue-600",
        skills: ["Cloud", "Automatisation", "IA", "Cybersécurité"]
    },
    {
        id: "CURR-006",
        title: "Paie & Social Sénégal/CI",
        subtitle: "Maîtrisez la paie dans l'espace UEMOA",
        category: "social",
        level: "Intermédiaire",
        duration: "20h",
        modules: 5,
        lessons: 32,
        students: 780,
        rating: 4.9,
        price: "125 000",
        cpf: 20,
        isCertifying: true,
        isPopular: false,
        instructor: { name: "M. Bah", avatar: "MB" },
        color: "from-rose-400 to-pink-500",
        skills: ["Bulletins", "CNPS", "CSS", "Licenciement"]
    }
];

const UNIT_COURSES = [
    // SYSCOHADA
    { id: "U001", title: "Introduction au SYSCOHADA Révisé", category: "syscohada", duration: "4h", level: "Débutant", price: "25 000", rating: 4.8, students: 1200 },
    { id: "U002", title: "Écritures de régularisation", category: "syscohada", duration: "3h", level: "Intermédiaire", price: "20 000", rating: 4.7, students: 890 },
    { id: "U003", title: "Provisions et dépréciations", category: "syscohada", duration: "4h", level: "Intermédiaire", price: "25 000", rating: 4.6, students: 756 },
    { id: "U004", title: "Immobilisations corporelles", category: "syscohada", duration: "5h", level: "Intermédiaire", price: "30 000", rating: 4.8, students: 680 },

    // Consolidation
    { id: "U005", title: "Périmètre de consolidation", category: "consolidation", duration: "3h", level: "Intermédiaire", price: "25 000", rating: 4.9, students: 540 },
    { id: "U006", title: "Méthodes : IG, IP, MEE", category: "consolidation", duration: "6h", level: "Avancé", price: "40 000", rating: 4.8, students: 420 },
    { id: "U007", title: "Écarts d'acquisition (Goodwill)", category: "consolidation", duration: "4h", level: "Avancé", price: "35 000", rating: 4.7, students: 380 },

    // Fiscalité
    { id: "U008", title: "TVA : régime UEMOA", category: "fiscal", duration: "4h", level: "Intermédiaire", price: "25 000", rating: 4.8, students: 1100 },
    { id: "U009", title: "Impôt sur les Sociétés", category: "fiscal", duration: "6h", level: "Intermédiaire", price: "35 000", rating: 4.9, students: 980 },
    { id: "U010", title: "Contrôle fiscal : se préparer", category: "fiscal", duration: "4h", level: "Avancé", price: "30 000", rating: 4.8, students: 750 },
    { id: "U011", title: "Transfer Pricing", category: "fiscal", duration: "4h", level: "Expert", price: "50 000", rating: 4.6, students: 320 },

    // Audit
    { id: "U012", title: "Déontologie du CAC", category: "audit", duration: "2h", level: "Débutant", price: "15 000", rating: 4.5, students: 650 },
    { id: "U013", title: "Planification de mission", category: "audit", duration: "4h", level: "Intermédiaire", price: "30 000", rating: 4.7, students: 480 },
    { id: "U014", title: "Seuil de signification", category: "audit", duration: "3h", level: "Intermédiaire", price: "25 000", rating: 4.8, students: 520 },
    { id: "U015", title: "Fraude et détection", category: "audit", duration: "4h", level: "Avancé", price: "35 000", rating: 4.9, students: 390 },

    // Social
    { id: "U016", title: "Bulletin de paie Sénégal", category: "social", duration: "4h", level: "Intermédiaire", price: "25 000", rating: 4.8, students: 680 },
    { id: "U017", title: "Bulletin de paie Côte d'Ivoire", category: "social", duration: "4h", level: "Intermédiaire", price: "25 000", rating: 4.7, students: 590 },
    { id: "U018", title: "Rupture du contrat de travail", category: "social", duration: "4h", level: "Avancé", price: "30 000", rating: 4.6, students: 410 },

    // Digital
    { id: "U019", title: "Excel Avancé pour comptables", category: "digital", duration: "6h", level: "Intermédiaire", price: "35 000", rating: 4.9, students: 1450 },
    { id: "U020", title: "Power BI : Tableaux de bord", category: "digital", duration: "8h", level: "Intermédiaire", price: "50 000", rating: 4.8, students: 890 },
    { id: "U021", title: "IA pour Experts-Comptables", category: "digital", duration: "4h", level: "Débutant", price: "30 000", rating: 4.7, students: 720 },
    { id: "U022", title: "Cybersécurité Cabinet", category: "digital", duration: "3h", level: "Débutant", price: "20 000", rating: 4.5, students: 560 },

    // Soft Skills
    { id: "U023", title: "Relation client", category: "soft", duration: "3h", level: "Débutant", price: "20 000", rating: 4.6, students: 480 },
    { id: "U024", title: "Négociation d'honoraires", category: "soft", duration: "2h", level: "Intermédiaire", price: "25 000", rating: 4.8, students: 350 }
];

const MASTERCLASSES = [
    { id: "MC001", title: "Loi de Finances 2026", instructor: "Me. Diallo", date: "15 Fév 2026", duration: "2h", isLive: true, attendees: 245 },
    { id: "MC002", title: "IFRS 17 - Assurances", instructor: "Prof. Koné", date: "22 Fév 2026", duration: "3h", isLive: true, attendees: 180 },
    { id: "MC003", title: "IA & Avenir de la Profession", instructor: "Panel Expert", date: "1 Mars 2026", duration: "2h", isLive: true, attendees: 320 }
];

export default function TrainingCatalogPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"curricula" | "units" | "live">("curricula");

    const filteredCurricula = CURRICULA.filter(c =>
        (selectedCategory === "all" || c.category === selectedCategory) &&
        (selectedLevel === "Tous" || c.level === selectedLevel) &&
        (searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredUnits = UNIT_COURSES.filter(c =>
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
                        <BookOpen className="w-3 h-3" /> Catalogue Complet
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Toutes nos Formations
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        <span className="text-teal-400 font-bold">45+ formations</span> créées par des experts pour les professionnels du chiffre en zone OHADA.
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
                {/* Search */}
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

                {/* Level Filter */}
                <div className="flex gap-2">
                    {LEVELS.map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                selectedLevel === level ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                            )}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                            selectedCategory === cat.id
                                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                                : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/5"
                        )}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px]",
                            selectedCategory === cat.id ? "bg-white/20" : "bg-slate-800"
                        )}>
                            {cat.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
                <button
                    onClick={() => setViewMode("curricula")}
                    className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        viewMode === "curricula" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    <Award className="w-4 h-4" /> Parcours Certifiants ({CURRICULA.length})
                </button>
                <button
                    onClick={() => setViewMode("units")}
                    className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        viewMode === "units" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    <BookOpen className="w-4 h-4" /> À la carte ({UNIT_COURSES.length})
                </button>
                <button
                    onClick={() => setViewMode("live")}
                    className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 relative",
                        viewMode === "live" ? "bg-teal-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}
                >
                    <Zap className="w-4 h-4" /> Masterclasses Live
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                </button>
            </div>

            {/* Content */}
            {viewMode === "curricula" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCurricula.map((course) => (
                        <Link href="/training/courses" key={course.id} className="group block rounded-[32px] bg-slate-900/40 border border-white/5 hover:border-teal-500/30 transition-all overflow-hidden">
                            {/* Header Image */}
                            <div className={cn("h-32 bg-gradient-to-br relative", course.color)}>
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

                                {/* Instructor */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white", course.color)}>
                                        {course.instructor.avatar}
                                    </div>
                                    <span className="text-xs text-slate-400">{course.instructor.name}</span>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {course.skills.slice(0, 3).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded-lg">{skill}</span>
                                    ))}
                                    {course.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] rounded-lg">+{course.skills.length - 3}</span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.modules} modules</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-white font-bold">{course.rating}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <div>
                                        <span className="text-xl font-black text-white">{course.price}</span>
                                        <span className="text-xs text-slate-500 ml-1">FCFA</span>
                                    </div>
                                    <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                                        Voir <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {viewMode === "units" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredUnits.map((course) => (
                        <Link href="/training/courses" key={course.id} className="group p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-teal-500/30 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                    <Play className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-bold",
                                    course.level === "Débutant" ? "bg-emerald-500/10 text-emerald-400" :
                                        course.level === "Intermédiaire" ? "bg-amber-500/10 text-amber-400" :
                                            course.level === "Avancé" ? "bg-rose-500/10 text-rose-400" : "bg-violet-500/10 text-violet-400"
                                )}>
                                    {course.level}
                                </span>
                            </div>
                            <h3 className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                <span><Clock className="w-3 h-3 inline mr-1" />{course.duration}</span>
                                <span><Star className="w-3 h-3 inline mr-1 text-amber-400 fill-amber-400" />{course.rating}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <span className="text-sm font-bold text-white">{course.price} <span className="text-[10px] text-slate-500">FCFA</span></span>
                                <span className="text-[10px] text-slate-500">{course.students} inscrits</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {viewMode === "live" && (
                <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-rose-500/10 to-violet-500/10 border border-rose-500/20 rounded-[32px] flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center animate-pulse">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Masterclasses en Direct</h3>
                            <p className="text-sm text-slate-400">Participez à des sessions live animées par nos experts et posez vos questions en temps réel.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MASTERCLASSES.map((mc) => (
                            <div key={mc.id} className="p-6 rounded-[24px] bg-slate-900/40 border border-white/5 hover:border-rose-500/30 transition-all group cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black uppercase">
                                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" /> Live
                                    </span>
                                    <span className="text-xs text-slate-500">{mc.duration}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors mb-2">{mc.title}</h3>
                                <p className="text-xs text-slate-500 mb-4">Animé par <span className="text-white">{mc.instructor}</span></p>
                                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl mb-4">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-white font-bold">{mc.date}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">{mc.attendees} inscrits</span>
                                    <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors">
                                        S'inscrire
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
