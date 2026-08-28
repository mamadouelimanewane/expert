"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Download, Save, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UEMOA_CHECKLIST, calculateComplianceScore } from "@/lib/compliance-engine";

export default function UemoaScorePage() {
  // La checklist démarrait pré-remplie avec ~29 réponses fictives (commentaire
  // d'origine : "Initial mock state to show a score around 74"), affichant un
  // score et des points critiques précis dès le premier chargement, sans
  // qu'aucune évaluation n'ait eu lieu. Elle démarre désormais vide : le
  // score reflète uniquement les réponses effectivement cochées.
  const [answers, setAnswers] = useState<Record<string, 'conforme'|'attention'|'non_conforme'>>({});

  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [chargement, setChargement] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);

  useEffect(() => {
    fetch("/api/clients?limit=200&isActive=true")
      .then((r) => r.json())
      .then((d) =>
        setClients(
          (d.clients ?? []).map((c: Record<string, unknown>) => ({
            id: String(c.id),
            nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
          }))
        )
      )
      .catch((e) => console.error("Chargement du portefeuille :", e));
  }, []);

  useEffect(() => {
    if (!clientId) { setAnswers({}); return; }
    setChargement(true);
    fetch(`/api/audit/work-papers?clientId=${clientId}&type=UEMOA_SCORE`)
      .then((r) => r.json())
      .then((d) => setAnswers(d.data?.answers ?? {}))
      .finally(() => setChargement(false));
  }, [clientId]);

  const enregistrer = async () => {
    if (!clientId) return;
    setSauvegarde(true);
    try {
      await fetch("/api/audit/work-papers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, type: "UEMOA_SCORE", data: { answers } }),
      });
    } finally {
      setSauvegarde(false);
    }
  };

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "États Financiers": true
  });

  const categories = useMemo(() => {
    const cats = new Set(UEMOA_CHECKLIST.map(item => item.category));
    return Array.from(cats);
  }, []);

  const result = useMemo(() => calculateComplianceScore(answers), [answers]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAnswer = (id: string, value: 'conforme'|'attention'|'non_conforme') => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-indigo-500" /> Score de Conformité (UEMOA/BCEAO)
          </h2>
          <p className="page-subtitle">Évaluation des risques légaux, fiscaux et réglementaires</p>
        </div>
        <div className="flex gap-2">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
          >
            <option value="">Sélectionner un dossier client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button
            onClick={enregistrer}
            disabled={!clientId || sauvegarde}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {sauvegarde ? "…" : "Enregistrer"}
          </button>
          <button
            disabled
            title="La génération PDF de ce rapport n'est pas encore implémentée."
            className="px-6 py-3 bg-indigo-600/40 text-white/50 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Rapport Conformité
          </button>
        </div>
      </div>

      {!clientId ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-10 text-center text-sm text-slate-500">
          Sélectionnez un dossier client pour ouvrir (ou créer) son évaluation de conformité.
        </div>
      ) : chargement ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-10 text-center text-sm text-slate-500">
          Chargement de l&apos;évaluation…
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Checklist */}
        <div className="lg:col-span-8 space-y-4">
          {categories.map((category) => {
            const items = UEMOA_CHECKLIST.filter(item => item.category === category);
            const isExpanded = expandedCategories[category];
            const catScore = items.reduce((acc, item) => acc + (answers[item.id] === 'conforme' ? item.weight : answers[item.id] === 'attention' ? item.weight * 0.5 : 0), 0);
            const catMax = items.reduce((acc, item) => acc + item.weight, 0);
            const catPct = Math.round((catScore / catMax) * 100);
            
            return (
              <div key={category} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{category}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className={cn("h-full", catPct >= 80 ? "bg-emerald-500" : catPct >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${catPct}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{catPct}%</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-2 space-y-1 bg-slate-900/20">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors group">
                            <div className="flex-1">
                              <p className="text-sm text-slate-300">{item.description}</p>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Poids: {item.weight}</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleAnswer(item.id, 'conforme')}
                                className={cn("p-2 rounded-lg transition-colors border", answers[item.id] === 'conforme' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-slate-900 border-white/5 text-slate-500 hover:text-emerald-400")}
                                title="Conforme"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAnswer(item.id, 'attention')}
                                className={cn("p-2 rounded-lg transition-colors border", answers[item.id] === 'attention' ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-900 border-white/5 text-slate-500 hover:text-amber-400")}
                                title="Partiellement conforme"
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAnswer(item.id, 'non_conforme')}
                                className={cn("p-2 rounded-lg transition-colors border", answers[item.id] === 'non_conforme' ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-slate-900 border-white/5 text-slate-500 hover:text-red-400")}
                                title="Non conforme"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right: Score & Criticals */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Score Global de Conformité</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="88" 
                  className={cn("transition-all duration-1000", result.score >= 85 ? "stroke-emerald-500" : result.score >= 60 ? "stroke-amber-500" : "stroke-red-500")}
                  strokeWidth="12" fill="none" strokeLinecap="round" 
                  style={{ strokeDasharray: 2 * Math.PI * 88, strokeDashoffset: (2 * Math.PI * 88) * (1 - result.score / 100) }}
                />
              </svg>
              <div className="text-center">
                <p className="text-5xl font-black text-white">{result.score}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">/ 100</p>
              </div>
            </div>
            
            <span className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
              result.rating === 'CONFORME' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              result.rating === 'PARTIELLEMENT CONFORME' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {result.rating}
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500" /> Points Critiques
            </h3>
            
            <div className="space-y-4">
              {result.criticals.length > 0 ? (
                result.criticals.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                      <p className="text-sm font-medium text-white">{item.description}</p>
                      <div className="mt-2 text-xs text-red-400 font-medium">Risque Sanction Élevé</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">Aucun point critique majeur</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      )}
    </div>
  );
}
