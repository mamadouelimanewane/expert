"use client";

import { useState } from "react";
import { Sparkles, X, MessageSquare, Send, Bot, Paperclip, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "nexus";
    text: string;
    action?: string;
}

export function NexusCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "nexus", text: "Bonjour ! Je suis Nexus, votre assistant IA de cabinet. Je peux analyser un bilan, générer une lettre de mission ou vérifier les anomalies comptables." }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMsg: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            let replyText = "Je peux vous aider à effectuer cette tâche depuis le module correspondant.";
            let actionText = undefined;

            const lowerInput = input.toLowerCase();
            if (lowerInput.includes("facture") || lowerInput.includes("sonelec")) {
                replyText = "J'ai détecté un dépassement de budget de 113% sur le dossier SONELEC. Voulez-vous que je génère un projet de facture hors-forfait ?";
                actionText = "Générer la facture (25 000 FCFA)";
            } else if (lowerInput.includes("audit") || lowerInput.includes("anomalie")) {
                replyText = "Le dernier scan FEC de la Pharmacie Dior a détecté 3 anomalies sur la TVA (Loi de Benford).";
                actionText = "Ouvrir le rapport d'audit";
            } else if (lowerInput.includes("relance") || lowerInput.includes("document")) {
                replyText = "Il manque 12 relevés bancaires ce mois-ci. J'ai préparé les emails de relance automatique.";
                actionText = "Envoyer les 12 relances WhatsApp";
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: "nexus", text: replyText, action: actionText }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-500 shadow-[0_0_30px_rgba(79,70,229,0.5)]",
                    isOpen ? "w-14 h-14 bg-slate-800 text-slate-400 rotate-90 scale-0 opacity-0" : "w-16 h-16 bg-indigo-600 text-white hover:scale-110 rotate-0 scale-100 opacity-100"
                )}
            >
                <Sparkles className="w-7 h-7" />
            </button>

            {/* Chat Window */}
            <div
                className={cn(
                    "absolute bottom-0 right-0 w-[400px] h-[600px] bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/20 rounded-[40px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right",
                    isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg tracking-tight">Nexus Copilot</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">En ligne</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors relative z-10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map(msg => (
                        <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-3xl p-4 text-sm",
                                msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                            )}>
                                {msg.text}
                                {msg.action && (
                                    <button className="mt-3 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 border border-indigo-500/30">
                                        <CheckCircle2 className="w-4 h-4" /> {msg.action}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <div className="bg-slate-800 text-slate-400 rounded-3xl rounded-tl-sm px-4 py-3 border border-white/5 flex gap-2 items-center">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-slate-900/80">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Demandez à Nexus IA..."
                            className="w-full bg-slate-800 border border-white/10 rounded-2xl pl-4 pr-24 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                        />
                        <div className="absolute right-2 flex gap-1">
                            <button className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleSend}
                                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-[9px] text-center text-slate-500 mt-3 font-medium">NEXUS IA 3.1 PRO — Les réponses peuvent être imprécises.</p>
                </div>
            </div>
        </div>
    );
}
