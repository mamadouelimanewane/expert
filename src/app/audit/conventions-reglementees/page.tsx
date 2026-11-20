"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type ConventionSaisie,
  type RapportSpecialCAC,
  genererRapportSpecialCAC,
} from "@/lib/ohada/conventions-reglementees-penal";

const DEFAULT_CONVENTIONS: ConventionSaisie[] = [
  {
    id: "conv-1",
    beneficiaireNom: "M. Ibrahima FALL",
    qualite: "ADMINISTRATEUR",
    personnePhysique: true,
    typeOperation: "BAIL_COMMERCIAL",
    montant_XOF: 18_000_000,
    soldeDebiteur: false,
    autorisationPrealableCA: true,
    conditionsArmLength: true,
    dateConvention: "2024-03-15",
    interetSocialAvéré: true,
    description: "Location d'un immeuble de bureaux à usage de siège social",
  },
  {
    id: "conv-2",
    beneficiaireNom: "M. Amadou SOW (Directeur Général)",
    qualite: "DIRECTEUR_GENERAL",
    personnePhysique: true,
    typeOperation: "COMPTE_COURANT_ASSOCIE",
    montant_XOF: 45_000_000,
    soldeDebiteur: true,
    autorisationPrealableCA: false,
    conditionsArmLength: false,
    dateConvention: "2024-06-30",
    interetSocialAvéré: false,
    description: "Avance de trésorerie personnelle sans intérêts ni convention",
  },
  {
    id: "conv-3",
    beneficiaireNom: "HOLDING SA (Actionnaire 25%)",
    qualite: "ACTIONNAIRE_SIGNIFICATIF",
    personnePhysique: false,
    typeOperation: "PRESTATION_HONORAIRES",
    montant_XOF: 25_000_000,
    soldeDebiteur: false,
    autorisationPrealableCA: false,
    conditionsArmLength: true,
    dateConvention: "2024-09-01",
    interetSocialAvéré: true,
    description: "Prestations d'assistance comptable et financière",
  },
];

