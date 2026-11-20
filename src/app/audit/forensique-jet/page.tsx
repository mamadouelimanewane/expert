"use client";

import { useState } from "react";
import Link from "next/link";
import {
  executerAuditForensiqueISA240,
  type EcritureGrandLivreJET,
  type RapportForensiqueISA240,
  type EcritureScoreeJET,
} from "@/lib/ohada/audit-forensique-jet";

const ECRITURES_DEMO: EcritureGrandLivreJET[] = [
  { id: "JNL-001", dateComptable: "2024-03-15", heureSaisie: "09:30", jourSemaine: 5, utilisateur: "amadou.sow", journalCode: "AC", compteDebit: "401100", compteCredit: "521000", libelle: "Fournisseur SODATEL — Facture 2024-089", montant_XOF: 3_500_000, hasPieceJustificative: true },
  { id: "JNL-002", dateComptable: "2024-12-31", heureSaisie: "23:47", jourSemaine: 2, utilisateur: "admin", journalCode: "OD", compteDebit: "658000", compteCredit: "401900", libelle: "Régularisation fin d'exercice", montant_XOF: 15_000_000, hasPieceJustificative: false },
  { id: "JNL-003", dateComptable: "2024-07-20", heureSaisie: "14:20", jourSemaine: 6, utilisateur: "fatou.diop", journalCode: "VT", compteDebit: "411000", compteCredit: "701000", libelle: "Vente client CORAF", montant_XOF: 7_990_000, hasPieceJustificative: true },
  { id: "JNL-004", dateComptable: "2024-05-10", heureSaisie: "11:00", jourSemaine: 5, utilisateur: "amadou.sow", journalCode: "BQ", compteDebit: "521000", compteCredit: "411200", libelle: "Encaissement client SAES", montant_XOF: 1_000_000, hasPieceJustificative: true },
  { id: "JNL-005", dateComptable: "2024-11-15", heureSaisie: "03:12", jourSemaine: 5, utilisateur: "admin", journalCode: "OD", compteDebit: "641000", compteCredit: "421000", libelle: "Régularisation salaire dirigeant", montant_XOF: 25_000_000, hasPieceJustificative: false },
];

const COULEUR_RISQUE: Record<string, string> = {
  CRITIQUE: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  ELEVE: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  MODERE: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  FAIBLE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
};

const BARRE_COULEUR: Record<string, string> = {
  CRITIQUE: "bg-rose-500",
  ELEVE: "bg-orange-500",
  MODERE: "bg-amber-500",
  FAIBLE: "bg-emerald-500",
};

