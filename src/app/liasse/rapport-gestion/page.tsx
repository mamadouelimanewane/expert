"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type InputRapportGestion,
  type RapportGestionComplet,
  genererRapportGestion,
} from "@/lib/ohada/rapport-de-gestion";

const DEFAULT_INPUT: InputRapportGestion = {
  entite: {
    raisonSociale: "SOCIÉTÉ COMMERCIALE D'AFRIQUE DE L'OUEST SA",
    formeJuridique: "SA",
    capitalSocial_XOF: 100_000_000,
    rccm: "SN-DKR-2020-B-12345",
    identifiantFiscal: "001234567 2G3",
    siegeSocial: "Dakar, Sénégal",
    exercice: 2024,
    dirigeant: {
      nom: "Mamadou DIOP",
      titre: "Directeur Général",
    },
  },
  soldesN: {
    chiffreAffaires_XOF: 1_200_000_000,
    valeurAjoutee_XOF: 400_000_000,
    ebe_XOF: 180_000_000,
    resultatExploitation_XOF: 120_000_000,
    resultatFinancier_XOF: -10_000_000,
    resultatHAO_XOF: 0,
    impotSocietes_XOF: 33_000_000,
    resultatNet_XOF: 77_000_000,
    tresorerieNette_XOF: 50_000_000,
  },
  soldesNMoins1: {
    chiffreAffaires_XOF: 1_000_000_000,
    valeurAjoutee_XOF: 350_000_000,
    ebe_XOF: 150_000_000,
    resultatExploitation_XOF: 100_000_000,
    resultatFinancier_XOF: -8_000_000,
    resultatHAO_XOF: 0,
    impotSocietes_XOF: 27_000_000,
    resultatNet_XOF: 65_000_000,
    tresorerieNette_XOF: 30_000_000,
  },
  affectation: {
    reportANouveauInitial_XOF: 15_000_000,
    dotationReservesStatutaires_XOF: 5_000_000,
    dividendesProposes_XOF: 40_000_000,
  },
};

