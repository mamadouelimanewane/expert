"use client";

import { useState } from "react";
import {
    Sparkles,
    Send,
    Scale,
    FileText,
    Brain,
    ShieldCheck,
    History,
    Search,
    Mic,
    Paperclip,
    ArrowUpRight,
    Scale as ScaleIcon,
    Gavel,
    ScrollText,
    Copy,
    Download,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    references?: { title: string; link: string }[];
}

export default function AssistantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Bonjour Maître. Je suis votre assistant spécialisé en droit OHADA et normes SYSCOHADA. Comment puis-je vous assister aujourd'hui ?",
            timestamp: "09:00",
            references: [
                { title: "Acte Uniforme - Sociétés Commerciales", link: "#" },
                { title: "Guide PCG 2024", link: "#" }
            ]
        }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages([...messages, userMsg]);
        setInput("");

        // Simulate AI thinking and response
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                role: "assistant",
                content: "Selon l'Acte Uniformre relatif au Droit des Sociétés Commerciales et du GIE (AUSCGIE), la constitution d'une SARL nécessite un capital social minimum de 1 000 000 FCFA dans la plupart des juridictions OHADA, sauf disposition nationale contraire plus favorable. Souhaitez-vous que je rédige un projet de statuts ?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                references: [{ title: "AUSCGIE Article 311", link: "#" }]
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1500);
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
                            <h2 className="text-xl font-black text-white tracking-widest uppercase">Assistant Expert IA</h2>
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

                                    {msg.references && (
                                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Fondements Juridiques</p>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.references.map((ref, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer">
                                                        <ScaleIcon className="w-3 h-3" />
                                                        {ref.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] font-black text-slate-700 uppercase">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
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
                                    className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
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

                <div className="glass-card rounded-3xl p-6 border border-rose-500/10 bg-rose-500/[0.02]">
                    <h3 className="text-rose-400 font-black text-[10px] uppercase tracking-widest mb-4">Urgent / Alertes Fiscales</h3>
                    <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                        <p className="text-xs text-rose-200 font-bold leading-relaxed italic">
                            "Attention Maître, 3 dossiers dépassent le seuil de capital social minimum pour leur forme juridique actuelle."
                        </p>
                        <button className="mt-3 text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                            Dépiler les dossiers <ArrowUpRight className="w-3 h-3" />
                        </button>
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
