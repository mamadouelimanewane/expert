"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type EntiteDeclarantePT,
  type DossierLocalFilePT,
  genererDossierLocalFilePT,
} from "@/lib/ohada/local-file-prix-transfert";

const DEFAULT_ENTITE: EntiteDeclarantePT = {
  raisonSociale: "MULTINATIONALE LOGISTIQUE SÉNÉGAL SA",
  ninea_niu: "009876543 2R1",
  pays: "SN",
  exercice: 2024,
  chiffreAffaires_XOF: 2_000_000_000,
  fraisGeneraux_XOF: 400_000_000,
  tauxBceaoReference_pct: 5.5,
  transactions: [
    {
      id: "pt-1",
      entiteLieeNom: "GROUPE HOLDING FRANCE SAS",
      paysResidenceLiee: "FR",
      lienCapital_pct: 100,
      natureFlux: "MANAGEMENT_FEES",
      montantAnnuel_XOF: 70_000_000,
      methodeRetenue: "COUT_MAJORE",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: true,
    },
    {
      id: "pt-2",
      entiteLieeNom: "GROUPE FINANCE LUXEMBOURG SA",
      paysResidenceLiee: "LU",
      lienCapital_pct: 100,
      natureFlux: "PRET_INTRAGROUPE",
      montantAnnuel_XOF: 500_000_000,
      tauxInteretApplique_pct: 11.5,
      methodeRetenue: "PRIX_COMPARABLE_CUP",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: true,
    },
    {
      id: "pt-3",
      entiteLieeNom: "BRAND IP DUBAI FZE",
      paysResidenceLiee: "AE",
      lienCapital_pct: 100,
      natureFlux: "REDEVANCES_MARQUES",
      montantAnnuel_XOF: 120_000_000,
      methodeRetenue: "MARGE_NETTE_TNMM",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: false,
    },
  ],
};

export default function LocalFilePrixTransfertPage() {
  const [entite, setEntite] = useState<EntiteDeclarantePT>(DEFAULT_ENTITE);
  const [dossier, setDossier] = useState<DossierLocalFilePT | null>(() =>
    genererDossierLocalFilePT(DEFAULT_ENTITE)
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"synthese" | "texte">("synthese");

  const handleGenerer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/fiscalite/local-file-pt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entite),
      });
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      } else {
        setDossier(genererDossierLocalFilePT(entite));
      }
    } catch {
      setDossier(genererDossierLocalFilePT(entite));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>Art. 31 ter CGI / Loi de Finances</span>
            <span>•</span>
            <span>Principes OCDE Action 13</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Fichier Local des Prix de Transfert (Local File)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Génération dématérialisée de la documentation légale, plafonds de déductibilité et risques de rappel IS & BRS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fiscalite/prix-transfert"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Simulateur Prix Transfert
          </Link>
          <Link
            href="/fiscalite/scanner-predictif"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Scanner DGID →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire entité & flux */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerer} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Entité Déclarante UEMOA
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={entite.raisonSociale}
                  onChange={(e) => setEntite({ ...entite, raisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Chiffre d'Affaires (XOF)</label>
                  <input
                    type="number"
                    value={entite.chiffreAffaires_XOF}
                    onChange={(e) =>
                      setEntite({ ...entite, chiffreAffaires_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Frais Généraux (XOF)</label>
                  <input
                    type="number"
                    value={entite.fraisGeneraux_XOF}
                    onChange={(e) =>
                      setEntite({ ...entite, fraisGeneraux_XOF: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Taux BCEAO Référence (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={entite.tauxBceaoReference_pct}
                  onChange={(e) =>
                    setEntite({ ...entite, tauxBceaoReference_pct: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Génération en cours..." : "Générer la Documentation Local File"}
            </button>
          </form>

          {/* Liste des transactions */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Flux Intra-groupe Documentés ({entite.transactions.length})
            </h3>
            {entite.transactions.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white block">{t.entiteLieeNom}</span>
                    <span className="text-slate-400 text-[11px]">{t.natureFlux} • Pays: {t.paysResidenceLiee}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {t.montantAnnuel_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Méthode : {t.methodeRetenue}</span>
                  <span>Détention : {t.lienCapital_pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {dossier && (
            <>
              {/* Carte Synthèse Risque */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Audit de Conformité Prix de Transfert
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={`text-2xl font-black ${
                          dossier.avisDossier === "CONFORME"
                            ? "text-emerald-400"
                            : dossier.avisDossier === "RISQUE_MODERE"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {dossier.avisDossier.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 block">
                      Taux de conformité des flux :{" "}
                      <strong className="text-white">{dossier.tauxConformiteGlobal_pct}%</strong>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center md:text-right">
                    <span className="text-xs text-rose-400 block mb-1">
                      Exposition Fiscale Potentielle
                    </span>
                    <span className="text-3xl font-extrabold text-rose-400">
                      {dossier.expositionFiscaleTotale_XOF.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Surplus non déductible : {dossier.totalExcedentReintegrable_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Onglets navigation */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("synthese")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "synthese"
                      ? "border-amber-400 text-amber-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Contrôle des Plafonds par Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("texte")}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                    activeTab === "texte"
                      ? "border-amber-400 text-amber-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Fichier Local Imprimable (Local File)
                </button>
              </div>

              {activeTab === "synthese" && (
                <div className="space-y-4">
                  {dossier.analyses.map((a, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-white text-sm">
                          {a.transaction.entiteLieeNom} ({a.transaction.natureFlux})
                        </span>
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded text-[10px] border ${
                            a.conformePlafondLegal
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          }`}
                        >
                          {a.conformePlafondLegal ? "CONFORME" : "DÉPASSEMENT DE PLAFOND"}
                        </span>
                      </div>
                      <p className="text-slate-300">{a.observationsLegales}</p>
                      {!a.conformePlafondLegal && (
                        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Rappel IS estimé (30%)</span>
                            <span className="font-bold text-rose-400">
                              {a.risqueRappelIS_XOF.toLocaleString("fr-FR")} XOF
                            </span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Rappel BRS estimé</span>
                            <span className="font-bold text-amber-400">
                              {a.risqueBrs_XOF.toLocaleString("fr-FR")} XOF
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "texte" && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-slate-200 text-sm">
                      Dossier Légal Fichier Local (Prêt au dépôt DGE)
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(dossier.texteIntegralLocalFile)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition"
                    >
                      Copier le texte
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                    {dossier.texteIntegralLocalFile}
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
