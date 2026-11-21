"use client";

import { useState } from "react";
import Link from "next/link";
import {
  evaluerGageWarrantAgricole,
  type InputGageAgricole,
  type RapportGageAgricole,
} from "@/lib/ohada/gages-warrants-agricoles";

const INPUT_DEMO: InputGageAgricole = {
  societeEmprunteur: "SOCIÉTÉ COMMERCIALE DE CACAO SA",
  banquePreteuse: "BANQUE NATIONALE D'INVESTISSEMENT (BNI)",
  exercice: 2024,
  creditBancaireTire_XOF: 300_000_000,
  seuilLtvAlerte_pct: 80,
  prixSpotTonne_XOF: 2_500_000,
  lots: [
    {
      idLot: "LOT-01",
      speculation: "CACAO",
      entrepotNom: "Magasin Central San Pedro",
      localisation: "San Pedro, Côte d'Ivoire",
      quantite_tonnes: 120,
      qualiteGrade: "Grade 1 Export",
      numeroRecepisseEntrepot: "REC-SP-9921",
      nomTiersDetenteur: "SGS SURVEILLANCE CÔTE D'IVOIRE",
    },
    {
      idLot: "LOT-02",
      speculation: "CACAO",
      entrepotNom: "Magasin Vridi Port",
      localisation: "Abidjan, Côte d'Ivoire",
      quantite_tonnes: 80,
      qualiteGrade: "Grade 1 Export",
      numeroRecepisseEntrepot: "REC-VR-4412",
      nomTiersDetenteur: "SGS SURVEILLANCE CÔTE D'IVOIRE",
    },
  ],
};

export default function GagesWarrantsAgricolesPage() {
  const [input, setInput] = useState<InputGageAgricole>(INPUT_DEMO);
  const [tonnesMainlevee, setTonnesMainlevee] = useState<number>(40);
  const [rapport, setRapport] = useState<RapportGageAgricole | null>(() => {
    return evaluerGageWarrantAgricole(INPUT_DEMO, 40);
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fintech/warrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, tonnesPourMainlevee: tonnesMainlevee }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(evaluerGageWarrantAgricole(input, tonnesMainlevee));
      }
    } catch {
      setRapport(evaluerGageWarrantAgricole(input, tonnesMainlevee));
    } finally {
      setLoading(false);
    }
  };

  const copierCertificat = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.certificatTierceDetentionTexte);
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
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SMART COLLATERAL & WARRANTS
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              SÛRETÉS OHADA (ART. 92 À 117 AUS)
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Gages Agricoles & Warrants de Tierce Détention
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Supervision des stocks nantis, valorisation mark-to-market, ratios Loan-to-Value (LTV) et protocoles de mainlevée
          </p>
        </div>
      </div>

      {/* Formulaire de valorisation */}
      <form onSubmit={handleCalculer} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
          Paramètres du Financement de Campagne
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Crédit Bancaire Tiré (XOF)</label>
            <input
              type="number"
              value={input.creditBancaireTire_XOF}
              onChange={(e) => setInput({ ...input, creditBancaireTire_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prix Spot de la Tonne (XOF)</label>
            <input
              type="number"
              value={input.prixSpotTonne_XOF}
              onChange={(e) => setInput({ ...input, prixSpotTonne_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Seuil Alerte LTV (%)</label>
            <input
              type="number"
              value={input.seuilLtvAlerte_pct}
              onChange={(e) => setInput({ ...input, seuilLtvAlerte_pct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tonnes pour Mainlevée Export</label>
            <input
              type="number"
              value={tonnesMainlevee}
              onChange={(e) => setTonnesMainlevee(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Calcul en cours..." : "Actualiser la valorisation du collatéral ⚡"}
        </button>
      </form>

      {/* Cartes KPI */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Ratio Loan-to-Value (LTV)</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.ratioLTV_pct <= 65
                  ? "text-emerald-400"
                  : rapport.ratioLTV_pct <= rapport.seuilLtvAlerte_pct
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.ratioLTV_pct} %
            </p>
            <p className="text-xs text-slate-500 mt-1">Seuil contractuel : {rapport.seuilLtvAlerte_pct}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Statut de la Couverture</p>
            <p
              className={`text-lg font-bold mt-2 ${
                rapport.statutCouverture === "SURCOUVERTURE_CONFORTABLE"
                  ? "text-emerald-400"
                  : rapport.statutCouverture === "COUVERTURE_OPTIMALE"
                  ? "text-teal-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.statutCouverture.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-slate-500 mt-1">Conformité AUS OHADA</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Valeur Vénale Mark-to-Market</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {rapport.valeurTotaleStock_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">{rapport.totalQuantite_tonnes} tonnes nantis</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Appel de Marge Bancaire</p>
            <p
              className={`text-2xl font-bold mt-2 font-mono ${
                rapport.montantAppelDeMarge_XOF > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {rapport.montantAppelDeMarge_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {rapport.montantAppelDeMarge_XOF > 0 ? "Appel de trésorerie requis" : "Aucun appel requis"}
            </p>
          </div>
        </div>
      )}

      {/* Détail des Lots Nantis */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📦 Lots sous Récépissés d&apos;Entreposage & Tierce Détention</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Réf Lot</th>
                  <th className="py-2.5 px-3">Spéculation</th>
                  <th className="py-2.5 px-3 text-right">Tonnage</th>
                  <th className="py-2.5 px-3 text-right">Valeur Marchande (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Part Collatéral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {rapport.lotsAnalyse.map((l) => (
                  <tr key={l.idLot} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{l.idLot}</td>
                    <td className="py-2.5 px-3 font-sans text-amber-400 font-bold">{l.speculation}</td>
                    <td className="py-2.5 px-3 text-right text-white">{l.quantite_tonnes} T</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {l.valeurMarchande_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-400">{l.partDuCollatéral_pct} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulation de Mainlevée */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚢 Protocole de Mainlevée Partielle pour Exportation</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block font-sans">Tonnes Demandées :</span>
              <span className="text-base font-bold text-white">{rapport.simulationMainlevee.tonnesALiberer} Tonnes</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Remboursement de Crédit Requis :</span>
              <span className="text-base font-bold text-amber-400">
                {rapport.simulationMainlevee.remboursementCreditRequis_XOF.toLocaleString("fr-FR")} XOF
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Nouveau LTV Projeté :</span>
              <span className="text-base font-bold text-emerald-400">{rapport.simulationMainlevee.nouveauLTV_pct} %</span>
            </div>
          </div>
        </div>
      )}

      {/* Attestation Officielle */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📑 Attestation de Tierce Détention & Nantissement</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Conforme aux articles 92 à 117 de l&apos;Acte Uniforme OHADA sur les Sûretés
              </p>
            </div>
            <button
              onClick={copierCertificat}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Attestation copiée !" : "Copier l'attestation 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.certificatTierceDetentionTexte}
          </pre>
        </div>
      )}
    </div>
  );
}
