"use client";

import { useState } from "react";
import Link from "next/link";
import {
  executerAuditFiscalDefender,
  type LigneRisqueFiscal,
  type RapportFiscalDefender,
} from "@/lib/ohada/agent-fiscal-defender";

const LIGNES_DEMO: LigneRisqueFiscal[] = [
  {
    rubrique: "AMORTISSEMENT_VEHICULE_TOURISME",
    libelle: "Amortissement Range Rover excédent plafond 20M XOF",
    baseConcernee_XOF: 18_000_000,
    tauxImposition_pct: 25,
    tauxPenalite_pct: 25,
    justificationEntreprise: "Véhicule acquis pour les déplacements de direction en région",
  },
  {
    rubrique: "CHARGES_NON_JUSTIFIEES_ART8",
    libelle: "Frais de réception & cadeaux d'affaires sans factures normalisées",
    baseConcernee_XOF: 6_500_000,
    tauxImposition_pct: 25,
    tauxPenalite_pct: 25,
    justificationEntreprise: "Événements promotionnels et prospection nouveaux clients",
  },
  {
    rubrique: "RETENUE_SOURCE_PRESTATAIRE_ETRANGER",
    libelle: "Prestations informatiques et hébergement cloud payées en France sans BRS",
    baseConcernee_XOF: 14_000_000,
    tauxImposition_pct: 20,
    tauxPenalite_pct: 25,
    justificationEntreprise: "Abonnement ERP et serveurs cloud AWS",
  },
];

export default function AgentFiscalDefenderPage() {
  const [clientNom, setClientNom] = useState("SOCIÉTÉ COMMERCIALE DAKAROISE SAS");
  const [pays, setPays] = useState("Sénégal");
  const [exercice, setExercice] = useState(2024);
  const [lignes] = useState<LigneRisqueFiscal[]>(LIGNES_DEMO);
  const [rapport, setRapport] = useState<RapportFiscalDefender | null>(() => {
    return executerAuditFiscalDefender(
      "SOCIÉTÉ COMMERCIALE DAKAROISE SAS",
      "Sénégal",
      2024,
      LIGNES_DEMO
    );
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleAuditer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/fiscal-defender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientNom, pays, exercice, lignes }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(executerAuditFiscalDefender(clientNom, pays, exercice, lignes));
      }
    } catch {
      setRapport(executerAuditFiscalDefender(clientNom, pays, exercice, lignes));
    } finally {
      setLoading(false);
    }
  };

  const copierMemoire = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.memoireDefensePreventif);
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
            <Link
              href="/agents/orchestrateur"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              ← Hub Orchestrateur
            </Link>
            <span className="text-slate-600">|</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              AGENT FISCAL DEFENDER
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              AUDIT PRÉDICTIF DGID & UEMOA
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Bouclier Fiscal & Mémoire de Défense Préventif
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Évaluation prédictive des redressements fiscaux et génération de mémoires fondés sur le CGI OHADA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAuditer}
            disabled={loading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Audit en cours..." : "Lancer le scan DGID ⚡"}
          </button>
        </div>
      </div>

      {/* Cartes KPI Risque Fiscal */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Score de Sécurité Fiscale</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.scoreSecuriteFiscale_100 >= 80
                  ? "text-emerald-400"
                  : rapport.scoreSecuriteFiscale_100 >= 60
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.scoreSecuriteFiscale_100} / 100
            </p>
            <p className="text-xs text-slate-500 mt-1">CGI {rapport.pays}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Base Redressable Estimée</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {rapport.totalBaseRedressable_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">{rapport.lignesAnalysees.length} rubriques exposées</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Risque Fiscal Total (Droits + Pén.)</p>
            <p className="text-2xl font-bold text-rose-400 mt-2 font-mono">
              {rapport.risqueFiscalTotal_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-rose-500/80 mt-1">
              Dont {rapport.totalPenalites_XOF.toLocaleString("fr-FR")} XOF pénalités
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Provision Recommandée (Cpte 195)</p>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {rapport.provisionRecommandee_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">Prudence SYSCOHADA</p>
          </div>
        </div>
      )}

      {/* Matrice des Risques Fiscaux */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔍 Matrice d&apos;Audit Prédictif DGID</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Rubrique</th>
                  <th className="py-2.5 px-3">Degré de Risque</th>
                  <th className="py-2.5 px-3 text-right">Base Exposée (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Rappel Droits (XOF)</th>
                  <th className="py-2.5 px-3 text-right">Pénalités (XOF)</th>
                  <th className="py-2.5 px-3">Action Préventive Conseillée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {rapport.lignesAnalysees.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{l.libelle}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.degreRisque === "TRES_ELEVE"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : l.degreRisque === "ELEVE"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {l.degreRisque.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-white">
                      {l.baseRedressable_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                      {l.droitsSimples_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                      {l.penalitesEstimees_XOF.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs">{l.recommandationImmediata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mémoire de Défense Préventif */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📑 Mémoire en Défense Préventif Généré</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rédigé automatiquement selon les articles du CGI et la jurisprudence OHADA
              </p>
            </div>
            <button
              onClick={copierMemoire}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Mémoire copié !" : "Copier le texte du mémoire 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.memoireDefensePreventif}
          </pre>
        </div>
      )}

      {/* Fondements Légaux */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-white">⚖️ Référentiel Légal CGI & Jurisprudence</h2>
          <ul className="space-y-2">
            {rapport.argumentsJuridiquesCGI.map((arg, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{arg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
