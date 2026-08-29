"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Mic, Paperclip, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "1",
  role: 'assistant',
  content: "Bonjour. Je suis NEXUS, votre assistant expert en normes OHADA/SYSCOHADA. Que puis-je analyser pour vous aujourd'hui ?",
  // Pas d'horodatage au rendu initial : new Date() calculee ici differait entre le
  // rendu serveur (SSR) et l'hydratation client, provoquant un mismatch React
  // (erreur #418) qui desactivait tous les clics/saisies clavier de la page.
  timestamp: ""
};

export default function NexusChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(["📊 KPIs du cabinet", "📅 Échéances semaine", "🔍 Analyser TVA", "📝 Journal de clôture"]);
  const [llmStatus, setLlmStatus] = useState<'unknown' | 'connected' | 'not-configured'>('unknown');

  useEffect(() => {
    setMessages(prev => prev.map(m => (m.id === "1" && m.timestamp === "" ? { ...m, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m)));
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);
    setSuggestions([]);

    try {
      const res = await fetch("/api/nexus/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setSuggestions(data.suggestions || []);
      setLlmStatus(data.notConfigured ? 'not-configured' : 'connected');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    // Simple parser for code blocks (```code```) and bold (**text**)
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        return (
          <div key={i} className="my-3 bg-slate-950 p-4 rounded-xl border border-white/10 font-mono text-sm text-indigo-300 whitespace-pre-wrap shadow-inner">
            {code}
          </div>
        );
      }
      
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bp, j) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return <strong key={j} className="font-bold text-white">{bp.slice(2, -2)}</strong>;
            }
            return <span key={j}>{bp.split('\n').map((line, k) => (
              <span key={k}>{line}<br/></span>
            ))}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] animate-in fade-in duration-700 gap-6">
      {/* Sidebar - History */}
      <div className="hidden lg:flex w-72 flex-col bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => {
            setMessages([{
              id: "1",
              role: 'assistant',
              content: "Bonjour. Je suis NEXUS, votre assistant expert en normes OHADA/SYSCOHADA. Que puis-je analyser pour vous aujourd'hui ?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setSuggestions(["📊 KPIs du cabinet", "📅 Échéances semaine", "🔍 Analyser TVA", "📝 Journal de clôture"]);
          }}
          className="w-full mb-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvelle Conversation
        </button>

        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          L'historique des conversations n'est pas encore persisté : chaque rechargement de page repart d'une conversation vide.
        </p>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl relative">
        {/* Chat Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">NEXUS Chat IA</h2>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  llmStatus === 'connected' ? "bg-emerald-500" : llmStatus === 'not-configured' ? "bg-rose-500" : "bg-slate-500"
                )}></span>
                {llmStatus === 'connected' ? "Assistant connecté (SYSCOHADA)" : llmStatus === 'not-configured' ? "Assistant IA non configuré" : "Statut non vérifié"}
              </p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                  msg.role === 'user' ? "bg-slate-700 text-white" : "bg-indigo-600 text-white"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={cn(
                  "px-6 py-4 rounded-2xl shadow-md",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-sm" 
                    : "bg-slate-800 border border-white/5 text-slate-200 rounded-tl-sm"
                )}>
                  <div className="text-[15px] leading-relaxed">
                    {renderMessageContent(msg.content)}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mt-2 block",
                    msg.role === 'user' ? "text-indigo-300 text-right" : "text-slate-500"
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-6 py-4 bg-slate-800 border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
          {/* Quick Actions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors border border-white/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3 relative">
            <div className="absolute left-4 bottom-4 flex gap-2">
              <button className="text-slate-400 hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
              <button className="text-slate-400 cursor-not-allowed transition-colors" title="Bientôt disponible"><Mic className="w-5 h-5" /></button>
            </div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Posez une question sur vos dossiers, la comptabilité, ou les normes OHADA..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl pl-16 pr-16 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none min-h-[56px] max-h-[120px]"
              rows={1}
            />
            
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
