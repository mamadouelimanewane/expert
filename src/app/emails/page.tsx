"use client";

import { useState, useEffect } from "react";
import {
    Mail,
    Search,
    Star,
    Send,
    Bot,
    Archive,
    Trash2,
    Tag,
    Inbox,
    Loader2,
    AlertTriangle,
    PlugZap,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailRecord {
    id: string;
    sender: string;
    subject: string | null;
    preview: string | null;
    content: string;
    date: string;
    read: boolean;
    tags: string[];
}

export default function EmailAIPage() {
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [isConfigured, setIsConfigured] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("Reception");
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    const loadEmails = () => {
        return fetch("/api/emails")
            .then((r) => r.json())
            .then((data) => {
                setEmails(data.emails || []);
                setIsConfigured(!!data.isConfigured);
                if ((data.emails || []).length > 0 && !selectedId) setSelectedId(data.emails[0].id);
            });
    };

    useEffect(() => {
        loadEmails().finally(() => setLoading(false));
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMessage(null);
        try {
            const res = await fetch("/api/emails/sync", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSyncMessage(`${data.synced} nouveau(x) message(s) synchronisé(s)${data.skipped ? `, ${data.skipped} déjà connu(s)` : ""}.`);
                await loadEmails();
            } else {
                setSyncMessage(data.error || "Échec de la synchronisation.");
            }
        } catch {
            setSyncMessage("Erreur réseau lors de la synchronisation.");
        } finally {
            setSyncing(false);
        }
    };

    const selectedEmail = emails.find((e) => e.id === selectedId) || null;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {!isConfigured ? (
                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl shrink-0">
                    <PlugZap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400 leading-relaxed">
                        Boîte mail non connectée — configurez IMAP_HOST/IMAP_USER/IMAP_PASSWORD pour recevoir vos emails ici. {emails.length > 0
                            ? "Les messages ci-dessous proviennent uniquement des communications déjà enregistrées en base."
                            : "Aucun email n'a encore été synchronisé."}
                    </p>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-3 p-3 bg-primary/5 border border-primary/20 rounded-2xl shrink-0">
                    <p className="text-xs text-primary-foreground/70">
                        {syncMessage || "Boîte mail connectée — synchronisez pour récupérer les derniers messages."}
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Synchroniser
                    </button>
                </div>
            )}

            <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

                {/* Sidebar: Nav */}
                <div className="w-16 md:w-56 flex flex-col gap-4">
                    <button disabled title="Boîte mail non connectée" className="w-full bg-primary/30 text-white/50 rounded-2xl p-3 flex items-center justify-center md:justify-start gap-3 cursor-not-allowed">
                        <Send className="w-5 h-5" />
                        <span className="font-bold hidden md:block">Nouveau Mail</span>
                    </button>

                    <div className="space-y-1">
                        {["Reception", "Etoiles", "Envoyés", "Brouillons", "Archives"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                    activeTab === tab ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                )}
                            >
                                {tab === "Reception" && <Inbox className="w-5 h-5" />}
                                {tab === "Etoiles" && <Star className="w-5 h-5" />}
                                {tab === "Envoyés" && <Send className="w-5 h-5" />}
                                {tab === "Brouillons" && <Bot className="w-5 h-5" />}
                                {tab === "Archives" && <Archive className="w-5 h-5" />}
                                <span className="hidden md:block text-sm">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* List: Emails */}
                <div className="w-80 md:w-[450px] flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Rechercher par expéditeur, sujet..." className="w-full bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {emails.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <Mail className="w-10 h-10 text-slate-600 mb-3" />
                                <p className="text-sm text-slate-400">Aucun email synchronisé</p>
                            </div>
                        ) : emails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => setSelectedId(email.id)}
                                className={cn(
                                    "p-4 border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/30 relative group",
                                    selectedId === email.id ? "bg-slate-800 border-l-2 border-l-primary" : "bg-transparent border-l-2 border-l-transparent",
                                    !email.read && "bg-primary/[0.03]"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("font-bold text-sm", !email.read ? "text-white" : "text-slate-400")}>{email.sender}</span>
                                        {!email.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(email.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                                    </span>
                                </div>
                                <h4 className={cn("text-xs font-medium mb-1 truncate", selectedId === email.id ? "text-white" : "text-slate-300")}>{email.subject || "Sans objet"}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2">{email.preview || email.content.slice(0, 80)}</p>
                                {email.tags.length > 0 && (
                                    <div className="mt-2 flex gap-1">
                                        {email.tags.map((t) => (
                                            <span key={t} className="text-[8px] px-1.5 rounded uppercase font-bold border bg-primary/10 text-primary border-primary/20">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content: View Email */}
                <div className="flex-1 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
                    {!selectedEmail ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                <Mail className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-400 mb-2">Aucun email à afficher</h3>
                            <p className="text-slate-600 text-sm max-w-sm">
                                Connectez votre compte Gmail ou Outlook pour synchroniser vos échanges clients ici.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Action Bar High */}
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <div className="flex gap-4">
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Trash2 className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Archive className="w-5 h-5" /></button>
                                    <div className="w-px h-8 bg-slate-800 mx-1" />
                                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Tag className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Email Content Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">{selectedEmail.subject || "Sans objet"}</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary border border-slate-700">
                                            {selectedEmail.sender[0]}
                                        </div>
                                        <div>
                                            <span className="font-bold text-white text-sm">{selectedEmail.sender}</span>
                                        </div>
                                        <span className="ml-auto text-[10px] text-slate-500">
                                            {new Date(selectedEmail.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                                        </span>
                                    </div>
                                </div>

                                {/* Résumé IA — honnêtement non disponible */}
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Résumé et catégorisation automatique par IA non configurés pour cette boîte mail.
                                    </p>
                                </div>

                                {/* Email Body Text */}
                                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed border-l-2 border-slate-800 pl-6 py-2 whitespace-pre-line">
                                    {selectedEmail.content}
                                </div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex flex-col items-center gap-2">
                                <button
                                    disabled
                                    title="Génération de réponse IA non configurée"
                                    className="w-full max-w-sm py-3 bg-slate-800/60 text-slate-500 border border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 cursor-not-allowed"
                                >
                                    <Bot className="w-4 h-4" /> Réponse IA non disponible
                                </button>
                                <p className="text-[10px] text-slate-600">L'envoi et la génération de réponse nécessitent une boîte mail connectée et une intégration IA configurée.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
