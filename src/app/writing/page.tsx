"use client";

import { useState, useEffect, useMemo } from "react";
import {
    PenTool,
    Mail,
    FileText,
    ScrollText,
    Plus,
    Search,
    CheckSquare,
    Send,
    Inbox,
    History,
    ChevronRight,
    ShieldCheck,
    Loader2,
    X,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "redaction" | "courrier";

interface Template {
    id: string;
    title: string;
    category: string;
    content: string;
}

interface Correspondence {
    id: string;
    subject: string;
    type: "COURRIER" | "PV" | "MISE_EN_DEMEURE" | "AUTRE";
    content: string;
    recipientName: string | null;
    createdAt: string;
    client: { companyName: string | null; firstName: string | null; lastName: string | null } | null;
    createdBy: { firstName: string; lastName: string } | null;
}

const TYPE_LABEL: Record<string, string> = {
    COURRIER: "Courrier",
    PV: "PV",
    MISE_EN_DEMEURE: "Mise en demeure",
    AUTRE: "Autre",
};

function extractPlaceholders(content: string): string[] {
    const matches = content.match(/\[[A-ZÉÈÀÇÙ0-9_]+\]/g) || [];
    return Array.from(new Set(matches));
}

function categoryToType(category: string): Correspondence["type"] {
    if (/PV|Convocation/i.test(category)) return "PV";
    if (/demeure/i.test(category)) return "MISE_EN_DEMEURE";
    if (/Courrier/i.test(category)) return "COURRIER";
    return "AUTRE";
}

export default function WritingCenterPage() {
    const [view, setView] = useState<ViewMode>("redaction");
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [content, setContent] = useState("");
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [templateSearch, setTemplateSearch] = useState("");

    const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
    const [loadingMail, setLoadingMail] = useState(true);

    const [clients, setClients] = useState<any[]>([]);
    const [subject, setSubject] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [clientId, setClientId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ title: "", category: "", content: "" });
    const [savingTemplate, setSavingTemplate] = useState(false);

    const [showLogModal, setShowLogModal] = useState(false);
    const [logForm, setLogForm] = useState({ subject: "", recipientName: "", type: "COURRIER", content: "", clientId: "" });
    const [savingLog, setSavingLog] = useState(false);

    const loadTemplates = () => {
        setLoadingTemplates(true);
        fetch("/api/writing/templates")
            .then((r) => r.json())
            .then((d) => setTemplates(d.templates || []))
            .finally(() => setLoadingTemplates(false));
    };

    const loadCorrespondences = () => {
        setLoadingMail(true);
        fetch("/api/writing/correspondences")
            .then((r) => r.json())
            .then((d) => setCorrespondences(d.correspondences || []))
            .finally(() => setLoadingMail(false));
    };

    useEffect(() => {
        loadTemplates();
        loadCorrespondences();
        fetch("/api/clients").then((r) => r.json()).then((d) => setClients(d.clients || []));
    }, []);

    const placeholders = useMemo(() => (selectedTemplate ? extractPlaceholders(selectedTemplate.content) : []), [selectedTemplate]);

    const handleSelectTemplate = (t: Template) => {
        setSelectedTemplate(t);
        setContent(t.content);
        setSubject(t.title);
        setFieldValues({});
        setSaveMessage(null);
    };

    const applyFields = () => {
        let merged = content;
        for (const [key, value] of Object.entries(fieldValues)) {
            if (value.trim()) {
                merged = merged.split(key).join(value);
            }
        }
        setContent(merged);
    };

    const handleSaveCorrespondence = async () => {
        if (!subject.trim() || !content.trim()) return;
        setSaving(true);
        setSaveMessage(null);
        try {
            const res = await fetch("/api/writing/correspondences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    type: selectedTemplate ? categoryToType(selectedTemplate.category) : "AUTRE",
                    content,
                    recipientName: recipientName || null,
                    clientId: clientId || null,
                }),
            });
            if (res.ok) {
                setSaveMessage("Courrier enregistré avec succès.");
                loadCorrespondences();
            } else {
                setSaveMessage("Erreur lors de l'enregistrement.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!newTemplate.title.trim() || !newTemplate.content.trim()) return;
        setSavingTemplate(true);
        try {
            await fetch("/api/writing/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTemplate),
            });
            setShowTemplateModal(false);
            setNewTemplate({ title: "", category: "", content: "" });
            loadTemplates();
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleLogMail = async () => {
        if (!logForm.subject.trim() || !logForm.content.trim()) return;
        setSavingLog(true);
        try {
            await fetch("/api/writing/correspondences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...logForm, clientId: logForm.clientId || null }),
            });
            setShowLogModal(false);
            setLogForm({ subject: "", recipientName: "", type: "COURRIER", content: "", clientId: "" });
            loadCorrespondences();
        } finally {
            setSavingLog(false);
        }
    };

    const filteredTemplates = templates.filter((t) =>
        t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.category.toLowerCase().includes(templateSearch.toLowerCase())
    );

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const receivedWeek = correspondences.filter((c) => now - new Date(c.createdAt).getTime() < weekMs).length;
    const pvCount = correspondences.filter((c) => c.type === "PV").length;
    const miseEnDemeureCount = correspondences.filter((c) => c.type === "MISE_EN_DEMEURE").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-cyan-400" />
                        Rédaction & Gestion de Courrier
                    </h2>
                    <p className="page-subtitle">Modèles réels d'actes juridiques, PV et courriers, avec suivi des correspondances du cabinet.</p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setView("redaction")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2",
                            view === "redaction" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <ScrollText className="w-4 h-4" /> Rédaction
                    </button>
                    <button
                        onClick={() => setView("courrier")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2",
                            view === "courrier" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Mail className="w-4 h-4" /> Courrier
                    </button>
                </div>
            </div>

            {view === "redaction" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Template Menu */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Modèle d'acte..."
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {loadingTemplates ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTemplates.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => handleSelectTemplate(t)}
                                        className={cn(
                                            "p-3 rounded-xl border cursor-pointer transition-all",
                                            selectedTemplate?.id === t.id ? "bg-cyan-500/10 border-cyan-500/50" : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-500/20">{t.category}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white leading-tight">{t.title}</h4>
                                    </div>
                                ))}
                                {filteredTemplates.length === 0 && (
                                    <p className="text-xs text-slate-500 text-center py-4">Aucun modèle trouvé.</p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                        >
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold">Modèle Perso</span>
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden min-h-[350px] sm:h-[550px] lg:h-[700px]">
                        {selectedTemplate ? (
                            <>
                                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white">{selectedTemplate.title}</h3>
                                        <span className="text-xs text-slate-500 italic">{selectedTemplate.category}</span>
                                    </div>
                                </div>

                                {placeholders.length > 0 && (
                                    <div className="p-4 border-b border-slate-700/50 bg-slate-950/30 space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Champs à compléter ({placeholders.length})</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {placeholders.map((ph) => (
                                                <input
                                                    key={ph}
                                                    placeholder={ph}
                                                    value={fieldValues[ph] || ""}
                                                    onChange={(e) => setFieldValues({ ...fieldValues, [ph]: e.target.value })}
                                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={applyFields}
                                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5" /> Appliquer les champs au texte
                                        </button>
                                    </div>
                                )}

                                <div className="flex-1 relative p-6 bg-white/5">
                                    <textarea
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 font-serif leading-relaxed text-sm resize-none"
                                        placeholder="Le texte s'affichera ici..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>

                                <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 space-y-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <input
                                            placeholder="Objet du courrier"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="flex-1 min-w-[180px] bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                        />
                                        <input
                                            placeholder="Destinataire (optionnel)"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            className="flex-1 min-w-[160px] bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                        />
                                        <select
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value)}
                                            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                        >
                                            <option value="">Client (optionnel)</option>
                                            {clients.map((c) => (
                                                <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSaveCorrespondence}
                                            disabled={saving}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Enregistrer le courrier
                                        </button>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                        <span>Mots: {content.split(" ").filter((x) => x.length > 0).length}</span>
                                        {saveMessage ? (
                                            <span className="flex items-center gap-1 text-emerald-400 normal-case"><ShieldCheck className="w-3 h-3" /> {saveMessage}</span>
                                        ) : (
                                            <span>&nbsp;</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <PenTool className="w-16 h-16 mb-4 opacity-10" />
                                <p>Sélectionnez un modèle pour commencer la rédaction.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === "courrier" && (
                <div className="space-y-6">
                    {/* Mail Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Courriers</p>
                                <h4 className="text-2xl font-bold text-white">{correspondences.length}</h4>
                            </div>
                            <Inbox className="w-8 h-8 text-indigo-500 opacity-20" />
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">7 Derniers Jours</p>
                                <h4 className="text-2xl font-bold text-white">{receivedWeek}</h4>
                            </div>
                            <History className="w-8 h-8 text-cyan-500 opacity-20" />
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">PV / Mises en demeure</p>
                                <h4 className="text-2xl font-bold text-white">{pvCount} / {miseEnDemeureCount}</h4>
                            </div>
                            <Send className="w-8 h-8 text-emerald-500 opacity-20" />
                        </div>
                        <button
                            onClick={() => setShowLogModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-4 flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Enregistrer Courrier
                        </button>
                    </div>

                    {/* Mail List */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Objet</th>
                                    <th className="px-6 py-4">Destinataire / Client</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Auteur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {correspondences.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4 text-slate-200 font-medium">{m.subject}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {m.recipientName || m.client?.companyName || `${m.client?.firstName ?? ""} ${m.client?.lastName ?? ""}`.trim() || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-800 text-slate-400 border-slate-700">
                                                {TYPE_LABEL[m.type]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</td>
                                        <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                            {m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName}` : "—"}
                                        </td>
                                    </tr>
                                ))}
                                {!loadingMail && correspondences.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Aucun courrier enregistré pour le moment.</td></tr>
                                )}
                            </tbody>
                        </table></div>
                    </div>
                </div>
            )}

            {/* Custom Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouveau Modèle Personnalisé</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Titre du modèle" value={newTemplate.title} onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input placeholder="Catégorie (ex: Courrier, PV, Contrat)" value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <textarea placeholder="Contenu du modèle (utilisez [CHAMP] pour les champs à remplir)" value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} rows={8} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono" />
                            <button onClick={handleCreateTemplate} disabled={savingTemplate} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {savingTemplate ? "Enregistrement…" : "Créer le modèle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Mail Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Enregistrer un Courrier</h3>
                            <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Objet" value={logForm.subject} onChange={(e) => setLogForm({ ...logForm, subject: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Destinataire" value={logForm.recipientName} onChange={(e) => setLogForm({ ...logForm, recipientName: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <select value={logForm.type} onChange={(e) => setLogForm({ ...logForm, type: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                    {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <select value={logForm.clientId} onChange={(e) => setLogForm({ ...logForm, clientId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Client (optionnel)</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>
                                ))}
                            </select>
                            <textarea placeholder="Contenu / notes du courrier" value={logForm.content} onChange={(e) => setLogForm({ ...logForm, content: e.target.value })} rows={5} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <button onClick={handleLogMail} disabled={savingLog} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {savingLog ? "Enregistrement…" : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
