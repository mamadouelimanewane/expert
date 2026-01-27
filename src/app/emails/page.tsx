"use client";

import { useState } from "react";
import {
    Mail,
    Sparkles,
    Search,
    Star,
    AlertCircle,
    CheckCircle2,
    Filter,
    Paperclip,
    Send,
    Bot,
    Archive,
    Trash2,
    MessageSquare,
    Zap,
    Tag,
    ChevronDown,
    Inbox,
    Clock,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantAction {
    id: string;
    type: "task" | "reminder" | "missing_doc";
    label: string;
}

interface Email {
    id: string;
    sender: string;
    email: string;
    subject: string;
    preview: string;
    date: string;
    category: "Fiscal" | "Comptable" | "Social" | "Juridique" | "Commercial";
    priority: "high" | "medium" | "low";
    read: boolean;
    isStarred: boolean;
    aiSummary: string;
    aiSuggestedActions: AIAssistantAction[];
}

const MOCK_EMAILS: Email[] = [
    {
        id: "e1",
        sender: "Aissatou Traoré",
        email: "a.traore@import-export.ci",
        subject: "Relance: Justificatifs T2 2024",
        preview: "Je vous envoie enfin les factures de douane que vous m'avez demandées pour la déclaration TVA de mai...",
        date: "Il y a 10 min",
        category: "Fiscal",
        priority: "high",
        read: false,
        isStarred: true,
        aiSummary: "Le client envoie les documents douaniers pour la TVA de Mai et demande confirmation de réception.",
        aiSuggestedActions: [
            { id: "a1", type: "task", label: "Mettre à jour déclaration TVA" },
            { id: "a2", type: "missing_doc", label: "Vérifier le bordereau douane" }
        ]
    },
    {
        id: "e2",
        sender: "Direction Impôts (DGI)",
        email: "notif@dgi.gouv.ci",
        subject: "Notification de mise en demeure #88291",
        preview: "Votre client SIB est informé d'un retard de dépôt sur la taxe de voirie...",
        date: "09:15",
        category: "Juridique",
        priority: "high",
        read: false,
        isStarred: false,
        aiSummary: "Alerte critique : Mise en demeure pour retard de taxe de voirie (Client SIB). Risque de pénalité de 10%.",
        aiSuggestedActions: [
            { id: "a3", type: "task", label: "Contester la notification" },
            { id: "a4", type: "reminder", label: "Appeler client SIB" }
        ]
    },
    {
        id: "e3",
        sender: "Marc Konan",
        email: "m.konan@startup.ci",
        subject: "Question sur les dividendes",
        preview: "Bonjour, j'aimerais savoir quel est le taux de l'IRVM applicable si nous décidons de distribuer...",
        date: "Hier",
        category: "Juridique",
        priority: "medium",
        read: true,
        isStarred: false,
        aiSummary: "Demande de conseil fiscal sur le taux d'imposition des dividendes (IRVM).",
        aiSuggestedActions: [
            { id: "a5", type: "task", label: "Rédiger note de conseil" }
        ]
    }
];

export default function EmailAIPage() {
    const [selectedId, setSelectedId] = useState<string>(MOCK_EMAILS[0].id);
    const [activeTab, setActiveTab] = useState<string>("Reception");
    const [draftMode, setDraftMode] = useState(false);
    const [isAiDrafting, setIsAiDrafting] = useState(false);

    const selectedEmail = MOCK_EMAILS.find(e => e.id === selectedId) || MOCK_EMAILS[0];

    const handleAiDraft = () => {
        setIsAiDrafting(true);
        setDraftMode(true);
        setTimeout(() => {
            setIsAiDrafting(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4 overflow-hidden">

            {/* Sidebar: Nav */}
            <div className="w-16 md:w-56 flex flex-col gap-4">
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl p-3 flex items-center justify-center md:justify-start gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    <Zap className="w-5 h-5 fill-current" />
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
                            {tab === "Reception" && <span className="ml-auto hidden md:block text-[10px] bg-indigo-600 text-white px-1.5 rounded-full">2</span>}
                        </button>
                    ))}
                </div>

                <div className="mt-8 px-4 hidden md:block">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Catégories IA</h4>
                    <div className="space-y-3">
                        {["Fiscal", "Comptable", "Social", "Juridique"].map(cat => (
                            <div key={cat} className="flex items-center gap-2 group cursor-pointer text-sm text-slate-400 hover:text-white">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    cat === "Fiscal" ? "bg-rose-500" :
                                        cat === "Comptable" ? "bg-indigo-500" :
                                            cat === "Social" ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List: Emails */}
            <div className="w-80 md:w-[450px] flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input type="text" placeholder="Rechercher par expéditeur, sujet..." className="w-full bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 border border-slate-700 px-2 py-1 rounded hover:text-white transition-colors">
                            <Tag className="w-3 h-3" /> Masquer traité
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-2 py-1 rounded">
                            <Sparkles className="w-3 h-3" /> Analyse IA On
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {MOCK_EMAILS.map((email) => (
                        <div
                            key={email.id}
                            onClick={() => setSelectedId(email.id)}
                            className={cn(
                                "p-4 border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/30 relative group",
                                selectedId === email.id ? "bg-slate-800 border-l-2 border-l-indigo-500" : "bg-transparent border-l-2 border-l-transparent",
                                !email.read && "bg-indigo-500/[0.03]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-bold text-sm",
                                        !email.read ? "text-white" : "text-slate-400"
                                    )}>{email.sender}</span>
                                    {!email.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                </div>
                                <span className="text-[10px] text-slate-500">{email.date}</span>
                            </div>
                            <h4 className={cn("text-xs font-medium mb-1 truncate", selectedId === email.id ? "text-white" : "text-slate-300")}>{email.subject}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{email.preview}</p>

                            <div className="mt-2 flex gap-1">
                                <span className={cn(
                                    "text-[8px] px-1.5 rounded uppercase font-bold border",
                                    email.category === "Fiscal" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                )}>{email.category}</span>
                                {email.priority === "high" && <span className="text-[8px] px-1.5 rounded uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Urgent</span>}
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2">
                                <Star className={cn("w-4 h-4", email.isStarred ? "text-amber-500 fill-current" : "text-slate-500")} />
                                <Archive className="w-4 h-4 text-slate-500 hover:text-indigo-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content: View Email */}
            <div className="flex-1 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-900/30">
                {/* Action Bar High */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex gap-4">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Trash2 className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Archive className="w-5 h-5" /></button>
                        <div className="w-px h-8 bg-slate-800 mx-1" />
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Tag className="w-5 h-5" /></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAiDraft} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                            <Sparkles className="w-4 h-4" /> Réponse IA
                        </button>
                    </div>
                </div>

                {/* Email Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {/* Subject & Metadata */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">{selectedEmail.subject}</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                                {selectedEmail.sender[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{selectedEmail.sender}</span>
                                    <span className="text-[10px] text-slate-500">&lt;{selectedEmail.email}&gt;</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span>À: Cabinet 360 Partner &lt;contact@cabinet360.ci&gt;</span>
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>
                            <span className="ml-auto text-[10px] text-slate-500">{selectedEmail.date}</span>
                        </div>
                    </div>

                    {/* IA Summary Card */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-50"><Bot className="w-4 h-4 text-indigo-400" /></div>
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Résumé IA du fil
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{selectedEmail.aiSummary}"
                        </p>
                    </div>

                    {/* Email Body Text */}
                    <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed border-l-2 border-slate-800 pl-6 py-2">
                        {selectedEmail.preview}
                        <br /><br />
                        In hac habitasse platea dictumst. Vivamus mattis, nulla sed gravida varius, purus lorem tincidunt ipsum, non sollicitudin neque ipsum non magna.
                        Cras ultrices nisi ut porta eleifend. Donec finibus massa sed eros porta, non posuere sem pretium.
                        <br /><br />
                        Cordialement,<br />
                        {selectedEmail.sender}
                    </div>

                    {/* AI Suggested Actions */}
                    <div className="space-y-3 pt-6 border-t border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Décisions Extraites par l'IA</h4>
                        <div className="flex flex-wrap gap-3">
                            {selectedEmail.aiSuggestedActions.map(action => (
                                <div key={action.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500 cursor-pointer transition-all group">
                                    {action.type === "task" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    {action.type === "missing_doc" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                                    {action.type === "reminder" && <Clock className="w-4 h-4 text-amber-500" />}
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white">{action.label}</span>
                                    <Plus className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Composer: AI Draft Display */}
                {draftMode && (
                    <div className="p-4 bg-slate-900 border-t border-slate-700/50 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full uppercase">Brouillon IA</span>
                                {isAiDrafting && <LoaderIcon className="w-3 h-3 text-indigo-400 animate-spin" />}
                            </div>
                            <button onClick={() => setDraftMode(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Archive className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                className="w-full h-40 bg-slate-800 border-none rounded-2xl p-4 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Écrivez votre réponse..."
                                defaultValue={isAiDrafting ? "Génération par l'IA..." : `Bonjour ${selectedEmail.sender},\n\nMerci pour l'envoi des documents pour la TVA de Mai. Je confirme bien avoir reçu les bordereaux de douane.\n\nJe reviens vers vous dès que la déclaration est prête sur e-Impôts.\n\nCordialement,\nCabinet 360`}
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-4">
                                <Paperclip className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer" />
                                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                    <Send className="w-3 h-3" /> Envoyer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Bar: Action Trigger */}
                {!draftMode && (
                    <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-center">
                        <button
                            onClick={() => setDraftMode(true)}
                            className="w-full max-w-sm py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3"
                        >
                            <MessageSquare className="w-4 h-4" /> Cliquer pour répondre rapidement...
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}

function LoaderIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}
