"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    Users,
    Search,
    Filter,
    TrendingUp,
    Hash,
    ThumbsUp,
    MessageCircle,
    Plus,
    CheckCircle2,
    Award,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = [
    { id: "all", label: "Toute la communauté", icon: Users },
    { id: "fiscal", label: "Fiscalité & TVA", icon: Hash },
    { id: "ohada", label: "Normes OHADA", icon: Hash },
    { id: "audit", label: "Audit & CAC", icon: Hash },
    { id: "digital", label: "Digitalisation", icon: Hash },
    { id: "career", label: "Carrière & Emploi", icon: Hash }
];

interface Post {
    id: string;
    title: string;
    content: string;
    topic: string;
    tags: string[];
    author: { name: string; role: string };
    likes: number;
    comments: number;
    createdAt: string;
}

export default function TrainingCommunityPage() {
    const [selectedTopic, setSelectedTopic] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", content: "", topic: "fiscal" });
    const [submitting, setSubmitting] = useState(false);

    const loadPosts = () => {
        setLoading(true);
        fetch(`/api/community/posts${selectedTopic !== "all" ? `?topic=${selectedTopic}` : ""}`)
            .then(r => r.json())
            .then(d => setPosts(d.posts ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPosts(); }, [selectedTopic]);

    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleLike = async (postId: string) => {
        const res = await fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
        if (res.ok) {
            const data = await res.json();
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, tags: [] }),
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ title: "", content: "", topic: "fiscal" });
                loadPosts();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const topicCounts = TOPICS.map(t => ({
        ...t,
        count: t.id === "all" ? posts.length : posts.filter(p => p.topic === t.id).length,
    }));

    const contributors = Object.values(
        posts.reduce((acc: Record<string, { name: string; count: number }>, p) => {
            acc[p.author.name] = acc[p.author.name] || { name: p.author.name, count: 0 };
            acc[p.author.name].count++;
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count).slice(0, 5);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-sky-500/20">
                        <MessageSquare className="w-3 h-3" /> Espace Collaboratif
                    </div>
                    <h1 className="page-title-dark">
                        Communauté d'Experts
                    </h1>
                    <p className="page-subtitle-dark max-w-2xl">
                        Échangez avec vos pairs, partagez vos connaissances et progressez ensemble.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-600/25 flex items-center gap-2 transform hover:scale-105">
                        <Plus className="w-5 h-5" /> Nouvelle Publication
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-6 h-fit sticky top-8">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-sky-400" /> Thématiques
                        </h3>
                        <div className="space-y-1">
                            {topicCounts.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                        selectedTopic === topic.id ? "bg-sky-600 text-white shadow-lg" : "text-slate-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <span className="flex items-center gap-3"><topic.icon className="w-4 h-4" /> {topic.label}</span>
                                    <span className="text-xs opacity-70">{topic.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-1 flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                            <Search className="w-5 h-5 text-slate-500 ml-2" />
                            <input
                                type="text"
                                placeholder="Rechercher une discussion..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 rounded-2xl border border-white/5">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-[32px]">
                            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Aucune discussion pour le moment</p>
                            <p className="text-slate-500 text-xs mt-2">Soyez le premier à publier une question ou un partage d'expérience.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredPosts.map((post) => (
                                <div key={post.id} className="group bg-slate-900/40 border border-white/5 rounded-[32px] p-8 hover:border-sky-500/30 transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-black text-slate-400 border border-white/5">
                                                {post.author.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                                    {post.author.name}
                                                    <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-black uppercase tracking-tighter text-slate-500 rounded-md">{post.author.role}</span>
                                                </h4>
                                                <p className="text-[10px] text-slate-500 font-medium">{new Date(post.createdAt).toLocaleDateString("fr-FR")} • Dans <span className="text-sky-400"># {post.topic}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-white mb-4 group-hover:text-sky-400 transition-colors leading-tight">{post.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-6">
                                            <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span className="text-xs font-bold">{post.likes}</span>
                                            </button>
                                            <span className="flex items-center gap-2 text-slate-500">
                                                <MessageCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold">{post.comments}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-slate-900/50 rounded-[32px] border border-white/5 p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <Award className="w-5 h-5 text-amber-400" /> Top Contributeurs
                        </h3>
                        {contributors.length === 0 ? (
                            <p className="text-xs text-slate-500">Aucune activité pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {contributors.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-white/5">
                                                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <p className="text-xs font-bold text-white">{user.name}</p>
                                        </div>
                                        <span className="text-[10px] font-black text-sky-400">{user.count} post{user.count !== 1 ? "s" : ""}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Nouvelle Publication</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <select
                                value={form.topic}
                                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                            >
                                {TOPICS.filter(t => t.id !== "all").map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                            <input
                                placeholder="Titre de la discussion"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500"
                            />
                            <textarea
                                placeholder="Votre question ou partage..."
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                rows={5}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !form.title.trim() || !form.content.trim()}
                                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
