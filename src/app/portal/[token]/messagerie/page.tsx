"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Send, Paperclip, FileText, CheckCircle2, XCircle, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientPortalMessagesPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [activeThread, setActiveThread] = useState("t1");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/portal/messages", { headers: { "x-portal-token": params.token } })
      .then(res => res.json())
      .then(d => setData(d));
  }, [params.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, activeThread]);

  const handleSend = async () => {
    if (!input.trim() || !data) return;
    
    // Optimistic UI update
    const newMsg = {
      id: Date.now(),
      threadId: activeThread,
      sender: "client",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setData({
      ...data,
      messages: [...data.messages, newMsg]
    });
    setInput("");

    try {
      await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-portal-token": params.token },
        body: JSON.stringify({ threadId: activeThread, text: input })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="p-8">Chargement...</div>;

  const activeMessages = data.messages.filter((m: any) => m.threadId === activeThread);

  return (
    <div className="h-[calc(100vh-80px)] flex gap-6 animate-in fade-in duration-700 bg-slate-50 p-6 rounded-[32px]">
      
      {/* Left: Threads & Docs */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-6">
        
        {/* Documents à approuver */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">À Approuver</h3>
          <div className="space-y-3">
            {data.documentsToApprove.map((doc: any) => (
              <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
                    <CheckCircle2 className="w-3 h-3" /> Oui
                  </button>
                  <button className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
                    <XCircle className="w-3 h-3" /> Non
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threads */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Messages
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {data.threads.map((t: any) => (
              <button 
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all mb-1",
                  activeThread === t.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={cn("text-sm font-bold truncate pr-2", activeThread === t.id ? "text-indigo-900" : "text-slate-800")}>{t.title}</p>
                  <span className="text-[10px] font-medium text-slate-500 shrink-0">{t.date}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{t.lastMessage}</p>
                {t.unread > 0 && (
                  <div className="mt-2 flex justify-end">
                    <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-full text-[10px] font-bold">{t.unread}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right: Chat */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              C3
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Équipe Cabinet 360</h2>
              <p className="text-slate-500 text-xs font-medium">Répond généralement en 1h</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
          {activeMessages.map((msg: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn("flex max-w-[80%]", msg.sender === 'client' ? "ml-auto" : "")}
            >
              <div className={cn(
                "px-6 py-4 rounded-2xl shadow-sm",
                msg.sender === 'client' 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
              )}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={cn("text-[10px] font-bold mt-2", msg.sender === 'client' ? "text-indigo-200" : "text-slate-400")}>{msg.time}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-end gap-3 relative">
            <button className="absolute left-4 bottom-3 p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-100 rounded-full">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Écrivez votre message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-14 py-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[56px] max-h-[120px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-3 bottom-2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
