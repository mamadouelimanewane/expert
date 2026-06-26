"use client";

import { useState, useEffect } from "react";
import { 
  Check, X, Send, MessageCircle, Loader2,
  CheckCircle2, Bot, Zap, Filter, Smartphone, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TpeProcessing() {
  const [flows, setFlows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  // Simulation envois
  const [simText, setSimText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (d.clients) setClients(d.clients);
      if (d.clients?.length > 0) setSelectedClient(d.clients[0].id);
    });
    // On pourrait fetcher GET /api/tpe/process-flow mais simulons ici pour aller vite
  }, []);

  const handleSimulateSend = async () => {
    if (!simText || !selectedClient) return;
    setIsSimulating(true);
    
    const client = clients.find(c => c.id === selectedClient);
    
    try {
      const res = await fetch("/api/tpe/process-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          businessName: client?.companyName || "Boutique Informelle",
          rawMessage: simText,
          source: "WHATSAPP"
        })
      });
      const data = await res.json();
      if (data.success) {
        setFlows([data.entry, ...flows]);
        setSimText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setFlows(flows.map(f => f.id === id ? { ...f, status: action } : f));
  };

  const pendingFlows = flows.filter(f => f.status === "PENDING");
  const processedFlows = flows.filter(f => f.status !== "PENDING");

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <Smartphone className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Usine BPO (TPE / Informel)</h2>
            <p className="text-slate-400 mt-1">Transformez les notes vocales WhatsApp de vos TPE en écritures comptables OHADA (Zéro Saisie).</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-300">Hub WhatsApp Actif</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[350px] sm:h-[450px] lg:h-[600px]">
        
        {/* Colonne Gauche : Simulateur WhatsApp */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-white text-sm uppercase tracking-widest">Simulateur Client</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <label className="text-xs font-bold text-slate-400">Sélectionner une TPE</label>
              <select 
                value={selectedClient} 
                onChange={e => setSelectedClient(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName || c.firstName + " " + c.lastName}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden relative">
              <div className="text-center text-xs text-slate-500 font-bold mb-auto">Aujourd'hui</div>
              
              {/* Fake conversation */}
              <div className="flex flex-col gap-4 overflow-y-auto pb-20 custom-scrollbar">
                {flows.map((f, i) => (
                  <div key={i} className="self-end bg-emerald-600/20 border border-emerald-500/20 text-emerald-100 rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-sm">
                    {f.rawContent}
                    <div className="text-[9px] text-emerald-400/60 text-right mt-1 font-bold">14:02 • Envoyé au cabinet</div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <input 
                  type="text" 
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSimulateSend()}
                  placeholder="Ex: J'ai vendu 50 000 de ciment..."
                  className="flex-1 bg-slate-800 border border-white/10 rounded-full px-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={handleSimulateSend}
                  disabled={!simText || isSimulating}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shrink-0 disabled:opacity-50 transition-all"
                >
                  {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Boîte de Traitement IA (Tinder-like) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 flex flex-col h-full relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-8 z-10 relative">
              <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Écritures en attente ({pendingFlows.length})
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Filtrer
                </button>
              </div>
            </div>

            {pendingFlows.length > 0 ? (
              <div className="flex-1 relative flex items-center justify-center z-10">
                {/* Pile de cartes "Tinder" (on n'affiche que la première en grand) */}
                {pendingFlows.slice(0, 1).map((flow) => (
                  <div key={flow.id} className="w-full max-w-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
                    
                    {/* Header Carte */}
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{flow.businessName}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Source: {flow.source}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <Zap className="w-3 h-3" /> IA Confiance: {(flow.confidenceScore * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* Contenu Brut */}
                    <div className="mb-8">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Message Original du Client</p>
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 border-l-2 border-l-emerald-500">
                        <p className="text-white text-sm font-medium leading-relaxed italic">"{flow.rawContent}"</p>
                      </div>
                    </div>

                    {/* Traduction Comptable IA */}
                    <div className="mb-8">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Traduction OHADA (IA)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Débit ({flow.debitCompte})</p>
                          <p className="font-bold text-white text-sm truncate">{flow.debitIntitule}</p>
                          <p className="font-black text-emerald-400 mt-2">{flow.montant.toLocaleString()} F</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Crédit ({flow.creditCompte})</p>
                          <p className="font-bold text-white text-sm truncate">{flow.creditIntitule}</p>
                          <p className="font-black text-rose-400 mt-2">{flow.montant.toLocaleString()} F</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions "Swipe" */}
                    <div className="flex items-center justify-center gap-6 pt-4">
                      <button 
                        onClick={() => handleAction(flow.id, "REJECTED")}
                        className="w-16 h-16 rounded-full bg-slate-800 border border-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-all group shadow-xl"
                      >
                        <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleAction(flow.id, "APPROVED")}
                        className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all group shadow-xl shadow-emerald-500/20 border-4 border-emerald-900/30"
                      >
                        <Check className="w-10 h-10 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center z-10 opacity-50">
                <CheckCircle2 className="w-16 h-16 text-slate-600 mb-4" />
                <h4 className="text-xl font-black text-white">Zéro écriture en attente</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-sm text-center">Vous avez traité tous les messages WhatsApp de vos TPE. Simulez un nouvel envoi à gauche.</p>
              </div>
            )}
            
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          </div>
        </div>

      </div>
    </div>
  );
}
