"use client";

import { useState } from "react";
import { Landmark, Send, Loader2, AlertTriangle } from "lucide-react";

// Nexus Fiscal : assistant IA specialise fiscalite/social OHADA-UEMOA,
// ancre sur le referentiel reel d'obligations fiscales du cabinet (voir
// /api/nexus/fiscal) et sur les donnees reelles du portefeuille client
// (facturation, declarations, missions — memes donnees que l'assistant
// Nexus general). Sans DEEPSEEK_API_KEY configuree, la route repond
// honnetement plutot que d'inventer une reponse fiscale.

type Message = { role: "user" | "assistant"; texte: string; nonConfigure?: boolean };

export default function NexusFiscalPage() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [enCours, setEnCours] = useState(false);

    const envoyer = async (e: React.FormEvent) => {
        e.preventDefault();
        const texte = question.trim();
        if (!texte || enCours) return;

        setMessages((prev) => [...prev, { role: "user", texte }]);
        setQuestion("");
        setEnCours(true);
        try {
            const res = await fetch("/api/nexus/fiscal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: texte }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);
            setMessages((prev) => [...prev, { role: "assistant", texte: data.response ?? "", nonConfigure: Boolean(data.notConfigured) }]);
        } catch (err) {
            setMessages((prev) => [...prev, {
                role: "assistant",
                texte: err instanceof Error ? err.message : "Échec de l'appel à l'assistant.",
            }]);
        } finally {
            setEnCours(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8 flex flex-col h-[calc(100vh-4rem)]">
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Landmark className="w-8 h-8 text-indigo-400" /> Nexus Fiscal
                </h2>
                <p className="page-subtitle">
                    Assistant IA spécialisé fiscalité et obligations sociales OHADA/UEMOA, ancré sur le référentiel réel du cabinet.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-500">
                        <Landmark className="w-10 h-10 text-slate-700" />
                        <p className="text-sm max-w-sm">
                            Posez une question sur une échéance, une obligation ou un point de fiscalité OHADA/UEMOA.
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div className={
                            m.role === "user"
                                ? "max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm"
                                : "max-w-[80%] bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 text-sm whitespace-pre-wrap"
                        }>
                            {m.nonConfigure && (
                                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Non configuré
                                </div>
                            )}
                            {m.texte}
                        </div>
                    </div>
                ))}
                {enCours && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={envoyer} className="flex gap-3">
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex : quelle est l'échéance de la TVA au Sénégal ?"
                    className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                    type="submit"
                    disabled={!question.trim() || enCours}
                    className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center gap-2 transition-all"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
