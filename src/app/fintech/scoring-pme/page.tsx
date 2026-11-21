"use client";

import { useState } from "react";
import Link from "next/link";
import {
  evaluerDossierCreditPME,
  type DossierCreditPME,
  type ScoreBanquePME,
} from "@/lib/ohada/scoring-pme-banque";

const DOSSIER_EXEMPLE: DossierCreditPME = {
  raisonSociale: "SOCIÉTÉ AGRO-ALIMENTAIRE DU SÉNÉGAL SA",
  secteurActivite: "Agroalimentaire",
  paysUEMOA: "SN",
  chiffreAffaires_XOF: 650_000_000,
  resultatNet_XOF: 52_000_000,
  capitauxPropres_XOF: 240_000_000,
  dettesFinancieres_XOF: 110_000_000,
  tresorerie_XOF: 45_000_000,
  ebe_XOF: 95_000_000,
  ancienneteAns: 7,
  nombreEmployes: 42,
  garantiesDisponibles_XOF: 180_000_000,
  historiqueCredit: "BON",
};

export default function ScoringPmePage() {
  const [dossier, setDossier] = useState<DossierCreditPME>(DOSSIER_EXEMPLE);
  const [scoreResult, setScoreResult] = useState<ScoreBanquePME | null>(() => {
    return evaluerDossierCreditPME(DOSSIER_EXEMPLE);
  });
  const [loading, setLoading] = useState(false);

  const handleEvaluer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fintech/scoring-pme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier }),
      });
      if (res.ok) {
        const data = await res.json();
        setScoreResult(data);
      } else {
        setScoreResult(evaluerDossierCreditPME(dossier));
      }
    } catch {
      setScoreResult(evaluerDossierCreditPME(dossier));
    } finally {
      setLoading(false);
    }
  };

  const getNotationColor = (notation: string) => {
    switch (notation) {
      case "A":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
      case "B":
        return "text-teal-400 bg-teal-500/20 border-teal-500/40";
      case "C":
        return "text-amber-400 bg-amber-500/20 border-amber-500/40";
      case "D":
        return "text-orange-400 bg-orange-500/20 border-orange-500/40";
      default:
        return "text-rose-400 bg-rose-500/20 border-rose-500/40";
    }
  };

  const getAvisColor = (avis: string) => {
    switch (avis) {
      case "FAVORABLE":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "FAVORABLE_SOUS_CONDITIONS":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default:
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>Dispositif PME BCEAO</span>
            <span>•</span>
            <span>Analyse Risque Crédit Bancaire</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Scoring PME & Dossier de Crédit Bancaire
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Évaluation prudentielle selon le barème 100 points BCEAO : ratios financiers, garanties, capacité d'emprunt
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fintech/credit-bceao"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Notation BCEAO
          </Link>
          <Link
            href="/fintech/payments"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Paiements Fintech →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleEvaluer} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Données de l'Entreprise
            </h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
              <input
                type="text"
                value={dossier.raisonSociale}
                onChange={(e) => setDossier({ ...dossier, raisonSociale: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Secteur</label>
                <input
                  type="text"
                  value={dossier.secteurActivite}
                  onChange={(e) => setDossier({ ...dossier, secteurActivite: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pays UEMOA</label>
                <select
                  value={dossier.paysUEMOA}
                  onChange={(e) => setDossier({ ...dossier, paysUEMOA: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  <option value="SN">Sénégal (SN)</option>
                  <option value="CI">Côte d'Ivoire (CI)</option>
                  <option value="BJ">Bénin (BJ)</option>
                  <option value="BF">Burkina Faso (BF)</option>
                  <option value="ML">Mali (ML)</option>
                  <option value="TG">Togo (TG)</option>
                  <option value="NE">Niger (NE)</option>
                  <option value="GW">Guinée-Bissau (GW)</option>
                </select>
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800/80">
              États Financiers (XOF)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Chiffre d'Affaires</label>
                <input
                  type="number"
                  value={dossier.chiffreAffaires_XOF}
                  onChange={(e) => setDossier({ ...dossier, chiffreAffaires_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Résultat Net</label>
                <input
                  type="number"
                  value={dossier.resultatNet_XOF}
                  onChange={(e) => setDossier({ ...dossier, resultatNet_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Capitaux Propres</label>
                <input
                  type="number"
                  value={dossier.capitauxPropres_XOF}
                  onChange={(e) => setDossier({ ...dossier, capitauxPropres_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dettes Financières</label>
                <input
                  type="number"
                  value={dossier.dettesFinancieres_XOF}
                  onChange={(e) => setDossier({ ...dossier, dettesFinancieres_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Trésorerie Active</label>
                <input
                  type="number"
                  value={dossier.tresorerie_XOF}
                  onChange={(e) => setDossier({ ...dossier, tresorerie_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">EBE</label>
                <input
                  type="number"
                  value={dossier.ebe_XOF}
                  onChange={(e) => setDossier({ ...dossier, ebe_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800/80">
              Paramètres Qualitatifs
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ancienneté (Années)</label>
                <input
                  type="number"
                  value={dossier.ancienneteAns}
                  onChange={(e) => setDossier({ ...dossier, ancienneteAns: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Effectif Employés</label>
                <input
                  type="number"
                  value={dossier.nombreEmployes}
                  onChange={(e) => setDossier({ ...dossier, nombreEmployes: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Garanties (XOF)</label>
                <input
                  type="number"
                  value={dossier.garantiesDisponibles_XOF}
                  onChange={(e) => setDossier({ ...dossier, garantiesDisponibles_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Historique Crédit</label>
                <select
                  value={dossier.historiqueCredit}
                  onChange={(e) => setDossier({ ...dossier, historiqueCredit: e.target.value as DossierCreditPME["historiqueCredit"] })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="BON">Bon (Aucun défaut)</option>
                  <option value="MOYEN">Moyen (Retards ponctuels)</option>
                  <option value="MAUVAIS">Mauvais (Incidents)</option>
                  <option value="AUCUN">Aucun (Primo-emprunteur)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-950/50 mt-4"
            >
              {loading ? "Évaluation..." : "Évaluer le Dossier de Crédit"}
            </button>
          </form>
        </div>

        {/* Résultats du scoring */}
        <div className="lg:col-span-7 space-y-6">
          {scoreResult && (
            <>
              {/* Carte Score & Avis */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${getNotationColor(scoreResult.notation)}`}>
                      <span className="text-3xl">{scoreResult.notation}</span>
                      <span className="text-[10px] font-mono">{scoreResult.scoreTotal}/100</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-medium text-slate-400 block">Avis du Comité Crédit</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1.5 ${getAvisColor(scoreResult.avisCredit)}`}>
                        {scoreResult.avisCredit.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center w-full sm:w-auto">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Crédit Max Recommandé</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {scoreResult.montantCreditRecommande_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Taux Indicatif</span>
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        {scoreResult.tauxInteret_pct}% ({scoreResult.dureeCreditRecommandee_mois} mois)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
                  {scoreResult.narratifBanquier}
                </p>
              </div>

              {/* Ratios Financiers */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Ratios Prudentiels BCEAO / Commission Bancaire
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block">Endettement (Dettes/CP)</span>
                      <span className="text-[10px] text-slate-500">Seuil max : 200%</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${scoreResult.ratiosFinanciers.ratioEndettement_pct > 200 ? "text-rose-400" : "text-emerald-400"}`}>
                      {scoreResult.ratiosFinanciers.ratioEndettement_pct}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block">Solvabilité (CP/Actif)</span>
                      <span className="text-[10px] text-slate-500">Seuil min : 20%</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${scoreResult.ratiosFinanciers.ratioSolvabilite_pct < 20 ? "text-rose-400" : "text-emerald-400"}`}>
                      {scoreResult.ratiosFinanciers.ratioSolvabilite_pct}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block">Rentabilité Nette (RN/CA)</span>
                      <span className="text-[10px] text-slate-500">Norme : &gt; 5%</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {scoreResult.ratiosFinanciers.ratioRentabilite_pct}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block">Service de la Dette (EBE/Dettes)</span>
                      <span className="text-[10px] text-slate-500">Norme : &gt; 30%</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${scoreResult.ratiosFinanciers.ratioServiceDette_pct < 30 ? "text-rose-400" : "text-emerald-400"}`}>
                      {scoreResult.ratiosFinanciers.ratioServiceDette_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Points Forts & Faibles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    ✓ Points Forts ({scoreResult.pointsForts.length})
                  </h4>
                  <ul className="space-y-1 text-xs text-emerald-300">
                    {scoreResult.pointsForts.map((pf, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{pf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    ⚠ Risques & Points Faibles ({scoreResult.pointsFaibles.length})
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-300">
                    {scoreResult.pointsFaibles.map((pf, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{pf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conditions Suspenseives */}
              {scoreResult.conditionsRequises.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    📋 Conditions Préalables au Décaissement
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scoreResult.conditionsRequises.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400">▫</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