export default function RapportGestionPage() {
  const [inputData, setInputData] = useState<InputRapportGestion>(DEFAULT_INPUT);
  const [rapport, setRapport] = useState<RapportGestionComplet | null>(() =>
    genererRapportGestion(DEFAULT_INPUT)
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"synthese" | "resolutions" | "texte">("synthese");

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/liasse/rapport-gestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererRapportGestion(inputData));
      }
    } catch {
      setRapport(genererRapportGestion(inputData));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            <span>AUSCGIE Art. 138-143</span>
            <span>•</span>
            <span>SYSCOHADA Révisé</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Rapport de Gestion & Plaquette AGOA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Générateur de rapport annuel, analyse des Soldes Intermédiaires de Gestion (SIG), et tableau d'affectation du résultat
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/liasse/bouclage"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Bouclage Liasse
          </Link>
          <Link
            href="/liasse/mapping"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Mapping Balance →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleCalculer} className="lg:col-span-5 space-y-6">
          {/* Identité */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Société & Exercice
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={inputData.entite.raisonSociale}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      entite: { ...inputData.entite, raisonSociale: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Forme</label>
                  <select
                    value={inputData.entite.formeJuridique}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        entite: {
                          ...inputData.entite,
                          formeJuridique: e.target.value as InputRapportGestion["entite"]["formeJuridique"],
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="SA">SA</option>
                    <option value="SAS">SAS</option>
                    <option value="SARL">SARL</option>
                    <option value="SNC">SNC</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Exercice</label>
                  <input
                    type="number"
                    value={inputData.entite.exercice}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        entite: { ...inputData.entite, exercice: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Capital (XOF)</label>
                  <input
                    type="number"
                    value={inputData.entite.capitalSocial_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        entite: { ...inputData.entite, capitalSocial_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dirigeant (Nom)</label>
                  <input
                    type="text"
                    value={inputData.entite.dirigeant.nom}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        entite: {
                          ...inputData.entite,
                          dirigeant: { ...inputData.entite.dirigeant, nom: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Qualité / Titre</label>
                  <input
                    type="text"
                    value={inputData.entite.dirigeant.titre}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        entite: {
                          ...inputData.entite,
                          dirigeant: { ...inputData.entite.dirigeant, titre: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Soldes N vs N-1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              Soldes de Gestion (N vs N-1)
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CA Exercice N (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesN.chiffreAffaires_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesN: { ...inputData.soldesN, chiffreAffaires_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CA N-1 (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesNMoins1.chiffreAffaires_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesNMoins1: {
                          ...inputData.soldesNMoins1,
                          chiffreAffaires_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">EBE Exercice N (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesN.ebe_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesN: { ...inputData.soldesN, ebe_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">EBE N-1 (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesNMoins1.ebe_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesNMoins1: {
                          ...inputData.soldesNMoins1,
                          ebe_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Résultat Net N (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesN.resultatNet_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesN: { ...inputData.soldesN, resultatNet_XOF: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Résultat Net N-1 (XOF)</label>
                  <input
                    type="number"
                    value={inputData.soldesNMoins1.resultatNet_XOF}
                    onChange={(e) =>
                      setInputData({
                        ...inputData,
                        soldesNMoins1: {
                          ...inputData.soldesNMoins1,
                          resultatNet_XOF: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Proposition d'affectation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
              Proposition d'Affectation du Résultat
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Report N-1 (XOF)</label>
                <input
                  type="number"
                  value={inputData.affectation.reportANouveauInitial_XOF}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      affectation: {
                        ...inputData.affectation,
                        reportANouveauInitial_XOF: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Réserves Stat. (XOF)</label>
                <input
                  type="number"
                  value={inputData.affectation.dotationReservesStatutaires_XOF}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      affectation: {
                        ...inputData.affectation,
                        dotationReservesStatutaires_XOF: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Dividendes (XOF)</label>
                <input
                  type="number"
                  value={inputData.affectation.dividendesProposes_XOF}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      affectation: {
                        ...inputData.affectation,
                        dividendesProposes_XOF: Number(e.target.value),
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
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Génération..." : "Générer Rapport de Gestion & Résolutions AGOA"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Onglets de navigation */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("synthese")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "synthese"
                      ? "border-cyan-400 text-cyan-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Indicateurs & Affectation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("resolutions")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "resolutions"
                      ? "border-cyan-400 text-cyan-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Projets de Résolutions AGOA
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("texte")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "texte"
                      ? "border-cyan-400 text-cyan-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Texte Intégral Imprimable
                </button>
              </div>

              {activeTab === "synthese" && (
                <div className="space-y-6">
                  {/* KPIs Clés */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Croissance CA</span>
                      <span
                        className={`text-xl font-bold ${
                          rapport.analyseSIG.croissanceCA_pct >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {rapport.analyseSIG.croissanceCA_pct >= 0 ? "+" : ""}
                        {rapport.analyseSIG.croissanceCA_pct}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Marge d'EBE</span>
                      <span className="text-xl font-bold text-cyan-400">
                        {rapport.analyseSIG.margeEBE_pct}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Marge Nette</span>
                      <span className="text-xl font-bold text-white">
                        {rapport.analyseSIG.margeNette_pct}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Évol. Résultat Net</span>
                      <span
                        className={`text-xl font-bold ${
                          rapport.analyseSIG.evolutionResultatNet_pct >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {rapport.analyseSIG.evolutionResultatNet_pct >= 0 ? "+" : ""}
                        {rapport.analyseSIG.evolutionResultatNet_pct}%
                      </span>
                    </div>
                  </div>

                  {/* Tableau Officiel d'Affectation du Résultat */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-semibold text-slate-200 text-sm">
                        Tableau d'Affectation du Résultat (Art. 143-146 AUSCGIE)
                      </h3>
                      <span className="text-xs text-cyan-400 font-medium">
                        Taux distribution : {rapport.tableauAffectation.tauxDistribution_pct}%
                      </span>
                    </div>
                    <div className="divide-y divide-slate-800/60 text-xs">
                      <div className="flex justify-between py-2">
                        <span className="text-slate-300">Bénéfice net de l'exercice (A)</span>
                        <span className="font-bold text-white">
                          {rapport.tableauAffectation.beneficeNetExercice_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Report à nouveau antérieur créditeur (B)</span>
                        <span className="font-medium text-slate-300">
                          {rapport.tableauAffectation.reportANouveauAnterieur_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-slate-950/60 px-2 rounded">
                        <span className="font-semibold text-cyan-400">Bénéfice Distribuable (A + B)</span>
                        <span className="font-bold text-cyan-400">
                          {rapport.tableauAffectation.beneficeDistribuable_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">
                          Dotation Réserve Légale (10% - Plafond 20% capital)
                        </span>
                        <span className="font-semibold text-amber-400">
                          - {rapport.tableauAffectation.reserveLegale_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Dotation Réserves Statutaires</span>
                        <span className="font-medium text-slate-300">
                          - {rapport.tableauAffectation.reserveStatutaire_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Dividendes distribués aux actionnaires</span>
                        <span className="font-semibold text-emerald-400">
                          - {rapport.tableauAffectation.dividendes_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                      <div className="flex justify-between py-2.5 bg-emerald-500/10 px-2 rounded border border-emerald-500/20">
                        <span className="font-bold text-emerald-400">Nouveau Report à Nouveau</span>
                        <span className="font-extrabold text-emerald-400">
                          {rapport.tableauAffectation.nouveauReportANouveau_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "resolutions" && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-3">
                    Projets de Résolutions Soumises au Vote de l'AGOA
                  </h3>
                  <div className="space-y-3">
                    {rapport.resolutionsProposees.map((res, i) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-xs font-semibold text-cyan-400 uppercase">
                          Résolution {i + 1}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{res}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "texte" && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-slate-200 text-sm">
                      Texte Intégral du Rapport de Gestion
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(rapport.texteIntegralRapport)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition"
                    >
                      Copier le texte
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                    {rapport.texteIntegralRapport}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
