"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, AlertTriangle, Building, FileText, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { id: "SN", name: "Sénégal", flag: "🇸🇳", color: "emerald" },
  { id: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", color: "orange" },
  { id: "CM", name: "Cameroun", flag: "🇨🇲", color: "red" },
  { id: "BJ", name: "Bénin", flag: "🇧🇯", color: "green" }
];

interface Decl {
  id: string;
  country: string;
  client: string;
  type: string;
  amount: number;
  deadline: string;
  status: string;
}

export default function EDepotPage() {
  const [activeCountry, setActiveCountry] = useState("SN");
  const [selectedDecl, setSelectedDecl] = useState<Decl | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [decls, setDecls] = useState<Decl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/declarations")
      .then(res => res.json())
      .then(data => {
        const list: Decl[] = (data.declarations || []).map((d: any) => ({
          id: d.id,
          country: d.client?.country || "SN",
          client: d.client,
          type: `${d.type} — ${d.month}`,
          amount: d.amount || 0,
          deadline: d.dueDate ? new Date(d.dueDate).toLocaleDateString("fr-FR") : "—",
          status: d.status,
        }));
        setDecls(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCountryData = COUNTRIES.find(c => c.id === activeCountry);
  const filteredDecls = decls.filter(d => d.country === activeCountry);

  const handleSubmit = async () => {
    if (!selectedDecl) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/declarations/e-depot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationId: selectedDecl.id })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Erreur lors de la transmission");
      }
    } catch (error) {
      setSubmitError("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <UploadCloud className="w-6 h-6 text-primary" /> E-Dépôt DGI Centralisé
          </h2>
          <p className="page-subtitle">Télétransmission directe aux administrations fiscales</p>
        </div>
      </div>

      {/* Country Tabs */}
      <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-xl">
        {COUNTRIES.map(c => (
          <button 
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex items-center gap-2",
              activeCountry === c.id ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <span className="text-lg">{c.flag}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={activeCountry} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl min-h-[300px]">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-400" /> Déclarations en attente - {activeCountryData?.name}
            </h3>
            
            <div className="space-y-4">
              {filteredDecls.length > 0 ? (
                filteredDecls.map(d => (
                  <div key={d.id} className="p-5 bg-slate-800/30 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{d.client}</p>
                        <p className="text-xs text-slate-400">{d.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-black text-white">{d.amount.toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Avant le {d.deadline}</p>
                      </div>
                      
                      <button
                        onClick={() => { setSelectedDecl(d); setSubmitError(null); }}
                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-primary hover:brightness-110 text-white shadow-lg shadow-primary/20"
                      >
                        Déposer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">{loading ? "Chargement…" : "Aucune déclaration en attente pour ce pays."}</p>
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex items-start gap-3 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              La télétransmission automatique vers le portail de la DGI n'est pas encore connectée. Le dépôt doit être effectué manuellement sur le portail officiel du pays concerné ; cet écran sert à préparer et suivre les déclarations réelles enregistrées dans le cabinet.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Dépot */}
      <AnimatePresence>
        {selectedDecl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white">Validation du Dépôt</h3>
                    <button onClick={() => !isSubmitting && setSelectedDecl(null)} className="text-slate-500 hover:text-white p-2">✕</button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Déclaration</p>
                      <p className="text-sm font-bold text-white">{selectedDecl.type}</p>
                      <p className="text-xs text-slate-400 mt-1">{selectedDecl.client}</p>
                    </div>

                    {submitError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-xs text-red-400">{submitError}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 text-primary focus:ring-primary bg-slate-950" />
                        <span className="text-sm text-slate-300">Validation par l'expert confirmée</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 text-primary focus:ring-primary bg-slate-950" />
                        <span className="text-sm text-slate-300">Mandat de prélèvement valide</span>
                      </label>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-400">La télétransmission automatique vers la DGI de {activeCountryData?.name} n'est pas encore active — ce bouton vérifiera l'état de l'intégration.</p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary hover:brightness-110 disabled:bg-primary/50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Vérification en cours...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Confirmer le Dépôt</>
                      )}
                    </button>
                  </div>
                </>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
