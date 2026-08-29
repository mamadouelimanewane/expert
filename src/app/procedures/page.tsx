"use client";

import { useState, useEffect } from "react";
import {
    BookOpen,
    Plus,
    Search,
    FileEdit,
    Save,
    Loader2,
    Users,
    X,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Procedure {
    id: string;
    title: string;
    category: string;
    content: string;
    version: number;
    status: "BROUILLON" | "PUBLIEE" | "ARCHIVEE";
    updatedAt: string;
    createdBy: { firstName: string; lastName: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
    BROUILLON: "Brouillon",
    PUBLIEE: "Publiée",
    ARCHIVEE: "Archivée",
};

export default function ProceduresPage() {
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProc, setSelectedProc] = useState<Procedure | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ title: "", category: "", content: "" });
    const [creating, setCreating] = useState(false);

    const load = () => {
        setLoading(true);
        fetch("/api/procedures")
            .then((r) => r.json())
            .then((d) => {
                const list: Procedure[] = d.procedures || [];
                setProcedures(list);
                setSelectedProc((prev) => {
                    if (prev) {
                        const fresh = list.find((p) => p.id === prev.id);
                        if (fresh) return fresh;
                    }
                    return list[0] || null;
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (selectedProc) {
            setEditContent(selectedProc.content);
            setEditTitle(selectedProc.title);
            setSavedMessage(null);
        }
    }, [selectedProc]);

    const handleSave = async () => {
        if (!selectedProc) return;
        setSaving(true);
        setSavedMessage(null);
        try {
            const res = await fetch("/api/procedures", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedProc.id, title: editTitle, content: editContent }),
            });
            if (res.ok) {
                setSavedMessage("Modifications enregistrées.");
                load();
            } else {
                setSavedMessage("Erreur lors de l'enregistrement.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!selectedProc) return;
        const nextStatus = selectedProc.status === "PUBLIEE" ? "BROUILLON" : "PUBLIEE";
        await fetch("/api/procedures", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedProc.id, status: nextStatus }),
        });
        load();
    };

    const handleCreate = async () => {
        if (!newForm.title.trim() || !newForm.content.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/procedures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newForm),
            });
            const data = await res.json();
            setShowNewModal(false);
            setNewForm({ title: "", category: "", content: "" });
            await load();
            if (data.procedure) setSelectedProc(data.procedure);
        } finally {
            setCreating(false);
        }
    };

    const filteredProcedures = procedures.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-emerald-400" />
                        Manuels de Procédures
                    </h2>
                    <p className="page-subtitle">Bibliothèque des procédures internes du cabinet pour structurer le contrôle interne.</p>
                </div>

                <button onClick={() => setShowNewModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                    <Plus className="w-4 h-4" /> Nouvelle Procédure
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar: Procedure List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Rechercher une procédure..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                        </div>

                        <div className="space-y-2">
                            {filteredProcedures.map(proc => (
                                <div
                                    key={proc.id}
                                    onClick={() => setSelectedProc(proc)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all group",
                                        selectedProc?.id === proc.id ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{proc.category}</span>
                                        <span className={cn(
                                            "text-[8px] px-1.5 py-0.5 rounded-full font-bold border",
                                            proc.status === "PUBLIEE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                                        )}>{STATUS_LABEL[proc.status]}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{proc.title}</h4>
                                    <p className="text-[10px] text-slate-600 mt-1">v{proc.version} · {new Date(proc.updatedAt).toLocaleDateString("fr-FR")}</p>
                                </div>
                            ))}
                            {filteredProcedures.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">Aucune procédure trouvée.</p>
                            )}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {selectedProc ? (
                            <>
                                <div className="glass-card rounded-2xl border border-slate-700/50 flex flex-col min-h-[300px] sm:h-[500px] lg:h-[600px] overflow-hidden">
                                    <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-wrap justify-between items-center gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                            <FileEdit className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 flex-1 min-w-0"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleTogglePublish}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 transition-all"
                                            >
                                                <CheckCircle2 className="w-3 h-3" /> {selectedProc.status === "PUBLIEE" ? "Repasser en brouillon" : "Publier"}
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Enregistrer
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8 bg-slate-950/20 relative">
                                        <textarea
                                            className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 font-serif leading-relaxed text-sm resize-none"
                                            placeholder="Rédigez la procédure..."
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                    </div>
                                    <div className="p-3 bg-slate-900/50 border-t border-slate-700/50 flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                        <span>Version {selectedProc.version} · {selectedProc.createdBy ? `${selectedProc.createdBy.firstName} ${selectedProc.createdBy.lastName}` : "Cabinet"}</span>
                                        {savedMessage && <span className="text-emerald-400 normal-case">{savedMessage}</span>}
                                    </div>
                                </div>

                                {/* RACI Matrix Pre-view */}
                                <div className="apix-card">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Matrice des Responsabilités (RACI) — repère visuel
                                    </h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        {["Collaborateur", "Chef de mission", "Expert-comptable", "Client"].map((role) => (
                                            <div key={role} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                                <p className="text-xs font-bold text-white mb-2">{role}</p>
                                                <div className="flex justify-center gap-1">
                                                    {["R", "A", "C", "I"].map(l => (
                                                        <span key={l} className="w-5 h-5 rounded bg-slate-800 text-[10px] flex items-center justify-center text-slate-500">
                                                            {l}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-4 sm:p-8 lg:p-12">
                                <BookOpen className="w-16 h-16 mb-4 opacity-10" />
                                <p>Aucune procédure. Créez-en une pour commencer.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouvelle Procédure</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Titre de la procédure" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input placeholder="Catégorie / Cycle (ex: Achats, Trésorerie, RH)" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <textarea placeholder="Contenu de la procédure" value={newForm.content} onChange={(e) => setNewForm({ ...newForm, content: e.target.value })} rows={8} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <button onClick={handleCreate} disabled={creating} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {creating ? "Création…" : "Créer la procédure"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
