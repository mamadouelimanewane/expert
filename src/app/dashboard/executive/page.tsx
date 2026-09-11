"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Briefcase, FileText, CheckCircle2, AlertTriangle, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/executive")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  if (!data) return <div className="text-white p-8">Chargement...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title">Dashboard Dirigeant</h2>
          <p className="page-subtitle">Vue stratégique en temps réel de votre cabinet</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taux de Recouvrement</p>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{data.kpis.recouvrement}%</p>
          <p className="text-xs text-slate-400 mt-1">Factures payées / échues ou envoyées</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CA du Mois</p>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{(data.kpis.caMois / 1000000).toFixed(1)}M <span className="text-sm text-slate-400">FCFA</span></p>
          <p className={cn("text-xs mt-1", data.kpis.croissance >= 0 ? "text-emerald-400" : "text-red-400")}>{data.kpis.croissance >= 0 ? "+" : ""}{data.kpis.croissance}% vs mois dernier</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Missions Actives</p>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Briefcase className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white">{data.kpis.missionsActives}</p>
          <p className="text-xs text-slate-400 mt-1">Sur {data.kpis.totalClients} client{data.kpis.totalClients > 1 ? "s" : ""}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900/40 border border-red-500/20 rounded-[32px] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-[10px] font-black text-red-400/80 uppercase tracking-widest">Alertes Urgentes</p>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{data.kpis.alertes}</p>
          <p className="text-xs text-red-400 mt-1 relative z-10">Nécessitent action immédiate</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes Urgentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1 bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Actions Requises
            </h3>
          </div>
          <div className="space-y-4 flex-1">
            {data.alertes.map((alerte: any, i: number) => (
              <div key={alerte.id} className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl flex items-start gap-3">
                <div className={cn("mt-1 p-1.5 rounded-lg", 
                  alerte.type === 'urgent' ? "bg-amber-500/10 text-amber-500" : 
                  alerte.type === 'critical' ? "bg-red-500/10 text-red-500" : 
                  "bg-blue-500/10 text-blue-500"
                )}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-slate-200">{alerte.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline Missions & Rentabilité */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Pipeline Missions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-white/5 text-center">
                <p className="text-2xl font-black text-slate-300">{data.pipeline.prospects}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Prospects</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center">
                <p className="text-2xl font-black text-primary">{data.pipeline.enCours}</p>
                <p className="text-[10px] font-bold text-primary/70 uppercase mt-1">En Cours</p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
                <p className="text-2xl font-black text-amber-400">{data.pipeline.revision}</p>
                <p className="text-[10px] font-bold text-amber-400/70 uppercase mt-1">Révision</p>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                <p className="text-2xl font-black text-emerald-400">{data.pipeline.cloture}</p>
                <p className="text-[10px] font-bold text-emerald-400/70 uppercase mt-1">Clôturés</p>
              </div>
            </div>
          </motion.div>

          {/* Rentabilité Collaborateurs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Rentabilité Collaborateurs
            </h3>
            <div className="overflow-x-auto">
              <table className="apix-table w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Collaborateur</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Heures</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Taux Facturable</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">CA Généré</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.collaborateurs.map((collab: any) => (
                    <tr key={collab.id}>
                      <td className="py-4 text-sm font-medium text-white">{collab.name}</td>
                      <td className="py-4 text-sm text-slate-400 text-right">{collab.hours}h</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${collab.billable}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-emerald-400">{collab.billable}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-bold text-primary text-right">
                        {(collab.ca / 1000000).toFixed(1)}M FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
