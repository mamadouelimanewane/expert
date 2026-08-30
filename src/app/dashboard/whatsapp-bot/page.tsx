"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MessageCircle, Bot, Phone, Users, Clock, AlertTriangle,
  Loader2, PlugZap, FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationRecord {
  id: string;
  type: string;
  sender: string;
  avatar: string | null;
  content: string;
  date: string;
  read: boolean;
  tags: string[];
}

interface Conversation {
  key: string;
  name: string;
  avatar: string;
  messages: CommunicationRecord[];
  lastMessage: CommunicationRecord;
  unread: number;
}

export default function WhatsAppBotHub() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<CommunicationRecord[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [canSimulate, setCanSimulate] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const loadData = () => {
    return fetch("/api/dashboard/whatsapp-bot")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setIsConfigured(!!data.isConfigured);
        setCanSimulate(!!data.canSimulate);
      });
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/webhooks/whatsapp/simulate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (data.result?.status === "unknown_client") {
          setSimResult("Aucun client trouvé pour tester (ajoutez un client avec un numéro de téléphone).");
        } else {
          setSimResult(`Message simulé traité pour ${data.client.name} — écriture "${data.result.libelle}" créée (confiance IA : ${Math.round((data.result.confidence ?? 0) * 100)}%)${data.result.replySent ? ", réponse WhatsApp envoyée." : "."}`);
        }
        await loadData();
      } else {
        setSimResult(data.error || "Échec de la simulation.");
      }
    } catch {
      setSimResult("Erreur réseau lors de la simulation.");
    } finally {
      setSimulating(false);
    }
  };

  const conversations: Conversation[] = useMemo(() => {
    const bySender = new Map<string, CommunicationRecord[]>();
    for (const msg of messages) {
      const key = msg.sender;
      if (!bySender.has(key)) bySender.set(key, []);
      bySender.get(key)!.push(msg);
    }
    return Array.from(bySender.entries()).map(([key, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return {
        key,
        name: key,
        avatar: msgs[0].avatar || key.charAt(0).toUpperCase(),
        messages: sorted,
        lastMessage: sorted[sorted.length - 1],
        unread: msgs.filter((m) => !m.read).length,
      };
    }).sort((a, b) => new Date(b.lastMessage.date).getTime() - new Date(a.lastMessage.date).getTime());
  }, [messages]);

  const selected = conversations.find((c) => c.key === selectedKey) || conversations[0] || null;
  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <MessageCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="page-title">Hub WhatsApp Bot PMI</h2>
            <p className="page-subtitle">Conversations client synchronisées via WhatsApp Business API.</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isConfigured ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Intégration connectée
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-black">
              <PlugZap className="w-3.5 h-3.5" />
              WhatsApp Business non configuré
            </div>
          )}
          {totalUnread > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-black">
              <AlertTriangle className="w-3.5 h-3.5" />
              {totalUnread} non lus
            </div>
          )}
          {canSimulate && (
            <button
              onClick={handleSimulate}
              disabled={simulating}
              title="Simule un message entrant réel pour tester le pipeline (client → écriture comptable → réponse), sans attendre l'intégration Meta"
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-violet-400 text-xs font-black transition-all disabled:opacity-50"
            >
              {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
              Tester (simulation)
            </button>
          )}
        </div>
      </div>

      {simResult && (
        <div className="flex items-start gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
          <FlaskConical className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <p className="text-xs text-violet-300 leading-relaxed">{simResult}</p>
        </div>
      )}

      {!isConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400 leading-relaxed">
            L'intégration WhatsApp Business (Meta Cloud API) n'est pas configurée sur cet environnement (variable
            <code className="mx-1 px-1.5 py-0.5 bg-black/30 rounded">WHATSAPP_VERIFY_TOKEN</code>
            absente). Aucune réponse automatique n'est générée. {messages.length > 0
              ? "Les conversations ci-dessous proviennent des messages déjà enregistrés en base."
              : "Aucun message WhatsApp n'a encore été enregistré."}
          </p>
        </div>
      )}

      {/* Stats rapides — calculées à partir des données réelles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Contacts", val: conversations.length, color: "text-primary bg-primary/10 border-primary/20" },
          { icon: MessageCircle, label: "Messages enregistrés", val: messages.length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: Clock, label: "Non lus", val: totalUnread, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { icon: Bot, label: "Réponses automatiques", val: "—", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
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
      {conversations.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <MessageCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-slate-400 mb-2">Aucune conversation WhatsApp</h3>
          <p className="text-slate-600 max-w-md text-sm">
            Connectez l'intégration WhatsApp Business (Meta Cloud API) pour recevoir et afficher ici les conversations réelles de vos clients PMI.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-0 bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden" style={{ height: "600px" }}>

          {/* Liste conversations */}
          <div className="lg:col-span-4 border-r border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Conversations ({conversations.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {conversations.map((conv) => (
                <div
                  key={conv.key}
                  onClick={() => setSelectedKey(conv.key)}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-white/5",
                    selected?.key === conv.key ? "bg-emerald-600/10" : "hover:bg-slate-800/40"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center font-black text-white">
                      {conv.avatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-white truncate">{conv.name}</p>
                      <p className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(conv.lastMessage.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMessage.content}</p>
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
            {selected ? (
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-800/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm">
                      {selected.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{selected.name}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> {selected.messages.length} message(s) enregistré(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {selected.messages.map((msg) => (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-slate-800 text-white rounded-tl-sm">
                        <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                        <p className="text-[9px] opacity-50 text-right mt-1">
                          {new Date(msg.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-slate-800/20">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      disabled
                      placeholder="Envoi de message non disponible — intégration WhatsApp Business non configurée"
                      className="w-full bg-slate-700/30 border border-white/10 rounded-full px-5 py-3 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2 text-center">
                    L'envoi de messages et les réponses automatiques nécessitent une intégration WhatsApp Business API active.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                <MessageCircle className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Sélectionnez une conversation.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
