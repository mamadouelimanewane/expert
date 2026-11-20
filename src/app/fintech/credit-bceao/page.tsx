"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type DemandeCredit,
  type DonneesFinancieresBancaires,
  type DossierCreditComplet,
  evaluerDossierCreditBceao,
} from "@/lib/ohada/credit-notation-bceao";

const DEFAULT_FINANCIER: DonneesFinancieresBancaires = {
  raisonSociale: "SOCIÉTÉ AGRO-TRANSFORMATION SA",
  secteur: "AGRO-INDUSTRIE",
  exercice: 2024,
  chiffreAffaires_XOF: 850_000_000,
  ebe_XOF: 130_000_000,
  rex_XOF: 95_000_000,
  resultatNet_XOF: 52_000_000,
  caf_XOF: 78_000_000,
  dettesFinancieresActuelles_XOF: 45_000_000,
  tresorerieNette_XOF: 30_000_000,
  capitauxPropres_XOF: 220_000_000,
  totalBilan_XOF: 550_000_000,
};

const DEFAULT_DEMANDE: DemandeCredit = {
  montant_XOF: 120_000_000,
  dureeMois: 60,
  differeMois: 6,
  tauxInteretAnnuel_pct: 8.5,
  objetFinancement: "EQUIPEMENT_MATERIEL",
  valeurGaranties_XOF: 150_000_000,
  typeGarantie: "NANTISSEMENT_MATERIEL",
};

