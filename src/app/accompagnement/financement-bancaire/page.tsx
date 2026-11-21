"use client";

import { useState } from "react";
import Link from "next/link";
import {
  evaluerDossierFinancementBancaire,
  type InputDossierFinancement,
  type RapportDossierFinancement,
  type TypeFinancementBancaire,
} from "@/lib/ohada/dossier-financement-bancaire";

const INPUT_DEMO: InputDossierFinancement = {
  societeRaisonSociale: "SOCIÉTÉ AGRO-INDUSTRIELLE DU SÉNÉGAL SA",
  formeJuridique: "SA",
  rccm: "SN.DKR.2020.B.4412",
  nineaOuIfu: "005432102V",
  secteurActivite: "Agro-Industrie & Conditionnement",
  anneeCreation: 2020,
  banqueSollicitee: "COMPAGNIE BANCAIRE DE L'AFRIQUE OCCIDENTALE (CBAO)",
  typeFinancement: "CREDIT_INVESTISSEMENT_CMT",
  montantDemande_XOF: 120_000_000,
  dureeMois: 36,
  tauxInteretAnnuel_pct: 8.5,
  differeAmortissementMois: 3,
  apportFondsPropres_XOF: 35_000_000,
  objetFinancementDetaille: "Acquisition et installation d'une unité automatisée de calibrage et d'emballage sous atmosphère protectrice",
  donneesFinancieres: {
    chiffreAffairesN_XOF: 850_000_000,
    chiffreAffairesN1_XOF: 720_000_000,
    ebeN_XOF: 165_000_000,
    resultatNetN_XOF: 78_000_000,
    capitauxPropresN_XOF: 290_000_000,
    dettesFinancieresActuelles_XOF: 45_000_000,
    tresorerieActuelle_XOF: 55_000_000,
    impotISN_XOF: 26_000_000,
  },
  garanties: [
    {
      typeGarantie: "NANTISSEMENT_MATERIEL_FINANCE",
      intitule: "Gage avec inscription au RCCM sur l'unité industrielle neuve",
      valeurEstimee_XOF: 155_000_000,
      tauxCouvertureEstime_pct: 100,
    },
    {
      typeGarantie: "GARANTIE_FONGIP_FAGACE_ARIZ",
      intitule: "Intervention Fonds de Garantie FONGIP (50% risque partagé)",
      valeurEstimee_XOF: 60_000_000,
      tauxCouvertureEstime_pct: 50,
    },
    {
      typeGarantie: "DELEGATION_ASSURANCE_HOMME_CLE",
      intitule: "Délégation d'assurance décès-invalidité sur la tête du DG",
      valeurEstimee_XOF: 120_000_000,
      tauxCouvertureEstime_pct: 100,
    },
  ],
};

