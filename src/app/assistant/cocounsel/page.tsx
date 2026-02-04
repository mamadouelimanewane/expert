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

const SAMPLE_CONVERSATION: Message[] = [
    {
        id: "1",
        role: "user",
        content: "Quelle est la procédure pour convoquer une AGO selon l'AUSCGIE ?",
        timestamp: new Date(Date.now() - 300000)
    },
    {
        id: "2",
        role: "assistant",
        content: `## Procédure de convocation de l'AGO (AUSCGIE)

Selon les **articles 518 à 525** de l'Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE, la procédure est la suivante :

### 1. Délai de convocation
- **Minimum 15 jours** avant la date de l'assemblée (première convocation)
- **6 jours minimum** pour une deuxième convocation

### 2. Formes de convocation
- **Lettre recommandée** avec accusé de réception, OU
- **Avis dans un journal d'annonces légales** (si > 100 associés)

### 3. Contenu obligatoire
- Date, heure et lieu de l'assemblée
- Ordre du jour détaillé
- Texte des résolutions proposées
- Documents mis à disposition

### 4. Quorum requis
- **1ère convocation** : Associés représentant au moins 1/4 du capital
- **2ème convocation** : Aucun quorum requis

### ⚡ Conseil pratique
Prévoyez toujours une date de 2ème convocation dans votre convocation initiale pour anticiper un éventuel défaut de quorum.

---
📚 **Sources** : AUSCGIE Art. 518-525, Jurisprudence CCJA n°045/2022`,
        timestamp: new Date(Date.now() - 240000),
        sources: ["AUSCGIE Art. 518-525", "CCJA n°045/2022"]
    }
];

export default function CoCounselPage() {
    const [messages, setMessages] = useState<Message[]>(SAMPLE_CONVERSATION);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInputValue("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `## Analyse en cours...

Je traite votre demande : "${inputValue}"

Voici une réponse structurée basée sur les Actes Uniformes OHADA et la doctrine fiscale UEMOA.

### Points clés identifiés
1. Analyse contextuelle de votre question
2. Références juridiques applicables
3. Recommandations pratiques

### ⚡ Action suggérée
Consulter les documents sources pour une analyse approfondie.

---
📚 **Sources** : Base OHADA, Doctrine DGID`,
                timestamp: new Date(),
                sources: ["Base OHADA", "Doctrine DGID"]
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 2000);
    };

    const handleQuickAction = (action: QuickAction) => {
        setInputValue(action.prompt);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden animate-in fade-in duration-1000">
            {/* Sidebar */}
            <div className="w-80 flex flex-col gap-6">
                {/* Header Card */}
                <div className="glass-card rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Nexus Counsel</h3>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Assistant IA OHADA</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Recherche juridique, analyse de documents et rédaction assistée par IA. Basé sur les Actes Uniformes OHADA et la doctrine fiscale UEMOA.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6 flex-1 overflow-auto">
                    <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Actions Rapides</h4>
                    <div className="space-y-2">
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/20 transition-all">
                                    <action.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{action.label}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">{action.category}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
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
            <div className="flex-1 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-auto p-8 space-y-6">
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
                                message.role === "user" ? "bg-indigo-600" : "bg-white/10"
                            )}>
                                {message.role === "user" ? (
                                    <User className="w-5 h-5 text-white" />
                                ) : (
                                    <Bot className="w-5 h-5 text-indigo-400" />
                                )}
                            </div>
                            <div className={cn(
                                "max-w-3xl rounded-3xl p-6",
                                message.role === "user"
                                    ? "bg-indigo-600/20 border border-indigo-500/20 rounded-tr-none"
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
                                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="bg-slate-800/50 border border-white/5 rounded-3xl rounded-tl-none p-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Zap className="w-5 h-5 text-indigo-400 opacity-50" />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
