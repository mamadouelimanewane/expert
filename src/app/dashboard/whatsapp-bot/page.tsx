"use client";

import { useState } from "react";
import { MessageCircle, Zap, Copy, CheckCircle, Phone, QrCode, Settings2, Users, Activity, ArrowRight } from "lucide-react";

const MOCK_RECENT = [
  { phone: "+225 07 12 34 56", name: "PMI Dakar SARL", msg: "Achat gasoil 25000 FCFA", time: "Il y a 2 min", status: "processed" },
  { phone: "+225 05 98 76 54", name: "Tech Startup CI", msg: "📸 [Photo facture Sonatel]", time: "Il y a 15 min", status: "ocr_pending" },
  { phone: "+221 77 45 32 10", name: "Chez Marie Traiteur", msg: "Vente du jour 85000 frs reçu", time: "Il y a 1h", status: "processed" },
];

export default function WhatsAppBotConfig() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://cabinet360.app'}/api/webhooks/whatsapp`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Messages reçus (30j)", val: "247", icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Clients connectés", val: "12", icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Écritures générées", val: "231", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
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
        {/* Configuration */}
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
            <p className="text-[10px] text-slate-600 mt-1">À coller dans votre tableau de bord Meta for Developers</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Token de vérification</label>
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3 border border-white/5">
              <code className="text-xs text-green-400 flex-1">cabinet360_secret</code>
              <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
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

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <p className="text-blue-400 text-xs font-bold mb-1">💡 Comment ça marche pour le client</p>
            <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
              <li>Le client enregistre le numéro du cabinet dans WhatsApp</li>
              <li>Il envoie une photo de son ticket de caisse OU un message vocal</li>
              <li>Le bot répond avec confirmation de l'écriture créée</li>
              <li>Le cabinet valide en 1 clic dans l'interface de révision</li>
            </ol>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-slate-400" />
            <h3 className="font-black text-white">Activité Récente</h3>
          </div>

          <div className="space-y-3">
            {MOCK_RECENT.map((msg, i) => (
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
                  <span className="flex-shrink-0 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black border border-amber-500/20">OCR</span>
                )}
                {msg.status === "processed" && (
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 text-green-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" /> Voir tous les messages entrants
          </button>
        </div>
      </div>
    </div>
  );
}
