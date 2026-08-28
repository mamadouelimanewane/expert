"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, BarChart2, Users, Building, ChevronRight, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ControllingPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'dept' | 'collab' | 'proj'>('general');

  useEffect(() => {
    fetch("/api/management/controlling")
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <LineChart className="w-6 h-6 text-emerald-500" /> Contrôle de Gestion Cabinet
          </h2>
          <p className="page-subtitle">Analyse des performances et rentabilité interne</p>
        </div>
      </div>

      <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit backdrop-blur-xl flex-wrap">
        <button onClick={() => setActiveTab('general')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'general' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>Vue Générale</button>
        <button onClick={() => setActiveTab('dept')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'dept' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>Par Pôle</button>
        <button onClick={() => setActiveTab('collab')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'collab' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>Par Collaborateur</button>
        <button onClick={() => setActiveTab('proj')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'proj' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}>CA Mensuel</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-lg font-black text-white mb-6">Chiffre d'Affaires (Année en cours)</h3>

              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CA Facturé (YTD)</p>
                <p className="text-4xl font-black text-white">{(data.general.caRealise / 1000000).toFixed(1)}M <span className="text-lg text-slate-400">FCFA</span></p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  Le suivi des charges du cabinet (fixes/variables), de l'objectif annuel et de la marge nette n'est pas encore disponible — aucun module de comptabilité interne du cabinet n'existe dans l'application. Seul le chiffre d'affaires facturé (réel) est affiché.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dept' && (
          <motion.div key="dept" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.departments.map((dept: any) => (
              <div key={dept.id} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-colors"></div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                  <Building className="w-5 h-5 text-indigo-400" /> {dept.name}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-sm font-medium text-slate-400">Valeur du portefeuille de missions</span>
                    <span className="text-lg font-bold text-white">{(dept.valeur / 1000000).toFixed(1)}M F</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-sm font-medium text-slate-400">Nombre de missions</span>
                    <span className="text-lg font-bold text-slate-300">{dept.missionsCount}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.departments.length === 0 && (
              <p className="text-sm text-slate-500 col-span-2">Aucune mission enregistrée.</p>
            )}
          </motion.div>
        )}

        {activeTab === 'collab' && (
          <motion.div key="collab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Rentabilité par Collaborateur</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Collaborateur</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Valeur Missions Assignées</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Heures Saisies</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Occupation (base 160h/mois)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.collaborators.map((collab: any) => (
                    <tr key={collab.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{collab.initials}</div>
                        <span className="text-sm font-bold text-white">{collab.name}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm font-bold text-indigo-400">{(collab.valeur / 1000000).toFixed(1)}M F</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm text-slate-300">{collab.hours}h</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full", collab.occupation > 80 ? "bg-emerald-500" : collab.occupation > 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${collab.occupation}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{collab.occupation}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.collaborators.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-sm text-slate-500">Aucun collaborateur actif.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'proj' && (
          <motion.div key="proj" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Chiffre d'Affaires Mensuel (Réel)
            </h3>

            <div className="h-64 mt-8 flex items-end gap-2 border-b border-white/5 pb-4 relative">
              {data.monthly.map((p: any, i: number) => {
                const maxVal = Math.max(...data.monthly.map((m: any) => m.reel || 0), 1);
                const h = p.reel ? `${(p.reel / maxVal) * 100}%` : "0%";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {p.reel !== null && (
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                        {p.mois}: {(p.reel / 1000000).toFixed(1)}M
                      </div>
                    )}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full rounded-t-sm transition-all bg-indigo-500/80 hover:bg-indigo-400"
                    ></motion.div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4">
              {data.monthly.map((p: any, i: number) => (
                <div key={i} className={cn("text-[9px] font-black uppercase tracking-widest flex-1 text-center", p.reel !== null ? "text-slate-400" : "text-slate-600")}>
                  {p.mois}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-6">Les projections de fin d'année nécessitent un moteur de prévision — non disponible pour l'instant. Seul le CA réellement facturé par mois est affiché.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
