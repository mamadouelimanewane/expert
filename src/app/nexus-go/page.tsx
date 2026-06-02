"use client";

import { useState, useEffect, useRef } from "react";
import {
    Mic,
    MicOff,
    Send,
    Sparkles,
    Volume2,
    ChevronDown,
    RotateCcw,
    Zap,
    BookOpen,
    Calculator,
    FileText,
    TrendingUp,
    ShieldCheck,
    Activity,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    typing?: boolean;
}

const QUICK_PROMPTS = [
    { icon: TrendingUp, label: "Analyse EBITDA", prompt: "Analyse l'EBITDA de mes principaux clients" },
    { icon: Calculator, label: "Calcul IS OHADA", prompt: "Comment calculer l'IS selon le SYSCOHADA ?" },
    { icon: FileText, label: "TVA à reverser", prompt: "Calcule la TVA à reverser pour ce mois" },
    { icon: ShieldCheck, label: "Conformité LCB-FT", prompt: "Quelles sont les obligations LCB-FT pour un cabinet ?" },
    { icon: BookOpen, label: "Plan comptable", prompt: "Donne-moi le plan comptable OHADA pour les charges" },
    { icon: Activity, label: "Supervision missions", prompt: "Donne-moi un résumé de l'avancement des missions actives" },
];

const DEMO_RESPONSES: Record<string, string> = {
    "ebitda": `📊 **Analyse EBITDA - Portefeuille Clients**

Voici l'état de vos 3 principaux clients :

| Client | CA | EBITDA | Marge |
|--------|-----|--------|-------|
| Groupe Traoré | 485M FCFA | 97M | **20.1%** ↗ |
| SIB Négoce | 230M FCFA | 41M | **17.8%** → |
| Agro-Kouyaté | 167M FCFA | 18M | **10.8%** ↘ |

⚠️ **Alerte** : La marge EBITDA d'Agro-Kouyaté est sous le seuil critique (12%). Recommandation : revue du poste charges externes.`,

    "is": `📋 **Calcul de l'IS selon SYSCOHADA**

L'Impôt sur les Sociétés (IS) en zone OHADA se calcule comme suit :

**Taux standards :**
- Cameroun : 33% du bénéfice imposable
- Côte d'Ivoire : 25%
- Sénégal : 30%

**Base imposable :**
\`Résultat Comptable ± Réintégrations - Déductions = Bénéfice Fiscal\`

Comptes SYSCOHADA associés :
- 695 — Impôts sur le bénéfice
- 444 — État, IS dû

Souhaitez-vous que je génère la liasse fiscale ?`,

    "tva": `🔄 **Calcul TVA à Reverser — Juin 2026**

**TVA Collectée** (Ventes) : **18 450 000 FCFA**
**TVA Déductible** (Achats) : **6 230 000 FCFA**
---
**TVA Nette à Reverser** : **12 220 000 FCFA**

📅 Date limite : 15 juillet 2026
📍 Compte 4431 — TVA collectée

Je peux préparer le formulaire de déclaration TVA automatiquement.`,

    "lcb": `🛡️ **Obligations LCB-FT — Cabinet d'Expertise**

Selon les directives UEMOA/CEMAC et la loi nationale :

**1. Vigilance client (KYC)**
   - Identification et vérification identité (art. 5)
   - Actualisation annuelle des dossiers

**2. Déclaration de soupçon**
   - Déclaration à la CENTIF/ANIF sous 24h
   - Conservation pendant 5 ans

**3. Formation obligatoire**
   - Formation annuelle du personnel (voir module TRACFIN)

Votre cabinet est-il à jour ? Je peux générer un rapport de conformité.`,

    "default": `🧠 **Nexus-Go — Analyse en cours...**

J'ai analysé votre demande. Voici les points clés selon le référentiel SYSCOHADA et les normes OHADA :

Cette fonctionnalité est en développement actif. Je peux déjà vous aider sur :
- ✅ Analyse financière et ratios
- ✅ Plan comptable SYSCOHADA
- ✅ Obligations fiscales par pays OHADA
- ✅ LCB-FT et conformité
- ✅ Supervision missions et clients

Voulez-vous préciser votre demande ?`
};

function getAIResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes("ebitda") || lower.includes("analyse")) return DEMO_RESPONSES.ebitda;
    if (lower.includes("is") || lower.includes("impôt") || lower.includes("impot")) return DEMO_RESPONSES.is;
    if (lower.includes("tva")) return DEMO_RESPONSES.tva;
    if (lower.includes("lcb") || lower.includes("conformité") || lower.includes("kyc")) return DEMO_RESPONSES.lcb;
    return DEMO_RESPONSES.default;
}

