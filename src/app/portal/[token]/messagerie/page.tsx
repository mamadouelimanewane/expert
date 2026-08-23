"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Messagerie du portail client.
//
// Cette page affichait trois fils de discussion fabriqués — dont un où un
// message annonçait « la TVA déductible s'élève à 450 000 F » — et un panneau
// « Documents à approuver » dont les boutons Oui/Non ne faisaient rien. Un
// client pouvait croire avoir reçu une information chiffrée réelle, ou
// approuver un document sans effet.
//
// Elle s'appuie désormais sur /api/portal/communications, adossé au modèle
// Communication déjà utilisé côté cabinet : un message envoyé ici apparaît
// réellement dans le hub du collaborateur, et inversement. Il n'existe qu'une
// seule conversation par client — aucun système de fils multiples n'étant
// implémenté, il n'a pas été simulé.
// ─────────────────────────────────────────────────────────────────────────────

type Message = {
    id: string;
    sender: "client" | "accountant";
    text: string;
    time: string;
};

export default function ClientPortalMessagesPage() {
    const params = useParams<{ token: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [chargement, setChargement] = useState(true);
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const charger = useCallback(async () => {
        try {
            const res = await fetch("/api/portal/communications", {
                headers: { "x-portal-token": params.token },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);
            setMessages(data.messages ?? []);
        } catch (e) {
            console.error("Chargement des messages :", e);
            setErreur("Impossible de charger la messagerie.");
        } finally {
            setChargement(false);
        }
    }, [params.token]);

    useEffect(() => {
        charger();
    }, [charger]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        const texte = input.trim();
        if (!texte || envoi) return;

        setEnvoi(true);
        setErreur(null);
        try {
            const res = await fetch("/api/portal/communications", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-portal-token": params.token },
                body: JSON.stringify({ text: texte }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);

            setMessages((prev) => [...prev, data.message]);
            setInput("");
        } catch (e) {
            console.error("Envoi du message :", e);
            setErreur(e instanceof Error ? e.message : "Échec de l'envoi.");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-700">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-800">Votre cabinet comptable</h2>
                    <p className="text-slate-500 text-xs font-medium">Vos échanges avec le cabinet</p>
                </div>
            </div>

            {erreur && (
                <div className="mx-8 mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm">
                    {erreur}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                {chargement ? (
                    <p className="text-sm text-slate-500">Chargement…</p>
                ) : messages.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        Aucun message pour le moment. Écrivez à votre cabinet ci-dessous.
                    </p>
                ) : (
                    messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={cn("flex max-w-[80%]", msg.sender === "client" ? "ml-auto" : "")}
                        >
                            <div
                                className={cn(
                                    "px-6 py-4 rounded-2xl shadow-sm",
                                    msg.sender === "client"
                                        ? "bg-indigo-600 text-white rounded-tr-sm"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                                )}
                            >
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p
                                    className={cn(
                                        "text-[10px] font-bold mt-2",
                                        msg.sender === "client" ? "text-indigo-200" : "text-slate-400"
                                    )}
                                >
                                    {msg.time}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-end gap-3 relative">
                    <button
                        disabled
                        title="L'envoi de pièces jointes n'est pas encore disponible"
                        className="absolute left-4 bottom-3 p-2 text-slate-300 bg-slate-100 rounded-full cursor-not-allowed"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Écrivez votre message…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-14 py-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[56px] max-h-[120px]"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || envoi}
                        className="absolute right-3 bottom-2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
