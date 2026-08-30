"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BellRing, Mail, Smartphone, Send, AlertTriangle, MessageCircle, Settings, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RelancesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ id: string; emailSent: boolean; message: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    fetch("/api/invoices/relances")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const handleSend = async (invoiceId: string) => {
    setSending(invoiceId);
    setSendResult(null);
    try {
      const res = await fetch("/api/invoices/relances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId })
      });
      const data = await res.json();
      setSuccess(invoiceId);
      setSendResult({
        id: invoiceId,
        emailSent: Boolean(data.emailSent),
        message: data.emailSent
          ? "E-mail de relance envoyé au client."
          : `Relance tracée, mais aucun e-mail envoyé (${data.emailError || "SMTP non configuré ou e-mail client manquant"}).`,
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(null);
    }
  };

  if (loading) return <div className="text-white p-8">Chargement...</div>;

  const stageTitles = ["Relance 1 (J+30)", "Relance 2 (J+45)", "Relance 3 (J+60)", "Contentieux"];
  const stageColors = ["text-blue-400 bg-blue-500/10", "text-amber-400 bg-amber-500/10", "text-orange-400 bg-orange-500/10", "text-red-400 bg-red-500/10"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <BellRing className="w-6 h-6 text-amber-500" /> Relance Automatique Impayés
          </h2>
          <p className="page-subtitle">Gérez vos créances clients et automatisez les rappels.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-center">
            <p className="text-xl font-black text-amber-400">{data.stats.count}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">À Relancer</p>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-center">
            <p className="text-xl font-black text-red-400">{(data.stats.amount / 1000000).toFixed(1)}M <span className="text-xs">FCFA</span></p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">En Souffrance</p>
          </div>
          <button 
            onClick={() => setShowConfig(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors border border-white/5 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" /> Configurer
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((stage) => {
          const stageInvoices = data.invoices.filter((i: any) => i.stage === stage);
          return (
            <div key={stage} className="min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block", stageColors[stage-1])}>
                  {stageTitles[stage-1]}
                </h3>
                <span className="text-slate-500 font-bold text-sm">{stageInvoices.length}</span>
              </div>
              
              <div className="space-y-4">
                {stageInvoices.map((inv: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={inv.id} 
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{inv.client}</p>
                        <p className="text-xs text-slate-400">{inv.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">{inv.amount.toLocaleString('fr-FR')} F</p>
                        <p className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full inline-block mt-1">+{inv.daysOverdue} jrs</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSend(inv.id)}
                      disabled={sending === inv.id || success === inv.id}
                      className={cn(
                        "w-full mt-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                        success === inv.id 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-primary/20 hover:brightness-110/40 text-primary border border-primary/30"
                      )}
                    >
                      {sending === inv.id ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      ) : success === inv.id ? (
                        <><CheckCircle2 className="w-4 h-4" /> {sendResult != null && sendResult.id === inv.id && sendResult.emailSent ? "E-mail envoyé" : "Tracé"}</>
                      ) : (
                        <><Send className="w-3 h-3" /> Envoyer Relance</>
                      )}
                    </button>
                    {sendResult != null && sendResult.id === inv.id && (
                      <p className={cn("text-[10px] mt-2 leading-relaxed", sendResult.emailSent ? "text-emerald-400" : "text-amber-400")}>
                        {sendResult.message}
                      </p>
                    )}
                  </motion.div>
                ))}
                {stageInvoices.length === 0 && (
                  <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-sm">
                    Aucune facture
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Historique */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
        <h3 className="text-lg font-black text-white mb-6">Historique des relances</h3>
        <div className="overflow-x-auto">
          <table className="apix-table text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.history.map((h: any) => (
                <tr key={h.id}>
                  <td className="py-4 text-sm text-slate-400 whitespace-nowrap">{h.date}</td>
                  <td className="py-4 text-sm text-slate-300">{h.details}</td>
                </tr>
              ))}
              {data.history.length === 0 && (
                <tr><td colSpan={2} className="py-8 text-center text-sm text-slate-500">Aucune relance envoyée pour l'instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Configuration des Templates</h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-white p-2">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Template Email (Relance 1)
                </label>
                <textarea 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-primary min-h-[120px]"
                  defaultValue="Bonjour {{client.name}},\n\nSauf erreur ou omission de notre part, la facture {{invoice.number}} d'un montant de {{invoice.amount}} FCFA arrivée à échéance le {{invoice.dueDate}} reste impayée.\n\nMerci de procéder au règlement dans les meilleurs délais."
                ></textarea>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Template WhatsApp (Relance 2)
                </label>
                <textarea 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-primary min-h-[100px]"
                  defaultValue="Bonjour {{client.name}}, Cabinet 360 vous rappelle que votre facture {{invoice.number}} de {{invoice.amount}} FCFA est en retard. Merci de régulariser la situation rapidement. 🔗 Lien de paiement: {{invoice.link}}"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setShowConfig(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors">Annuler</button>
              <button onClick={() => setShowConfig(false)} className="px-6 py-3 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-xl shadow-primary/30">Enregistrer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