export default function FinancementBancairePage() {
  const [input, setInput] = useState<InputDossierFinancement>(INPUT_DEMO);
  const [rapport, setRapport] = useState<RapportDossierFinancement | null>(() => {
    return evaluerDossierFinancementBancaire(INPUT_DEMO);
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/accompagnement/financement-bancaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(evaluerDossierFinancementBancaire(input));
      }
    } catch {
      setRapport(evaluerDossierFinancementBancaire(input));
    } finally {
      setLoading(false);
    }
  };

  const copierMemorandum = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.memorandumCreditBanque);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }
  };

  const getAvisBadge = (avis: string) => {
    if (avis === "AVIS_TRES_FAVORABLE") {
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
    }
    if (avis === "AVIS_FAVORABLE_SOUS_GARANTIES") {
      return "text-amber-400 bg-amber-500/20 border-amber-500/40";
    }
    return "text-rose-400 bg-rose-500/20 border-rose-500/40";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/accompagnement"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              ← Hub Accompagnement
            </Link>
            <span className="text-slate-600">|</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              DOSSIER DE FINANCEMENT BANCAIRE 360
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              STANDARDS COMITÉ DES CRÉDITS BCEAO
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Montage & Modélisation de Dossiers de Crédit Bancaire
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyse prudentielle de la capacité de remboursement (DSCR), structuration des garanties et mémorandum d&apos;information
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            🖨️ Imprimer le dossier
          </button>
        </div>
      </div>

      {/* Cartes KPI Ratios Bancaires */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Avis Comité des Crédits</p>
            <span
              className={`inline-block px-2.5 py-1 text-xs font-bold rounded border mt-2 ${getAvisBadge(
                rapport.ratios.avisComiteCredit
              )}`}
            >
              {rapport.ratios.avisComiteCredit.replace(/_/g, " ")}
            </span>
            <p className="text-xs text-slate-500 mt-2">Banque : {rapport.banqueSollicitee}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Ratio DSCR (Service Dette)</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.ratios.ratioDSCR >= 1.3
                  ? "text-emerald-400"
                  : rapport.ratios.ratioDSCR >= 1.15
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.ratios.ratioDSCR} x
            </p>
            <p className="text-xs text-slate-500 mt-1">Exigence minimale BCEAO : &gt;= 1.25x</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Mensualité Estimée</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {rapport.ratios.mensualiteConstante_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">Sur {rapport.dureeMois} mois d&apos;amortissement</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Couverture des Garanties</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.ratios.tauxCouvertureGaranties_pct >= 100 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {rapport.ratios.tauxCouvertureGaranties_pct} %
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Valeur : {rapport.ratios.valeurTotaleGaranties_XOF.toLocaleString("fr-FR")} XOF
            </p>
          </div>
        </div>
      )}

      {/* Formulaire de paramétrage du crédit */}
      <form onSubmit={handleCalculer} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
          Paramètres du Financement & Données Financières
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Raison Sociale Emprunteur</label>
            <input
              type="text"
              value={input.societeRaisonSociale}
              onChange={(e) => setInput({ ...input, societeRaisonSociale: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Banque Sollicitée</label>
            <input
              type="text"
              value={input.banqueSollicitee}
              onChange={(e) => setInput({ ...input, banqueSollicitee: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Type de Financement</label>
            <select
              value={input.typeFinancement}
              onChange={(e) => setInput({ ...input, typeFinancement: e.target.value as TypeFinancementBancaire })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="CREDIT_INVESTISSEMENT_CMT">Crédit d&apos;Investissement Moyen Terme (CMT)</option>
              <option value="CREDIT_CAMPAGNE_BFR">Crédit de Campagne & BFR</option>
              <option value="FACILITE_CAISSE_DECOUVERT">Facilité de Caisse / Découvert Autorisé</option>
              <option value="FINANCEMENT_MARCHE_PUBLIC_AVANCE">Financement de Marché Public / Bon de Commande</option>
              <option value="LEASING_CREDIT_BAIL">Crédit-Bail / Leasing Équipement</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Montant Sollicité (XOF)</label>
            <input
              type="number"
              value={input.montantDemande_XOF}
              onChange={(e) => setInput({ ...input, montantDemande_XOF: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Durée (Mois)</label>
            <input
              type="number"
              value={input.dureeMois}
              onChange={(e) => setInput({ ...input, dureeMois: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Taux d&apos;Intérêt Annuel (%)</label>
            <input
              type="number"
              step="0.1"
              value={input.tauxInteretAnnuel_pct}
              onChange={(e) => setInput({ ...input, tauxInteretAnnuel_pct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Apport Fonds Propres (XOF)</label>
            <input
              type="number"
              value={input.apportFondsPropres_XOF}
              onChange={(e) => setInput({ ...input, apportFondsPropres_XOF: Number(e.target.value) })}
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
          {loading ? "Calcul en cours..." : "Actualiser l'Analyse Bancaire ⚡"}
        </button>
      </form>

      {/* Points forts et vigilance */}
      {rapport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <span>✓ Points Forts pour le Comité de Crédit</span>
            </h2>
            <ul className="space-y-2">
              {rapport.ratios.pointsFortsDossier.map((pf, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pf}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <span>⚠️ Points de Vigilance & Mesures Prévues</span>
            </h2>
            {rapport.ratios.pointsVigilance.length > 0 ? (
              <ul className="space-y-2">
                {rapport.ratios.pointsVigilance.map((pv, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pv}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Aucun point de vigilance bloquant identifié.</p>
            )}
          </div>
        </div>
      )}

      {/* Échéancier d'Amortissement Prévisionnel */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📅 Échéancier d&apos;Amortissement Prévisionnel (6 Premières Échéances)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Mois</th>
                  <th className="py-2.5 px-3 text-right">Capital Début (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Mensualité (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Part Capital (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Part Intérêt (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Capital Fin (XOF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {rapport.tableauAmortissementAbrege.map((e) => (
                  <tr key={e.periodeMois} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">Mois {e.periodeMois}</td>
                    <td className="py-2.5 px-3 text-right">{e.capitalRestantDuDebut_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {e.mensualite_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-400">{e.partCapital_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{e.partInteret_XOF.toLocaleString("fr-FR")}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">
                      {e.capitalRestantDuFin_XOF.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checklist Réglementaire Bancaire */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📁 Checklist des 12 Pièces Justificatives Obligatoires</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rapport.checklistPieces.map((p) => (
              <div
                key={p.numero}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    [{p.categorie}]
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-0.5">{p.designation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mémorandum de Crédit Officiel */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📑 Mémorandum d&apos;Information de Crédit Institutionnel</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rapport de présentation officiel pour la Direction des Engagements & Comité des Crédits
              </p>
            </div>
            <button
              onClick={copierMemorandum}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Mémorandum copié !" : "Copier le Mémorandum 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.memorandumCreditBanque}
          </pre>
        </div>
      )}
    </div>
  );
}
