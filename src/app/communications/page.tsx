"use client";

import { useState } from "react";
import {
    Mail,
    MessageSquare,
    PhoneCall,
    Search,
    Filter,
    Star,
    Archive,
    MoreHorizontal,
    Send,
    Paperclip,
    Sparkles,
    MessageCircle,
    Video,
    MonitorIcon,
    AtSign,
    Plus,
    Clock,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender: string;
    avatar: string;
    subject: string;
    preview: string;
    date: string;
    type: "email" | "portal" | "whatsapp" | "teams";
    read: boolean;
    tags: string[];
}

const MOCK_MESSAGES: Message[] = [
    {
        id: "1",
        sender: "Jean Konan (SIB)",
        avatar: "JK",
        subject: "Ref: Déclaration TVA Mai 2024",
        preview: "Bonjour Maître, je viens de déposer les factures manquantes sur le portail...",
        date: "10:42",
        type: "email",
        read: false,
        tags: ["Fiscal", "Urgent"]
    },
    {
        id: "2",
        sender: "Aissatou (Traoré Import)",
        avatar: "AT",
        subject: "Question sur liasse fiscale",
        preview: "Pouvez-vous me confirmer que la case 'Retenue à la source' est bien remplie ?",
        date: "Hier",
        type: "portal",
        read: true,
        tags: ["Bilan"]
    },
    {
        id: "3",
        sender: "Malick Ndao",
        avatar: "MN",
        subject: "Contrôle Fiscal",
        preview: "Merci de me rappeler concernant le contrôle fiscal en cours. Urgent.",
        date: "Hier",
        type: "whatsapp",
        read: true,
        tags: ["Client", "Relance"]
    },
    {
        id: "4",
        sender: "Direction Financière GDS",
        avatar: "GD",
        subject: "Point Teams : Clôture Annuelle",
        preview: "Disponibilité pour demain 10h sur Teams ?",
        date: "Lun.",
        type: "teams",
        read: true,
        tags: ["AG"]
    }
];

