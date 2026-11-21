"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calculerScoringESGBRVM,
  type InputScoringESGBRVM,
  type RapportScoringESGBRVM,
} from "@/lib/ohada/scoring-esg-brvm";

const INPUT_DEMO: InputScoringESGBRVM = {
  societeRaisonSociale: "SOCIÉTÉ AGRO-INDUSTRIELLE SAHEL SA",
  secteur: "Agro-Industrie & Transformation",
  exercice: 2024,
  environnement: {
    emissionsGES_tCO2e: 4200,
    partEnergieRenouvelable_pct: 35,
    consommationEau_m3: 42000,
    tauxRecyclageDechets_pct: 55,
    certificationsVertes: ["ISO 14001"],
  },
  social: {
    effectifTotal: 380,
    tauxFeminisation_pct: 38,
    tauxFeminisationCadres_pct: 32,
    tauxAccidentTravail_pct: 0.5,
    heuresFormationParSalarie: 22,
    tauxEmploiNationalLocal_pct: 88,
  },
  gouvernance: {
    nombreAdministrateurs: 8,
    partAdministrateursIndependants_pct: 37.5,
    presenceComiteAudit: true,
    presenceComiteRSE: true,
    politiqueAntiCorruptionLCBFT: true,
    publicationTransparenteRemuneration: true,
    separationPresidentEtDG: true,
  },
};