export default function AuditForensiqueJETPage() {
  const [raisonSociale, setRaisonSociale] = useState("SOCIÉTÉ COMMERCIALE SAHEL SA");
  const [exercice, setExercice] = useState(2024);
  const [rapport, setRapport] = useState<RapportForensiqueISA240 | null>(() =>
    executerAuditForensiqueISA240("SOCIÉTÉ COMMERCIALE SAHEL SA", 2024, ECRITURES_DEMO)
  );
  const [ecritureSelectionnee, setEcritureSelectionnee] = useState<EcritureScoreeJET | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/audit/forensique-jet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ societeRaisonSociale: raisonSociale, exercice, ecritures: ECRITURES_DEMO }),
      });
      if (res.ok) setRapport(await res.json());
      else setRapport(executerAuditForensiqueISA240(raisonSociale, exercice, ECRITURES_DEMO));
    } catch {
      setRapport(executerAuditForensiqueISA240(raisonSociale, exercice, ECRITURES_DEMO));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-orange-400 font-semibold mb-1">
            <span>ISA 240</span><span>•</span><span>Journal Entry Testing (JET)</span><span>•</span><span>MindBridge Ai Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Forensique JET ISA 240</h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyse 100% du grand livre — Loi de Benford, horaires suspects, montants ronds, contournement contrôle interne
          </p>
        </div>
        <Link href="/audit/dossier-complet" className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
          ← Dossier CAC ISA 230
        </Link>
      </div>

      <form onSubmit={handleAnalyser} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
          <input type="text" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div className="w-28">
          <label className="text-xs text-slate-400 block mb-1">Exercice</label>
          <input type="number" value={exercice} onChange={(e) => setExercice(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-950/50">
          {loading ? "Analyse en cours..." : "Lancer l'audit JET"}
        </button>
      </form>

      {rapport && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total audités", val: rapport.totalEcrituresAuditees, color: "text-slate-200" },
              { label: "🔴 Critiques", val: rapport.nbEcrituresCritiques, color: "text-rose-400" },
              { label: "🟠 Élevés", val: rapport.nbEcrituresElevees, color: "text-orange-400" },
              { label: "🟡 Modérés", val: rapport.nbEcrituresModerees, color: "text-amber-400" },
              { label: "🟢 Faibles", val: rapport.nbEcrituresFaibles, color: "text-emerald-400" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</div>
                <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Distribution Benford */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Distribution de Benford — Premier Chiffre Significatif
            </h3>
            <div className="flex items-end gap-2 h-28">
              {rapport.distributionBenford.map((b) => (
                <div key={b.chiffre} className="flex flex-col items-center flex-1 gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "80px" }}>
                    <div
                      className="w-full bg-orange-500/60 rounded-t"
                      style={{ height: `${(b.frequenceObservee_pct / 35) * 100}%`, minHeight: "2px" }}
                      title={`Observé: ${b.frequenceObservee_pct.toFixed(1)}%`}
                    />
                    <div
                      className="w-full bg-slate-600/40 rounded-t border-t border-dashed border-slate-500"
                      style={{ height: `${(b.frequenceTheoriqueBenford_pct / 35) * 100}%`, minHeight: "2px" }}
                      title={`Théorique Benford: ${b.frequenceTheoriqueBenford_pct.toFixed(1)}%`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${b.anomalieDetectee ? "text-rose-400" : "text-slate-400"}`}>{b.chiffre}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-orange-500/60 rounded inline-block" />Observé</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-slate-600/40 border-t border-dashed border-slate-500 rounded inline-block" />Benford théorique</span>
            </div>
          </div>

          {/* Table + Détail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Écritures scorées ({rapport.ecrituresScorees.length})
              </h3>
              {rapport.ecrituresScorees.map((es) => (
                <button
                  key={es.ecriture.id}
                  type="button"
                  onClick={() => setEcritureSelectionnee(es)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    ecritureSelectionnee?.ecriture.id === es.ecriture.id
                      ? "border-orange-500/60 bg-orange-500/10"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-mono text-slate-400">{es.ecriture.id}</span>
                      <p className="text-sm font-medium text-white truncate">{es.ecriture.libelle}</p>
                      <span className="text-xs text-slate-500">{es.ecriture.dateComptable} · {es.ecriture.heureSaisie} · {es.ecriture.utilisateur}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">{es.ecriture.montant_XOF.toLocaleString("fr-FR")}</div>
                        <div className="text-[10px] text-slate-500">XOF</div>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border ${COULEUR_RISQUE[es.niveauRisque]}`}>
                        {es.scoreRisque}
                      </div>
                    </div>
                  </div>
                  {es.controlesDeclenches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {es.controlesDeclenches.slice(0, 3).map((c) => (
                        <span key={c.code} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">
                          {c.code.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Détail écriture sélectionnée */}
            <div className="lg:col-span-5">
              {ecritureSelectionnee ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-white">{ecritureSelectionnee.ecriture.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${COULEUR_RISQUE[ecritureSelectionnee.niveauRisque]}`}>
                      Score {ecritureSelectionnee.scoreRisque}/100 — {ecritureSelectionnee.niveauRisque}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      ["Libellé", ecritureSelectionnee.ecriture.libelle],
                      ["Journal", ecritureSelectionnee.ecriture.journalCode],
                      ["Débit / Crédit", `${ecritureSelectionnee.ecriture.compteDebit} / ${ecritureSelectionnee.ecriture.compteCredit}`],
                      ["Montant", `${ecritureSelectionnee.ecriture.montant_XOF.toLocaleString("fr-FR")} XOF`],
                      ["Saisie", `${ecritureSelectionnee.ecriture.dateComptable} à ${ecritureSelectionnee.ecriture.heureSaisie}`],
                      ["Utilisateur", ecritureSelectionnee.ecriture.utilisateur],
                      ["Pièce justificative", ecritureSelectionnee.ecriture.hasPieceJustificative ? "✓ Présente" : "⚠ Manquante"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-slate-400">{k}</span>
                        <span className={`font-medium text-right ${k === "Pièce justificative" && !ecritureSelectionnee.ecriture.hasPieceJustificative ? "text-amber-400" : "text-slate-200"}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Points de contrôle déclenchés</h4>
                    {ecritureSelectionnee.controlesDeclenches.length === 0 ? (
                      <p className="text-xs text-emerald-400">✓ Aucun contrôle déclenché</p>
                    ) : (
                      ecritureSelectionnee.controlesDeclenches.map((c) => (
                        <div key={c.code} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-orange-400">{c.code.replace(/_/g, " ")}</span>
                            <span className="text-[10px] text-slate-500">Poids +{c.poidsRisque}</span>
                          </div>
                          <p className="text-xs text-slate-300">{c.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 italic">
                    {ecritureSelectionnee.explicationForensique}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-xl p-10 text-center text-slate-500 text-sm">
                  Sélectionnez une écriture pour voir son détail forensique
                </div>
              )}
            </div>
          </div>

          {/* Synthèse ISA 240 */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">Synthèse Forensique ISA 240</h3>
            <p className="text-sm text-slate-300">{rapport.syntheseISA240}</p>
          </div>
        </>
      )}
    </div>
  );
}
