"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Zap, Copy, CheckCircle, Phone, Settings2, Users, Activity, ArrowRight, Send, Loader2 } from "lucide-react";

export default function WhatsAppBotConfig() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://cabinet360.app'}/api/webhooks/whatsapp`;
  
  const [recentJournals, setRecentJournals] = useState<any[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);

  // Simulator state
  const [simPhone, setSimPhone] = useState("");
  const [simMessage, setSimMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoadingJournals(true);
    try {
      // Pour la démo, on récupère tous les clients avec leurs TPE journals récents
      const res = await fetch("/api/clients");
      const data = await res.json();
      
      let allJournals: any[] = [];
      data.clients?.forEach((client: any) => {
        // En vrai, il faudrait une API spécifique qui ramène les écritures globales
        // On mock ici avec un state statique si on ne trouve pas de route spécifique
      });
      // Pour l'instant on garde une liste mockée mélangée avec les vrais ajouts si besoin,
      // ou on peut faire un fetch spécifique
    } catch (e) {
      console.error(e);
    }
    setLoadingJournals(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    if (!simPhone || !simMessage) return;
    setIsSimulating(true);
    setSimResult(null);

    const payload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: simPhone,
              type: "text",
              text: { body: simMessage }
            }]
          }
        }]
      }]
    };

    try {
      const res = await fetch("/api/webhooks/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.status === "unknown_client") {
        setSimResult("❌ Client introuvable. Créez un client avec ce numéro.");
      } else if (data.status === "processed") {
        setSimResult(`✅ Écriture créée : "${data.libelle}" (Confiance OCR: ${data.confidence}%)`);
        setSimMessage("");
        // On ajouterait la nouvelle ligne dans les récents
      } else {
        setSimResult("⚠️ Erreur ou non géré.");
      }
    } catch (err) {
      setSimResult("❌ Erreur serveur.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/20 flex items-center justify-center shadow-xl shadow-green-500/10">
          <MessageCircle className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-white tracking-tight">WhatsApp Bot</h2>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest">Option</span>
          </div>
          <p className="text-slate-400">Vos clients PMI transmettent leurs dépenses directement par WhatsApp. L'IA s'occupe du reste.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Messages reçus (30j)", val: "247", icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Clients connectés", val: "12", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Écritures automatisées", val: "231", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-[20px] border ${s.bg} bg-slate-900/30 flex items-center gap-4`}>
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-500 font-bold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne Gauche : Config & Simulateur */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-white">Configuration Meta API</h3>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">URL du Webhook</label>
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3 border border-white/5">
                <code className="text-xs text-indigo-400 flex-1 truncate">{webhookUrl}</code>
                <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Numéro WhatsApp Business</label>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-sm">+225 07 00 00 00</span>
                <span className="ml-auto text-[10px] text-green-600 font-black">CONNECTÉ</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <MessageCircle className="w-32 h-32 text-indigo-500" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <MessageCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black text-white">Simulateur WhatsApp</h3>
            </div>
            <p className="text-xs text-slate-400 relative z-10 mb-4">Testez l'envoi de dépenses via le numéro de téléphone d'un client existant dans votre CRM.</p>

            <div className="space-y-3 relative z-10">
              <input 
                type="text" 
                placeholder="Numéro Client (ex: +225... ou celui d'un client de la base)"
                value={simPhone}
                onChange={e => setSimPhone(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <textarea 
                placeholder="Ex: J'ai acheté du gasoil pour 25 000 FCFA à la station Shell"
                value={simMessage}
                onChange={e => setSimMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button 
                onClick={handleSimulate}
                disabled={isSimulating || !simPhone || !simMessage}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-50"
              >
                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer au Webhook
              </button>

              {simResult && (
                <div className={`p-3 rounded-xl text-xs font-bold mt-2 ${simResult.startsWith("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                  {simResult}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-slate-400" />
            <h3 className="font-black text-white">Console d'Activité Récente</h3>
          </div>

          <div className="space-y-3">
            {[
              { phone: "+225 07 12 34 56", name: "PMI Dakar SARL", msg: "Achat gasoil 25000 FCFA", time: "Il y a 2 min", status: "processed" },
              { phone: "+225 05 98 76 54", name: "Tech Startup CI", msg: "📸 [Photo facture Sonatel]", time: "Il y a 15 min", status: "ocr_pending" },
              { phone: "+221 77 45 32 10", name: "Chez Marie Traiteur", msg: "Vente du jour 85000 frs reçu", time: "Il y a 1h", status: "processed" },
            ].map((msg, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-green-500/20 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                  {msg.status === "ocr_pending" ? "📸" : "✅"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-bold text-white text-sm truncate">{msg.name}</p>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{msg.msg}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{msg.phone}</p>
                </div>
                {msg.status === "ocr_pending" && (
                  <span className="flex-shrink-0 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black border border-amber-500/20">OCR EN COURS</span>
                )}
                {msg.status === "processed" && (
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors flex-shrink-0 cursor-pointer" title="Voir l'écriture comptable" />
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-white/5">
             <button className="w-full py-3 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Traiter les écritures en attente
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">Toutes les écritures générées par le bot sont en attente de validation dans votre section "Révision Journaux TPE".</p>
          </div>
        </div>
      </div>
    </div>
  );
}
