"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Building2, TrendingUp, CheckCircle2, ChevronRight, Send, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affirmait un partenariat réel avec des banques nommées
// (Ecobank, SGBS, BICIS, Banque Atlantique...) promettant "un accord de
// principe en 48h", sur la base d'un "Score Crédit Moyen Portefeuille" fixe
// (commentaire d'origine : "Mock scoring") et d'un bouton "Soumettre
// Dossier" qui ne faisait qu'un POST renvoyant un identifiant de requête
// fictif (`REQ-${Date.now()}`, voir /api/fintech/marketplace) — rien n'est
// réellement transmis à aucune banque. Les noms de banques restent listés
// comme un répertoire de référence ; le score fictif et la promesse de
// soumission automatique sont retirés.
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/fintech/marketplace")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="text-white p-8">Chargement...</div>;

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

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-6 text-sm text-amber-200">
        Répertoire de référence à but informatif — aucun partenariat de soumission automatisée n&apos;existe avec ces
        établissements. Contactez-les directement pour déposer un dossier de financement.
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.partners.map((p: any, i: number) => (
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
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
