"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type DonneesComptablesSyscohada,
  type ResultatConversionIFRS,
  convertirSyscohadaVersIFRS,
} from "@/lib/ohada/passerelle-syscohada-ifrs";

const DEFAULT_INPUT: DonneesComptablesSyscohada = {
  raisonSociale: "SOCIÉTÉ AGRO-ALIMENTAIRE UEMOA SA",
  exercice: 2024,
  ebitdaSyscohada_XOF: 200_000_000,
  resultatExploitationSyscohada_XOF: 140_000_000,
  chargesFinancieresSyscohada_XOF: 20_000_000,
  resultatNetSyscohada_XOF: 80_000_000,
  totalActifSyscohada_XOF: 1_000_000_000,
  dettesFinancieresSyscohada_XOF: 150_000_000,
  capitauxPropresSyscohada_XOF: 450_000_000,
  contratsLeasing: [
    {
      libelle: "Flotte de camions de distribution",
      loyerAnnuel_XOF: 30_000_000,
      dureeRestanteAnnees: 4,
      tauxActualisation_pct: 8.0,
    },
  ],
  retraiteIAS19: {
    masseSalarialeEligible_XOF: 120_000_000,
    ancienneteMoyenneAnnees: 8,
    tauxActualisationActuariel_pct: 6.5,
    provisionDejaComptabiliseeSyscohada_XOF: 10_000_000,
  },
};

