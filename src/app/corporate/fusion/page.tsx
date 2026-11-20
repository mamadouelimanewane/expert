"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type DossierFusion,
  type ResultatFusion,
  calculerResultatFusion,
} from "@/lib/ohada/fusions-restructurations";

const DEFAULT_DOSSIER: DossierFusion = {
  type: "FUSION_ABSORPTION",
  pays: "SN",
  absorbante: {
    raisonSociale: "GROUPE ABSORBANT SA",
    capitalSocial_XOF: 500_000_000,
    nombreActions: 50_000,
    valeurNominale_XOF: 10_000,
    actifNet_XOF: 800_000_000,
    valeurEconomique_XOF: 2_500_000_000,
  },
  absorbee: {
    raisonSociale: "CIBLE INDUSTRIELLE SAS",
    capitalSocial_XOF: 100_000_000,
    nombreActions: 10_000,
    valeurNominale_XOF: 10_000,
    actifNet_XOF: 200_000_000,
    valeurEconomique_XOF: 250_000_000,
    coutTitresChezAbsorbante_XOF: 0,
  },
};

export default function FusionsRestructurationsPage() {
  const [dossier, setDossier] = useState<DossierFusion>(DEFAULT_DOSSIER);
  const [resultat, setResultat] = useState<ResultatFusion | null>(() =>
    calculerResultatFusion(DEFAULT_DOSSIER)
  );
  const [loading, setLoading] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/corporate/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dossier),
      });
      if (res.ok) {
        const data = await res.json();
        setResultat(data);
      } else {
        setResultat(calculerResultatFusion(dossier));
      }
    } catch {
      setResultat(calculerResultatFusion(dossier));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>AUSCGIE Art. 189 à 199</span>
            <span>•</span>
            <span>SYSCOHADA Révisé</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Fusions, Scissions & Apports Partiels d'Actifs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Parité d'Échange, Prime / Mali de Fusion, Rapport du Commissaire aux Apports & Traité de Fusion
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
            href="/advisory/due-diligence"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Due Diligence M&A →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleCalculer} className="lg:col-span-5 space-y-6">
          {/* Type d'opération */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Type d'Opération Juridique
            </h2>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nature de la restructuration</label>
              <select
                value={dossier.type}
                onChange={(e) =>
                  setDossier({ ...dossier, type: e.target.value as DossierFusion["type"] })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="FUSION_ABSORPTION">Fusion-Absorption (Art. 189 AUSCGIE)</option>
                <option value="FUSION_CREATION">Fusion par création d'une société nouvelle</option>
                <option value="SCISSION">Scission (Art. 190 AUSCGIE)</option>
                <option value="APPORT_PARTIEL">Apport Partiel d'Actifs (Art. 195 AUSCGIE)</option>
              </select>
            </div>
          </div>

          {/* Société Absorbante / Bénéficiaire */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              Société Absorbante / Bénéficiaire
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={dossier.absorbante.raisonSociale}
                  onChange={(e) =>
                    setDossier({
                      ...dossier,
                      absorbante: { ...dossier.absorbante, raisonSociale: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nombre d'Actions</label>
                  <input
                    type="number"
                    value={dossier.absorbante.nombreActions}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbante: { ...dossier.absorbante, nombreActions: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valeur Nominale (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbante.valeurNominale_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbante: {
                          ...dossier.absorbante,
                          valeurNominale_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Actif Net Comptable (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbante.actifNet_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbante: { ...dossier.absorbante, actifNet_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valeur Économique Retenue (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbante.valeurEconomique_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbante: {
                          ...dossier.absorbante,
                          valeurEconomique_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Société Absorbée / Apporteuse */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2">
              Société Absorbée / Apporteuse
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={dossier.absorbee.raisonSociale}
                  onChange={(e) =>
                    setDossier({
                      ...dossier,
                      absorbee: { ...dossier.absorbee, raisonSociale: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nombre d'Actions</label>
                  <input
                    type="number"
                    value={dossier.absorbee.nombreActions}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbee: { ...dossier.absorbee, nombreActions: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valeur Nominale (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbee.valeurNominale_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbee: {
                          ...dossier.absorbee,
                          valeurNominale_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Actif Net Comptable (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbee.actifNet_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbee: { ...dossier.absorbee, actifNet_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valeur Économique Retenue (XOF)</label>
                  <input
                    type="number"
                    value={dossier.absorbee.valeurEconomique_XOF}
                    onChange={(e) =>
                      setDossier({
                        ...dossier,
                        absorbee: {
                          ...dossier.absorbee,
                          valeurEconomique_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Coût d'acquisition des titres chez l'absorbante (si participation préalable)
                </label>
                <input
                  type="number"
                  value={dossier.absorbee.coutTitresChezAbsorbante_XOF || 0}
                  onChange={(e) =>
                    setDossier({
                      ...dossier,
                      absorbee: {
                        ...dossier.absorbee,
                        coutTitresChezAbsorbante_XOF: Number(e.target.value),
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
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Calcul en cours..." : "Calculer Parité & Rédiger Traité de Fusion"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {resultat && (
            <>
              {/* Carte Principale de Parité */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Rapport d'Échange Retenu (Parité)
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-amber-400">
                        {resultat.pariteEchange}
                      </span>
                      <span className="text-sm text-slate-400">action nouvelle pour 1 action ancienne</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Actions à émettre</span>
                    <span className="text-2xl font-bold text-white">
                      {resultat.actionsAEmettre.toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Augmentation Capital</span>
                    <span className="text-base font-bold text-white">
                      {resultat.augmentationCapital_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-emerald-400 block mb-1">Prime de Fusion</span>
                    <span className="text-base font-bold text-emerald-400">
                      {resultat.primeDeFusion_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Valeur Apport Retenue</span>
                    <span className="text-base font-bold text-white">
                      {resultat.valeurApport_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF</span>
                  </div>
                </div>

                {/* Mali technique / Vrai mali si applicable */}
                {(resultat.maliTechnique_XOF > 0 || resultat.vraiMali_XOF > 0 || resultat.boniFusion_XOF > 0) && (
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-amber-400 block mb-1">Mali Technique</span>
                      <span className="text-sm font-semibold text-amber-400">
                        {resultat.maliTechnique_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                      <span className="text-[10px] text-slate-500 block">Immo incorporelle (Compte 21)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-rose-400 block mb-1">Vrai Mali</span>
                      <span className="text-sm font-semibold text-rose-400">
                        {resultat.vraiMali_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                      <span className="text-[10px] text-slate-500 block">Charge financière (Compte 67)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs text-emerald-400 block mb-1">Boni de Fusion</span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {resultat.boniFusion_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                      <span className="text-[10px] text-slate-500 block">Résultat financier / Capitaux</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rapport du Commissaire aux Apports (CAA) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    Rapport du Commissaire aux Apports (Art. 193 AUSCGIE)
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      resultat.rapportCAA.avisCAA === "FAVORABLE"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : resultat.rapportCAA.avisCAA === "FAVORABLE_AVEC_RESERVES"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    }`}
                  >
                    Avis CAA : {resultat.rapportCAA.avisCAA}
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">{resultat.rapportCAA.justificationParite}</p>
                <div className="space-y-1.5">
                  {resultat.rapportCAA.observations.map((obs, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-amber-400">•</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traité de Fusion (Clauses clés) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm">
                  Stipulations Fondamentales du Traité de Fusion
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Transmission Universelle du Patrimoine :</span>
                    <span className="font-semibold text-emerald-400">Actif & Passif transmis de plein droit</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Clause de Parité & Rémunération :</span>
                    <span className="font-semibold text-slate-200">{resultat.traiteFusion.clauseParite}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Régime Fiscal :</span>
                    <span className="font-semibold text-amber-400">{resultat.traiteFusion.regimeFiscal}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between">
                    <span className="text-slate-400">Droits d'Enregistrement :</span>
                    <span className="font-semibold text-slate-200">{resultat.traiteFusion.droitsEnregistrement}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
