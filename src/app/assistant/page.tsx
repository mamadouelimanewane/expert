"use client";

import { useState, useRef, useEffect } from "react";
import {
    Bot,
    Send,
    User,
    Sparkles,
    BookOpen,
    Files,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        role: "assistant",
        content: "Bonjour Maître. Je suis votre Assistant Fiscal IA, entraîné sur le Code Général des Impôts (CI, SN, CM, BJ) et les Actes Uniformes OHADA. Comment puis-je vous aider aujourd'hui ?",
        timestamp: "09:00",
    },
];

const SUGGESTIONS = [
    "Quel est le taux d'IS en Côte d'Ivoire ?",
    "Rédige une réponse à une notification de redressement (TVA)",
    "Quelles sont les conditions de déductibilité des charges en OHADA ?",
    "Calcule les pénalités de retard pour déclaration tardive (Sénégal)"
];

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulation of AI processing
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: generateMockResponse(userMsg.content),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateMockResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes("taux") && q.includes("is")) return "En Côte d'Ivoire, le taux normal de l'Impôt sur les Sociétés (IS) est de **25%**. \n\nNotez cependant qu'il existe un taux réduit pour certaines entreprises agréées au Code des Investissements.";
        if (q.includes("redressement") || q.includes("notification")) return "Voici une **structure de réponse** suggérée pour une notification de redressement TVA : \n\n1. **Accusé de réception** : Confirmer la réception de la notification n°... datée du...\n2. **Rappel des faits** : Mentionner la période contrôlée.\n3. **Points contestés** : \n   - *Chef de redressement n°1* : Argumentaire basé sur l'article X du CGI.\n   - *Chef de redressement n°2* : Preuve de la déductibilité (Documents joints).\n4. **Conclusion** : Demande d'abandon des chefs de redressement.\n\nSouhaitez-vous que je rédige le courrier complet ?";
        if (q.includes("ohada") && q.includes("charge")) return "Selon le **PCG-OHADA Révisé**, pour qu'une charge soit déductible, elle doit remplir 4 conditions cumulatives :\n1. Être exposée dans l'intérêt de l'exploitation.\n2. Correspondre à une dépense effective et être appuyée de pièces justificatives.\n3. Se traduire par une diminution de l'actif net.\n4. Être comprise dans les charges de l'exercice au cours duquel elle a été engagée.";

        return "Je comprends votre question. Pourriez-vous préciser le pays concerné (CI, SN, CM, etc.) pour que je consulte le CGI approprié ?";
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Expert IA OHADA</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-slate-400">En ligne • v4.0 (RAG activé)</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-white transition-colors">
                        <Files className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex gap-4 max-w-3xl",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                msg.role === "assistant" ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700 text-slate-300"
                            )}>
                                {msg.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm",
                                msg.role === "assistant"
                                    ? "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none"
                                    : "bg-indigo-600/90 text-white rounded-tr-none"
                            )}>
                                {msg.content}
                                <div className={cn(
                                    "text-[10px] mt-2 opacity-50 text-right",
                                    msg.role === "user" ? "text-indigo-100" : "text-slate-400"
                                )}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4 max-w-3xl">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 rounded-tl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                    {messages.length === 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                            {SUGGESTIONS.map((sugg, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(sugg); }} // Just putting it in input for user to validate, or could auto-send
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                                >
                                    {sugg}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Posez votre question fiscale ou juridique..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-600 mt-2">
                        L'IA peut faire des erreurs. Vérifiez toujours les informations avec le Code Général des Impôts en vigueur.
                    </p>
                </div>
            </div>

            {/* Sidebar Info (Context) */}
            <div className="w-80 hidden lg:flex flex-col gap-4">
                <div className="glass-card rounded-2xl p-4 border border-slate-700/50">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        Sources Juridiques
                    </h4>
                    <div className="space-y-2">
                        {[
                            "CGI Côte d'Ivoire (2024)",
                            "CGI Sénégal (2024)",
                            "Acte Uniforme OHADA (Compta)",
                            "Acte Uniforme OHADA (Sociét.)"
                        ].map((src, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded bg-slate-800/50 border border-slate-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {src}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-4 border border-slate-700/50 flex-1 bg-gradient-to-b from-slate-900/50 to-indigo-900/10">
                    <h4 className="font-bold text-white mb-2">Historique récent</h4>
                    <p className="text-xs text-slate-500 mb-4">Vos dernières consultations.</p>
                    <div className="space-y-3">
                        <div className="text-xs p-2 hover:bg-slate-800/50 rounded cursor-pointer transition-colors">
                            <span className="text-slate-300 font-medium block mb-1">TVA Déductible</span>
                            <span className="text-slate-500 block">Hier</span>
                        </div>
                        <div className="text-xs p-2 hover:bg-slate-800/50 rounded cursor-pointer transition-colors">
                            <span className="text-slate-300 font-medium block mb-1">Amortissement Véhicules</span>
                            <span className="text-slate-500 block">Il y a 2 jours</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
