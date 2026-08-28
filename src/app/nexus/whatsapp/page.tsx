"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Bot, CheckCheck, Send } from 'lucide-react';

export default function WhatsAppHubPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLLMConfigured, setIsLLMConfigured] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/nexus/whatsapp');
            if (res.ok) {
                const data = await res.json();
                setMessages(data.communications ?? []);
                setIsLLMConfigured(!!data.isLLMConfigured);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setLoading(true);
        const userMsg = inputValue;
        setInputValue("");
        
        // Optimistic UI update
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, sender: 'Client', content: userMsg, date: new Date().toISOString() }]);

        try {
            await fetch('/api/nexus/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: 'Client', content: userMsg })
            });
            // Re-fetch to get real ID and AI response
            setTimeout(fetchMessages, 1600);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="flex justify-between items-end border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h1 className="page-title mb-0">Hub WhatsApp & IA</h1>
                    </div>
                    <p className="page-subtitle mb-0">Testez ici les réponses de Nexus IA telles qu'elles seraient envoyées sur WhatsApp.</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${isLLMConfigured ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${isLLMConfigured ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {isLLMConfigured ? 'IA Configurée' : 'IA Non Configurée'}
                </div>
            </header>

            <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl text-sm text-muted-foreground flex items-center gap-3">
                <Bot className="w-5 h-5 text-green-500 shrink-0" />
                Ceci est un simulateur interne de conversation IA — l'envoi/réception réel de messages WhatsApp nécessite l'intégration Meta Business Cloud API (voir Paramètres). L'extraction OCR de pièces jointes (image/audio) n'est pas encore implémentée.
            </div>

            <div className="grid grid-cols-1">
                {/* Simulateur de conversation */}
                <div className="glass-card rounded-3xl border border-green-500/20 flex flex-col h-[350px] sm:h-[450px] lg:h-[600px] overflow-hidden">
                    <div className="p-4 bg-green-600/90 backdrop-blur-md text-white flex items-center gap-3 shadow-md z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">C</div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">Simulation de conversation</h3>
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                        <div className="text-center">
                            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full shadow-sm">Aujourd'hui</span>
                        </div>
                        
                        {messages.map((msg, idx) => {
                            const isNexus = msg.sender === 'Nexus IA';
                            return (
                                <div key={msg.id || idx} className={`flex flex-col gap-1 ${isNexus ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[80%] ${isNexus ? 'bg-green-100 dark:bg-green-900/60 text-foreground rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-foreground rounded-tl-sm'}`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isNexus && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                    </span>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex flex-col gap-1 items-end">
                                <div className="p-3 rounded-2xl text-sm shadow-sm bg-green-100 dark:bg-green-900/60 text-foreground rounded-tr-sm">
                                    <span className="animate-pulse">...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-background border-t border-border/50">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 bg-muted border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                                placeholder="Écrivez un message (ex: J'ai payé 10000 FCFA pour l'essence)..." 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={loading}
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || loading}
                                className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                <Send className="w-5 h-5 ml-1" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
