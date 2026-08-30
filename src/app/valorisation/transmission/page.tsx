"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Building, Download, BarChart2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateDCF, calculateEBITDAMultiple, calculateANR } from "@/lib/valuation-engine";

export default function ValorisationPage() {
  const [activeTab, setActiveTab] = useState<'dcf' | 'ebitda' | 'anr' | 'synthese'>('dcf');

  // Form states
  const [dcfInputs, setDcfInputs] = useState({ ca: 500000000, croissance: 5, actualisation: 10, annees: 5 });
  const [ebitdaInputs, setEbitdaInputs] = useState({ ebitda: 75000000, multiple: 6 });
  const [anrInputs, setAnrInputs] = useState({ actif: 800000000, dettes: 450000000, ajustements: 50000000 });

  const [dcfResult, setDcfResult] = useState<any>(null);

  const runDCF = () => {
    const res = calculateDCF(dcfInputs.ca, dcfInputs.croissance, dcfInputs.actualisation, dcfInputs.annees);
    setDcfResult(res);
  };

  const valEbitda = calculateEBITDAMultiple(ebitdaInputs.ebitda, ebitdaInputs.multiple);
  const valAnr = calculateANR(anrInputs.actif, anrInputs.dettes, anrInputs.ajustements);
  const valDcf = dcfResult ? dcfResult.enterpriseValue : 0;
  
  const avgValuation = (valEbitda + valAnr + (valDcf || valEbitda)) / 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" /> Valorisation & Transmission
          </h2>
          <p className="page-subtitle">Outils d'évaluation d'entreprise multicritères</p>
        </div>
      </div>

      <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-xl">
        <button onClick={() => setActiveTab('dcf')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'dcf' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white")}>Méthode DCF</button>
        <button onClick={() => setActiveTab('ebitda')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'ebitda' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white")}>Multiple EBITDA</button>
        <button onClick={() => setActiveTab('anr')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'anr' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white")}>Actif Net (ANR)</button>
        <button onClick={() => setActiveTab('synthese')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === 'synthese' ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-400/70 hover:text-emerald-400")}>
          <BarChart2 className="w-4 h-4" /> Synthèse
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dcf' && (
          <motion.div key="dcf" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Paramètres DCF
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chiffre d'Affaires N (FCFA)</label>
                  <input type="number" value={dcfInputs.ca} onChange={e => setDcfInputs({...dcfInputs, ca: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taux Croissance (%)</label>
                    <input type="number" value={dcfInputs.croissance} onChange={e => setDcfInputs({...dcfInputs, croissance: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taux Actualisation (%)</label>
                    <input type="number" value={dcfInputs.actualisation} onChange={e => setDcfInputs({...dcfInputs, actualisation: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horizon (Années)</label>
                  <input type="number" value={dcfInputs.annees} onChange={e => setDcfInputs({...dcfInputs, annees: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" max="10" />
                </div>
                
                <button onClick={runDCF} className="w-full mt-4 py-4 bg-primary hover:brightness-110 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <Calculator className="w-4 h-4" /> Calculer DCF
                </button>
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-center">
              {dcfResult ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valeur d'Entreprise Estimée</p>
                    <p className="text-4xl font-black text-primary">{Math.round(dcfResult.enterpriseValue).toLocaleString()} <span className="text-lg text-slate-400">FCFA</span></p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Flux Actualisés</p>
                      <p className="text-lg font-bold text-white">{Math.round(dcfResult.enterpriseValue - dcfResult.terminalValue).toLocaleString()} F</p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valeur Terminale</p>
                      <p className="text-lg font-bold text-white">{Math.round(dcfResult.terminalValue).toLocaleString()} F</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Renseignez les paramètres et lancez le calcul.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'ebitda' && (
          <motion.div key="ebitda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-lg font-black text-white mb-6">Approche Comparative</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">EBITDA Normatif (FCFA)</label>
                  <input type="number" value={ebitdaInputs.ebitda} onChange={e => setEbitdaInputs({...ebitdaInputs, ebitda: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Multiple Sectoriel (x)</label>
                  <div className="flex items-center gap-4 mt-1">
                    <input type="range" min="2" max="15" step="0.5" value={ebitdaInputs.multiple} onChange={e => setEbitdaInputs({...ebitdaInputs, multiple: Number(e.target.value)})} className="flex-1 accent-primary" />
                    <span className="text-lg font-black text-white w-12 text-right">{ebitdaInputs.multiple}x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valeur d'Entreprise (EBITDA)</p>
              <p className="text-5xl font-black text-emerald-400">{valEbitda.toLocaleString()} <span className="text-xl text-slate-400">FCFA</span></p>
              <p className="text-sm text-slate-400 mt-4">Fourchette suggérée : {(valEbitda * 0.9).toLocaleString()} - {(valEbitda * 1.1).toLocaleString()}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'anr' && (
          <motion.div key="anr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-lg font-black text-white mb-6">Approche Patrimoniale</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Actif (FCFA)</label>
                  <input type="number" value={anrInputs.actif} onChange={e => setAnrInputs({...anrInputs, actif: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Dettes (FCFA)</label>
                  <input type="number" value={anrInputs.dettes} onChange={e => setAnrInputs({...anrInputs, dettes: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ajustements (Plus-values latentes) (FCFA)</label>
                  <input type="number" value={anrInputs.ajustements} onChange={e => setAnrInputs({...anrInputs, ajustements: Number(e.target.value)})} className="mt-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Actif Net Réévalué (ANR)</p>
              <p className="text-5xl font-black text-blue-400">{valAnr.toLocaleString()} <span className="text-xl text-slate-400">FCFA</span></p>
            </div>
          </motion.div>
        )}

        {activeTab === 'synthese' && (
          <motion.div key="synthese" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-[32px] p-10 backdrop-blur-xl shadow-2xl text-center">
              <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4">Valeur de Synthèse (Moyenne)</h3>
              <p className="text-6xl font-black text-white">{Math.round(avgValuation).toLocaleString()} <span className="text-2xl text-slate-400">FCFA</span></p>
              
              <div className="flex justify-center gap-8 mt-10">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ANR</p>
                  <p className="text-lg font-bold text-blue-400">{valAnr.toLocaleString()}</p>
                </div>
                <div className="w-px bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EBITDA x{ebitdaInputs.multiple}</p>
                  <p className="text-lg font-bold text-emerald-400">{valEbitda.toLocaleString()}</p>
                </div>
                <div className="w-px bg-white/10"></div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DCF</p>
                  <p className="text-lg font-bold text-primary">{valDcf ? Math.round(valDcf).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={`/valorisation/transmission/print?${new URLSearchParams({
                  ca: String(dcfInputs.ca),
                  croissance: String(dcfInputs.croissance),
                  actualisation: String(dcfInputs.actualisation),
                  annees: String(dcfInputs.annees),
                  dcfComputed: dcfResult ? "1" : "0",
                  ebitda: String(ebitdaInputs.ebitda),
                  multiple: String(ebitdaInputs.multiple),
                  actif: String(anrInputs.actif),
                  dettes: String(anrInputs.dettes),
                  ajustements: String(anrInputs.ajustements),
                }).toString()}`}
                target="_blank"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" /> Générer Rapport d'Évaluation
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