export default function ScoringEsgBrvmPage() {
  const [input, setInput] = useState<InputScoringESGBRVM>(INPUT_DEMO);
  const [rapport, setRapport] = useState<RapportScoringESGBRVM | null>(() => {
    return calculerScoringESGBRVM(INPUT_DEMO);
  });
  const [loading, setLoading] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/advisory/scoring-esg-brvm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(calculerScoringESGBRVM(input));
      }
    } catch {
      setRapport(calculerScoringESGBRVM(input));
    } finally {
      setLoading(false);
    }
  };

  const getNotationBadge = (not: string) => {
    if (not === "AAA" || not === "AA") return "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
    if (not === "A" || not === "BBB") return "text-teal-400 bg-teal-500/20 border-teal-500/40";
    if (not === "BB" || not === "B") return "text-amber-400 bg-amber-500/20 border-amber-500/40";
    return "text-rose-400 bg-rose-500/20 border-rose-500/40";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            <span>BRVM & Green Bonds BOAD</span>
            <span>•</span>
            <span>Évaluation Extra-Financière IFRS S1/S2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Scoring ESG / RSE BRVM & Financement Vert
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Notation extra-financière standardisée (E-S-G 100 pts) pour émetteurs cotés et obligations durables UEMOA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/advisory/esg"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Rapport ESG IFRS
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
        {/* Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCalculer} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Profil de l'Émetteur
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={input.societeRaisonSociale}
                  onChange={(e) => setInput({ ...input, societeRaisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Secteur</label>
                  <input
                    type="text"
                    value={input.secteur}
                    onChange={(e) => setInput({ ...input, secteur: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Exercice</label>
                  <input
                    type="number"
                    value={input.exercice}
                    onChange={(e) => setInput({ ...input, exercice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 pt-2 border-t border-slate-800">
              🌱 Pilier E (Environnement)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Émissions GES (tCO2e)</label>
                <input
                  type="number"
                  value={input.environnement.emissionsGES_tCO2e}
                  onChange={(e) => setInput({
                    ...input,
                    environnement: { ...input.environnement, emissionsGES_tCO2e: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">% Énergie Renouvelable</label>
                <input
                  type="number"
                  value={input.environnement.partEnergieRenouvelable_pct}
                  onChange={(e) => setInput({
                    ...input,
                    environnement: { ...input.environnement, partEnergieRenouvelable_pct: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">% Recyclage Déchets</label>
                <input
                  type="number"
                  value={input.environnement.tauxRecyclageDechets_pct}
                  onChange={(e) => setInput({
                    ...input,
                    environnement: { ...input.environnement, tauxRecyclageDechets_pct: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Eau (m3)</label>
                <input
                  type="number"
                  value={input.environnement.consommationEau_m3}
                  onChange={(e) => setInput({
                    ...input,
                    environnement: { ...input.environnement, consommationEau_m3: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 pt-2 border-t border-slate-800">
              👥 Pilier S (Social)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Effectif Total</label>
                <input
                  type="number"
                  value={input.social.effectifTotal}
                  onChange={(e) => setInput({
                    ...input,
                    social: { ...input.social, effectifTotal: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">% Féminisation Cadres</label>
                <input
                  type="number"
                  value={input.social.tauxFeminisationCadres_pct}
                  onChange={(e) => setInput({
                    ...input,
                    social: { ...input.social, tauxFeminisationCadres_pct: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Heures Formation/an</label>
                <input
                  type="number"
                  value={input.social.heuresFormationParSalarie}
                  onChange={(e) => setInput({
                    ...input,
                    social: { ...input.social, heuresFormationParSalarie: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">% Emploi Local</label>
                <input
                  type="number"
                  value={input.social.tauxEmploiNationalLocal_pct}
                  onChange={(e) => setInput({
                    ...input,
                    social: { ...input.social, tauxEmploiNationalLocal_pct: Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-400 pt-2 border-t border-slate-800">
              ⚖️ Pilier G (Gouvernance)
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={input.gouvernance.presenceComiteAudit}
                  onChange={(e) => setInput({
                    ...input,
                    gouvernance: { ...input.gouvernance, presenceComiteAudit: e.target.checked }
                  })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                />
                Comité d'Audit formel au Conseil
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={input.gouvernance.politiqueAntiCorruptionLCBFT}
                  onChange={(e) => setInput({
                    ...input,
                    gouvernance: { ...input.gouvernance, politiqueAntiCorruptionLCBFT: e.target.checked }
                  })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                />
                Politique Anti-Corruption & LCB-FT formalisée
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={input.gouvernance.separationPresidentEtDG}
                  onChange={(e) => setInput({
                    ...input,
                    gouvernance: { ...input.gouvernance, separationPresidentEtDG: e.target.checked }
                  })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                />
                Séparation PCA / Directeur Général
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 mt-4"
            >
              {loading ? "Notation en cours..." : "Calculer le Rating ESG BRVM"}
            </button>
          </form>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Carte Score Global */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${getNotationBadge(rapport.notationBRVM)}`}>
                      <span className="text-3xl">{rapport.notationBRVM}</span>
                      <span className="text-[10px] font-mono">{rapport.scoreGlobal_100}/100</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-medium text-slate-400 block">Rating Extra-Financier BRVM</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{rapport.societeRaisonSociale}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-2 ${
                        rapport.eligibiliteGreenBondBOAD
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      }`}>
                        {rapport.eligibiliteGreenBondBOAD ? "✓ Éligible Green Bonds BOAD" : "⚠ En cours d'alignement"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block font-bold">Pilier E</span>
                      <span className="text-base font-black text-white">{rapport.pilierEnvironnement.score}/35</span>
                      <span className="text-[9px] text-slate-500 block">{rapport.pilierEnvironnement.pourcentage}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-blue-400 block font-bold">Pilier S</span>
                      <span className="text-base font-black text-white">{rapport.pilierSocial.score}/35</span>
                      <span className="text-[9px] text-slate-500 block">{rapport.pilierSocial.pourcentage}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-purple-400 block font-bold">Pilier G</span>
                      <span className="text-base font-black text-white">{rapport.pilierGouvernance.score}/30</span>
                      <span className="text-[9px] text-slate-500 block">{rapport.pilierGouvernance.pourcentage}%</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
                  {rapport.syntheseInvestisseurs}
                </p>
              </div>

              {/* Détails Piliers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400">Environnement</span>
                    <span className="font-mono text-slate-300">{rapport.pilierEnvironnement.score}/35</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {rapport.pilierEnvironnement.pointsCles.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-blue-400">Social</span>
                    <span className="font-mono text-slate-300">{rapport.pilierSocial.score}/35</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {rapport.pilierSocial.pointsCles.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-purple-400">Gouvernance</span>
                    <span className="font-mono text-slate-300">{rapport.pilierGouvernance.score}/30</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {rapport.pilierGouvernance.pointsCles.map((pt, i) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommandations ESG */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Feuille de Route & Recommandations Investisseurs
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {rapport.recommandationsESG.map((rec, idx) => (
                    <li key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">👉</span>
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