export default function NotationBancaireBceaoPage() {
  const [financier, setFinancier] = useState<DonneesFinancieresBancaires>(DEFAULT_FINANCIER);
  const [demande, setDemande] = useState<DemandeCredit>(DEFAULT_DEMANDE);
  const [dossier, setDossier] = useState<DossierCreditComplet | null>(() =>
    evaluerDossierCreditBceao(DEFAULT_FINANCIER, DEFAULT_DEMANDE)
  );
  const [loading, setLoading] = useState(false);

  const handleEvaluer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fintech/dossier-credit-bceao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financier, demande }),
      });
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      } else {
        setDossier(evaluerDossierCreditBceao(financier, demande));
      }
    } catch {
      setDossier(evaluerDossierCreditBceao(financier, demande));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            <span>Règles Prudentielles BCEAO / COBAC</span>
            <span>•</span>
            <span>Guichet Spécial PME/PMI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Notation Bancaire & Dossier de Crédit PME
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Évaluation du risque de crédit, scoring bancaire, tableau d'amortissement et éligibilité au refinancement BCEAO
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fintech/scoring"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Scoring Fintech
          </Link>
          <Link
            href="/fintech/credit"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Dossier Crédit Standard →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleEvaluer} className="lg:col-span-5 space-y-6">
          {/* Données de la demande */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
              Paramètres du Financement Sollicité
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Montant Sollicité (XOF)</label>
                <input
                  type="number"
                  value={demande.montant_XOF}
                  onChange={(e) => setDemande({ ...demande, montant_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Durée (Mois)</label>
                  <input
                    type="number"
                    value={demande.dureeMois}
                    onChange={(e) => setDemande({ ...demande, dureeMois: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Taux Annuel (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={demande.tauxInteretAnnuel_pct}
                    onChange={(e) =>
                      setDemande({ ...demande, tauxInteretAnnuel_pct: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Objet</label>
                  <select
                    value={demande.objetFinancement}
                    onChange={(e) =>
                      setDemande({
                        ...demande,
                        objetFinancement: e.target.value as DemandeCredit["objetFinancement"],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="EQUIPEMENT_MATERIEL">Équipement & Matériel</option>
                    <option value="BFR_CAMPAGNE">BFR / Campagne</option>
                    <option value="IMMOBILIER_PRO">Immobilier d'exploitation</option>
                    <option value="EXPANSION_REGIONALE">Expansion régionale</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valeur Garanties (XOF)</label>
                  <input
                    type="number"
                    value={demande.valeurGaranties_XOF}
                    onChange={(e) =>
                      setDemande({ ...demande, valeurGaranties_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* États financiers de l'emprunteur */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Indicateurs Financiers SYSCOHADA
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={financier.raisonSociale}
                  onChange={(e) => setFinancier({ ...financier, raisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Chiffre d'Affaires (XOF)</label>
                  <input
                    type="number"
                    value={financier.chiffreAffaires_XOF}
                    onChange={(e) =>
                      setFinancier({ ...financier, chiffreAffaires_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">EBE (XOF)</label>
                  <input
                    type="number"
                    value={financier.ebe_XOF}
                    onChange={(e) =>
                      setFinancier({ ...financier, ebe_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CAF Annuelle (XOF)</label>
                  <input
                    type="number"
                    value={financier.caf_XOF}
                    onChange={(e) =>
                      setFinancier({ ...financier, caf_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dettes Financières Actuelles</label>
                  <input
                    type="number"
                    value={financier.dettesFinancieresActuelles_XOF}
                    onChange={(e) =>
                      setFinancier({
                        ...financier,
                        dettesFinancieresActuelles_XOF: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Capitaux Propres (XOF)</label>
                  <input
                    type="number"
                    value={financier.capitauxPropres_XOF}
                    onChange={(e) =>
                      setFinancier({ ...financier, capitauxPropres_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Total Bilan (XOF)</label>
                  <input
                    type="number"
                    value={financier.totalBilan_XOF}
                    onChange={(e) =>
                      setFinancier({ ...financier, totalBilan_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Notation en cours..." : "Calculer le Score BCEAO & Évaluer le Dossier"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {dossier && (
            <>
              {/* Score & Décision */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Classe de Risque Prudentiel BCEAO
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-black text-emerald-400">
                        Classe {dossier.classeRisqueBceao.replace("_", " ")}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">
                        ({dossier.scoreGlobal}/100)
                      </span>
                    </div>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                        dossier.avisComiteCredit === "ACCORD_RECOMMANDE"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : dossier.avisComiteCredit === "ACCORD_SOUS_CONDITIONS"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      }`}
                    >
                      Avis Comité des Risques : {dossier.avisComiteCredit.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="text-center md:text-right p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Annuité Prévisionnelle</span>
                    <span className="text-2xl font-bold text-white">
                      {dossier.annuitePrevisionnelle_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">XOF / an</span>
                  </div>
                </div>
              </div>

              {/* Ratios Bancaires Prudentiels */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                  Grille des Ratios Réglementaires BCEAO / COBAC
                </h3>
                <div className="space-y-2">
                  {dossier.ratiosBancaires.map((ratio) => (
                    <div
                      key={ratio.code}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-200 block">{ratio.libelle}</span>
                        <span className="text-[10px] text-slate-500">Norme : {ratio.normePrudentielle}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm block ${
                            ratio.conforme ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {ratio.valeur}
                        </span>
                        <span className="text-[10px] text-slate-400">Score : {ratio.score}/25</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Éligibilité Dispositif BCEAO PME */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    Dispositif BCEAO de Soutien aux PME/PMI
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      dossier.eligibiliteDispositifBceaoPme.eligible
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    }`}
                  >
                    {dossier.eligibiliteDispositifBceaoPme.eligible ? "Éligible" : "Non éligible"}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {dossier.eligibiliteDispositifBceaoPme.avantageTauxRefinancement}
                </p>
              </div>

              {/* Tableau d'amortissement */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">
                  Échéancier Prévisionnel d'Amortissement
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">Année</th>
                        <th className="pb-2">Capital Début</th>
                        <th className="pb-2">Amortissement</th>
                        <th className="pb-2">Intérêts</th>
                        <th className="pb-2">Annuité</th>
                        <th className="pb-2 text-right">Capital Fin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {dossier.tableauAmortissement.map((ech) => (
                        <tr key={ech.annee}>
                          <td className="py-2 text-slate-300">An {ech.annee}</td>
                          <td className="py-2">{ech.capitalDebut_XOF.toLocaleString("fr-FR")}</td>
                          <td className="py-2 text-emerald-400">
                            {ech.amortissementCapital_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="py-2 text-amber-400">
                            {ech.interets_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="py-2 font-bold text-white">
                            {ech.annuite_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="py-2 text-right text-slate-400">
                            {ech.capitalFin_XOF.toLocaleString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
