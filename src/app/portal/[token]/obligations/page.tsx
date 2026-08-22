"use client";

import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

import DonneesDemo from "@/components/layout/DonneesDemo";
const OBLIGATIONS = [
  { id: 1, type: "TVA - Mois 06/2026", date: "15 Juillet 2026", amount: "12 500 000 FCFA", status: "URGENT", days: 2 },
  { id: 2, type: "BRS - Mois 06/2026", date: "15 Juillet 2026", amount: "4 200 000 FCFA", status: "PROCHE", days: 2 },
  { id: 3, type: "VRS - Mois 06/2026", date: "15 Juillet 2026", amount: "À déterminer", status: "EN PRÉPARATION", days: 2 },
  { id: 4, type: "Acompte IS", date: "31 Juillet 2026", amount: "8 500 000 FCFA", status: "À VENIR", days: 18 },
  { id: 5, type: "TVA - Mois 05/2026", date: "15 Juin 2026", amount: "11 200 000 FCFA", status: "RÉGLÉ", days: -30 }
];

export default function ClientPortalObligationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6 max-w-5xl mx-auto">
            <DonneesDemo />

      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-500" /> Calendrier des Obligations
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Vos échéances fiscales et sociales à venir</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-sm">
          Contacter l'Expert
        </button>
      </div>

      <div className="space-y-4">
        {OBLIGATIONS.map((ob, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={ob.id} 
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                ob.status === 'URGENT' ? "bg-red-50 border-red-200 text-red-500" :
                ob.status === 'PROCHE' ? "bg-amber-50 border-amber-200 text-amber-500" :
                ob.status === 'RÉGLÉ' ? "bg-emerald-50 border-emerald-200 text-emerald-500" :
                "bg-slate-50 border-slate-200 text-slate-400"
              )}>
                {ob.status === 'RÉGLÉ' ? <CheckCircle2 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-800">{ob.type}</h3>
                <p className="text-sm text-slate-500 mt-1">Échéance : <strong className="text-slate-700">{ob.date}</strong></p>
                {ob.status === 'RÉGLÉ' ? (
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Déclaré et payé
                  </p>
                ) : (
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1",
                    ob.status === 'URGENT' ? "text-red-500" :
                    ob.status === 'PROCHE' ? "text-amber-500" : "text-indigo-500"
                  )}>
                    {ob.status === 'URGENT' && <AlertCircle className="w-3 h-3" />}
                    {ob.status} {ob.days > 0 && `(J-${ob.days})`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 sm:border-l sm:border-slate-100 sm:pl-6">
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Estimé</p>
                <p className="text-xl font-black text-slate-800">{ob.amount}</p>
              </div>
              
              {ob.status !== 'RÉGLÉ' && (
                <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              {ob.status === 'RÉGLÉ' && (
                <button className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
