"use client";

import { useState } from "react";
import { Upload, Plus, FileSpreadsheet, Save, ScanLine, TrendingUp, Smartphone } from "lucide-react";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { MobileMoneySync } from "@/components/portal/MobileMoneySync";

// Score de démo — en production, récupéré depuis l'API /api/clients/[id]/health-score
const DEMO_SCORE = { score: 72, rating: "AA" };

export default function SaisieSimplifiee() {
  const [activeTab, setActiveTab] = useState<"form" | "upload" | "ocr">("form");
  const [isUploading, setIsUploading] = useState(false);
  const [entries, setEntries] = useState([
    { date: "", libelle: "", entree: "", sortie: "" }
  ]);
  const [showMobileSync, setShowMobileSync] = useState(false);

  const handleAddRow = () => {
    setEntries([...entries, { date: "", libelle: "", entree: "", sortie: "" }]);
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
  };

  const handleSubmitForm = async () => {
    alert("Données envoyées au cabinet avec succès ! Votre score sera mis à jour sous 24h.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Fichier traité ! Les écritures sont en cours d'analyse par notre IA.");
    }, 1500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Hero avec Score */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center space-y-3">
          <div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Portail Client — Cabinet 360</p>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Votre Cahier<br />de Caisse Digital</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Transmettez vos dépenses et recettes simplement. Pas de numéros de compte, pas de jargon comptable. Notre IA s'occupe du reste.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs font-bold">
              <ScanLine className="w-3.5 h-3.5" /> OCR automatique
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Score mis à jour en temps réel
            </div>
            <button
              onClick={() => setShowMobileSync(!showMobileSync)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-purple-300 text-xs font-bold transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" /> Sync Mobile Money
            </button>
          </div>
        </div>

        {/* Score de Santé Financière */}
        <div>
          <FinancialHealthGauge
            score={DEMO_SCORE.score}
            rating={DEMO_SCORE.rating}
            clientName="PMI Dakar SARL"
          />
        </div>
      </div>

      {/* Mobile Money Sync (Option) */}
      {showMobileSync && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <MobileMoneySync clientId="demo_client" />
        </div>
      )}

      {/* Tabs Saisie */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
        {[
          { id: "form", label: "Saisie Rapide", icon: Plus },
          { id: "upload", label: "Import Excel", icon: FileSpreadsheet },
          { id: "ocr", label: "Scan / Photo (OCR)", icon: ScanLine },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      {activeTab === "form" && (
        <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Libellé (Description)</th>
                  <th className="p-4 text-xs font-black text-emerald-400 uppercase tracking-widest">Entrée (Recette)</th>
                  <th className="p-4 text-xs font-black text-rose-400 uppercase tracking-widest">Sortie (Dépense)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-2">
                      <input type="date" value={entry.date} onChange={(e) => handleUpdateRow(idx, "date", e.target.value)} className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="text" placeholder="Ex: Achat fournitures..." value={entry.libelle} onChange={(e) => handleUpdateRow(idx, "libelle", e.target.value)} className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="0" value={entry.entree} onChange={(e) => handleUpdateRow(idx, "entree", e.target.value)} className="w-full bg-emerald-900/20 border-none rounded-lg p-3 text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="0" value={entry.sortie} onChange={(e) => handleUpdateRow(idx, "sortie", e.target.value)} className="w-full bg-rose-900/20 border-none rounded-lg p-3 text-rose-400 focus:ring-2 focus:ring-rose-500 outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={handleAddRow} className="px-4 py-2 text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
            <button onClick={handleSubmitForm} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95">
              <Save className="w-4 h-4" /> Envoyer au Cabinet
            </button>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="glass-card rounded-[32px] p-12 border border-white/5 bg-slate-900/40 text-center">
          <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Importez votre fichier Excel ou CSV</h3>
          <p className="text-slate-400 mb-2 max-w-md mx-auto text-sm">Colonnes requises : <code className="text-indigo-400">Date, Libellé, Entrée, Sortie</code></p>
          <p className="text-slate-500 mb-8 text-xs max-w-sm mx-auto">Votre fichier de trésorerie habituel suffit. Notre IA transforme tout en écritures OHADA.</p>
          <div className="relative inline-block">
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button className={`px-10 py-4 ${isUploading ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl`}>
              {isUploading ? "Analyse IA en cours..." : "Sélectionner un fichier"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "ocr" && (
        <div className="glass-card rounded-[32px] p-12 border border-dashed border-indigo-500/30 bg-slate-900/40 text-center hover:border-indigo-500/60 transition-colors">
          <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-indigo-500/10">
            <ScanLine className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Photographiez vos reçus et factures</h3>
          <p className="text-slate-400 mb-2 max-w-md mx-auto text-sm">L'IA de Cabinet 360 extrait automatiquement : fournisseur, date, montant HT/TVA/TTC.</p>
          <p className="text-slate-500 mb-8 text-xs">Formats acceptés : JPG, PNG, PDF</p>
          <div className="relative inline-block">
            <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button className={`px-10 py-4 ${isUploading ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-600/20`}>
              {isUploading ? "Extraction OCR en cours..." : "Prendre une photo / Parcourir"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