export default function NexusGoPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `👋 **Bonjour ! Je suis Nexus-Go**, votre assistant expert-comptable OHADA.\n\nJe peux analyser vos dossiers, calculer des ratios, vérifier vos obligations fiscales et bien plus. Commencez par une question ou utilisez un raccourci ci-dessous.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const sendMessage = async (text?: string) => {
        const content = text || input.trim();
        if (!content) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simuler un délai de réflexion IA
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        const response = getAIResponse(content);
        const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: response,
            timestamp: new Date()
        };

        setIsTyping(false);
        setMessages(prev => [...prev, aiMsg]);
    };

    const toggleVoice = () => {
        setIsListening(!isListening);
        if (!isListening) {
            // Simulation de reconnaissance vocale
            setTimeout(() => {
                setIsListening(false);
                sendMessage("Analyse l'EBITDA de mes principaux clients");
            }, 3000);
        }
    };

    const formatMessage = (text: string) => {
        return text
            .split('\n')
            .map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-white mb-1">{line.slice(2, -2)}</p>;
                }
                if (line.startsWith('---')) {
                    return <hr key={i} className="border-white/10 my-2" />;
                }
                if (line.startsWith('| ')) {
                    return <p key={i} className="font-mono text-xs text-slate-300 mb-0.5">{line}</p>;
                }
                if (line.startsWith('- ') || line.startsWith('   - ')) {
                    return <p key={i} className="text-slate-300 text-sm mb-0.5 pl-2">• {line.replace(/^(-|\s+-)/, '').trim()}</p>;
                }
                if (line.match(/^\d\./)) {
                    return <p key={i} className="text-slate-300 text-sm mb-1">{line}</p>;
                }
                if (line.startsWith('`') && line.endsWith('`')) {
                    return <code key={i} className="block font-mono text-xs bg-slate-900/80 text-cyan-400 px-3 py-2 rounded-lg mb-2 mt-1">{line.slice(1, -1)}</code>;
                }
                // Bold inline
                const parts = line.split(/\*\*(.*?)\*\*/g);
                if (parts.length > 1) {
                    return (
                        <p key={i} className="text-slate-300 text-sm mb-1">
                            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
                        </p>
                    );
                }
                return line ? <p key={i} className="text-slate-300 text-sm mb-1">{line}</p> : <div key={i} className="h-1" />;
            });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] space-y-0 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex-none p-6 flex items-center justify-between bg-slate-900/40 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Animated waveform background */}
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "absolute bottom-0 w-1 bg-gradient-to-t from-indigo-600/30 to-transparent rounded-t-full transition-all duration-300",
                                isListening && "animate-pulse"
                            )}
                            style={{
                                left: `${i * 5 + 2}%`,
                                height: `${20 + Math.sin(i * 0.8) * 40}%`,
                                animationDelay: `${i * 50}ms`
                            }}
                        />
                    ))}
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-2xl transition-all shadow-xl",
                        isListening
                            ? "bg-red-600 shadow-red-600/40 animate-pulse"
                            : "bg-indigo-600 shadow-indigo-600/30"
                    )}>
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Nexus-Go</h2>
                        <p className="text-slate-400 text-sm font-medium">Assistant Expert-Comptable OHADA • IA Contextuelle</p>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button
                        onClick={() => setMessages([messages[0]])}
                        className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5"
                        title="Nouvelle conversation"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        <span className="text-emerald-400 text-xs font-black uppercase">En Ligne</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Quick Actions Sidebar */}
                <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-5 flex-1">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Raccourcis Rapides
                        </h3>
                        <div className="space-y-3">
                            {QUICK_PROMPTS.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => sendMessage(item.prompt)}
                                    className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all">
                                            <item.icon className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-5">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Session
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Messages</span>
                                <span className="text-white font-bold">{messages.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Contexte</span>
                                <span className="text-emerald-400 font-bold">Cabinet 360</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Référentiel</span>
                                <span className="text-cyan-400 font-bold">SYSCOHADA Rev.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat */}
                <div className="lg:col-span-3 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 flex flex-col overflow-hidden shadow-2xl min-h-0">

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                {/* Avatar */}
                                <div className={cn(
                                    "flex-none w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-cyan-500/30"
                                )}>
                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "max-w-[80%] px-5 py-4 rounded-[24px] relative",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-tr-md"
                                        : "bg-slate-800/80 border border-white/5 rounded-tl-md"
                                )}>
                                    {msg.role === "user" ? (
                                        <p className="text-sm">{msg.content}</p>
                                    ) : (
                                        <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                                    )}
                                    <p className={cn(
                                        "text-[9px] mt-2 font-mono",
                                        msg.role === "user" ? "text-indigo-200 text-right" : "text-slate-600"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-800/80 border border-white/5 rounded-[24px] rounded-tl-md px-5 py-4">
                                    <div className="flex gap-1.5 items-center h-5">
                                        {[0, 150, 300].map(delay => (
                                            <div
                                                key={delay}
                                                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                                style={{ animationDelay: `${delay}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div className="flex-none p-5 border-t border-white/5 bg-slate-900/60">
                        {/* Voice indicator */}
                        {isListening && (
                            <div className="flex items-center gap-3 mb-3 p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <div className="flex gap-1">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-red-500 rounded-full animate-pulse"
                                            style={{
                                                height: `${12 + Math.random() * 20}px`,
                                                animationDelay: `${i * 80}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-red-400 text-xs font-black uppercase animate-pulse">Écoute en cours...</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={toggleVoice}
                                className={cn(
                                    "flex-none p-3.5 rounded-2xl font-bold transition-all border",
                                    isListening
                                        ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse"
                                        : "bg-slate-800 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700"
                                )}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <input
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Posez votre question ou dictez à voix haute..."
                                className="flex-1 bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                            />

                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isTyping}
                                className="flex-none p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all border border-indigo-500/50 shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
