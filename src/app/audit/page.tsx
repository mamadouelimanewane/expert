"use client";

import { useState } from "react";
import {
  ShieldAlert, Search, FileSearch, AlertTriangle, CheckCircle2,
  TrendingUp, BarChart3, Loader2, Download, ArrowRight, Zap,
  Scale, Activity, Eye, X, ChevronRight, Sparkles, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// DONNÉES MOCK AUDIT
// ============================================
const DOSSIERS = [
  { id: "d1", name: "Société Alpha SARL", score: 85, anomalies: 4, statut: "EN_COURS", risque: "MODERE" },
  { id: "d2", name: "Pharmacie Dior", score: 96, anomalies: 0, statut: "CERTIFIE", risque: "FAIBLE" },
  { id: "d3", name: "Tech Solutions CI", score: 61, anomalies: 11, statut: "ALERTE", risque: "ELEVE" },
  { id: "d4", name: "Transport Ibra", score: 44, anomalies: 7, statut: "ALERTE", risque: "ELEVE" },
];

const ANOMALIES: Record<string, any[]> = {
  d1: [
    { id: "AN-001", type: "Doublon Suspect", description: "Deux écritures identiques sur compte 605100 à 2 jours d'intervalle.", compte: "605100 — Transport", montant: "45 000 FCFA", date: "12/05/2026", niveau: "CRITIQUE", confidence: 98 },
    { id: "AN-002", type: "TVA Incohérente", description: "Taux TVA appliqué (12%) ≠ taux légal SN (18%) sur ce type de prestation.", compte: "445200 — TVA Récupérable", montant: "1 200 000 FCFA", date: "18/05/2026", niveau: "MOYEN", confidence: 85 },
    { id: "AN-003", type: "Saisie hors horaires", description: "Écriture de caisse enregistrée un dimanche à 02h14.", compte: "571100 — Caisse", montant: "150 000 FCFA", date: "19/05/2026", niveau: "FAIBLE", confidence: 60 },
    { id: "AN-004", type: "Loi de Benford", description: "Distribution des premiers chiffres anormale sur compte 625100.", compte: "625100 — Frais Mission", montant: "N/A", date: "Exercice 2026", niveau: "MOYEN", confidence: 72 },
  ],
  d2: [],
  d3: [
    { id: "AN-010", type: "Chèque sans provision", description: "3 chèques retournés non provisionnés dans les 30 jours.", compte: "512000 — Banque", montant: "4 500 000 FCFA", date: "02/06/2026", niveau: "CRITIQUE", confidence: 99 },
    { id: "AN-011", type: "Charge fictive présumée", description: "Facture fournisseur introuvable en base RCCM / NINEA.", compte: "601000 — Achats", montant: "2 200 000 FCFA", date: "25/05/2026", niveau: "CRITIQUE", confidence: 91 },
  ],
  d4: [
    { id: "AN-020", type: "Retards de paiement IPRES", description: "Cotisations sociales non virées depuis 3 mois.", compte: "431000 — IPRES", montant: "840 000 FCFA", date: "Multiple", niveau: "CRITIQUE", confidence: 100 },
  ],
};

const NIVEAU_STYLE: Record<string, string> = {
  CRITIQUE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  MOYEN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FAIBLE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};
const RISQUE_STYLE: Record<string, string> = {
  FAIBLE: "text-emerald-400",
  MODERE: "text-amber-400",
  ELEVE: "text-rose-400",
};

export default function AuditIA() {
  const [selected, setSelected] = useState(DOSSIERS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [anomalies, setAnomalies] = useState(ANOMALIES["d1"]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [corrected, setCorrected] = useState<string[]>([]);

  const handleSelect = (d: any) => {
    setSelected(d);
    setAnomalies(ANOMALIES[d.id] || []);
    setScanDone(false);
    setDismissed([]);
    setCorrected([]);
  };

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsScanning(false);
    setScanDone(true);
  };

  const activeAnomalies = anomalies.filter(a => !dismissed.includes(a.id) && !corrected.includes(a.id));
  const critiques = activeAnomalies.filter(a => a.niveau === "CRITIQUE").length;

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500/20 to-red-600/10 border border-rose-500/20 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Audit & Conformité IA</h2>
            <p className="text-slate-400 mt-1">Détection automatique d'anomalies, Loi de Benford, FEC Analyzer. Rapport CAC généré en 1 clic.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Moteur IA Actif
          </div>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: "Dossiers Audités", val: DOSSIERS.length, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { icon: AlertTriangle, label: "Anomalies Détectées", val: Object.values(ANOMALIES).flat().length, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { icon: CheckCircle2, label: "Dossiers Certifiés", val: DOSSIERS.filter(d => d.statut === "CERTIFIE").length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: AlertTriangle, label: "Dossiers en Alerte", val: DOSSIERS.filter(d => d.statut === "ALERTE").length, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((k, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", k.color)}>
            <k.icon className="w-5 h-5 mb-4" />
            <p className="text-3xl font-black tabular-nums">{k.val}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Corps principal */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* Liste dossiers */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Dossiers d'Audit</p>
          {DOSSIERS.map(d => {
            const isActive = selected.id === d.id;
            return (
              <div
                key={d.id}
                onClick={() => handleSelect(d)}
                className={cn(
                  "cursor-pointer p-4 rounded-2xl border transition-all",
                  isActive ? "bg-rose-600/10 border-rose-500/30" : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={cn("font-bold text-sm truncate flex-1 mr-2", isActive ? "text-rose-300" : "text-white")}>{d.name}</p>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded font-black uppercase border",
                    d.statut === "CERTIFIE" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                    d.statut === "ALERTE" ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                    "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  )}>
                    {d.statut}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: d.score >= 80 ? "#10b981" : d.score >= 60 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-xs font-black text-white">{d.score}%</span>
                  </div>
                  {d.anomalies > 0 && (
                    <span className="text-[10px] text-rose-400 font-black">{d.anomalies} anom.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone principale */}
        <div className="lg:col-span-9 space-y-6">

          {/* Header dossier */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-white">{selected.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn("text-sm font-black", RISQUE_STYLE[selected.risque])}>
                    Risque : {selected.risque}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-400">{activeAnomalies.length} anomalie(s) active(s)</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-rose-500/20 disabled:opacity-60"
                >
                  {isScanning ? <><Loader2 className="w-4 h-4 animate-spin" /> Scan en cours…</> : <><Search className="w-4 h-4" /> Lancer Audit IA</>}
                </button>
                <button className="px-5 py-3 bg-slate-800 border border-white/5 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Rapport CAC
                </button>
              </div>
            </div>

            {/* Score visuel */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 p-5 rounded-2xl border border-white/5 bg-slate-800/30 flex flex-col items-center gap-2">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <path
                      strokeDasharray={`${selected.score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={selected.score >= 80 ? "#10b981" : selected.score >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{selected.score}</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>
                </div>
                <p className="text-xs font-black text-slate-400">Score Qualité</p>
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                {[
                  { label: "Écritures analysées", val: "12 450", icon: FileSearch, color: "text-blue-400" },
                  { label: "Test de Benford", val: selected.score >= 80 ? "✅ Conforme" : "⚠️ Déviation", icon: BarChart3, color: selected.score >= 80 ? "text-emerald-400" : "text-amber-400" },
                  { label: "Risque Fiscal", val: selected.risque, icon: Scale, color: RISQUE_STYLE[selected.risque] },
                  { label: "Anomalies Critiques", val: critiques, icon: AlertTriangle, color: critiques > 0 ? "text-rose-400" : "text-emerald-400" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/30 rounded-xl border border-white/5 flex items-start gap-2">
                    <item.icon className={cn("w-4 h-4 shrink-0 mt-0.5", item.color)} />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold">{item.label}</p>
                      <p className={cn("text-sm font-black", item.color)}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Liste anomalies */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Anomalies ({activeAnomalies.length})
              </h4>
              {scanDone && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black">
                  <CheckCircle2 className="w-3 h-3" /> Analyse IA terminée
                </div>
              )}
            </div>

            {activeAnomalies.length === 0 ? (
              <div className="p-16 text-center opacity-50">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-white font-black">Aucune anomalie détectée</p>
                <p className="text-slate-400 text-sm mt-1">Ce dossier est certifiable.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {activeAnomalies.map(anom => (
                  <div key={anom.id} className="p-5 hover:bg-slate-800/20 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={cn("text-[9px] px-2 py-1 rounded-lg border font-black uppercase", NIVEAU_STYLE[anom.niveau])}>
                            {anom.niveau}
                          </span>
                          <h5 className="font-black text-white text-sm">{anom.type}</h5>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">IA: {anom.confidence}%</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{anom.description}</p>
                        <div className="flex flex-wrap gap-3 text-[10px]">
                          <span className="text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">{anom.compte}</span>
                          <span className="text-white font-black tabular-nums">{anom.montant}</span>
                          <span className="text-slate-500">{anom.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setCorrected(prev => [...prev, anom.id])}
                          className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Corriger
                        </button>
                        <button
                          onClick={() => setDismissed(prev => [...prev, anom.id])}
                          className="px-3 py-1.5 bg-slate-800 border border-white/5 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Ignorer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommandation IA */}
          {selected.score < 80 && (
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-indigo-300 font-black text-sm mb-1">Recommandation NEXUS IA</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ce dossier présente un risque fiscal et comptable {selected.risque.toLowerCase()}. 
                  Je recommande une revue manuelle des {anomalies.filter(a => a.niveau === "CRITIQUE").length} anomalie(s) critique(s) avant toute certification. 
                  Un plan de régularisation sur les 30 prochains jours est conseillé.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
