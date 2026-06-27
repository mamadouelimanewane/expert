"use client";

import { useState } from "react";
import { Anchor, TrendingUp, Calculator, CheckCircle2, AlertTriangle, Globe, Building2, Zap, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ZONES = [
  { id: "dakar", name: "Zone Franche de Dakar", country: "Sénégal", flag: "🇸🇳", tva: 0, is: 15, douane: 0, duree: 25 },
  { id: "abidjan", name: "Zone Industrielle d'Abidjan", country: "Côte d'Ivoire", flag: "🇨🇮", tva: 0, is: 0, douane: 0, duree: 20 },
  { id: "bamako", name: "Zone Économique Spéciale du Mali", country: "Mali", flag: "🇲🇱", tva: 0, is: 10, douane: 0, duree: 15 },
  { id: "douala", name: "Zone Franche Industrielle de Douala", country: "Cameroun", flag: "🇨🇲", tva: 0, is: 17, douane: 0, duree: 25 },
  { id: "lome", name: "Zone Franche de Lomé", country: "Togo", flag: "🇹🇬", tva: 0, is: 0, douane: 0, duree: 30 },
];

const AVANTAGES = [
  { label: "Exonération TVA", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "IS réduit ou nul", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Droits de douane 0%", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Rapatriement libre des bénéfices", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Pas de contrôle des changes", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Statut expatriés facilité", icon: CheckCircle2, color: "text-emerald-400" },
];

export default function ZoneFranchePage() {
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [chiffreAffaires, setChiffreAffaires] = useState("500000000");
  const [showSimulation, setShowSimulation] = useState(false);

  const ca = parseInt(chiffreAffaires) || 0;
  const economieIS = ca * 0.3 * (30 - selectedZone.is) / 100;
  const economieTVA = ca * 0.18;
  const totalEconomie = economieIS + economieTVA;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="p-4 sm:p-8 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] bg-gradient-to-br from-slate-900/80 to-indigo-950/30 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Anchor className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
              OHADA Zone Économique
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Simulateur Zone Franche <span className="text-indigo-400">UEMOA/CEMAC</span>
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base font-medium max-w-2xl">
            Calculez les avantages fiscaux et douaniers liés à l'implantation de votre entreprise dans les zones franches d'Afrique de l'Ouest et Centrale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sélection Zone */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Zones Disponibles</h3>
          {ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={cn(
                "w-full p-4 rounded-2xl border text-left transition-all",
                selectedZone.id === zone.id
                  ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg"
                  : "bg-slate-900/20 border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{zone.flag}</span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{zone.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{zone.country} · IS {zone.is}% · TVA 0%</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Détails & Simulateur */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche Zone */}
          <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{selectedZone.flag}</span>
              <div>
                <h3 className="text-xl font-black text-white">{selectedZone.name}</h3>
                <p className="text-slate-400 text-sm font-medium">{selectedZone.country} — Durée d'agrément : {selectedZone.duree} ans</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "IS", value: `${selectedZone.is}%`, good: selectedZone.is < 20 },
                { label: "TVA", value: "0%", good: true },
                { label: "Douanes", value: "0%", good: true },
              ].map(item => (
                <div key={item.label} className={cn(
                  "p-4 rounded-2xl border text-center",
                  item.good ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                )}>
                  <p className="text-xs text-slate-500 font-black uppercase mb-1">{item.label}</p>
                  <p className={cn("text-2xl font-black", item.good ? "text-emerald-400" : "text-amber-400")}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVANTAGES.map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", color)} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Simulateur */}
          <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-indigo-400" /> Simulation d'économies fiscales
            </h3>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Chiffre d'Affaires Prévisionnel (FCFA/an)
              </label>
              <input
                type="number"
                value={chiffreAffaires}
                onChange={e => { setChiffreAffaires(e.target.value); setShowSimulation(false); }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              onClick={() => setShowSimulation(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-6"
            >
              <Zap className="w-4 h-4" /> Calculer les économies
            </button>

            {showSimulation && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Économie IS (vs régime normal 30%)</span>
                    <span className="text-lg font-black text-indigo-400">{economieIS.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Économie TVA (18%)</span>
                    <span className="text-lg font-black text-emerald-400">{economieTVA.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-xs text-white font-black uppercase tracking-widest">Total économies / an</span>
                    <span className="text-2xl font-black text-white">{totalEconomie.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    <strong className="text-amber-400">Avis d'expert :</strong> Ces estimations sont indicatives. L'implantation en zone franche nécessite un agrément et peut impliquer des obligations spécifiques (emploi local, réinvestissement, reporting). Contactez notre équipe pour un audit d'éligibilité complet.
                  </p>
                </div>

                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4" /> Demander un Audit d'Éligibilité <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
