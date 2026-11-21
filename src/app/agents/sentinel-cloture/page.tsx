"use client";

import { useState } from "react";
import Link from "next/link";
import {
  executerAuditSentinelCloture,
  type CompteBalanceCloture,
  type RapportSentinelCloture,
} from "@/lib/ohada/agent-sentinel-cloture";

const BALANCE_DEMO: CompteBalanceCloture[] = [
  { compte: "101000", libelle: "Capital social", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 150_000_000 },
  { compte: "162000", libelle: "Emprunts bancaires", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 45_000_000 },
  { compte: "241100", libelle: "Matériel industriel & outillage", soldeDebiteur_XOF: 95_000_000, soldeCrediteur_XOF: 0 },
  { compte: "401100", libelle: "Fournisseur SODATEL (Créditeur standard)", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 18_000_000 },
  { compte: "401250", libelle: "Fournisseur TOTAL Énergies (Avoir non imputé débiteur)", soldeDebiteur_XOF: 3_500_000, soldeCrediteur_XOF: 0 },
  { compte: "411100", libelle: "Client KOUAME & Frères (Créance standard)", soldeDebiteur_XOF: 42_000_000, soldeCrediteur_XOF: 0 },
  { compte: "411420", libelle: "Client SENEGAL DISTRIBUTION (Acompte reçu créditeur)", soldeDebiteur_XOF: 0, soldeCrediteur_XOF: 5_500_000 },
  { compte: "471200", libelle: "Compte d'attente virement non identifié", soldeDebiteur_XOF: 1_200_000, soldeCrediteur_XOF: 0 },
  { compte: "521100", libelle: "Banque CBAO Compte Courant", soldeDebiteur_XOF: 76_800_000, soldeCrediteur_XOF: 0 },
];

export default function AgentSentinelCloturePage() {
  const [clientNom, setClientNom] = useState("AFRIQUE TRANSIT LOGISTIQUE SA");
  const [exercice, setExercice] = useState(2024);
  const [comptes] = useState<CompteBalanceCloture[]>(BALANCE_DEMO);
  const [rapport, setRapport] = useState<RapportSentinelCloture | null>(() => {
    return executerAuditSentinelCloture("AFRIQUE TRANSIT LOGISTIQUE SA", 2024, BALANCE_DEMO);
  });
  const [loading, setLoading] = useState(false);
  const [odValidees, setOdValidees] = useState<Record<string, boolean>>({});

  const handleAuditer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/sentinel-cloture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientNom, exercice, comptes }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(executerAuditSentinelCloture(clientNom, exercice, comptes));
      }
    } catch {
      setRapport(executerAuditSentinelCloture(clientNom, exercice, comptes));
    } finally {
      setLoading(false);
    }
  };

  const toggleValiderOD = (idEcriture: string) => {
    setOdValidees((prev) => ({
      ...prev,
      [idEcriture]: !prev[idEcriture],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête avec retour */}
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
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AGENT SENTINEL CLÔTURE
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              CASEWARE & FLOQAST STANDARDS
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Surveillance & Audit Autonome de Clôture
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Détection automatique des anomalies de balance, régularisation des comptes de tiers et génération d&apos;OD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAuditer}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Audit en cours..." : "Relancer l'audit complet ⚡"}
          </button>
        </div>
      </div>

      {/* Métriques Clôture */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Score d&apos;Intégrité Clôture</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.scoreIntegrite_100 >= 80
                  ? "text-emerald-400"
                  : rapport.scoreIntegrite_100 >= 50
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.scoreIntegrite_100} / 100
            </p>
            <p className="text-xs text-slate-500 mt-1">Conformité SYSCOHADA</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Statut de la Clôture</p>
            <p
              className={`text-xl font-bold mt-2 ${
                rapport.statutCloture === "CONFORME_POUR_LIASSE"
                  ? "text-emerald-400"
                  : rapport.statutCloture === "AJUSTEMENTS_REQUIS"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.statutCloture.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-slate-500 mt-1">Exercice {rapport.exercice}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Anomalies Détectées</p>
            <p className="text-3xl font-extrabold text-white mt-2">
              {rapport.totalAnomalies}{" "}
              <span className="text-xs font-normal text-rose-400">
                ({rapport.anomaliesBloquantes} bloquante(s))
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Nécessitent action</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">OD Proposées</p>
            <p className="text-3xl font-extrabold text-violet-400 mt-2">{rapport.ecrituresRegularisation.length}</p>
            <p className="text-xs text-slate-500 mt-1">Générées automatiquement</p>
          </div>
        </div>
      )}

      {/* Anomalies Détectées */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🚨 Anomalies & Points d&apos;Audit Détectés</span>
          </h2>

          <div className="space-y-3">
            {rapport.anomalies.map((anom) => (
              <div
                key={anom.code}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        anom.gravite === "BLOQUANTE"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {anom.gravite}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Compte : {anom.compteConcerne}</span>
                    <h3 className="text-sm font-bold text-white">{anom.intitule}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{anom.explication}</p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-xs text-slate-400 block">Montant en cause</span>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {anom.montantAnomalie_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Écritures d'Ajustement d'OD de Clôture */}
      {rapport && rapport.ecrituresRegularisation.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✍️ Écritures d&apos;OD de Régularisation Proposées par Sentinel</span>
            </h2>
            <span className="text-xs text-slate-400">Prêtes pour injection comptable</span>
          </div>

          <div className="space-y-4">
            {rapport.ecrituresRegularisation.map((od) => (
              <div
                key={od.idEcriture}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{od.idEcriture}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{od.libelleEcriture}</h4>
                  </div>
                  <button
                    onClick={() => toggleValiderOD(od.idEcriture)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      odValidees[od.idEcriture]
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {odValidees[od.idEcriture] ? "✓ Validée pour le Grand Livre" : "Valider l'écriture"}
                  </button>
                </div>

                {/* Tableau des lignes d'écriture */}
                <table className="w-full text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3 text-left">Compte SYSCOHADA</th>
                      <th className="py-2 px-3 text-left">Intitulé</th>
                      <th className="py-2 px-3 text-right">Débit (XOF)</th>
                      <th className="py-2 px-3 text-right">Crédit (XOF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {od.lignes.map((l, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-bold text-cyan-400">{l.compte}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{l.intituleCompte}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">
                          {l.debit_XOF > 0 ? l.debit_XOF.toLocaleString("fr-FR") : "-"}
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400">
                          {l.credit_XOF > 0 ? l.credit_XOF.toLocaleString("fr-FR") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="font-semibold text-slate-300">Fondement légal :</span> {od.justificationSYSCOHADA}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthèse & Recommandations */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-white">📋 Recommandations Clôture Sentinel</h2>
          <ul className="space-y-2">
            {rapport.syntheseRecommandations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
