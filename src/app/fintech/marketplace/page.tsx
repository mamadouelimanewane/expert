"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Building2, TrendingUp, CheckCircle2, ChevronRight, Send, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'offres' | 'demandes'>('offres');
  const [demandes, setDemandes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/fintech/marketplace")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  const handleDemande = async (partner: any) => {
    const res = await fetch("/api/fintech/marketplace", {
      method: "POST",
      body: JSON.stringify({ partnerId: partner.id }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    if (result.success) {
      setDemandes([{
        id: result.requestId,
        date: new Date().toLocaleDateString('fr-FR'),
        partner: partner.name,
        status: "En cours d'analyse",
        type: partner.products[0]
      }, ...demandes]);
      setActiveTab('demandes');
    }
  };

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  // Mock scoring
  const clientScore = 68;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Landmark className="w-6 h-6 text-indigo-500" /> Marketplace Financement
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Connectez les données de vos clients à nos partenaires financiers</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600/20 to-emerald-500/10 border border-indigo-500/20 rounded-[32px] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-black text-white mb-2">Accélérez l'accès au crédit</h3>
          <p className="text-slate-300">
            En tant qu'Expert-Comptable, votre visa sur les états financiers certifie la donnée. 
            Soumettez les dossiers de vos clients en 1 clic vers notre réseau bancaire UEMOA et obtenez un accord de principe en 48h.
          </p>
        </div>
        <div className="relative z-10 text-right shrink-0 ml-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Score Crédit Moyen Portefeuille</p>
          <div className="flex items-center gap-3 justify-end">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-2xl font-black text-indigo-400">
              {clientScore}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Notation "B+"</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Éligible à 80% des offres</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-xl">
        <button onClick={() => setActiveTab('offres')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'offres' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>Partenaires Financiers</button>
        <button onClick={() => setActiveTab('demandes')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'demandes' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>
          Mes Demandes {demandes.length > 0 && <span className="px-2 py-0.5 bg-white/20 rounded-full text-white">{demandes.length}</span>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'offres' && (
          <motion.div key="offres" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.partners.map((p: any, i: number) => {
              const eligible = clientScore >= p.minScore;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.1 }}
                  key={p.id} 
                  className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl flex flex-col h-full hover:border-indigo-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black",
                      `bg-${p.color}-500/20 text-${p.color}-400`
                    )}>
                      {p.initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400">{p.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Produits Phares</p>
                      <div className="flex flex-wrap gap-2">
                        {p.products.map((prod: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-300">{prod}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-xl border border-white/5 bg-slate-950/50 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Score min. exigé</span>
                      <span className={cn("text-sm font-bold", eligible ? "text-emerald-400" : "text-red-400")}>{p.minScore}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDemande(p)}
                    className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                  >
                    <Send className="w-4 h-4" /> Soumettre Dossier
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'demandes' && (
          <motion.div key="demandes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            {demandes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Partenaire</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produit Demandé</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Requête</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {demandes.map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 text-sm text-slate-400">{d.date}</td>
                        <td className="py-4 text-sm font-bold text-white">{d.partner}</td>
                        <td className="py-4 text-sm text-slate-300">{d.type}</td>
                        <td className="py-4 text-xs font-mono text-indigo-400">{d.id}</td>
                        <td className="py-4 text-right">
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 justify-end w-fit ml-auto">
                            <Clock className="w-3 h-3" /> {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Landmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Aucune demande en cours</h3>
                <p className="text-slate-400 text-sm">Soumettez des dossiers depuis l'onglet Partenaires Financiers.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
