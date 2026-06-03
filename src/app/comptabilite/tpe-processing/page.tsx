"use client";

import { useState, useEffect } from "react";
import { Check, X, Wand2, ArrowRight, CheckSquare, BrainCircuit, ScanLine, TrendingUp, RefreshCw } from "lucide-react";
import { AccountingEngine, AccountingBatch } from "@/lib/accounting-engine";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";

interface ProcessedEntry extends AccountingBatch {
  id: number;
  date: string;
  libelle: string;
  entree: number;
  sortie: number;
  client: string;
  clientId: string;
  isApproved: boolean;
  selected: boolean;
}

const DEMO_ENTRIES = [
  { id: 1, date: "2026-06-01", libelle: "Achat fournitures de bureau", entree: 0, sortie: 45000, client: "PMI Dakar SARL", clientId: "client_1" },
  { id: 2, date: "2026-06-02", libelle: "Recette vente logiciel", entree: 150000, sortie: 0, client: "Tech Startup CI", clientId: "client_2" },
  { id: 3, date: "2026-06-03", libelle: "Abonnement Sonatel Orange", entree: 0, sortie: 25000, client: "PMI Dakar SARL", clientId: "client_1" },
  { id: 4, date: "2026-06-03", libelle: "Réparation véhicule commercial", entree: 0, sortie: 75000, client: "Chez Marie Traiteur", clientId: "client_3" },
  { id: 5, date: "2026-06-04", libelle: "Vente prestation conseil", entree: 200000, sortie: 0, client: "Tech Startup CI", clientId: "client_2" },
];

const CLIENT_SCORES: Record<string, { score: number; rating: string }> = {
  client_1: { score: 72, rating: "AA" },
  client_2: { score: 88, rating: "AAA" },
  client_3: { score: 45, rating: "B" },
};

