"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type DonneeControleFiscal,
  type RapportScannerFiscal,
  scannerRisquesFiscaux,
} from "@/lib/ohada/scanner-fiscal-predictif";

const DEFAULT_INPUT: DonneeControleFiscal = {
  exercice: 2024,
  pays: "SN",
  chiffreAffairesComptable_XOF: 1_200_000_000,
  totalCaDeclareTva_XOF: 1_120_000_000, // Écart de 80M
  tvaCollecteeComptabilisee_XOF: 216_000_000,
  tvaCollecteeDeclaree_XOF: 201_600_000,
  dettesFournisseursDormantesPlus4Ans_XOF: 35_000_000, // Dette prescrite
  amortissementsComptabilises_XOF: 65_000_000,
  plafondAmortissementsFiscaux_XOF: 50_000_000, // Dépassement 15M
  honorairesEtCommissionsComptabilises_XOF: 28_000_000,
  honorairesDeclaresSurEtatRecapitulatif_XOF: 18_000_000, // 10M non déclarés
  chargesSousTraitance_XOF: 40_000_000,
  justificatifsSousTraitanceValides: true,
  ecartInventaireStock_XOF: 5_000_000,
};

export default function ScannerFiscalPredictifPage() {
  const [form, setForm] = useState<DonneeControleFiscal>(DEFAULT_INPUT);
  const [rapport, setRapport] = useState<RapportScannerFiscal | null>(() =>
    scannerRisquesFiscaux(DEFAULT_INPUT)
  );
  const [loading, setLoading] = useState(false);

  const handleScanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fiscalite/scanner-predictif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(scannerRisquesFiscaux(form));
      }
    } catch {
      setRapport(scannerRisquesFiscaux(form));
    } finally {
      setLoading(false);
    }
  };

  const getSeveriteBadge = (sev: string) => {
    switch (sev) {
      case "CRITIQUE":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "ELEVEE":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "MOYENNE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-500 font-semibold mb-1">
            <span>Algorithmes DGID / DGI UEMOA</span>
            <span>•</span>
            <span>Pré-Contrôle Automatisé</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Scanner Prédictif de Contrôle Fiscal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Détection automatique des chefs de redressement, chiffrage de l'exposition financière et actions de régularisation spontanée
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite/controle-defense"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Défense Contrôle Fiscal
          </Link>
          <Link
            href="/fiscalite/comparateur-regional"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Comparateur Régional →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie des données fiscales */}
        <form onSubmit={handleScanner} className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              1. Cadrage Chiffre d'Affaires & TVA
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Chiffre d'Affaires Comptable Liasse (Compte 70)
                </label>
                <input
                  type="number"
                  value={form.chiffreAffairesComptable_XOF}
                  onChange={(e) =>
                    setForm({ ...form, chiffreAffairesComptable_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Total CA Déclaré sur les 12 Déclarations TVA
                </label>
                <input
                  type="number"
                  value={form.totalCaDeclareTva_XOF}
                  onChange={(e) =>
                    setForm({ ...form, totalCaDeclareTva_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              2. Dettes Fournisseurs & Prescription Quadriennale
            </h2>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Soldes créditeurs Fournisseurs (401) dormants depuis &gt; 4 ans
              </label>
              <input
                type="number"
                value={form.dettesFournisseursDormantesPlus4Ans_XOF}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dettesFournisseursDormantesPlus4Ans_XOF: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              3. Amortissements & Honoraires Déclarés
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amortissements compta</label>
                <input
                  type="number"
                  value={form.amortissementsComptabilises_XOF}
                  onChange={(e) =>
                    setForm({ ...form, amortissementsComptabilises_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Plafond fiscal déductible</label>
                <input
                  type="number"
                  value={form.plafondAmortissementsFiscaux_XOF}
                  onChange={(e) =>
                    setForm({ ...form, plafondAmortissementsFiscaux_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Honoraires comptabilisés</label>
                <input
                  type="number"
                  value={form.honorairesEtCommissionsComptabilises_XOF}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      honorairesEtCommissionsComptabilises_XOF: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Honoraires déclarés (DAS)</label>
                <input
                  type="number"
                  value={form.honorairesDeclaresSurEtatRecapitulatif_XOF}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      honorairesDeclaresSurEtatRecapitulatif_XOF: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              4. Sous-traitance & Stocks
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Charges de sous-traitance (XOF)</label>
                <input
                  type="number"
                  value={form.chargesSousTraitance_XOF}
                  onChange={(e) =>
                    setForm({ ...form, chargesSousTraitance_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.justificatifsSousTraitanceValides}
                  onChange={(e) =>
                    setForm({ ...form, justificatifsSousTraitanceValides: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-rose-500"
                />
                <span>Contrats formels et preuves de matérialité archivés</span>
              </label>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Écart d'inventaire physique stock</label>
                <input
                  type="number"
                  value={form.ecartInventaireStock_XOF}
                  onChange={(e) =>
                    setForm({ ...form, ecartInventaireStock_XOF: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Scan en cours..." : "Lancer le Scanner Prédictif DGID"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Score card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Score de Conformité Fiscale
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={`text-5xl font-black ${
                          rapport.scoreConformiteFiscale >= 80
                            ? "text-emerald-400"
                            : rapport.scoreConformiteFiscale >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {rapport.scoreConformiteFiscale}
                      </span>
                      <span className="text-lg text-slate-500 font-semibold">/ 100</span>
                    </div>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                        rapport.niveauRisqueGlobal === "FAIBLE"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : rapport.niveauRisqueGlobal === "MODERE"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      }`}
                    >
                      Niveau de Risque : {rapport.niveauRisqueGlobal}
                    </span>
                  </div>

                  <div className="space-y-2 text-center md:text-right">
                    <span className="text-xs text-slate-400 block">Exposition Financière Maximale</span>
                    <span className="text-3xl font-extrabold text-rose-400">
                      {rapport.expositionFinanciereTotale_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Dont {rapport.totalRedressementPrincipal_XOF.toLocaleString("fr-FR")} XOF en principal
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste des chefs de redressement détectés */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    Chefs de Redressement Détectés ({rapport.chefsDeRedressement.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Pénalités + Intérêts : {rapport.totalPenalitesEtInterets_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                {rapport.chefsDeRedressement.length === 0 ? (
                  <p className="text-xs text-emerald-400 py-4 text-center">
                    Aucune anomalie détectée. La situation fiscale de l'entreprise est saine.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {rapport.chefsDeRedressement.map((chef) => (
                      <div
                        key={chef.id}
                        className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getSeveriteBadge(
                                  chef.severite
                                )}`}
                              >
                                {chef.severite}
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {chef.intitule}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {chef.articleLegal}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-rose-400 whitespace-nowrap">
                            {chef.expositionTotale_XOF.toLocaleString("fr-FR")} XOF
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {chef.explicationFiscale}
                        </p>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Action de régularisation :</span>
                          <span className="text-amber-400 font-medium">
                            {chef.actionRegularisation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommandations prioritaires */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm">
                  Plan d'Action de Sécurisation Fiscale
                </h3>
                <ul className="space-y-2">
                  {rapport.recommandationsPrioritaires.map((rec, i) => (
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