export default function CommunicationPage() {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(MOCK_MESSAGES[0]);
    const [replyText, setReplyText] = useState("");
    const [activeChannel, setActiveChannel] = useState("all");

    const filteredMessages = MOCK_MESSAGES.filter(m => activeChannel === "all" || m.type === activeChannel);

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
            {/* Navigation Rail */}
            <div className="w-20 glass-card rounded-2xl border border-slate-700/50 flex flex-col items-center py-6 gap-6 bg-slate-900/40">
                <button
                    onClick={() => setActiveChannel("all")}
                    className={cn("p-3 rounded-2xl transition-all", activeChannel === "all" ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "hover:bg-slate-800 text-slate-500")}
                >
                    <MessageSquare className="w-6 h-6 text-white" />
                </button>
                <button
                    onClick={() => setActiveChannel("email")}
                    className={cn("p-3 rounded-2xl transition-all", activeChannel === "email" ? "bg-rose-500 shadow-lg shadow-rose-600/20" : "hover:bg-slate-800 text-slate-500")}
                >
                    <AtSign className="w-6 h-6 text-white" />
                </button>
                <button
                    onClick={() => setActiveChannel("whatsapp")}
                    className={cn("p-3 rounded-2xl transition-all", activeChannel === "whatsapp" ? "bg-emerald-500 shadow-lg shadow-emerald-600/20" : "hover:bg-slate-800 text-slate-500")}
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </button>
                <button
                    onClick={() => setActiveChannel("teams")}
                    className={cn("p-3 rounded-2xl transition-all", activeChannel === "teams" ? "bg-indigo-400 shadow-lg shadow-indigo-400/20" : "hover:bg-slate-800 text-slate-500")}
                >
                    <MonitorIcon className="w-6 h-6 text-white" />
                </button>
                <div className="mt-auto">
                    <button className="p-3 rounded-2xl hover:bg-slate-800 text-slate-500">
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Sidebar List */}
            <div className="w-96 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 space-y-4 bg-slate-900/20">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white tracking-tight capitalize">
                            {activeChannel === "all" ? "Hub Central" : activeChannel}
                        </h2>
                        <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full text-white font-bold">{filteredMessages.length}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => setSelectedMessage(msg)}
                            className={cn(
                                "p-4 border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/30 relative group",
                                selectedMessage?.id === msg.id ? "bg-slate-800/60 border-l-2 border-l-indigo-500 shadow-inner" : "border-l-2 border-l-transparent",
                                !msg.read && "bg-indigo-500/[0.03]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ring-1 ring-white/10",
                                        msg.type === "email" ? "bg-rose-500/10 text-rose-400" :
                                            msg.type === "whatsapp" ? "bg-emerald-500/10 text-emerald-400" :
                                                msg.type === "teams" ? "bg-indigo-500/10 text-indigo-400" : "bg-white/10 text-white"
                                    )}>
                                        {msg.avatar}
                                    </div>
                                    <div>
                                        <p className={cn("text-sm font-bold", !msg.read ? "text-white" : "text-slate-300")}>{msg.sender}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] uppercase font-bold text-slate-500">{msg.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500">{msg.date}</span>
                            </div>
                            <h4 className={cn("text-xs mt-2 mb-1 truncate", !msg.read ? "text-slate-200 font-semibold" : "text-slate-400")}>{msg.subject}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{msg.preview}</p>

                            {!msg.read && <div className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden bg-slate-900/10">
                {selectedMessage ? (
                    <>
                        {/* Thread Header */}
                        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl font-bold text-white shadow-xl">
                                    {selectedMessage.avatar}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                                        <User className="w-3 h-3" />
                                        <span>{selectedMessage.sender}</span>
                                        <span className="mx-1">•</span>
                                        <Clock className="w-3 h-3" />
                                        <span>Dernière activité: 10 min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedMessage.type === "teams" && (
                                    <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                        <Video className="w-4 h-4" /> Rejoindre Réunion
                                    </button>
                                )}
                                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors border border-slate-800">
                                    <Star className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors border border-slate-800">
                                    <Archive className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thread Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-white/[0.02]">
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 border border-white/5">
                                        {selectedMessage.avatar}
                                    </div>
                                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-5 border border-white/5 shadow-inner">
                                        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                                            <p>Bonjour Maître,</p>
                                            <p>{selectedMessage.preview}</p>
                                            <p>Nulla sed gravida varius, purus lorem tincidunt ipsum, non sollicitudin neque ipsum non magna. Cras ultrices nisi ut porta eleifend.</p>
                                            <p className="mt-4 pt-4 border-t border-white/5 font-medium italic opacity-50">Envoyé via {selectedMessage.type}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg">
                                        E
                                    </div>
                                    <div className="bg-indigo-600/10 rounded-2xl rounded-tr-none p-5 border border-indigo-500/20">
                                        <p className="text-sm text-indigo-100">Bonjour, c'est bien reçu. Je prépare les documents pour notre call sur Teams.</p>
                                        <p className="text-[9px] text-indigo-400 font-bold mt-2 uppercase">Hier, 16:45</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Composer Container */}
                        <div className="p-6 bg-slate-900/50 border-t border-white/5">
                            {/* Suggestions */}
                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                                <div className="p-1.5 bg-indigo-500/10 rounded-lg shrink-0">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                                {["Accuser réception", "Demander doc", "Planifier Zoom"].map(sugg => (
                                    <button
                                        key={sugg}
                                        onClick={() => setReplyText(`Bonjour,\n\nBien reçu. Je vous recontacte rapidement.\n\nCordialement.`)}
                                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 rounded-full border border-slate-700 transition-all whitespace-nowrap"
                                    >
                                        {sugg}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group bg-slate-800 border border-slate-700 rounded-3xl p-1 shadow-2xl focus-within:border-indigo-500/50 transition-all">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Répondre au client..."
                                    className="w-full bg-transparent border-none rounded-3xl px-5 py-4 min-h-[120px] text-slate-200 focus:ring-0 text-sm resize-none"
                                />
                                <div className="flex justify-between items-center p-3">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all active:scale-95">
                                        Envoyer <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="font-bold text-lg">Hub de Communication Unifié</p>
                        <p className="text-sm text-slate-600 mt-2">Sélectionnez un canal à gauche pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
