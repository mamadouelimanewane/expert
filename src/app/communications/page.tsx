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
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender: string;
    avatar: string;
    subject: string;
    preview: string;
    date: string;
    type: "email" | "portal" | "sms";
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
        sender: "+225 07 07 00 00 00",
        avatar: "#",
        subject: "SMS Client",
        preview: "Merci de me rappeler concernant le contrôle fiscal en cours. Urgent.",
        date: "Hier",
        type: "sms",
        read: true,
        tags: ["Client", "Relance"]
    }
];

export default function CommunicationPage() {
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(MOCK_MESSAGES[0]);
    const [replyText, setReplyText] = useState("");

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-96 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        Communications
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Chercher un message..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-indigo-600/20 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/30">Tout</button>
                        <button className="flex-1 py-1.5 bg-slate-800 text-slate-400 text-xs font-medium rounded-lg hover:text-white">Email</button>
                        <button className="flex-1 py-1.5 bg-slate-800 text-slate-400 text-xs font-medium rounded-lg hover:text-white">Portail</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MOCK_MESSAGES.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => setSelectedMessage(msg)}
                            className={cn(
                                "p-4 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800/50 relative",
                                selectedMessage?.id === msg.id ? "bg-slate-800/80 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent",
                                !msg.read && "bg-slate-800/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        msg.type === "email" ? "bg-indigo-500" :
                                            msg.type === "portal" ? "bg-emerald-500" : "bg-amber-500"
                                    )} />
                                    <span className={cn("font-medium", !msg.read ? "text-white" : "text-slate-300")}>{msg.sender}</span>
                                </div>
                                <span className="text-xs text-slate-500">{msg.date}</span>
                            </div>
                            <h4 className={cn("text-sm mb-1 truncate", !msg.read ? "text-slate-200 font-semibold" : "text-slate-400")}>{msg.subject}</h4>
                            <p className="text-xs text-slate-500 truncate">{msg.preview}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                {selectedMessage ? (
                    <>
                        {/* Thread Header */}
                        <div className="p-6 border-b border-slate-700/50 flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold text-white border border-slate-600">
                                    {selectedMessage.avatar}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedMessage.subject}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span>{selectedMessage.sender}</span>
                                        <span>&lt;client@example.com&gt;</span>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs border border-slate-700">
                                            {selectedMessage.type === "portal" ? "Via Portail Sécurisé" : "Via Email"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                    <Star className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                    <Archive className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thread Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                                    <p>Bonjour Maître,</p>
                                    <p>{selectedMessage.preview}</p>
                                    <p>Je reste à votre disposition pour tout complément d'information.</p>
                                    <p>Cordialement,<br />{selectedMessage.sender}</p>
                                </div>

                                {/* Attachment Mock */}
                                <div className="flex gap-3 pt-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                        <div className="w-8 h-8 rounded bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <span className="text-xs font-bold">PDF</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Factures_Mai.pdf</p>
                                            <p className="text-xs text-slate-500">2.4 MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Reply Suggester */}
                        <div className="px-6 py-3 bg-indigo-900/10 border-t border-indigo-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-300">Suggestions IA</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {["Accuser réception", "Demander pièce manquante", "Proposer rendez-vous"].map(sugg => (
                                    <button
                                        key={sugg}
                                        onClick={() => setReplyText(`Bonjour,\n\nMerci pour votre message. J'accuse bonne réception des éléments.\n\nCordialement,`)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 rounded-lg text-xs text-slate-300 transition-all"
                                    >
                                        {sugg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Composer */}
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                            <div className="relative">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Écrivez votre réponse..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 min-h-[100px] text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-transform active:scale-95">
                                        Envoyer <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sélectionnez une conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
