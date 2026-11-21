"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calculerCadrageTVA,
  comparerTVAUEMOA,
  getPaysList,
  type ResultatCadrageTVA,
  type ResultatComparaisonPays,
} from "@/lib/ohada/tva-uemoa-multi-pays";

export default function TvaUemoaPage() {
  const paysList = getPaysList();
  const [activeTab, setActiveTab] = useState<"cadrage" | "comparateur">("cadrage");

  // Inputs Cadrage
  const [pays, setPays] = useState("SN");
  const [caHT, setCaHT] = useState(250_000_000);
  const [tvaCollectee, setTvaCollectee] = useState(45_000_000);
  const [tvaDeductible, setTvaDeductible] = useState(28_000_000);
  const [resultatCadrage, setResultatCadrage] = useState<ResultatCadrageTVA | null>(() => {
    try {
      return calculerCadrageTVA("SN", 250_000_000, 45_000_000, 28_000_000);
    } catch {
      return null;
    }
  });

  // Inputs Comparateur
  const [caComparaison, setCaComparaison] = useState(500_000_000);
  const [resultatComparaison, setResultatComparaison] = useState<ResultatComparaisonPays[]>(() => {
    return comparerTVAUEMOA(500_000_000);
  });

  const [loading, setLoading] = useState(false);

  const handleCalculerCadrage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fiscalite/tva-uemoa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cadrage",
          pays,
          caHT_XOF: caHT,
          tvaCollectee_XOF: tvaCollectee,
          tvaDeductible_XOF: tvaDeductible,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResultatCadrage(data);
      } else {
        setResultatCadrage(calculerCadrageTVA(pays, caHT, tvaCollectee, tvaDeductible));
      }
    } catch {
      setResultatCadrage(calculerCadrageTVA(pays, caHT, tvaCollectee, tvaDeductible));
    } finally {
      setLoading(false);
    }
  };

  const handleCalculerComparaison = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fiscalite/tva-uemoa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comparer",
          caHT_XOF: caComparaison,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResultatComparaison(data.comparaison);
      } else {
        setResultatComparaison(comparerTVAUEMOA(caComparaison));
      }
    } catch {
      setResultatComparaison(comparerTVAUEMOA(caComparaison));
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
            <span>Directives UEMOA n°02/2009/CM</span>
            <span>•</span>
            <span>Fiscalité Indirecte Régionale</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Cadrage TVA UEMOA Multi-Pays & Régimes Spéciaux
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Contrôle de cohérence, détection des risques de redressement et benchmark comparatif des 8 États de l'Union
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite/cadrage-tva"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Cadrage TVA Standard
          </Link>
          <Link
            href="/fiscalite/comparateur-regional"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Comparateur IS/IMF →
          </Link>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("cadrage")}
          className={`px-5 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
            activeTab === "cadrage"
              ? "border-emerald-400 text-emerald-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🔍 Cadrage & Cohérence Déclarative
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("comparateur")}
          className={`px-5 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 ${
            activeTab === "comparateur"
              ? "border-emerald-400 text-emerald-400 bg-slate-900/60"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🌍 Benchmark TVA 8 Pays UEMOA
        </button>
      </div>

      {/* Onglet 1: Cadrage */}
      {activeTab === "cadrage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCalculerCadrage} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                Données de la Déclaration
              </h2>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Pays UEMOA d'établissement</label>
                <select
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  {paysList.map((p) => (
                    <option key={p.pays} value={p.pays}>
                      {p.nomPays} ({p.pays}) — Taux {p.tauxNormal_pct}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Chiffre d'Affaires HT (XOF)</label>
                <input
                  type="number"
                  value={caHT}
                  onChange={(e) => setCaHT(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">TVA Collectée (Ligne 443 / 444) (XOF)</label>
                <input
                  type="number"
                  value={tvaCollectee}
                  onChange={(e) => setTvaCollectee(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">TVA Déductible (Ligne 445) (XOF)</label>
                <input
                  type="number"
                  value={tvaDeductible}
                  onChange={(e) => setTvaDeductible(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 mt-4"
              >
                {loading ? "Calcul en cours..." : "Lancer le Cadrage TVA"}
              </button>
            </form>

            {resultatCadrage && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-2">
                  Particularités Légales — {resultatCadrage.regimePays.nomPays}
                </h3>
                <p className="text-slate-400 leading-relaxed">{resultatCadrage.regimePays.particularites}</p>
                <div className="pt-2 border-t border-slate-800/60 flex justify-between text-slate-400">
                  <span>Périodicité : {resultatCadrage.regimePays.periodiciteDeclaration}</span>
                  <span>Seuil assujettissement : {resultatCadrage.regimePays.seuilAssujettissement_XOF.toLocaleString("fr-FR")} XOF</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            {resultatCadrage && (
              <>
                {/* Cartes KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border ${
                    resultatCadrage.typePosition === "CREDIT_TVA"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    <span className="text-xs uppercase font-medium text-slate-400 block">Position TVA Nette</span>
                    <span className="text-2xl font-black mt-1 block">
                      {Math.abs(resultatCadrage.soldeTVA_XOF).toLocaleString("fr-FR")} XOF
                    </span>
                    <span className="text-[10px] font-semibold mt-1 inline-block uppercase">
                      {resultatCadrage.typePosition === "CREDIT_TVA" ? "Crédit reportable / remboursable" : "TVA à décaisser"}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-xs uppercase font-medium text-slate-400 block">Taux Effectif</span>
                    <span className="text-2xl font-black text-slate-100 mt-1 block">
                      {resultatCadrage.tauxEffectif_pct}%
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 inline-block">
                      Taux nominal : {resultatCadrage.regimePays.tauxNormal_pct}%
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-xs uppercase font-medium text-slate-400 block">Écart TVA Théorique</span>
                    <span className={`text-2xl font-black mt-1 block ${
                      Math.abs(resultatCadrage.ecartTvaTheorique_XOF) > 1_000_000 ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {resultatCadrage.ecartTvaTheorique_XOF > 0 ? "+" : ""}
                      {resultatCadrage.ecartTvaTheorique_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 inline-block">
                      Théorique : {resultatCadrage.tvaTheorique_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>

                {/* Alertes de conformité */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Contrôles de Conformité & Risques ({resultatCadrage.alerteConformite.length})
                  </h3>
                  {resultatCadrage.alerteConformite.length === 0 ? (
                    <p className="text-xs text-emerald-400">✓ Aucun écart ni anomalie de conformité identifiés.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {resultatCadrage.alerteConformite.map((al, idx) => (
                        <li key={idx} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-slate-300">
                          {al}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Détails du calcul */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                    Réconciliation des Lignes SYSCOHADA
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Chiffre d'Affaires HT Déclaré</span>
                      <span className="font-mono text-slate-200">{caHT.toLocaleString("fr-FR")} XOF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">TVA Collectée (Comptes 443 / 444)</span>
                      <span className="font-mono text-slate-200">{tvaCollectee.toLocaleString("fr-FR")} XOF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">TVA Déductible (Comptes 445)</span>
                      <span className="font-mono text-slate-200">{tvaDeductible.toLocaleString("fr-FR")} XOF</span>
                    </div>
                    <div className="flex justify-between py-1 font-bold text-sm pt-2">
                      <span className="text-white">Solde Net de TVA</span>
                      <span className={resultatCadrage.soldeTVA_XOF < 0 ? "text-blue-400" : "text-amber-400"}>
                        {resultatCadrage.soldeTVA_XOF.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Onglet 2: Comparateur */}
      {activeTab === "comparateur" && (
        <div className="space-y-6">
          <form onSubmit={handleCalculerComparaison} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="text-xs text-slate-400 block mb-1">Chiffre d'Affaires HT de Référence (XOF)</label>
              <input
                type="number"
                value={caComparaison}
                onChange={(e) => setCaComparaison(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50"
            >
              {loading ? "Calcul..." : "Mettre à jour le Benchmark"}
            </button>
          </form>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">État Membre</th>
                    <th className="p-3">Taux Normal</th>
                    <th className="p-3">Taux Réduit</th>
                    <th className="p-3">Seuil Assujettissement</th>
                    <th className="p-3">Périodicité</th>
                    <th className="p-3 text-right">TVA Théorique</th>
                    <th className="p-3 text-right">Delta vs Sénégal (SN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {resultatComparaison.map((r) => {
                    const deltaSN = r.economieVsPays["SN"] ?? 0;
                    return (
                      <tr key={r.pays} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-semibold text-white">
                          {r.nomPays} <span className="text-slate-500 font-mono text-[10px]">({r.pays})</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{r.tauxNormal_pct}%</td>
                        <td className="p-3 font-mono text-slate-400">{r.tauxReduit_pct ? `${r.tauxReduit_pct}%` : "—"}</td>
                        <td className="p-3 font-mono">{r.seuilAssujettissement_XOF.toLocaleString("fr-FR")} XOF</td>
                        <td className="p-3">{r.periodiciteDeclaration}</td>
                        <td className="p-3 font-mono font-bold text-right text-white">
                          {r.tvaTheorique_XOF.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className={`p-3 font-mono text-right font-semibold ${
                          deltaSN > 0 ? "text-emerald-400" : deltaSN < 0 ? "text-rose-400" : "text-slate-400"
                        }`}>
                          {deltaSN > 0 ? `+${deltaSN.toLocaleString("fr-FR")} XOF (Économie)` : deltaSN < 0 ? `${deltaSN.toLocaleString("fr-FR")} XOF (Surcoût)` : "Référence"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
