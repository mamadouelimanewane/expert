"use client";

import { useState } from "react";
import Link from "next/link";
import {
  genererModeleFinancierImpact,
  type InputModelisationImpact,
  type RapportModelisationImpact,
} from "@/lib/ohada/modelisation-fonds-impact";

const INPUT_DEMO: InputModelisationImpact = {
  projetNom: "BIO-AGRO TRANSFORMATION DU SAHEL SA",
  secteur: "Agroalimentaire & Énergie Verte",
  paysImplantation: "Sénégal",
  chiffreAffairesAn1_XOF: 500_000_000,
  tauxCroissanceAnnuel_pct: 15,
  margeEbe_pct: 22,
  besoinFinancementTotal_XOF: 400_000_000,
  partFondsPropresApportee_pct: 30,
  tauxEmpruntBancaire_pct: 8.5,
  tauxImpotIS_pct: 25,
  spreadRisquePays_bps: 500,
  impactMetriques: {
    emploisDirectsPrevus: 150,
    partFemmes_pct: 45,
    producteursLocauxSoutenus: 350,
    tonnesCO2EviteesAn: 1200,
  },
};

export default function FondsImpactPage() {
  const [input, setInput] = useState<InputModelisationImpact>(INPUT_DEMO);
  const [rapport, setRapport] = useState<RapportModelisationImpact | null>(() => {
    return genererModeleFinancierImpact(INPUT_DEMO);
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/strategy/fonds-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererModeleFinancierImpact(input));
      }
    } catch {
      setRapport(genererModeleFinancierImpact(input));
    } finally {
      setLoading(false);
    }
  };

  const copierTeaser = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.teaserInvestisseurTexte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FONDS D&apos;IMPACT & BAILLEURS
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              BAD • PROPARCO • BOAD • BIDC • SFI
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Modélisation Financière & Levée de Fonds d&apos;Impact
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Calcul du WACC Pays OHADA avec spread souverain, DCF sur 5 ans, TRI et métriques d&apos;impact ODD
          </p>
        </div>
      </div>

      {/* Formulaire des hypothèses financières */}
      <form onSubmit={handleCalculer} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
          Hypothèses d&apos;Exploitation & Financement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nom du Projet / Entreprise</label>
            <input
              type="text"
              value={input.projetNom}
              onChange={(e) => setInput({ ...input, projetNom: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Secteur d&apos;Activité</label>
            <input
              type="text"
              value={input.secteur}
              onChange={(e) => setInput({ ...input, secteur: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Pays d&apos;Implantation</label>
            <input
              type="text"
              value={input.paysImplantation}
              onChange={(e) => setInput({ ...input, paysImplantation: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">CA Année 1 (XOF)</label>
            <input
              type="number"
              value={input.chiffreAffairesAn1_XOF}
              onChange={(e) => setInput({ ...input, chiffreAffairesAn1_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Croissance Annuelle (%)</label>
            <input
              type="number"
              value={input.tauxCroissanceAnnuel_pct}
              onChange={(e) => setInput({ ...input, tauxCroissanceAnnuel_pct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Marge EBE (%)</label>
            <input
              type="number"
              value={input.margeEbe_pct}
              onChange={(e) => setInput({ ...input, margeEbe_pct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Besoin Financement Total (XOF)</label>
            <input
              type="number"
              value={input.besoinFinancementTotal_XOF}
              onChange={(e) => setInput({ ...input, besoinFinancementTotal_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Modélisation en cours..." : "Générer le modèle financier DCF ⚡"}
        </button>
      </form>

      {/* Cartes KPI Investisseurs */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">WACC Pays OHADA</p>
            <p className="text-3xl font-extrabold text-cyan-400 mt-2">{rapport.parametresWACC.waccFinal_pct} %</p>
            <p className="text-xs text-slate-500 mt-1">Spread pays : +{rapport.parametresWACC.spreadSouverainPays_pct}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Valeur d&apos;Entreprise DCF</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {rapport.valorisationDCF.valeurEntrepriseDCF_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Fonds propres : {rapport.valorisationDCF.valeurFondsPropres_XOF.toLocaleString("fr-FR")} XOF
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Taux de Rentabilité Interne (TRI)</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">
              {rapport.indicateursInvestisseurs.triEstimeProjet_pct} %
            </p>
            <p className="text-xs text-slate-500 mt-1">Multiple : {rapport.indicateursInvestisseurs.multipleInvestissementMoIC}x</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Score Impact Bailleurs</p>
            <p className="text-3xl font-extrabold text-violet-400 mt-2">{rapport.scoreImpactBailleurs_100} / 100</p>
            <p className="text-xs text-slate-500 mt-1">ODD & critères concessionnels</p>
          </div>
        </div>
      )}

      {/* Projections Financières sur 5 Ans */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📈 Projections Financières sur 5 Ans (Modèle 3-Statements)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Année</th>
                  <th className="py-2.5 px-3 text-right">Chiffre d&apos;Affaires (XOF)</th>
                  <th className="py-2.5 px-3 text-right">EBE / EBITDA (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Résultat Net (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Flux Trésorerie (FCFF)</th>
                  <th className="py-2.5 px-3 text-right">Flux Actualisé DCF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {rapport.projections5Ans.map((p) => (
                  <tr key={p.annee} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">Année {p.annee}</td>
                    <td className="py-2.5 px-3 text-right text-white">{p.chiffreAffaires_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-cyan-400">{p.ebe_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{p.resultatNet_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">
                      {p.fluxTresorerieLibreFCFF_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-violet-400 font-bold">
                      {p.fluxActualise_XOF.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teaser Investisseur Officiel */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📑 Executive Teaser d&apos;Investissement</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prêt pour soumission aux comités de crédit BAD, Proparco, BOAD et BIDC
              </p>
            </div>
            <button
              onClick={copierTeaser}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Teaser copié !" : "Copier le Teaser d'Investissement 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.teaserInvestisseurTexte}
          </pre>
        </div>
      )}
    </div>
  );
}