export default function TpeProcessing() {
  const [processedEntries, setProcessedEntries] = useState<ProcessedEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [scores, setScores] = useState(CLIENT_SCORES);
  const [updatingScore, setUpdatingScore] = useState<string | null>(null);

  useEffect(() => {
    const processEntries = async () => {
      setIsProcessing(true);
      const results: ProcessedEntry[] = [];
      for (const entry of DEMO_ENTRIES) {
        const suggestion = await AccountingEngine.processEntry(
          entry.libelle, entry.entree, entry.sortie, entry.clientId
        );
        results.push({ ...entry, ...suggestion, isApproved: false, selected: suggestion.confidence === 1.0 });
      }
      setProcessedEntries(results);
      setIsProcessing(false);
    };
    processEntries();
  }, []);

  const toggleSelect = (id: number) =>
    setProcessedEntries(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));

  const handleToggleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setProcessedEntries(prev => prev.map(e => ({ ...e, selected: next })));
  };

  /** Valide + recalcule le score de santé de chaque client concerné */
  const handleBatchApprove = async () => {
    const affected = processedEntries.filter(e => e.selected && !e.isApproved);
    setProcessedEntries(prev => prev.map(e => e.selected ? { ...e, isApproved: true, selected: false } : e));
    setSelectAll(false);

    // Recalcul du score pour chaque client unique touché
    const uniqueClientIds = [...new Set(affected.map(e => e.clientId))];
    for (const clientId of uniqueClientIds) {
      setUpdatingScore(clientId);
      // Simulation mise à jour du score (+3 à +8 pts pour la régularité)
      await new Promise(r => setTimeout(r, 800));
      setScores(prev => {
        const old = prev[clientId] ?? { score: 50, rating: "B" };
        const newScore = Math.min(100, old.score + Math.floor(Math.random() * 6) + 3);
        const rating = newScore >= 90 ? "AAA" : newScore >= 75 ? "AA" : newScore >= 60 ? "A" : newScore >= 40 ? "B" : "C";
        return { ...prev, [clientId]: { score: newScore, rating } };
      });
      setUpdatingScore(null);
    }
  };

  const handleExport = () => alert("Toutes les écritures validées ont été exportées vers le Grand Livre !");

  // Groupement des scores pour l'affichage
  const clientScoreEntries = Object.entries(scores);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
            Supervision IA des Journaux
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Validation par lot · Smart VAT · Score mis à jour automatiquement</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleBatchApprove} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl flex items-center gap-2 active:scale-95">
            <CheckSquare className="w-4 h-4" /> Valider la Sélection
          </button>
          <button onClick={handleExport} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2 active:scale-95">
            <Check className="w-4 h-4" /> Exporter en Compta
          </button>
        </div>
      </div>

      {/* Scores en temps réel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {clientScoreEntries.map(([clientId, data]) => (
          <div key={clientId} className="relative">
            {updatingScore === clientId && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-slate-900/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-bold">Mise à jour score…</p>
                </div>
              </div>
            )}
            <FinancialHealthGauge
              score={data.score}
              rating={data.rating}
              clientName={DEMO_ENTRIES.find(e => e.clientId === clientId)?.client}
            />
          </div>
        ))}
      </div>

      {/* Table de révision */}
      <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
        {isProcessing ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Wand2 className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
            <p className="text-white font-bold text-lg">Analyse LLM + Machine Learning en cours…</p>
            <p className="text-slate-500 text-sm">Consultation de la base d'apprentissage · Détection TVA</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50">
                  <th className="p-4">
                    <input type="checkbox" checked={selectAll} onChange={handleToggleSelectAll} className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
                  </th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Origine PMI</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Écritures OHADA (Smart VAT)</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Confiance IA</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                </tr>
              </thead>
              <tbody>
                {processedEntries.map((entry) => (
                  <tr key={entry.id} className={`border-b border-white/5 transition-all ${entry.isApproved ? 'bg-emerald-900/10' : entry.selected ? 'bg-indigo-900/10' : 'hover:bg-white/[0.02]'}`}>
                    <td className="p-4">
                      <input type="checkbox" checked={entry.selected} onChange={() => toggleSelect(entry.id)} disabled={entry.isApproved} className="rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer disabled:opacity-30" />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{entry.client}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <ScanLine className="w-3 h-3" /> {entry.libelle}
                      </p>
                      <div className="flex gap-3 mt-1">
                        {entry.entree > 0 && <span className="text-[10px] text-emerald-400 font-bold">+{entry.entree.toLocaleString()} F</span>}
                        {entry.sortie > 0 && <span className="text-[10px] text-rose-400 font-bold">-{entry.sortie.toLocaleString()} F</span>}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="space-y-1">
                        {entry.lignes.map((ligne, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] bg-slate-800/50 px-3 py-2 rounded-xl border border-white/5">
                            <span className="font-mono text-indigo-400 font-bold w-10 flex-shrink-0">{ligne.compte}</span>
                            <span className="text-slate-300 flex-1 truncate">{ligne.intitule}</span>
                            <div className="flex gap-3 font-mono text-right flex-shrink-0">
                              <span className={ligne.debit > 0 ? "text-white font-bold" : "text-slate-600"}>{ligne.debit > 0 ? ligne.debit.toLocaleString() : "—"}</span>
                              <span className={ligne.credit > 0 ? "text-white font-bold" : "text-slate-600"}>{ligne.credit > 0 ? ligne.credit.toLocaleString() : "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {entry.source === "ML_LEARNING" && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">✦ 100% ML</span>
                      )}
                      {entry.source === "LLM" && (
                        <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">🤖 90% LLM</span>
                      )}
                      {entry.source === "RULE" && (
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">⚡ 80% Règle</span>
                      )}
                    </td>
                    <td className="p-4">
                      {entry.isApproved ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Validé
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info recalcul score */}
      <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
        <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          <span className="text-indigo-400 font-bold">Score automatique :</span> À chaque validation par lot, le score de santé financière de chaque client est recalculé et mis à jour en temps réel. Les clients avec un score ≥ 60 (A, AA, AAA) sont éligibles à un dossier de crédit automatique.
        </p>
      </div>
    </div>
  );
}
