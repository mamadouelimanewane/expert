"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type InputComparateurFiscal,
  type ResultatComparateurFiscal,
  type SecteurActivite,
  comparerFiscaliteRegionale,
} from "@/lib/ohada/comparateur-fiscal-uemoa";

const DEFAULT_INPUT: InputComparateurFiscal = {
  chiffreAffaires_XOF: 1_500_000_000,
  resultatFiscal_XOF: 150_000_000,
  secteur: "SERVICES",
  tauxDistributionDividendes_pct: 60,
};

export default function ComparateurFiscalRegionalPage() {
  const [form, setForm] = useState<InputComparateurFiscal>(DEFAULT_INPUT);
  const [resultat, setResultat] = useState<ResultatComparateurFiscal | null>(() =>
    comparerFiscaliteRegionale(DEFAULT_INPUT)
  );
  const [loading, setLoading] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fiscalite/comparateur-regional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setResultat(data);
      } else {
        setResultat(comparerFiscaliteRegionale(form));
      }
    } catch {
      setResultat(comparerFiscaliteRegionale(form));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1">
            <span>UEMOA • CEMAC</span>
            <span>•</span>
            <span>Optimisation Territoriale</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Comparateur Régional de Pression Fiscale
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Benchmark comparatif de l'IS, de l'IMF et des retenues sur dividendes à travers 7 juridictions africaines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite/prix-transfert"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Prix de Transfert
          </Link>
          <Link
            href="/fiscalite/controle-defense"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Défense Contrôle Fiscal →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de paramétrage */}
        <form onSubmit={handleCalculer} className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Hypothèses Économiques du Groupe
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Secteur d'Activité</label>
                <select
                  value={form.secteur}
                  onChange={(e) =>
                    setForm({ ...form, secteur: e.target.value as SecteurActivite })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="SERVICES">Prestations de Services & Conseil</option>
                  <option value="COMMERCE">Commerce & Distribution</option>
                  <option value="INDUSTRIE">Industrie de Transformation (Régimes préférentiels)</option>
                  <option value="BTP">BTP & Infrastructures</option>
                  <option value="MINES_ENERGIE">Mines & Énergie</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Chiffre d'Affaires Annuel HT (XOF)
                </label>
                <input
                  type="number"
                  value={form.chiffreAffaires_XOF}
                  onChange={(e) =>
                    setForm({ ...form, chiffreAffaires_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Résultat Fiscal Imposable avant IS (XOF)
                </label>
                <input
                  type="number"
                  value={form.resultatFiscal_XOF}
                  onChange={(e) =>
                    setForm({ ...form, resultatFiscal_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Politique de Distribution de Dividendes</span>
                  <span className="font-semibold text-rose-400">
                    {form.tauxDistributionDividendes_pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.tauxDistributionDividendes_pct}
                  onChange={(e) =>
                    setForm({ ...form, tauxDistributionDividendes_pct: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Calcul en cours..." : "Lancer le Benchmark Régional"}
          </button>
        </form>

        {/* Restitution & Comparatif */}
        <div className="lg:col-span-8 space-y-6">
          {resultat && (
            <>
              {/* Carte Synthèse d'Arbitrage */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Juridiction Fiscale Optimale
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-emerald-400">
                        {resultat.meilleurPays.nom}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({resultat.meilleurPays.zone})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Total prélèvements directs :{" "}
                      <span className="text-white font-bold">
                        {resultat.meilleurPays.totalPrelevementsDirects_XOF.toLocaleString("fr-FR")} XOF
                      </span>{" "}
                      (Taux effectif : {resultat.meilleurPays.tauxEffectifImposition_pct}%)
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center md:text-right">
                    <span className="text-xs text-amber-400 block mb-1">
                      Économie Fiscale Potentielle
                    </span>
                    <span className="text-2xl font-black text-amber-400">
                      {resultat.economieFiscaleMax_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF / an vs juridiction max</span>
                  </div>
                </div>
              </div>

              {/* Tableau Comparatif des 7 Pays */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-3">
                  Classement de Compétitivité Fiscale UEMOA / CEMAC
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-medium">Rang</th>
                        <th className="pb-2 font-medium">Pays</th>
                        <th className="pb-2 font-medium">Taux IS</th>
                        <th className="pb-2 font-medium">IS Dû</th>
                        <th className="pb-2 font-medium">IMF</th>
                        <th className="pb-2 font-medium">Retenue Div.</th>
                        <th className="pb-2 font-medium text-right">Total Impôt</th>
                        <th className="pb-2 font-medium text-right">Taux Effectif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {resultat.classement.map((pays) => (
                        <tr
                          key={pays.code}
                          className={`hover:bg-slate-900/80 transition ${
                            pays.rangCompetitivite === 1
                              ? "bg-emerald-500/10 font-medium"
                              : ""
                          }`}
                        >
                          <td className="py-2.5">
                            <span
                              className={`inline-block w-5 h-5 rounded-full text-center leading-5 text-[10px] font-bold ${
                                pays.rangCompetitivite === 1
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {pays.rangCompetitivite}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className="font-semibold text-white">{pays.nom}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({pays.zone})</span>
                          </td>
                          <td className="py-2.5 font-mono">
                            {(pays.tauxIsApplicable * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 font-mono">
                            {pays.impotSocieteDu_XOF.toLocaleString("fr-FR")}
                            {pays.regimeApplique === "IMF" && (
                              <span className="text-[9px] text-amber-400 block font-sans">
                                (Base IMF)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 font-mono text-slate-400">
                            {pays.montantImf_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="py-2.5 font-mono text-slate-400">
                            {pays.retenueDividendes_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-right text-rose-300">
                            {pays.totalPrelevementsDirects_XOF.toLocaleString("fr-FR")} XOF
                          </td>
                          <td className="py-2.5 font-mono font-bold text-right text-white">
                            {pays.tauxEffectifImposition_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommandations Stratégiques */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm">
                  Analyse Stratégique & Conseils d'Implantation
                </h3>
                <ul className="space-y-2">
                  {resultat.recommandations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-rose-400 font-bold mt-0.5">•</span>
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
