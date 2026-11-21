"use client";

import { useState } from "react";
import Link from "next/link";
import {
  verifierConformiteStatutsOHADA,
  type StatutsSocieteInput,
  type RapportConformiteStatutaire,
} from "@/lib/ohada/controleur-legalite-ohada";

const STATUTS_DEFAUT: StatutsSocieteInput = {
  raisonSociale: "SOCIÉTÉ COMMERCIALE D'AFRIQUE DE L'OUEST SA",
  formeJuridique: "SA",
  paysSiege: "SN",
  capitalSocial_XOF: 50_000_000,
  valeurNominaleTitre_XOF: 10_000,
  nombreAssocies: 7,
  chiffreAffaires_XOF: 450_000_000,
  effectifPermanent: 65,
  totalBilan_XOF: 320_000_000,
  presenceCAC: true,
  clauseExclusionBenefice: false,
  dureeSocieteAnnees: 99,
  revocationDirigeantAdNutum: false,
  capitauxPropres_XOF: 55_000_000,
};

export default function ControleurLegalitePage() {
  const [statuts, setStatuts] = useState<StatutsSocieteInput>(STATUTS_DEFAUT);
  const [rapport, setRapport] = useState<RapportConformiteStatutaire | null>(() => {
    return verifierConformiteStatutsOHADA(STATUTS_DEFAUT);
  });
  const [loading, setLoading] = useState(false);

  const handleAuditer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/legal/controleur-legalite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuts }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(verifierConformiteStatutsOHADA(statuts));
      }
    } catch {
      setRapport(verifierConformiteStatutsOHADA(statuts));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
            <span>Droit des Sociétés OHADA</span>
            <span>•</span>
            <span>AUSCGIE Révisé & Jurisprudence CCJA</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Contrôleur de Légalité Statutaire & Actes Uniformes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit de conformité des statuts : clauses léonines, seuils de capital, désignation CAC et procédure de perte de capital
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/legal/actes"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Rédacteur d'Actes
          </Link>
          <Link
            href="/legal/recouvrement"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Recouvrement AUPSRVE →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAuditer} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Caractéristiques de la Société
            </h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Dénomination Sociale</label>
              <input
                type="text"
                value={statuts.raisonSociale}
                onChange={(e) => setStatuts({ ...statuts, raisonSociale: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Forme Juridique</label>
                <select
                  value={statuts.formeJuridique}
                  onChange={(e) => setStatuts({ ...statuts, formeJuridique: e.target.value as StatutsSocieteInput["formeJuridique"] })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  <option value="SA">SA (Société Anonyme)</option>
                  <option value="SARL">SARL (Resp. Limitée)</option>
                  <option value="SAS">SAS (Actions Simplifiée)</option>
                  <option value="SNC">SNC (Nom Collectif)</option>
                  <option value="GIE">GIE</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pays du Siège</label>
                <select
                  value={statuts.paysSiege}
                  onChange={(e) => setStatuts({ ...statuts, paysSiege: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  <option value="SN">Sénégal (SN)</option>
                  <option value="CI">Côte d'Ivoire (CI)</option>
                  <option value="CM">Cameroun (CM)</option>
                  <option value="BF">Burkina Faso (BF)</option>
                  <option value="ML">Mali (ML)</option>
                  <option value="TG">Togo (TG)</option>
                  <option value="BJ">Bénin (BJ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Capital Social (XOF)</label>
                <input
                  type="number"
                  value={statuts.capitalSocial_XOF}
                  onChange={(e) => setStatuts({ ...statuts, capitalSocial_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Valeur Nominale (XOF)</label>
                <input
                  type="number"
                  value={statuts.valeurNominaleTitre_XOF}
                  onChange={(e) => setStatuts({ ...statuts, valeurNominaleTitre_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Capitaux Propres (XOF)</label>
                <input
                  type="number"
                  value={statuts.capitauxPropres_XOF}
                  onChange={(e) => setStatuts({ ...statuts, capitauxPropres_XOF: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Durée (Années)</label>
                <input
                  type="number"
                  value={statuts.dureeSocieteAnnees}
                  onChange={(e) => setStatuts({ ...statuts, dureeSocieteAnnees: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={statuts.presenceCAC}
                  onChange={(e) => setStatuts({ ...statuts, presenceCAC: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-blue-500"
                />
                Commissaire aux Comptes en exercice
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={statuts.clauseExclusionBenefice}
                  onChange={(e) => setStatuts({ ...statuts, clauseExclusionBenefice: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-rose-500"
                />
                Clause d'exclusion totale des bénéfices/pertes (Léonine)
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={statuts.revocationDirigeantAdNutum}
                  onChange={(e) => setStatuts({ ...statuts, revocationDirigeantAdNutum: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500"
                />
                Révocation du dirigeant discrétionnaire (Ad Nutum)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-950/50 mt-4"
            >
              {loading ? "Audit juridique en cours..." : "Lancer le Contrôle de Légalité"}
            </button>
          </form>
        </div>

        {/* Rapport */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Carte Score Global */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${
                      rapport.conformeGlobalement
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/40"
                        : "text-rose-400 bg-rose-500/10 border-rose-500/40"
                    }`}>
                      <span className="text-3xl">{rapport.scoreConformite_100}</span>
                      <span className="text-[10px] font-mono">/100</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-medium text-slate-400 block">Conformité AUSCGIE</span>
                      <h3 className="text-lg font-bold text-white">{rapport.societeRaisonSociale}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1.5 ${
                        rapport.conformeGlobalement
                          ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/40"
                          : "text-rose-400 bg-rose-500/20 border-rose-500/40"
                      }`}>
                        {rapport.conformeGlobalement ? "✓ Statuts Conformes" : "⚠ Non-conformités Détectées"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-rose-400 block font-bold">Nullités</span>
                      <span className="text-xl font-black text-white">{rapport.nbNonConformitesBloquantes}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block font-bold">Majeures</span>
                      <span className="text-xl font-black text-white">{rapport.nbNonConformitesMajeures}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-blue-400 block font-bold">Avertis.</span>
                      <span className="text-xl font-black text-white">{rapport.nbAvertissements}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
                  {rapport.syntheseJuridique}
                </p>
              </div>

              {/* Statuts spécifiques (CAC & Capitaux Propres) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-xl border ${
                  rapport.obligationCAC.respecte
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}>
                  <span className="font-bold block text-sm mb-1">
                    {rapport.obligationCAC.respecte ? "✓ Commissariat aux Comptes" : "🔴 Défaut de CAC"}
                  </span>
                  <p className="text-slate-400">{rapport.obligationCAC.motif}</p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  !rapport.situationCapitauxPropres.perteSuperieureMoitieCapital
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}>
                  <span className="font-bold block text-sm mb-1">
                    {!rapport.situationCapitauxPropres.perteSuperieureMoitieCapital
                      ? "✓ Capitaux Propres Réguliers"
                      : "⚠️ Procédure Art. 664 Recommandée"}
                  </span>
                  <p className="text-slate-400">
                    {rapport.situationCapitauxPropres.perteSuperieureMoitieCapital
                      ? `Reconstitution du capital requise sous ${rapport.situationCapitauxPropres.delaiRegularisationAns} ans.`
                      : "Capitaux propres supérieurs à la moitié du capital social."}
                  </p>
                </div>
              </div>

              {/* Liste des anomalies */}
              {rapport.anomalies.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                    Anomalies Juridiques Détectées ({rapport.anomalies.length})
                  </h3>
                  <div className="space-y-3 text-xs">
                    {rapport.anomalies.map((an, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border space-y-1.5 ${
                          an.gravite === "BLOQUANT_NULLITE"
                            ? "bg-rose-500/10 border-rose-500/30"
                            : an.gravite === "MAJEUR_SANCTION"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white">{an.intitule}</span>
                          <span className="font-mono text-[10px] text-slate-400">{an.articleAUSCGIE}</span>
                        </div>
                        <p className="text-slate-300">{an.description}</p>
                        <div className="pt-1.5 border-t border-slate-800/60 text-slate-400 flex items-start gap-1">
                          <span className="text-emerald-400 font-bold">Correction :</span>
                          <span>{an.recommandationLegalTech}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
