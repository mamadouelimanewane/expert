"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, AlertTriangle, ShieldCheck, Clock, FileText, ChevronRight, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MissionsBudgetPage() {
  const [data, setData] = useState<any>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);

  useEffect(() => {
    fetch("/api/missions/budget")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  const criticalMissions = data.missions.filter((m: any) => m.status === 'DÉPASSEMENT' || m.status === 'ATTENTION').slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-500" /> Pilotage Budgétaire des Missions
          </h2>
          <p className="page-subtitle">Suivi de la rentabilité et des temps passés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/40 border border-emerald-500/20 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Missions à budget sain</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{data.stats.sain}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-red-500/20 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Alertes dépassement</p>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{data.stats.alertes}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/40 border border-indigo-500/20 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Budget Total Engagé</p>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><PieChart className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{(data.stats.totalBudget / 1000000).toFixed(1)}M <span className="text-sm text-slate-400">FCFA</span></p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <h3 className="text-lg font-black text-white mb-6">Portefeuille de Missions</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse apix-table">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission & Client</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Heures (Consommé / Estimé)</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Budget (FCFA)</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Progression</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.missions.map((m: any) => {
                    const pct = Math.round((m.consumedHours / m.estimatedHours) * 100);
                    const isOver = pct > 100;
                    const isWarning = pct >= 80 && pct <= 100;
                    
                    return (
                      <tr 
                        key={m.id} 
                        onClick={() => setSelectedMission(m)}
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-4">
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.client}</p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-sm font-medium text-white">{m.consumedHours}h <span className="text-slate-500">/ {m.estimatedHours}h</span></p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-sm font-bold text-indigo-400">{m.budget.toLocaleString('fr-FR')} F</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden w-24">
                              <div 
                                className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500")} 
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              ></div>
                            </div>
                            <span className={cn("text-xs font-bold w-8 text-right", isOver ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400")}>{pct}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            m.status === 'SAIN' ? "bg-emerald-500/10 text-emerald-400" :
                            m.status === 'ATTENTION' ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          )}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Side Panel (Selected Mission) */}
          <AnimatePresence mode="wait">
            {selectedMission ? (
              <motion.div 
                key={selectedMission.id}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/40 border border-indigo-500/30 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setSelectedMission(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>
                
                <h3 className="text-xl font-black text-white pr-8">{selectedMission.name}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">{selectedMission.client}</p>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Heures Consommées</p>
                      <p className="text-lg font-bold text-white">{selectedMission.consumedHours}h <span className="text-xs text-slate-500">/ {selectedMission.estimatedHours}h</span></p>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all", selectedMission.consumedHours > selectedMission.estimatedHours ? "bg-red-500" : "bg-indigo-500")} 
                        style={{ width: `${Math.min((selectedMission.consumedHours / selectedMission.estimatedHours) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Répartition par catégorie (heures réellement saisies)</p>
                    {selectedMission.breakdown && Object.keys(selectedMission.breakdown).length > 0 ? (
                      Object.entries(selectedMission.breakdown).map(([category, hours]) => (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="text-slate-300">{category}</span>
                          <span className="text-white font-medium">{hours as number}h</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">Aucune saisie de temps encore enregistrée pour cette mission.</p>
                    )}
                  </div>
                  
                  {selectedMission.status === 'DÉPASSEMENT' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-xs text-red-400 font-medium">Cette mission a dépassé son budget horaire de {selectedMission.consumedHours - selectedMission.estimatedHours}h. Envisagez un avenant.</p>
                      <button className="w-full mt-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Générer Avenant
                      </button>
                    </div>
                  )}
                  
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="alertes"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl"
              >
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertes Budgétaires
                </h3>
                <div className="space-y-4">
                  {criticalMissions.map((m: any) => (
                    <div key={m.id} className="p-4 bg-slate-800/30 border border-white/5 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-white">{m.client}</p>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          m.status === 'ATTENTION' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                        )}>{m.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">{m.name}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-300">{m.consumedHours}h / {m.estimatedHours}h ({Math.round(m.consumedHours/m.estimatedHours*100)}%)</span>
                      </div>
                    </div>
                  ))}
                  
                  {criticalMissions.length === 0 && (
                    <div className="text-center text-slate-500 text-sm p-4">
                      Aucune alerte pour le moment.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
