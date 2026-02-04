"use client";

import { useState } from "react";
import {
    MessageSquare,
    Users,
    Search,
    Filter,
    TrendingUp,
    Hash,
    MoreHorizontal,
    ThumbsUp,
    MessageCircle,
    Share2,
    Plus,
    CheckCircle2,
    Award,
    Bookmark,
    ArrowUpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TOPICS = [
    { id: "all", label: "Toute la communauté", icon: Users },
    { id: "fiscal", label: "Fiscalité & TVA", icon: Hash },
    { id: "ohada", label: "Normes OHADA", icon: Hash },
    { id: "audit", label: "Audit & CAC", icon: Hash },
    { id: "digital", label: "Digitalisation", icon: Hash },
    { id: "career", label: "Carrière & Emploi", icon: Hash }
];

const POSTS = [
    {
        id: 1,
        author: { name: "Mamadou Sylla", avatar: "MS", role: "Expert-Comptable", isVerified: true },
        topic: "fiscal",
        title: "Interprétation de l'article 45 du nouveau barème IR 2026",
        content: "Quelqu'un a-t-il déjà commencé à appliquer le nouveau barème sur les salaires de Janvier ? J'ai un doute sur le calcul du prorata pour les contrats à temps partiel...",
        stats: { likes: 24, comments: 12, shares: 5 },
        time: "Il y a 2h",
        tags: ["IR", "Fiscalité 2026", "Salaires"]
    },
    {
        id: 2,
        author: { name: "Aïcha Diop", avatar: "AD", role: "Auditeur Senior", isVerified: false },
        topic: "ohada",
        title: "Nouveau guide SYSCOHADA : Les points clés à retenir",
        content: "Je viens de terminer la lecture du dernier acte uniforme révisé. J'ai résumé les 5 changements majeurs qui vont impacter nos dossiers de clôture cette année.",
        stats: { likes: 56, comments: 28, shares: 12 },
        time: "Il y a 5h",
        tags: ["SYSCOHADA", "Clôture", "Expertise"]
    },
    {
        id: 3,
        author: { name: "Jean-Pierre Mensah", avatar: "JM", role: "Consultant IT", isVerified: true },
        topic: "digital",
        title: "IA Générative et Audit : Retour d'expérience",
        content: "Nous avons testé l'utilisation d'outils d'IA pour l'analyse de grands volumes de factures. Les résultats sont impressionnants en termes de gain de temps sur les tests de cohérence.",
        stats: { likes: 89, comments: 45, shares: 32 },
        time: "Hier",
        tags: ["IA", "Audit Digital", "Innovation"]
    }
];

const TRENDING_DISCUSSIONS = [
    "Date limite dépôt DSF Sénégal",
    "Réforme TVA Côte d'Ivoire",
    "Certification IFRS Foundation",
    "Outils de consolidation Cloud"
];

export default function TrainingCommunityPage() {
    const [selectedTopic, setSelectedTopic] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-sky-500/20">
                        <MessageSquare className="w-3 h-3" /> Espace Collaboratif
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Communauté d'Experts
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Échangez avec vos pairs, partagez vos connaissances et progressez ensemble.
                        <span className="text-sky-400 font-bold ml-1">Le savoir se multiplie quand on le partage.</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-600/25 flex items-center gap-2 transform hover:scale-105">
                        <Plus className="w-5 h-5" /> Nouvelle Publication
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar Left: Topics */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-6 h-fit sticky top-8">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-sky-400" /> Thématiques
                        </h3>
                        <div className="space-y-1">
                            {TOPICS.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                        selectedTopic === topic.id
                                            ? "bg-sky-600 text-white shadow-lg"
                                            : "text-slate-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <topic.icon className="w-4 h-4" />
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Search & Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                            <Search className="w-5 h-5 text-slate-500 ml-2" />
                            <input
                                type="text"
                                placeholder="Rechercher une discussion, une question..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 rounded-2xl border border-white/5">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-6">
                        {POSTS.map((post) => (
                            <div key={post.id} className="group bg-slate-900/40 border border-white/5 rounded-[32px] p-8 hover:border-sky-500/30 transition-all cursor-pointer relative overflow-hidden">
                                {/* Post Type Indicator */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[50px] -z-10" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-black text-slate-400 border border-white/5 relative">
                                            {post.author.avatar}
                                            {post.author.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                                {post.author.name}
                                                <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-black uppercase tracking-tighter text-slate-500 rounded-md">{post.author.role}</span>
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-medium">{post.time} • Dans <span className="text-sky-400"># {post.topic}</span></p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <MoreHorizontal className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-black text-white mb-4 group-hover:text-sky-400 transition-colors leading-tight">
                                    {post.title}
                                </h3>

                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.content}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {post.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions Bar */}
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors group/action">
                                            <ThumbsUp className="w-4 h-4 group-hover/action:scale-125 transition-transform" />
                                            <span className="text-xs font-bold">{post.stats.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors group/action">
                                            <MessageCircle className="w-4 h-4 group-hover/action:scale-125 transition-transform" />
                                            <span className="text-xs font-bold">{post.stats.comments}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors group/action">
                                            <Share2 className="w-4 h-4 group-hover/action:scale-125 transition-transform" />
                                            <span className="text-xs font-bold">{post.stats.shares}</span>
                                        </button>
                                    </div>
                                    <button className="p-2 text-slate-600 hover:text-amber-400 transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-4 bg-slate-900 shadow-xl rounded-[32px] text-slate-500 font-bold hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 uppercase tracking-[0.2em] text-[10px]">
                        Afficher plus de discussions <ArrowUpCircle className="w-4 h-4" />
                    </button>
                </div>

                {/* Sidebar Right: Stats & Suggestions */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Your Influence Stats */}
                    <div className="bg-gradient-to-br from-sky-600/10 to-transparent rounded-[32px] border border-sky-500/20 p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" /> Votre Influence
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-900/50 rounded-2xl border border-white/5">
                                <p className="text-xl font-black text-white">450</p>
                                <p className="text-[9px] text-slate-500 uppercase font-black">Points</p>
                            </div>
                            <div className="text-center p-3 bg-slate-900/50 rounded-2xl border border-white/5">
                                <p className="text-xl font-black text-white">12</p>
                                <p className="text-[9px] text-slate-500 uppercase font-black">Posts</p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 w-[65%]" />
                            </div>
                            <span className="text-[10px] font-black text-sky-400">Niveau 4</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center font-bold">Encore 50 points pour le badge "Expert Actif"</p>
                    </div>

                    {/* Trending Discussions */}
                    <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Discussions du moment
                        </h3>
                        <div className="space-y-4">
                            {TRENDING_DISCUSSIONS.map((trend, i) => (
                                <div key={i} className="flex items-start gap-3 group cursor-pointer">
                                    <div className="text-sky-500 font-black text-xs pt-1">#{i + 1}</div>
                                    <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{trend}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Top Contributeurs
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "Abdoulaye Wade", points: "2.4k", avatar: "AW" },
                                { name: "Sokhna Fall", points: "1.8k", avatar: "SF" },
                                { name: "Modou Gueye", points: "1.5k", avatar: "MG" }
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-white/5">
                                            {user.avatar}
                                        </div>
                                        <p className="text-xs font-bold text-white">{user.name}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-sky-400">{user.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
