"use client";

import { useState } from "react";
import Link from "next/link";
import {
  simulerArbitrageZLECAf,
  type InputArbitrageZLECAf,
  type RapportArbitrageZLECAf,
  type CorridorLogistique,
} from "@/lib/ohada/zlecaf-arbitrage-douanier";

const INPUT_DEMO: InputArbitrageZLECAf = {
  produitDesignation: "Huile de palme raffinée conditionnée",
  codeSH6: "151190",
  paysOrigine: "Côte d'Ivoire",
  paysDestination: "Mali",
  corridor: "ABIDJAN_OUAGADOUGOU",
  valeurDepartUsine_XOF: 50_000_000,
  valeurMatieresImporteesHorsZone_XOF: 15_000_000,
  droitDouaneStandard_pct: 20,
  tauxDroitZLECAf_pct: 0,
  volumeMarchandise_tonnes: 45,
  fraisTransportEstimes_XOF: 5_000_000,
};

export default function ZlecafArbitragePage() {
  const [input, setInput] = useState<InputArbitrageZLECAf>(INPUT_DEMO);
  const [rapport, setRapport] = useState<RapportArbitrageZLECAf | null>(() => {
    return simulerArbitrageZLECAf(INPUT_DEMO);
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleSimuler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/douanes/zlecaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(simulerArbitrageZLECAf(input));
      }
    } catch {
      setRapport(simulerArbitrageZLECAf(input));
    } finally {
      setLoading(false);
    }
  };

  const copierCertificat = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.certificatOrigineRecommande.declarationOrigineTexte);
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
              ZLECAF / AFCFTA OPTIMIZER
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              RÈGLES D&apos;ORIGINE & CORRIDORS
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Moteur ZLECAf & Arbitrage Douanier Intra-Africain
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Calcul de la valeur ajoutée locale (Règle des 35%), démantèlement tarifaire et certificat d&apos;origine dématérialisé
          </p>
        </div>
      </div>

      {/* Formulaire de simulation */}
      <form onSubmit={handleSimuler} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
          Paramètres de l&apos;Expédition & Intrants Industriels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Désignation Marchandise</label>
            <input
              type="text"
              value={input.produitDesignation}
              onChange={(e) => setInput({ ...input, produitDesignation: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Code SH6</label>
            <input
              type="text"
              value={input.codeSH6}
              onChange={(e) => setInput({ ...input, codeSH6: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Corridor Logistique</label>
            <select
              value={input.corridor}
              onChange={(e) => setInput({ ...input, corridor: e.target.value as CorridorLogistique })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ABIDJAN_OUAGADOUGOU">Abidjan ➔ Ouagadougou (CI ➔ BF)</option>
              <option value="DAKAR_BAMAKO">Dakar ➔ Bamako (SN ➔ ML)</option>
              <option value="DOUALA_NDJAMENA">Douala ➔ N&apos;Djamena (CM ➔ TD)</option>
              <option value="COTONOU_NIAMEY">Cotonou ➔ Niamey (BJ ➔ NE)</option>
              <option value="LOME_OUAGADOUGOU">Lomé ➔ Ouagadougou (TG ➔ BF)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Prix Départ Usine (XOF)</label>
            <input
              type="number"
              value={input.valeurDepartUsine_XOF}
              onChange={(e) => setInput({ ...input, valeurDepartUsine_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Intrants Hors-Zone Afrique (XOF)</label>
            <input
              type="number"
              value={input.valeurMatieresImporteesHorsZone_XOF}
              onChange={(e) => setInput({ ...input, valeurMatieresImporteesHorsZone_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Droit Douane Standard TEC (%)</label>
            <input
              type="number"
              value={input.droitDouaneStandard_pct}
              onChange={(e) => setInput({ ...input, droitDouaneStandard_pct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Frais Transport Estimés (XOF)</label>
            <input
              type="number"
              value={input.fraisTransportEstimes_XOF}
              onChange={(e) => setInput({ ...input, fraisTransportEstimes_XOF: Number(e.target.value) })}
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
          {loading ? "Calcul en cours..." : "Simuler l'arbitrage ZLECAf ⚡"}
        </button>
      </form>

      {/* Cartes KPI ZLECAf */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Valeur Ajoutée Locale</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.regleOrigine.estEligibleZLECAf ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {rapport.regleOrigine.tauxValeurAjouteeLocale_pct} %
            </p>
            <p className="text-xs text-slate-500 mt-1">Seuil minimum exigé : {rapport.regleOrigine.seuilExigeZLECAf_pct}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Statut d&apos;Éligibilité RDO</p>
            <p
              className={`text-xl font-bold mt-2 ${
                rapport.regleOrigine.estEligibleZLECAf ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {rapport.regleOrigine.estEligibleZLECAf ? "✓ ORIGINE ZLECAf VALIDÉE" : "✗ RÉGIME DROIT COMMUN"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Annexe 2 Règles d&apos;Origine</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Économie Douanière Nette</p>
            <p className="text-2xl font-bold text-cyan-400 mt-2 font-mono">
              {rapport.comparatif.economieDouaniereNette_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">Par expédition commerciale</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Gain Fiscal Global</p>
            <p className="text-3xl font-extrabold text-violet-400 mt-2">{rapport.comparatif.tauxGainFiscal_pct} %</p>
            <p className="text-xs text-slate-500 mt-1">Abattement droits de douane</p>
          </div>
        </div>
      )}

      {/* Tableau comparatif Fiscalité */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊 Comparatif Douanier : TEC Standard vs Préférentiel ZLECAf</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Poste Fiscal</th>
                  <th className="py-2.5 px-3 text-right">Régime Général TEC (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Régime Préférentiel ZLECAf (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Différentiel / Économie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans text-white">Droits de douane (DD)</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">
                    {rapport.comparatif.montantDroitStandard_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    {rapport.comparatif.montantDroitZLECAf_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                    -{rapport.comparatif.economieDouaniereNette_XOF.toLocaleString("fr-FR")} XOF
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans text-white">Prélèvements Communautaires & Stat. (1.5%)</td>
                  <td className="py-2.5 px-3 text-right">
                    {rapport.comparatif.prelevementsStatistiquesEtComm_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {rapport.comparatif.prelevementsStatistiquesEtComm_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">0 XOF</td>
                </tr>
                <tr className="bg-slate-950/80 font-bold">
                  <td className="py-3 px-3 font-sans text-white">TOTAL FISCALITÉ ENTRÉE EN DOUANE</td>
                  <td className="py-3 px-3 text-right text-rose-400">
                    {rapport.comparatif.totalFiscaliteStandard_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    {rapport.comparatif.totalFiscaliteZLECAf_XOF.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    -{rapport.comparatif.economieDouaniereNette_XOF.toLocaleString("fr-FR")} XOF ({rapport.comparatif.tauxGainFiscal_pct}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificat d'Origine Dématérialisé */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📜 Certificat d&apos;Origine Dématérialisé ZLECAf</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Réf : {rapport.certificatOrigineRecommande.numeroCertificatProvisoire} | Autorité : {rapport.certificatOrigineRecommande.autoriteCompetente}
              </p>
            </div>
            <button
              onClick={copierCertificat}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Déclaration copiée !" : "Copier la déclaration officielle 📋"}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs leading-relaxed text-slate-300">
            {rapport.certificatOrigineRecommande.declarationOrigineTexte}
          </div>
        </div>
      )}

      {/* Recommandations Corridor Logistique */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-white">🚛 Recommandations sur le {rapport.corridorNom}</h2>
          <ul className="space-y-2">
            {rapport.recommandationsCorridor.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
