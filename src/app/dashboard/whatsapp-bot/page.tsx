"use client";

import { useState } from "react";
import {
  MessageCircle, Bot, Zap, Phone, Users, Send, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, Smartphone, Mic,
  ArrowRight, TrendingUp, Activity, Globe, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_CONVERSATIONS = [
  {
    id: "conv1", name: "Boutique Awa", phone: "+221 77 123 45 67",
    lastMsg: "J'ai vendu pour 80 000 aujourd'hui", time: "14:02",
    unread: 2, status: "active", avatar: "A"
  },
  {
    id: "conv2", name: "Atelier Moussa", phone: "+221 76 987 65 43",
    lastMsg: "J'ai payé 15 000 pour le tissu", time: "12:30",
    unread: 0, status: "pending", avatar: "M"
  },
  {
    id: "conv3", name: "Transport Ibra", phone: "+221 78 321 09 87",
    lastMsg: "Carburant: 20 000 F dépensé", time: "Hier",
    unread: 0, status: "processed", avatar: "I"
  },
  {
    id: "conv4", name: "Pharmacie Dior", phone: "+221 70 456 78 90",
    lastMsg: "Vente médicaments: 150 000 F", time: "09:15",
    unread: 5, status: "active", avatar: "D"
  },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  conv1: [
    { from: "client", text: "Bonjour, j'ai vendu pour 80 000 aujourd'hui Alhamdulilah", time: "14:01" },
    { from: "bot", text: "✅ *Reçu !* Votre vente de 80 000 FCFA a été enregistrée.\n\n📊 *Traduction OHADA :*\n• Débit 521 (Caisse) : 80 000 F\n• Crédit 701 (Ventes) : 80 000 F\n\n_En cours de validation par votre cabinet…_", time: "14:01" },
    { from: "client", text: "Merci ! Et j'ai aussi dépensé 12 000 pour du carburant", time: "14:02" },
    { from: "bot", text: "✅ *Enregistré !*\n\n🚗 Frais de transport: -12 000 FCFA\n• Débit 613 (Transports) : 12 000 F\n• Crédit 521 (Caisse) : 12 000 F\n\n💰 *Bilan du jour :* +68 000 F net", time: "14:02" },
  ],
  conv2: [
    { from: "client", text: "J'ai payé 15 000 pour le tissu", time: "12:29" },
    { from: "bot", text: "📦 *Achat enregistré* — 15 000 FCFA\n• Catégorie : Achats matières premières\n• Débit 601 : 15 000 F\n• Crédit 521 : 15 000 F\n\n_En attente de validation…_", time: "12:30" },
  ],
  conv3: [],
  conv4: [
    { from: "client", text: "Vente médicaments: 150 000 F", time: "09:14" },
    { from: "bot", text: "💊 *Vente enregistrée* — 150 000 FCFA\n• Débit 521 (Caisse) : 150 000 F\n• Crédit 701 (Ventes) : 150 000 F", time: "09:15" },
    { from: "client", text: "Et j'ai reçu un paiement Wave de 35 000", time: "09:16" },
    { from: "bot", text: "📱 *Paiement Wave détecté* — 35 000 FCFA\n• Débit 521100 (Wave) : 35 000 F\n• Crédit 701 (Ventes) : 35 000 F\n\n✅ Synchronisé avec votre compte Mobile Money", time: "09:16" },
    { from: "client", text: "Merci vous êtes au top!", time: "09:17" },
  ],
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  processed: "bg-slate-500",
};

export default function WhatsAppBotHub() {
  const [selected, setSelected] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES["conv1"]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelect = (conv: any) => {
    setSelected(conv);
    setMessages(MOCK_MESSAGES[conv.id] || []);
  };

  const handleSendAsBot = async () => {
    if (!input.trim()) return;
    setIsSending(true);
    const userMsg = { from: "client", text: input, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    await new Promise(r => setTimeout(r, 1200));

    // Simulation réponse Bot
    const botResponse = {
      from: "bot",
      text: `✅ *Traité par NEXUS IA*\n\nJ'ai analysé votre message et enregistré l'opération dans votre journal OHADA.\n\n_Confiance IA: 94% — En attente de validation cabinet…_`,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, botResponse]);
    setIsSending(false);
  };

  const totalUnread = MOCK_CONVERSATIONS.reduce((a, c) => a + c.unread, 0);
  const activeCount = MOCK_CONVERSATIONS.filter(c => c.status === "active").length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <MessageCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Hub WhatsApp Bot PMI</h2>
            <p className="text-slate-400 mt-1">Toutes les conversations client. Le Bot NEXUS transcrit, catégorise et génère les écritures OHADA automatiquement.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Bot Actif · {activeCount} en ligne
          </div>
          {totalUnread > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-black">
              <AlertTriangle className="w-3.5 h-3.5" />
              {totalUnread} non lus
            </div>
          )}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "TPE connectés", val: MOCK_CONVERSATIONS.length, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { icon: MessageCircle, label: "Messages auj.", val: "47", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: Bot, label: "Écritures auto", val: "38", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { icon: Clock, label: "En attente valid.", val: "9", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((k, i) => (
          <div key={i} className={cn("rounded-[20px] border p-4 flex items-center gap-4", k.color)}>
            <k.icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-2xl font-black tabular-nums">{k.val}</p>
              <p className="text-[10px] font-bold opacity-70">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interface de messagerie */}
      <div className="grid lg:grid-cols-12 gap-0 bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden" style={{ height: "600px" }}>

        {/* Liste conversations */}
        <div className="lg:col-span-4 border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Conversations ({MOCK_CONVERSATIONS.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {MOCK_CONVERSATIONS.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-white/5",
                  selected.id === conv.id ? "bg-emerald-600/10" : "hover:bg-slate-800/40"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center font-black text-white">
                    {conv.avatar}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900", STATUS_STYLE[conv.status])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-white truncate">{conv.name}</p>
                    <p className="text-[10px] text-slate-500 shrink-0 ml-2">{conv.time}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                    {conv.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fenêtre de conversation */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Header conversation */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm">
                {selected.avatar}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{selected.name}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> {selected.phone}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black flex items-center gap-1">
                <Bot className="w-3 h-3" /> Bot Actif
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                <MessageCircle className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Aucun message pour le moment.</p>
                <p className="text-slate-600 text-xs mt-1">Simulez l'envoi d'un message client ci-dessous.</p>
              </div>
            ) : messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.from === "client" ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                  msg.from === "client"
                    ? "bg-slate-800 text-white rounded-tl-sm"
                    : "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20"
                )}>
                  {msg.from === "bot" && (
                    <div className="flex items-center gap-1.5 mb-2 opacity-70">
                      <Bot className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">NEXUS IA</span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <p className="text-[9px] opacity-50 text-right mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-end">
                <div className="bg-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-xs text-slate-400">NEXUS IA analyse…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input simulateur */}
          <div className="p-4 border-t border-white/5 bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendAsBot()}
                  placeholder={`Simuler un message de ${selected.name}…`}
                  className="w-full bg-slate-700/50 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleSendAsBot}
                disabled={!input.trim() || isSending}
                className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shrink-0 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-2 text-center">Le Bot NEXUS répond et génère les écritures OHADA automatiquement</p>
          </div>
        </div>

      </div>
    </div>
  );
}
