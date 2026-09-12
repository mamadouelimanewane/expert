"use client";

import { useState } from "react";
import {
    Sparkles,
    MessageSquare,
    FileText,
    Send,
    History,
    Lightbulb,
    BookOpen,
    Scale,
    Calculator,
    PenTool,
    Copy,
    Download,
    RefreshCw,
    ChevronRight,
    User,
    Bot,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    sources?: string[];
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    prompt: string;
    category: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { id: "1", label: "Analyser un contrat", icon: FileText, prompt: "Analysez ce contrat et identifiez les clauses à risque selon le droit OHADA", category: "Analyse" },
    { id: "2", label: "Recherche juridique", icon: Scale, prompt: "Quelle est la procédure de recouvrement de créances selon l'AUPSRVE ?", category: "Recherche" },
    { id: "3", label: "Calcul fiscal", icon: Calculator, prompt: "Calculez l'IS pour une société avec un bénéfice de 50M FCFA au Sénégal", category: "Fiscal" },
    { id: "4", label: "Rédiger une clause", icon: PenTool, prompt: "Rédigez une clause de non-concurrence conforme à l'AUSCGIE", category: "Rédaction" },
    { id: "5", label: "Veille réglementaire", icon: BookOpen, prompt: "Quelles sont les dernières modifications des Actes Uniformes OHADA en 2025 ?", category: "Veille" },
    { id: "6", label: "Conseil stratégique", icon: Lightbulb, prompt: "Conseillez-moi sur l'optimisation fiscale pour une PME exportatrice", category: "Conseil" },
];

export default function CoCounselPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const question = inputValue;
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/assistant/cocounsel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: question }),
            });
            const data = await res.json();
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response || data.error || "Erreur lors de la réponse de l'assistant.",
                timestamp: new Date(),
                sources: data.notConfigured ? undefined : ["Réponse générée par IA — à vérifier auprès des textes sources"],
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Erreur de connexion à l'assistant IA.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: QuickAction) => {
        setInputValue(action.prompt);
    };

    // Sur mobile, la colonne latérale de 320px et la zone de chat se
    // partageaient 375px : le chat était hors écran. Empilement vertical
    // sous lg, deux colonnes au-delà.
    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] lg:overflow-hidden animate-in fade-in duration-1000">
            {/* Sidebar */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                {/* Header Card */}
                <div className="glass-card rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Nexus Counsel</h3>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Assistant IA OHADA</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Recherche juridique, analyse de documents et rédaction assistée par IA. Basé sur les Actes Uniformes OHADA et la doctrine fiscale UEMOA.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="apix-card flex-1 overflow-auto">
                    <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Actions Rapides</h4>
                    <div className="space-y-2">
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:brightness-110/20 transition-all">
                                    <action.icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{action.label}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">{action.category}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* History Button */}
                <button className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 p-4 flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                    <History className="w-5 h-5" />
                    <span className="text-sm font-bold">Historique</span>
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-[60vh] glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-6">
                    {messages.map(message => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-4",
                                message.role === "user" ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                message.role === "user" ? "bg-primary" : "bg-white/10"
                            )}>
                                {message.role === "user" ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (
                                    <Bot className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <div className={cn(
                                "max-w-3xl rounded-3xl p-6",
                                message.role === "user"
                                    ? "bg-primary/20 border border-primary/20 rounded-tr-none"
                                    : "bg-slate-800/50 border border-white/5 rounded-tl-none"
                            )}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {message.role === "assistant" ? (
                                        <div
                                            className="text-sm text-slate-300 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: message.content
                                                    .replace(/##\s(.+)/g, '<h3 class="text-lg font-black text-white mt-4 mb-2">$1</h3>')
                                                    .replace(/###\s(.+)/g, '<h4 class="text-md font-bold text-slate-200 mt-3 mb-1">$1</h4>')
                                                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-200">{message.content}</p>
                                    )}
                                </div>
                                {message.sources && message.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                        {message.sources.map((source, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 text-[10px] text-slate-400 rounded-full border border-white/10">
                                                📚 {source}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {message.role === "assistant" && (
                                    <div className="flex gap-2 mt-4">
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary animate-pulse" />
                            </div>
                            <div className="bg-slate-800/50 border border-white/5 rounded-3xl rounded-tl-none p-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-900/50 border-t border-white/5">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Posez votre question juridique ou fiscale..."
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Zap className="w-5 h-5 text-primary opacity-50" />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="px-8 py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-600 text-center mt-4">
                        Nexus Counsel utilise les Actes Uniformes OHADA, la jurisprudence CCJA et la doctrine fiscale UEMOA pour fournir des réponses précises.
                    </p>
                </div>
            </div>
        </div>
    );
}
