"use client";

import { useState } from "react";
import {
    Book,
    Search,
    Download,
    ExternalLink,
    Bookmark,
    Scale,
    Calculator,
    FileCheck,
    Filter,
    ArrowUpRight,
    Star,
    Library,
    FileText,
    GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
    id: string;
    title: string;
    category: "Juridique" | "Comptabilité" | "Gestion" | "Audit";
    type: "Traité" | "Acte Uniforme" | "Recueil" | "Guide";
    year: string;
    description: string;
    isPremium: boolean;
    isStarred: boolean;
}

const RESOURCES: Resource[] = [
    // JURIDIQUE
    { id: "j1", title: "Acte Uniforme relatif au Droit des Sociétés Commerciales (AUSCGIE)", category: "Juridique", type: "Acte Uniforme", year: "2014", description: "Le texte fondamental régissant la création, le fonctionnement et la dissolution des sociétés en zone OHADA.", isPremium: true, isStarred: true },
    { id: "j2", title: "Acte Uniforme portant Organisation des Sûretés", category: "Juridique", type: "Acte Uniforme", year: "2010", description: "Règlementation des garanties (hypothèque, nantaissement, cautionnement) au sein de l'espace OHADA.", isPremium: false, isStarred: false },
    { id: "j3", title: "Droit de l'Arbitrage et Médiation", category: "Juridique", type: "Traité", year: "2017", description: "Cadre légal pour le règlement alternatif des litiges commerciaux.", isPremium: false, isStarred: false },
    { id: "j4", title: "Procédures Simplifiées de Recouvrement (AUPSRVE)", category: "Juridique", type: "Acte Uniforme", year: "1998", description: "Outils juridiques pour le recouvrement des créances et les voies d'exécution.", isPremium: true, isStarred: true },

    // COMPTABILITÉ
    { id: "c1", title: "SYSCOHADA Révisé - Guide d'Application", category: "Comptabilité", type: "Recueil", year: "2017", description: "Le référentiel comptable unique pour les 17 pays membres, incluant le Plan de Comptes.", isPremium: true, isStarred: true },
    { id: "c2", title: "Tableau de Flux de Trésorerie (OEC)", category: "Comptabilité", type: "Guide", year: "2022", description: "Méthodologie détaillée pour l'élaboration du tableau de flux selon les normes OHADA.", isPremium: false, isStarred: false },
    { id: "c3", title: "Normes IFRS vs SYSCOHADA : Analyse Comparative", category: "Comptabilité", type: "Traité", year: "2023", description: "Étude des divergences et convergences pour les groupes internationaux.", isPremium: true, isStarred: false },

    // GESTION
    { id: "g1", title: "Contrôle de Gestion en Environnement Africain", category: "Gestion", type: "Recueil", year: "2021", description: "Adaptation des outils de pilotage (Budget, KPI) aux spécificités des marchés locaux.", isPremium: true, isStarred: false },
    { id: "g2", title: "Financement des PME en Zone UEMOA", category: "Gestion", type: "Guide", year: "2023", description: "Guide pratique sur les dispositifs de financement et les garanties bancaires.", isPremium: false, isStarred: false },

    // AUDIT
    { id: "a1", title: "Normes Internationales d'Audit (ISA) adaptées OHADA", category: "Audit", type: "Recueil", year: "2020", description: "Recueil des normes de révision contractuelle et légale applicables par les commissaires aux comptes.", isPremium: true, isStarred: true },
    { id: "a2", title: "Guide d'Audit du Cycle Ventes-Clients", category: "Audit", type: "Guide", year: "2022", description: "Programme de travail détaillé et tests de procédures pour le cycle revenus.", isPremium: false, isStarred: true },
    { id: "a3", title: "Le Commissariat aux Comptes en zone OHADA", category: "Audit", type: "Traité", year: "2019", description: "Rôle, responsabilités et éthique de l'auditeur légal selon ONECCA.", isPremium: true, isStarred: false },
];

export default function LibraryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("Tous");

    const filteredResources = RESOURCES.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "Tous" || res.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                <div className="flex-1">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <Library className="w-10 h-10 text-indigo-400" />
                        Bibliothèque OHADA
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Accédez au recueil le plus complet des textes de loi, normes comptables (SYSCOHADA),
                        guides de gestion et procédures d'audit pour l'Afrique centrale et de l'ouest.
                    </p>

                    <div className="relative mt-6 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un texte, un article ou un guide..."
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-2xl transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-indigo-400">12,450</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Articles</p>
                    </div>
                    <div className="bg-emerald-600/10 p-4 rounded-2xl border border-emerald-500/20 text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-emerald-400">320</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Modèles</p>
                    </div>
                </div>
            </div>

            {/* Filters Navigation */}
            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {["Tous", "Juridique", "Comptabilité", "Gestion", "Audit"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wide",
                            activeFilter === cat
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Featured / Starred Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-white/5 bg-indigo-900/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star className="w-16 h-16 text-indigo-400" />
                        </div>
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            Favoris & Essentiels
                        </h3>
                        <div className="space-y-4">
                            {RESOURCES.filter(r => r.isStarred).slice(0, 4).map(res => (
                                <div key={res.id} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{res.category}</span>
                                        <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-200 mt-1 line-clamp-1">{res.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-emerald-400" />
                            Mises à Jour Récentes
                        </h3>
                        <div className="space-y-4">
                            {[
                                "Nouveau Plan Comptable (PCG) 2024",
                                "Décret Arbitrage Zone CEMAC",
                                "Guide Audit RSE (Bêta)"
                            ].map((update, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-400 font-medium">{update}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Results */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredResources.map((res) => (
                        <div key={res.id} className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "p-2.5 rounded-2xl border",
                                        res.category === "Juridique" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                            res.category === "Comptabilité" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                                                res.category === "Audit" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                    "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    )}>
                                        {res.category === "Juridique" && <Scale className="w-5 h-5" />}
                                        {res.category === "Comptabilité" && <Calculator className="w-5 h-5" />}
                                        {res.category === "Audit" && <ShieldSection className="w-5 h-5" />}
                                        {res.category === "Gestion" && <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div className="flex gap-2">
                                        {res.isPremium && (
                                            <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-black uppercase">Premium</span>
                                        )}
                                        <button className="text-slate-600 hover:text-white transition-colors">
                                            <Bookmark className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-white font-bold leading-tight line-clamp-2">{res.title}</h4>
                                <div className="flex gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 mb-4">
                                    <span>{res.type}</span>
                                    <span>•</span>
                                    <span>{res.year}</span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-6">
                                    {res.description}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 group transition-all">
                                    <Download className="w-3.5 h-3.5" /> Lire
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 group transition-all">
                                    <ExternalLink className="w-3.5 h-3.5" /> Source
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ShieldSection({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
