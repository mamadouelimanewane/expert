"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, PieChart, AlertTriangle, ArrowRight, Building, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { simulateCorporateTax, TaxSimulation } from "@/lib/tax-simulator";

const COUNTRIES = [
  { id: "sn", name: "Sénégal", flag: "🇸🇳", taxRate: "30%" },
  { id: "ci", name: "Côte d'Ivoire", flag: "🇨🇮", taxRate: "25%" },
  { id: "cm", name: "Cameroun", flag: "🇨🇲", taxRate: "33%" },
  { id: "bj", name: "Bénin", flag: "🇧🇯", taxRate: "30%" }
];

export default function TaxSimulatorPage() {
  const [params, setParams] = useState<TaxSimulation>({
    baseImposable: 10000000,
    pays: 'sn',
    regime: 'reel',
    secteur: 'services'
  });

  const [result, setResult] = useState<any>(null);

  const handleSimulate = () => {
    setResult(simulateCorporateTax(params));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Calculator className="w-6 h-6 text-indigo-500" /> Simulateur Fiscal OHADA
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Estimation des charges fiscales par pays (IS, TVA, Taxes Diverses)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Paramètres de Simulation</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pays d'Implantation</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {COUNTRIES.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setParams({...params, pays: c.id as any})}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between transition-all",
                        params.pays === c.id ? "bg-indigo-500/20 border-indigo-500/50" : "bg-slate-950/50 border-white/5 hover:border-white/20"
                      )}
                    >
                      <span className="text-sm font-bold text-white flex items-center gap-2"><span className="text-lg">{c.flag}</span> {c.name}</span>
                      <span className="text-[10px] font-black text-indigo-400">{c.taxRate}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Imposable (Résultat Fiscal FCFA)</label>
                <input 
                  type="number" 
                  value={params.baseImposable} 
                  onChange={e => setParams({...params, baseImposable: Number(e.target.value)})}
                  className="mt-2 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Régime Fiscal</label>
                  <select 
                    value={params.regime}
                    onChange={e => setParams({...params, regime: e.target.value as any})}
                    className="mt-2 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="reel">Réel Normal</option>
                    <option value="simplifie">Réel Simplifié</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secteur</label>
                  <select 
                    value={params.secteur}
                    onChange={e => setParams({...params, secteur: e.target.value as any})}
                    className="mt-2 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="services">Prestation de Services</option>
                    <option value="commerce">Commerce Général</option>
                    <option value="industrie">Industrie</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSimulate}
                className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Lancer la Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <PieChart className="w-6 h-6 text-emerald-400" /> Synthèse d'Imposition
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Estimation basée sur la législation en vigueur</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    {COUNTRIES.find(c => c.id === params.pays)?.flag} {COUNTRIES.find(c => c.id === params.pays)?.name}
                  </span>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Impôt sur les Sociétés (IS) Estimé</p>
                    <p className="text-5xl font-black text-emerald-400">{Math.round(result.is).toLocaleString()} <span className="text-lg text-slate-400">FCFA</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TVA Collectée (Est.)</p>
                      <p className="text-xl font-bold text-white">{Math.round(result.tvaMoyenne).toLocaleString()} F</p>
                    </div>
                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Taxes Diverses (CFCE...)</p>
                      <p className="text-xl font-bold text-white">{Math.round(result.cfce).toLocaleString()} F</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 mt-auto">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-400 leading-relaxed">
                      Cette simulation est fournie à titre indicatif et ne remplace pas l'avis de votre expert-comptable. Les taux peuvent varier selon les exonérations spécifiques (Code des Investissements).
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-full flex flex-col items-center justify-center text-center text-slate-500">
                <Calculator className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-lg font-black text-white mb-2">Aucune simulation active</h3>
                <p className="text-sm">Renseignez les paramètres à gauche pour estimer la charge fiscale.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