export default function ConversionIFRSPage() {
  const [form, setForm] = useState<DonneesComptablesSyscohada>(DEFAULT_INPUT);
  const [resultat, setResultat] = useState<ResultatConversionIFRS | null>(() =>
    convertirSyscohadaVersIFRS(DEFAULT_INPUT)
  );
  const [loading, setLoading] = useState(false);

  const handleConvertir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/corporate/conversion-ifrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setResultat(data);
      } else {
        setResultat(convertirSyscohadaVersIFRS(form));
      }
    } catch {
      setResultat(convertirSyscohadaVersIFRS(form));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
            <span>IFRS 16 • IAS 19 • IAS 12</span>
            <span>•</span>
            <span>Multi-Reporting Bimodal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Passerelle de Conversion SYSCOHADA ⇄ IFRS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Retraitements automatisés des contrats de location (IFRS 16), engagements de retraite (IAS 19) et impôts différés
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/corporate/consolidation/audcif"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Consolidation AUDCIF
          </Link>
          <Link
            href="/corporate/fusion"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Fusions AUSCGIE →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleConvertir} className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Données de Base SYSCOHADA
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={form.raisonSociale}
                  onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">EBITDA / EBE (XOF)</label>
                  <input
                    type="number"
                    value={form.ebitdaSyscohada_XOF}
                    onChange={(e) => setForm({ ...form, ebitdaSyscohada_XOF: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Résultat Net (XOF)</label>
                  <input
                    type="number"
                    value={form.resultatNetSyscohada_XOF}
                    onChange={(e) =>
                      setForm({ ...form, resultatNetSyscohada_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Total Actif Bilan (XOF)</label>
                  <input
                    type="number"
                    value={form.totalActifSyscohada_XOF}
                    onChange={(e) =>
                      setForm({ ...form, totalActifSyscohada_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dettes Financières (XOF)</label>
                  <input
                    type="number"
                    value={form.dettesFinancieresSyscohada_XOF}
                    onChange={(e) =>
                      setForm({ ...form, dettesFinancieresSyscohada_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Données IFRS 16 Leasing */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              Paramètres IFRS 16 (Contrats de Location)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Loyer Annuel Total (XOF)</label>
                <input
                  type="number"
                  value={form.contratsLeasing[0]?.loyerAnnuel_XOF || 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contratsLeasing: [
                        {
                          ...form.contratsLeasing[0],
                          loyerAnnuel_XOF: Number(e.target.value),
                          libelle: "Contrats de location opérationnelle",
                          dureeRestanteAnnees: form.contratsLeasing[0]?.dureeRestanteAnnees || 4,
                          tauxActualisation_pct: form.contratsLeasing[0]?.tauxActualisation_pct || 8,
                        },
                      ],
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Durée Restante (Ans)</label>
                  <input
                    type="number"
                    value={form.contratsLeasing[0]?.dureeRestanteAnnees || 4}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contratsLeasing: [
                          {
                            ...form.contratsLeasing[0],
                            dureeRestanteAnnees: Number(e.target.value),
                          },
                        ],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Taux Actualisation (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.contratsLeasing[0]?.tauxActualisation_pct || 8}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contratsLeasing: [
                          {
                            ...form.contratsLeasing[0],
                            tauxActualisation_pct: Number(e.target.value),
                          },
                        ],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Données IAS 19 Retraite */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
              Paramètres IAS 19 (Engagements de Retraite IFC)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Masse Salariale Éligible</label>
                <input
                  type="number"
                  value={form.retraiteIAS19.masseSalarialeEligible_XOF}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      retraiteIAS19: {
                        ...form.retraiteIAS19,
                        masseSalarialeEligible_XOF: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ancienneté Moyenne (Ans)</label>
                <input
                  type="number"
                  value={form.retraiteIAS19.ancienneteMoyenneAnnees}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      retraiteIAS19: {
                        ...form.retraiteIAS19,
                        ancienneteMoyenneAnnees: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Conversion..." : "Générer la Liasse Retraitée IFRS"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {resultat && (
            <>
              {/* Carte Bridge EBITDA & Bilan */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      EBITDA Retraité IFRS (Neutralisation IFRS 16)
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-extrabold text-blue-400">
                        {resultat.tablePassageEbitda.ebitdaIFRS_XOF.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">
                        (+{resultat.tablePassageEbitda.variation_pct}%)
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-1">
                      vs {resultat.tablePassageEbitda.ebitdaSyscohada_XOF.toLocaleString("fr-FR")} XOF en SYSCOHADA
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center md:text-right">
                    <span className="text-xs text-slate-400 block mb-1">Résultat Net IFRS</span>
                    <span className="text-2xl font-bold text-white">
                      {resultat.tablePassageResultatNet.rnIFRS_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF après impôts différés IAS 12</span>
                  </div>
                </div>
              </div>

              {/* Table de passage des résultats */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                  Table de Passage du Résultat Net (SYSCOHADA ➔ IFRS)
                </h3>
                <div className="divide-y divide-slate-800/60 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-300">Résultat Net Comptable SYSCOHADA</span>
                    <span className="font-bold text-white font-mono">
                      {resultat.tablePassageResultatNet.rnSyscohada_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Impact net IFRS 16 (Loyers annulés - Amortissement - Intérêts)</span>
                    <span className="font-mono text-blue-400">
                      {resultat.tablePassageResultatNet.impactIFRS16Net_XOF >= 0 ? "+" : ""}
                      {resultat.tablePassageResultatNet.impactIFRS16Net_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Impact net IAS 19 (Complément d'engagement retraite)</span>
                    <span className="font-mono text-purple-400">
                      {resultat.tablePassageResultatNet.impactIAS19Net_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Impôts différés nets (IAS 12)</span>
                    <span className="font-mono text-emerald-400">
                      +{resultat.tablePassageResultatNet.impactImpotsDifferesIAS12_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-blue-500/10 px-2 rounded font-bold border border-blue-500/20">
                    <span className="text-blue-300">Résultat Net Consolidé IFRS</span>
                    <span className="text-blue-300 font-mono">
                      {resultat.tablePassageResultatNet.rnIFRS_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Bilan Comparatif Retraité */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                  Impacts Patrimoniaux au Bilan IFRS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Droit d'Usage Actif</span>
                    <span className="font-bold font-mono text-blue-400">
                      {resultat.bilanRetraiteIFRS.droitUsageActif_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className="text-[10px] text-slate-500 block">Actif non courant</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Dette de Leasing Passif</span>
                    <span className="font-bold font-mono text-amber-400">
                      {resultat.bilanRetraiteIFRS.detteLeasingPassif_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className="text-[10px] text-slate-500 block">Dettes financières</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Provision Retraite IAS 19</span>
                    <span className="font-bold font-mono text-purple-400">
                      {resultat.bilanRetraiteIFRS.provisionRetraitePassif_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className="text-[10px] text-slate-500 block">Passif non courant</span>
                  </div>
                </div>
              </div>

              {/* Écritures de Reclassement Recommandées */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                  Journal des Écritures de Passage IFRS
                </h3>
                <div className="space-y-2">
                  {resultat.retraitements.map((ret, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-400">{ret.norme} : {ret.libelle}</span>
                      </div>
                      <p className="text-slate-400 font-mono text-[11px]">
                        {ret.ecritureComptableRecommandee}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
