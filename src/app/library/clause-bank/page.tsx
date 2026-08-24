"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    Search,
    Filter,
    Copy,
    Star,
    StarOff,
    FileText,
    Tag,
    ChevronRight,
    Plus,
    Edit3,
    Download,
    Info,
    Scale,
    Building2,
    Users,
    Handshake,
    Sparkles,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Clause {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    content: string;
    annotations: string[];
    negotiationTips: string[];
    acteUniforme: string;
    isFavorite: boolean;
    usageCount: number;
    lastUsed?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
    societes: { label: "Sociétés", icon: Building2 },
    contrats: { label: "Contrats", icon: Handshake },
    surete: { label: "Sûretés", icon: Scale },
    emploi: { label: "Travail", icon: Users },
};

export default function ClauseBankPage() {
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const loadClauses = () => {
        fetch("/api/library/clauses")
            .then(res => res.json())
            .then(data => setClauses(data.clauses || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadClauses(); }, []);

    const toggleFavorite = async (id: string) => {
        await fetch("/api/library/clauses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, toggleFavorite: true }) });
        loadClauses();
        if (selectedClause?.id === id) {
            setSelectedClause(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : prev);
        }
    };

    const openClause = async (clause: Clause) => {
        setSelectedClause(clause);
        await fetch("/api/library/clauses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: clause.id, incrementUsage: true }) });
        loadClauses();
    };

    const categories = Array.from(new Set(clauses.map(c => c.category))).map(id => ({
        id,
        label: CATEGORY_META[id]?.label || id,
        icon: CATEGORY_META[id]?.icon || FileText,
        count: clauses.filter(c => c.category === id).length,
    }));

    const filteredClauses = clauses.filter(c => {
        if (selectedCategory && c.category !== selectedCategory) return false;
        if (showFavoritesOnly && !c.isFavorite) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <BookOpen className="w-64 h-64 text-amber-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                Bibliothèque de Clauses • OHADA
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Clause Bank <span className="text-amber-400">OHADA</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Bibliothèque de clauses types conformes aux Actes Uniformes OHADA avec annotations d'experts et conseils de négociation.
                        </p>
                    </div>

                    <button disabled title="Non implémenté" className="px-8 py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-not-allowed">
                        <Plus className="w-5 h-5" /> Nouvelle Clause
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher une clause..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-white/5 rounded-2xl text-sm text-white focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Categories */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Catégories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                    !selectedCategory ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/5 text-slate-400"
                                )}
                            >
                                <span className="text-sm font-bold">Toutes les clauses</span>
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{clauses.length}</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                                        selectedCategory === cat.id ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/5 text-slate-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-4 h-4" />
                                        <span className="text-sm font-bold">{cat.label}</span>
                                    </div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{cat.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Favorites Toggle */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={cn(
                            "w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm",
                            showFavoritesOnly ? "bg-amber-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                        )}
                    >
                        {showFavoritesOnly ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        {showFavoritesOnly ? "Afficher tout" : "Mes favoris"}
                    </button>
                </div>

                {/* Clauses List */}
                <div className="lg:col-span-9">
                    {selectedClause ? (
                        /* Clause Detail View */
                        <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 p-4 sm:p-6 lg:p-10 shadow-2xl animate-in fade-in duration-500">
                            <button
                                onClick={() => setSelectedClause(null)}
                                className="text-sm text-slate-500 hover:text-white mb-6 flex items-center gap-2 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" /> Retour à la liste
                            </button>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">{selectedClause.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase rounded-full border border-amber-500/20">
                                            {selectedClause.subcategory}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                            Réf: {selectedClause.acteUniforme}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleFavorite(selectedClause.id)} className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-amber-400 transition-all border border-white/10">
                                        <Star className={cn("w-5 h-5", selectedClause.isFavorite && "fill-amber-400 text-amber-400")} />
                                    </button>
                                    <button onClick={() => navigator.clipboard.writeText(selectedClause.content)} className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/10">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const blob = new Blob([selectedClause.content], { type: "text/plain;charset=utf-8;" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `${selectedClause.title.replace(/[^a-z0-9]+/gi, "-")}.txt`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                        title="Télécharger la clause (.txt)"
                                        className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/10"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Clause Content */}
                            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 mb-8">
                                <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                    {selectedClause.content}
                                </pre>
                            </div>

                            {/* Annotations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                                    <h4 className="text-sm font-black text-indigo-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-4 h-4" /> Annotations Expert
                                    </h4>
                                    <ul className="space-y-3">
                                        {selectedClause.annotations.map((note, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                                {note}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                                    <h4 className="text-sm font-black text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Conseils de Négociation
                                    </h4>
                                    <ul className="space-y-3">
                                        {selectedClause.negotiationTips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button disabled title="Non implémenté : aucun document actif à cibler depuis cette page" className="flex-1 py-4 bg-amber-600/30 text-amber-200/40 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed">
                                    Insérer dans le document
                                </button>
                                <button disabled title="Non implémenté" className="px-8 py-4 bg-white/5 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 cursor-not-allowed">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Clauses Grid */
                        <div className="space-y-4">
                            {filteredClauses.map((clause) => (
                                <div
                                    key={clause.id}
                                    onClick={() => openClause(clause)}
                                    className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 p-6 hover:border-amber-500/30 transition-all cursor-pointer hover:scale-[1.01]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {clause.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                                <h4 className="text-lg font-black text-white">{clause.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                                                <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">{clause.subcategory}</span>
                                                <span>{clause.acteUniforme}</span>
                                                <span>Utilisée {clause.usageCount}x</span>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-2">{clause.content}</p>
                                        </div>
                                        <button className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
