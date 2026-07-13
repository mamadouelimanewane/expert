"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CONNECTORS = [
  { id: "wave", name: "Wave Accounting", color: "emerald", desc: "Logiciel cloud TPE", badge: "Populaire" },
  { id: "sage", name: "Sage 100", color: "blue", desc: "Fichier d'écritures .PNM / .TXT", badge: "Standard" },
  { id: "quickbooks", name: "QuickBooks", color: "green", desc: "Export FEC comptable", badge: "Nouveau" },
  { id: "csv", name: "CSV Générique", color: "slate", desc: "Format universel paramétrable", badge: "" }
];

export default function ConnectorsPage() {
  const [activeConnector, setActiveConnector] = useState(CONNECTORS[0].id);
  const [isUploading, setIsUploading] = useState(false);
  const [fileImported, setFileImported] = useState(false);
  
  const activeConnData = CONNECTORS.find(c => c.id === activeConnector);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setFileImported(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Link2 className="w-6 h-6 text-indigo-500" /> Connecteurs & Imports
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Ingestion automatisée des données comptables clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Connectors List */}
        <div className="lg:col-span-4 space-y-4">
          {CONNECTORS.map((conn) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={conn.id}
              onClick={() => {
                setActiveConnector(conn.id);
                setFileImported(false);
              }}
              className={cn(
                "p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden group",
                activeConnector === conn.id 
                  ? "bg-slate-900/80 border-indigo-500/50 shadow-xl shadow-indigo-500/10" 
                  : "bg-slate-900/40 border-white/5 hover:bg-slate-900/60"
              )}
            >
              {activeConnector === conn.id && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl",
                  `bg-${conn.color}-500/20 text-${conn.color}-400`
                )}>
                  {conn.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={cn("text-lg font-black", activeConnector === conn.id ? "text-white" : "text-slate-200")}>{conn.name}</h3>
                    {conn.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-400">
                        {conn.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{conn.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Import Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeConnector}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-full min-h-[500px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    Importer depuis {activeConnData?.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Mappage automatique vers le plan comptable SYSCOHADA</p>
                </div>
                <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {!fileImported ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div 
                    className="w-full max-w-lg border-2 border-dashed border-indigo-500/30 rounded-[32px] bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors flex flex-col items-center justify-center p-12 cursor-pointer group"
                    onClick={handleUpload}
                  >
                    <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {isUploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <UploadCloud className="w-10 h-10" />}
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">
                      {isUploading ? "Analyse en cours..." : "Glissez votre fichier d'export ici"}
                    </h4>
                    <p className="text-slate-400 text-sm text-center">
                      Ou cliquez pour parcourir (Formats acceptés : .CSV, .TXT, .PNM)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">Fichier analysé avec succès</h4>
                      <p className="text-xs text-emerald-400/80">342 écritures détectées. 100% mappé automatiquement.</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto bg-slate-950/50 rounded-2xl border border-white/5 mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><ArrowRight className="w-4 h-4 mx-auto" /></th>
                          <th className="px-4 py-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compte OHADA</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {[
                          { d: "12/06", s: "Sales Revenue", o: "7011 - Ventes march.", a: "450 000" },
                          { d: "13/06", s: "Office Supplies", o: "6054 - Fournitures bureau", a: "-25 000" },
                          { d: "14/06", s: "Consulting Fee", o: "6224 - Honoraires", a: "-150 000" },
                          { d: "15/06", s: "Payment Received", o: "4111 - Clients", a: "450 000" },
                          { d: "16/06", s: "Bank Fees", o: "6311 - Frais bancaires", a: "-5 500" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-slate-400">{row.d}</td>
                            <td className="px-4 py-3 text-slate-300">{row.s}</td>
                            <td className="px-4 py-3 text-center text-slate-600">→</td>
                            <td className="px-4 py-3 font-mono text-indigo-400">{row.o}</td>
                            <td className={cn("px-4 py-3 text-right font-medium", row.a.startsWith('-') ? "text-red-400" : "text-emerald-400")}>{row.a}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-4 mt-auto">
                    <button onClick={() => setFileImported(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                      Annuler
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" /> Valider & Intégrer au Grand Livre
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
