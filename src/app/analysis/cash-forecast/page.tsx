"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Activity, Calendar, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page présentait une trésorerie de départ fixe et huit échéances
// entièrement inventées (dont des paiements nommant Sonatel et Eiffage), plus
// trois « recommandations » statiques répétées à chaque ouverture, sans
// rapport avec les données du cabinet. La trésorerie de départ et les
// échéances proviennent désormais de /api/analysis/cash-forecast, calculées
// à partir des transactions bancaires et des factures réellement enregistrées
// (voir ce fichier route.ts pour le détail). Les scénarios optimiste/
// réaliste/pessimiste restent un modèle de projection simplifié à hypothèses
// fixes — un point de départ réel plutôt qu'une prédiction certaine — et
// aucune charge récurrente (loyer, salaires, TVA) n'étant suivie par
// l'application, ce n'est pas simulé.
// ─────────────────────────────────────────────────────────────────────────────

export default function CashForecastPage() {
  const [data, setData] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<'optimiste' | 'realiste' | 'pessimiste'>('realiste');

  useEffect(() => {
    fetch("/api/analysis/cash-forecast")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  const currentScenarioData = data.scenarios[activeScenario];
  const maxValue = Math.max(...currentScenarioData.map((d: any) => d.cash), data.baseCash * 1.5);
  const minValue = Math.min(...currentScenarioData.map((d: any) => d.cash), 0);
  const range = maxValue - minValue;

  const getBarHeight = (value: number) => {
    const normalizedValue = Math.max(0, value - minValue);
    return `${(normalizedValue / range) * 100}%`;
  };

  const isCritical = data.criticals.criticalDate && activeScenario === 'pessimiste';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-500" /> Prévision de Trésorerie (J+90)
          </h2>
          <p className="page-subtitle">Solde bancaire réel et factures clients à échoir, projetés sur trois scénarios simplifiés.</p>
        </div>
      </div>

      {isCritical && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-400 font-black">Risque de rupture de trésorerie détecté</h4>
            <p className="text-red-400/80 text-sm">Le scénario pessimiste prévoit un solde négatif le {data.criticals.criticalDate}. Veuillez consulter les recommandations.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trésorerie Actuelle</p>
                <div className="flex items-end gap-4">
                  <p className="text-4xl font-black text-white">{(data.baseCash / 1000000).toFixed(1)}M <span className="text-lg text-slate-400">FCFA</span></p>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full mb-1">Sain</span>
                </div>
              </div>

              <div className="flex bg-muted rounded-xl p-1 border border-border">
                <button 
                  onClick={() => setActiveScenario('optimiste')}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all", activeScenario === 'optimiste' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")}
                >
                  Optimiste
                </button>
                <button 
                  onClick={() => setActiveScenario('realiste')}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all", activeScenario === 'realiste' ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300")}
                >
                  Réaliste
                </button>
                <button 
                  onClick={() => setActiveScenario('pessimiste')}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all", activeScenario === 'pessimiste' ? "bg-red-500/20 text-red-400" : "text-slate-500 hover:text-slate-300")}
                >
                  Pessimiste
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 mt-8 flex items-end gap-2 border-b border-white/5 pb-4 relative">
              {/* Y-axis labels */}
              <div className="absolute -left-2 top-0 bottom-4 w-12 flex flex-col justify-between text-[10px] text-slate-500 text-right pr-2">
                <span>{(maxValue / 1000000).toFixed(1)}M</span>
                <span>{((maxValue + minValue) / 2000000).toFixed(1)}M</span>
                <span>{(minValue / 1000000).toFixed(1)}M</span>
              </div>
              
              <div className="flex-1 flex items-end gap-2 ml-10 h-full relative">
                {currentScenarioData.map((pt: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                      {pt.date} : {(pt.cash / 1000000).toFixed(2)}M
                    </div>
                    {/* Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(pt.cash) }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={cn(
                        "w-full rounded-t-sm transition-all",
                        pt.cash < 0 ? "bg-red-500/50" : 
                        activeScenario === 'optimiste' ? "bg-emerald-500/50 group-hover:bg-emerald-400" :
                        activeScenario === 'realiste' ? "bg-primary/50 group-hover:brightness-110" :
                        "bg-amber-500/50 group-hover:bg-amber-400"
                      )}
                    ></motion.div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between ml-10 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>Aujourd'hui</span>
              <span>J+30</span>
              <span>J+60</span>
              <span>J+90</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Encaissements Attendus</h3>
            <p className="text-xs text-slate-500 mb-6">
              Factures clients à échoir dans les 90 jours. Les charges récurrentes (loyer, salaires, TVA) ne sont pas
              suivies par l&apos;application et n&apos;apparaissent donc pas ici.
            </p>
            {data.events.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Aucune facture à échoir dans les 90 prochains jours.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="apix-table text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Libellé</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Encaissement</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Solde Cumulé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.events.map((ev: any) => (
                      <tr key={ev.id}>
                        <td className="py-4 text-sm text-slate-400">{ev.date}</td>
                        <td className="py-4 text-sm font-medium text-white">{ev.libelle}</td>
                        <td className="py-4 text-sm font-bold text-emerald-400 text-right">+{(ev.encaissement).toLocaleString()} F</td>
                        <td className="py-4 text-sm font-bold text-primary text-right">{(ev.solde).toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-primary" /> Analyse
            </h3>

            <div className="space-y-6 mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Point le plus bas prévu (scénario pessimiste)</p>
                <p className={cn("text-2xl font-black", data.criticals.minCash < 0 ? "text-red-400" : "text-white")}>
                  {(data.criticals.minCash / 1000000).toFixed(1)}M FCFA
                </p>
              </div>

              {data.criticals.criticalDate && (
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date critique potentielle</p>
                  <p className="text-lg font-medium text-red-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {data.criticals.criticalDate}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Recommandations
              </h4>
              {data.creancesEnRetard > 0 ? (
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Relancer créances clients</p>
                      <p className="text-xs text-slate-400">
                        {(data.creancesEnRetard / 1_000_000).toFixed(1)}M FCFA de factures en retard peuvent être recouvrés pour consolider la trésorerie.
                      </p>
                    </div>
                  </li>
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Aucune facture en retard actuellement.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