export default function ConventionsReglementeesPage() {
  const [conventions, setConventions] = useState<ConventionSaisie[]>(DEFAULT_CONVENTIONS);
  const [raisonSociale, setRaisonSociale] = useState("SOCIÉTÉ INDUSTRIELLE SAHEL SA");
  const [exercice, setExercice] = useState(2024);
  const [rapport, setRapport] = useState<RapportSpecialCAC | null>(() =>
    genererRapportSpecialCAC("SOCIÉTÉ INDUSTRIELLE SAHEL SA", 2024, DEFAULT_CONVENTIONS)
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnostic" | "texte">("diagnostic");

  const handleAnalyser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/audit/conventions-reglementees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ societeRaisonSociale: raisonSociale, exercice, conventions }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(genererRapportSpecialCAC(raisonSociale, exercice, conventions));
      }
    } catch {
      setRapport(genererRapportSpecialCAC(raisonSociale, exercice, conventions));
    } finally {
      setLoading(false);
    }
  };

  const getAvisBadge = (avis: string) => {
    switch (avis) {
      case "FAVORABLE":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "FAVORABLE_AVEC_OBSERVATIONS":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-purple-400 font-semibold mb-1">
            <span>AUSCGIE Art. 438 à 450 & Art. 716</span>
            <span>•</span>
            <span>Droit Pénal des Affaires</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Conventions Réglementées & Risque Pénal Dirigeant
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Détection des comptes courants débiteurs illicites, abus de biens sociaux et génération du Rapport Spécial du Commissaire aux Comptes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/audit/dossier-complet"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Dossier CAC ISA 230
          </Link>
          <Link
            href="/audit/rapport-cac"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Rapports CAC (ISA 700) →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire & Liste des conventions */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAnalyser} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Paramètres du Mandat CAC
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale Société</label>
                <input
                  type="text"
                  value={raisonSociale}
                  onChange={(e) => setRaisonSociale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Exercice d'Audit</label>
                <input
                  type="number"
                  value={exercice}
                  onChange={(e) => setExercice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Audit en cours..." : "Générer le Rapport Spécial CAC"}
            </button>
          </form>

          {/* Liste des conventions saisies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Conventions Recensées ({conventions.length})
            </h3>
            {conventions.map((conv, idx) => (
              <div
                key={conv.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white block">{conv.beneficiaireNom}</span>
                    <span className="text-slate-400 text-[11px]">{conv.qualite} • {conv.typeOperation}</span>
                  </div>
                  <span className="font-mono font-bold text-purple-300">
                    {conv.montant_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
                <p className="text-slate-400">{conv.description}</p>
                <div className="flex gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className={conv.autorisationPrealableCA ? "text-emerald-400" : "text-amber-400"}>
                    {conv.autorisationPrealableCA ? "✓ Autorisé par CA" : "⚠ Non autorisé CA"}
                  </span>
                  {conv.soldeDebiteur && (
                    <span className="text-rose-400 font-bold">
                      ⚠ Compte courant débiteur (Interdit Art. 450)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard & Rapport Spécial */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Carte Statut & Décision */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Avis du Commissaire aux Comptes (CAC)
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={`text-2xl font-black ${
                          rapport.avisGeneralCAC === "FAVORABLE"
                            ? "text-emerald-400"
                            : rapport.avisGeneralCAC === "FAVORABLE_AVEC_OBSERVATIONS"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {rapport.avisGeneralCAC.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getAvisBadge(rapport.avisGeneralCAC)}`}>
                      {rapport.nombreConventionsInterdites > 0
                        ? `${rapport.nombreConventionsInterdites} infraction(s) d'ordre public détectée(s)`
                        : "Aucune infraction d'ordre public"}
                    </span>
                  </div>

                  <div className="flex gap-4 text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Autorisées</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {rapport.conventionsAutorisees.length}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Non autorisées</span>
                      <span className="text-xl font-bold text-amber-400">
                        {rapport.conventionsNonAutorisees.length}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Interdites</span>
                      <span className="text-xl font-bold text-rose-400">
                        {rapport.conventionsInterdites.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes Pénales Immédiates */}
              {rapport.alertesPenales.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <span>⚠ Alertes Juridiques & Responsabilité Pénale</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-300">
                    {rapport.alertesPenales.map((al, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{al}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Onglets navigation */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("diagnostic")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "diagnostic"
                      ? "border-purple-400 text-purple-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Diagnostic Juridique des Conventions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("texte")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "texte"
                      ? "border-purple-400 text-purple-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Texte Officiel du Rapport Spécial
                </button>
              </div>

              {activeTab === "diagnostic" && (
                <div className="space-y-4">
                  {conventions.map((c) => {
                    const item =
                      rapport.conventionsAutorisees.find((x) => x.convention.id === c.id) ||
                      rapport.conventionsNonAutorisees.find((x) => x.convention.id === c.id) ||
                      rapport.conventionsInterdites.find((x) => x.convention.id === c.id);
                    if (!item) return null;
                    return (
                      <div
                        key={c.id}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="font-bold text-white text-sm">{c.beneficiaireNom}</span>
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${
                              item.analyse.gravite === "CRITIQUE_PENALE"
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                : item.analyse.gravite === "ELEVEE_NULLITE"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                                : item.analyse.gravite === "MOYENNE"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            }`}
                          >
                            {item.analyse.typeInfraction}
                          </span>
                        </div>
                        <p className="text-slate-300">{item.analyse.constat}</p>
                        <div className="p-2.5 bg-slate-950 rounded-lg text-slate-400 space-y-1">
                          <p>
                            <strong className="text-slate-300">Base légale :</strong> {item.analyse.articleAUSCGIE}
                          </p>
                          <p>
                            <strong className="text-slate-300">Risque Dirigeant :</strong> {item.analyse.risqueDirigeant}
                          </p>
                          <p>
                            <strong className="text-slate-300">Obligation CAC :</strong>{" "}
                            <span className={item.analyse.obligationCAC === "REVELATION_PROCUREUR_ART716" ? "text-rose-400 font-bold" : "text-slate-300"}>
                              {item.analyse.obligationCAC}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "texte" && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-slate-200 text-sm">
                      Rapport Spécial du CAC (Prêt pour l'AGOA)
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(rapport.texteIntegralRapportSpecial)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                    >
                      Copier le texte
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                    {rapport.texteIntegralRapportSpecial}
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
