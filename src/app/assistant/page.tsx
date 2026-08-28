"use client";

import { useState } from "react";
import {
    Send,
    FileText,
    Brain,
    History,
    Mic,
    Paperclip,
    Scale as ScaleIcon,
    Gavel,
    ScrollText,
    Loader2,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page simulait une conversation : quelle que soit la question posée,
// une seule réponse fixe apparaissait après 1,5 s (« la constitution d'une
// SARL nécessite un capital... »), avec une fausse référence juridique
// cliquable ne menant nulle part (href="#"). Le panneau « Urgent / Alertes
// Fiscales » affirmait « 3 dossiers dépassent le seuil de capital social
// minimum » sans aucune source : aucun modèle Prisma ne stocke de capital
// social ni de forme juridique par client, ce chiffre est donc invérifiable
// et a été retiré plutôt qu'inventé. Le chat appelle désormais /api/nexus/chat
// (répond honnêtement si l'IA n'est pas configurée) au lieu de rejouer un
// script.
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

const SYSTEM_PROMPT =
    "Tu es l'assistant juridique et comptable OHADA/SYSCOHADA d'un cabinet d'expertise comptable. Réponds en français, de façon concise et professionnelle. Cite le texte OHADA pertinent quand tu le connais, et dis clairement quand tu n'es pas certain plutôt que d'inventer une référence.";

export default function AssistantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Bonjour. Je suis l'assistant spécialisé en droit OHADA et normes SYSCOHADA. Comment puis-je vous assister aujourd'hui ?",
            timestamp: "09:00",
        }
    ]);
    const [input, setInput] = useState("");
    const [envoiEnCours, setEnvoiEnCours] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || envoiEnCours) return;

        const question = input;
        const userMsg: ChatMessage = { role: "user", content: question, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setEnvoiEnCours(true);

        try {
            const res = await fetch("/api/nexus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: `${SYSTEM_PROMPT}\n\nQuestion : ${question}` }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.response || data.error || "Réponse indisponible.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Impossible de contacter l'assistant IA.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ]);
        } finally {
            setEnvoiEnCours(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-8">
            {/* Left: Chat Interface */}
            <div className="flex-1 flex flex-col glass-card rounded-3xl border border-white/5 bg-slate-900/30 overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="page-title">Assistant Expert IA</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IA Spécialisée OHADA & SYSCOHADA</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 hover:bg-white/5 rounded-xl text-slate-500 transition-all border border-white/5">
                            <History className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex gap-4 max-w-4xl mx-auto",
                            msg.role === "user" ? "flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xl shadow-black/20",
                                msg.role === "assistant" ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-800 border-slate-700 text-indigo-400"
                            )}>
                                {msg.role === "assistant" ? <Brain className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                            </div>
                            <div className={cn(
                                "flex flex-col gap-2 max-w-[80%]",
                                msg.role === "user" ? "items-end text-right" : "items-start"
                            )}>
                                <div className={cn(
                                    "p-6 rounded-3xl border shadow-xl",
                                    msg.role === "assistant"
                                        ? "bg-slate-800/80 border-white/5 text-slate-200"
                                        : "bg-indigo-600 border-indigo-400 text-white"
                                )}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                                <span className="text-[9px] font-black text-slate-700 uppercase">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {envoiEnCours && (
                        <div className="flex gap-4 max-w-4xl mx-auto">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xl shadow-black/20 bg-indigo-600 border-indigo-400 text-white">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div className="p-6 rounded-3xl border shadow-xl bg-slate-800/80 border-white/5 text-slate-400 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Rédaction en cours…
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="p-8 bg-slate-950/50 border-t border-white/5">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute inset-0 bg-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
                        <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-2 shadow-2xl flex items-end gap-2 pr-4 pl-6">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder="Posez une question sur le droit OHADA ou demandez la rédaction d'un acte..."
                                className="w-full bg-transparent border-none py-4 text-sm text-white placeholder:text-slate-500 focus:ring-0 resize-none min-h-[60px]"
                                rows={1}
                            />
                            <div className="flex gap-1 mb-2">
                                <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={envoiEnCours}
                                    className="p-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Tools & Presets Sidebar */}
            <div className="w-80 space-y-6">
                <div className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/40">
                    <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-indigo-400" />
                        Actions Rapides
                    </h3>
                    <div className="space-y-3">
                        <AssistantAction icon={FileText} label="Vérifier conformité liasse" />
                        <AssistantAction icon={ScrollText} label="Générer PV d'AG" />
                        <AssistantAction icon={ScaleIcon} label="Consultation Article OHADA" />
                        <AssistantAction icon={Brain} label="Analyse de clause contractuelle" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssistantAction({ icon: Icon, label }: any) {
    return (
        <button className="w-full flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 group transition-all text-left">
            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-600 transition-colors">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <span className="text-xs font-bold text-slate-300 group-hover:text-white">{label}</span>
        </button>
    );
}
