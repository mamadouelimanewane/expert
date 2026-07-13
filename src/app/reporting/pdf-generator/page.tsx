"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_TEMPLATES } from "@/components/reporting/ReportTemplates";

const RECENT_REPORTS = [
  { id: 1, name: "Rapport d'Audit - Senelec 2025.pdf", date: "05 Juil 2026", size: "2.4 MB" },
  { id: 2, name: "Liasse Fiscale - Orange SN.pdf", date: "02 Juil 2026", size: "1.1 MB" },
  { id: 3, name: "Rapport de Mission - BOA.pdf", date: "28 Juin 2026", size: "3.5 MB" },
  { id: 4, name: "Bilan Annuel - Eiffage.pdf", date: "15 Juin 2026", size: "1.8 MB" },
  { id: 5, name: "Audit Légal - Sonatel.pdf", date: "10 Juin 2026", size: "4.2 MB" },
];

export default function PdfGeneratorPage() {
  const [selectedType, setSelectedType] = useState(REPORT_TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const activeTemplate = REPORT_TEMPLATES.find(t => t.id === selectedType) || REPORT_TEMPLATES[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Générateur PDF Automatisé</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Créez des rapports professionnels aux normes OHADA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Configuration</h3>
            
            <div className="space-y-5">
              {/* Type Select */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Type de Rapport</label>
                <div className="relative">
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    {REPORT_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Client Select */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Client</label>
                <div className="relative">
                  <select className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option>Senelec SA</option>
                    <option>Sonatel</option>
                    <option>Orange SN</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Période */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Période</label>
                <input type="text" defaultValue="Exercice clos le 31/12/2025" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>

              {/* Sections */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Sections à inclure</label>
                <div className="space-y-2">
                  {activeTemplate.sections.map(section => (
                    <label key={section.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" defaultChecked={section.defaultChecked} className="w-4 h-4 rounded border-white/10 text-indigo-600 focus:ring-indigo-500 bg-slate-950" />
                      <span className="text-sm text-slate-300">{section.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isGenerating ? "Génération en cours..." : "Générer le PDF"}
              </button>

              {generated && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Rapport généré avec succès</span>
                  </div>
                  <button className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Panel: Preview & History */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white">Aperçu du Document</h3>
              <div className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400">Page 1 / 14</div>
            </div>
            
            <div className="flex-1 bg-white rounded-xl p-8 overflow-hidden relative shadow-inner">
              <div className="absolute top-8 left-8 right-8 bottom-8 border border-slate-200">
                {/* Header Letterhead */}
                <div className="border-b border-slate-200 p-6 flex justify-between items-start">
                  <div className="w-32 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold">LOGO CABINET</div>
                  <div className="text-right">
                    <p className="text-slate-800 font-bold text-sm">GANTIC360 EXPERT</p>
                    <p className="text-slate-500 text-xs mt-1">123 Rue des Auditeurs, Dakar</p>
                  </div>
                </div>
                
                {/* Body Preview */}
                <div className="p-12 text-center mt-12">
                  <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{activeTemplate.name}</h1>
                  <div className="w-16 h-1 bg-indigo-600 mx-auto mt-6 mb-8"></div>
                  <p className="text-slate-600 text-lg">SENELEC SA</p>
                  <p className="text-slate-500 text-sm mt-2">Exercice clos le 31/12/2025</p>
                  
                  <div className="mt-20 space-y-3 text-left max-w-md mx-auto">
                    {activeTemplate.sections.map((sec, i) => (
                      <div key={sec.id} className="h-4 bg-slate-100 rounded w-full flex items-center px-2">
                        <span className="text-[8px] text-slate-300 font-bold uppercase">{sec.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6">Rapports Récents</h3>
            <div className="space-y-3">
              {RECENT_REPORTS.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{report.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
