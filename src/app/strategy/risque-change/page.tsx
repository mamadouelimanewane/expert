"use client";

import { useState } from "react";
import Link from "next/link";
import {
  genererRapportRisqueChange,
  type PositionDevise,
  type RapportRisqueChange,
} from "@/lib/ohada/simulateur-risque-change";

const POSITIONS_DEFAUT: PositionDevise[] = [
  {
    devise: "USD",
    coursSpotActuel_XOF: 620.0,
    creancesDevise: 150_000,
    dettesDevise: 750_000,
    coursComptabilise_XOF: 605.0,
  },
  {
    devise: "EUR",
    coursSpotActuel_XOF: 655.957,
    creancesDevise: 200_000,
    dettesDevise: 120_000,
    coursComptabilise_XOF: 655.957,
  },
  {
    devise: "CNY",
    coursSpotActuel_XOF: 84.5,
    creancesDevise: 0,
    dettesDevise: 1_200_000,
    coursComptabilise_XOF: 82.0,
  },
];

export default function RisqueChangePage() {
  const [raisonSociale, setRaisonSociale] = useState("GROUPE INDUSTRIEL AFRIQUE SA");
  const [positions, setPositions] = useState<PositionDevise[]>(POSITIONS_DEFAUT);
  const [rapport, setRapport] = useState<RapportRisqueChange | null>(() => {
    return genererRapportRisqueChange("GROUPE INDUSTRIEL AFRIQUE SA", 2024, POSITIONS_DEFAUT);
  });
  const [loading, setLoading] = useState(false);

  const handleSimuler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/strategy/risque-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societeRaisonSociale: raisonSociale,
          exercice: 2024,
          positions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererRapportRisqueChange(raisonSociale, 2024, positions));
      }
    } catch {
      setRapport(genererRapportRisqueChange(raisonSociale, 2024, positions));
    } finally {
      setLoading(false);
    }
  };

  const getNiveauRisqueBadge = (niv: string) => {
    switch (niv) {
      case "FAIBLE":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
      case "MODERE":
        return "text-blue-400 bg-blue-500/20 border-blue-500/40";
      case "ELEVE":
        return "text-amber-400 bg-amber-500/20 border-amber-500/40";
      default:
        return "text-rose-400 bg-rose-500/20 border-rose-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>Gestion de Trésorerie & FX UEMOA</span>
            <span>•</span>
            <span>Kyriba FX Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Simulateur Multi-Devises & Risque de Change FCFA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exposition nette en devises, chocs de cours et valorisation des écarts de conversion SYSCOHADA (Comptes 476/477 & 194)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/strategy/business-plan"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Business Plan
          </Link>
          <Link
            href="/strategy/devises"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Multi-Devises Standard →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire des positions */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSimuler} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Paramètres des Engagements en Devises
            </h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
              <input
                type="text"
                value={raisonSociale}
                onChange={(e) => setRaisonSociale(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-3">
              {positions.map((p, idx) => (
                <div key={p.devise} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-amber-400">
                    <span>Position {p.devise}</span>
                    <span className="font-mono text-[11px] text-slate-400">Spot : {p.coursSpotActuel_XOF} XOF</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Créances ({p.devise})</label>
                      <input
                        type="number"
                        value={p.creancesDevise}
                        onChange={(e) => {
                          const updated = [...positions];
                          updated[idx].creancesDevise = Number(e.target.value);
                          setPositions(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Dettes ({p.devise})</label>
                      <input
                        type="number"
                        value={p.dettesDevise}
                        onChange={(e) => {
                          const updated = [...positions];
                          updated[idx].dettesDevise = Number(e.target.value);
                          setPositions(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Cours Spot Actuel</label>
                      <input
                        type="number"
                        step="0.01"
                        value={p.coursSpotActuel_XOF}
                        onChange={(e) => {
                          const updated = [...positions];
                          updated[idx].coursSpotActuel_XOF = Number(e.target.value);
                          setPositions(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Cours Comptabilisé</label>
                      <input
                        type="number"
                        step="0.01"
                        value={p.coursComptabilise_XOF}
                        onChange={(e) => {
                          const updated = [...positions];
                          updated[idx].coursComptabilise_XOF = Number(e.target.value);
                          setPositions(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-950/50 mt-4"
            >
              {loading ? "Simulation..." : "Recalculer le Risque de Change"}
            </button>
          </form>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Carte Synthèse FX */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400 block">Exposition Nette Globale</span>
                    <span className={`text-2xl font-black mt-1 block font-mono ${
                      rapport.expositionGlobaleNette_XOF < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {rapport.expositionGlobaleNette_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-2 ${getNiveauRisqueBadge(rapport.niveauRisqueChange)}`}>
                      Niveau de Risque : {rapport.niveauRisqueChange}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center w-full sm:w-auto">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Écart Latent Net</span>
                      <span className={`text-sm font-bold font-mono ${rapport.impactGlobalLatent_XOF < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {rapport.impactGlobalLatent_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Provision Requise (194)</span>
                      <span className="text-sm font-bold font-mono text-amber-400">
                        {rapport.provisionsTotalesRequises_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
                  {rapport.syntheseTresorerie}
                </p>
              </div>

              {/* Détails par devise */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Exposition Détaillée & Stress Tests par Devise
                </h3>
                {rapport.positions.map((pos) => (
                  <div key={pos.devise} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-sm">Devise {pos.devise}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        pos.typeEcart === "ECART_CONVERSION_ACTIF_476"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          : pos.typeEcart === "ECART_CONVERSION_PASSIF_477"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {pos.typeEcart === "ECART_CONVERSION_ACTIF_476"
                          ? "Perte Latente (Compte 476)"
                          : pos.typeEcart === "ECART_CONVERSION_PASSIF_477"
                          ? "Gain Latent (Compte 477)"
                          : "Position Équilibrée"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Position Nette</span>
                        <span className="font-mono text-white font-bold">{pos.expositionNetteDevise.toLocaleString("fr-FR")} {pos.devise}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Contre-valeur XOF</span>
                        <span className="font-mono text-slate-200">{pos.expositionNette_XOF.toLocaleString("fr-FR")}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sensibilité (+1%)</span>
                        <span className="font-mono text-slate-200">{pos.sensibiliteParPourcent_XOF.toLocaleString("fr-FR")} XOF</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Provision (194)</span>
                        <span className="font-mono text-amber-400">{pos.provisionPerteChange_XOF.toLocaleString("fr-FR")} XOF</span>
                      </div>
                    </div>

                    {/* Grille de choc */}
                    <div className="pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">Simulations de variation du cours :</span>
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                        {pos.simulations.map((sim) => (
                          <div key={sim.variationDevise_pct} className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block">{sim.variationDevise_pct > 0 ? `+${sim.variationDevise_pct}%` : `${sim.variationDevise_pct}%`}</span>
                            <span className={`font-mono font-bold block mt-0.5 ${
                              sim.perteGainNet_XOF > 0 ? "text-emerald-400" : sim.perteGainNet_XOF < 0 ? "text-rose-400" : "text-slate-400"
                            }`}>
                              {sim.perteGainNet_XOF > 0 ? "+" : ""}
                              {Math.round(sim.perteGainNet_XOF / 1000)}k
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommandations */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Plan d'Atténuation & Couverture FX
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rapport.recommandationsCouverture.map((rec, idx) => (
                    <li key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">👉</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
