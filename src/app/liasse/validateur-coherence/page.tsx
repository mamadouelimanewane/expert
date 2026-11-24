"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type BilanChiffres,
  type CompteResultatChiffres,
  type InputValidationLiasse,
  type RapportValidationLiasse,
} from "@/lib/ohada/validateur-coherence-liasse";

type ChampsNumeriquesVides<T> = { [K in keyof T]: T[K] extends number ? number | "" : T[K] };
type BrouillonLiasse = Omit<InputValidationLiasse, "exercice" | "bilan" | "compteResultat"> & {
  exercice: number | "";
  bilan: ChampsNumeriquesVides<BilanChiffres>;
  compteResultat: ChampsNumeriquesVides<CompteResultatChiffres>;
};

const LIASSE_VIERGE: BrouillonLiasse = {
  societeRaisonSociale: "",
  exercice: new Date().getFullYear() - 1,
  bilan: {
    totalActifBrut_XOF: "",
    totalAmortissementsProvisions_XOF: "",
    totalActifNet_XOF: "",
    totalPassif_XOF: "",
    capitalSocial_XOF: "",
    capitauxPropres_XOF: "",
    resultatNetBilan_XOF: "",
    tresorerieActif_XOF: "",
    tresoreriePassif_XOF: "",
    fournisseursDebiteursNonReclasses_XOF: "",
    clientsCrediteursNonReclasses_XOF: "",
  },
  compteResultat: {
    chiffreAffaires_XOF: "",
    totalProduits_XOF: "",
    totalCharges_XOF: "",
    dotationsAmortissementsExercice_XOF: "",
    resultatNetCompteResultat_XOF: "",
    impotSurResultat_XOF: "",
  },
};

function convertirMontants<T extends object>(valeurs: T): { [K in keyof T]: number } {
  return Object.fromEntries(Object.entries(valeurs).map(([cle, valeur]) => [cle, Number(valeur)])) as { [K in keyof T]: number };
}

export default function ValidateurCoherenceLiassePage() {
  const [liasse, setLiasse] = useState<BrouillonLiasse>(LIASSE_VIERGE);
  const [rapport, setRapport] = useState<RapportValidationLiasse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValider = async (e: React.FormEvent) => {
    e.preventDefault();
    const valeurs = [liasse.exercice, ...Object.values(liasse.bilan), ...Object.values(liasse.compteResultat)];
    if (!liasse.societeRaisonSociale.trim() || valeurs.some((value) => typeof value !== "number" || !Number.isFinite(value))
      || typeof liasse.exercice !== "number" || !Number.isInteger(liasse.exercice) || liasse.exercice < 1900) {
      setError("Renseignez la raison sociale, un exercice valide et tous les postes de la liasse à partir des états approuvés.");
      return;
    }
    const liasseComplete: InputValidationLiasse = {
      societeRaisonSociale: liasse.societeRaisonSociale.trim(),
      exercice: liasse.exercice,
      bilan: convertirMontants(liasse.bilan),
      compteResultat: convertirMontants(liasse.compteResultat),
    };
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/liasse/validateur-coherence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liasse: liasseComplete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "La validation de la liasse a échoué.");
      setRapport(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La validation de la liasse a échoué.");
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
            <span>Contrôle Qualité Liasse SYSCOHADA</span>
            <span>•</span>
            <span>CaseWare Working Papers Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Validateur de Cohérence & Détecteur d&apos;Incohérences
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Contrôles croisés arithmétiques et fiscaux automatisés avant télétransmission DGID et certification CAC
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/liasse/bouclage"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Bouclage Liasse
          </Link>
          <Link
            href="/liasse/mapping"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Mapping Balance →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleValider} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Paramètres du Bilan & Compte de Résultat
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={liasse.societeRaisonSociale}
                  onChange={(e) => setLiasse({ ...liasse, societeRaisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Exercice</label>
                <input
                  type="number"
                  value={liasse.exercice}
                  onChange={(e) => setLiasse({ ...liasse, exercice: e.target.value === "" ? "" : Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 pt-2 border-t border-slate-800">
              📊 Bilan (XOF)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Actif Net</label>
                <input
                  type="number"
                  value={liasse.bilan.totalActifNet_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, totalActifNet_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Actif Brut</label>
                <input type="number" required value={liasse.bilan.totalActifBrut_XOF} onChange={(e) => setLiasse({ ...liasse, bilan: { ...liasse.bilan, totalActifBrut_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Passif</label>
                <input
                  type="number"
                  value={liasse.bilan.totalPassif_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, totalPassif_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Capital Social</label>
                <input
                  type="number"
                  value={liasse.bilan.capitalSocial_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, capitalSocial_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Capitaux Propres</label>
                <input
                  type="number"
                  value={liasse.bilan.capitauxPropres_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, capitauxPropres_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Résultat Net Bilan</label>
                <input
                  type="number"
                  value={liasse.bilan.resultatNetBilan_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, resultatNetBilan_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Amort. & Dépréciations</label>
                <input
                  type="number"
                  value={liasse.bilan.totalAmortissementsProvisions_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    bilan: { ...liasse.bilan, totalAmortissementsProvisions_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Trésorerie actif</label>
                <input type="number" required value={liasse.bilan.tresorerieActif_XOF} onChange={(e) => setLiasse({ ...liasse, bilan: { ...liasse.bilan, tresorerieActif_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Trésorerie passif</label>
                <input type="number" required value={liasse.bilan.tresoreriePassif_XOF} onChange={(e) => setLiasse({ ...liasse, bilan: { ...liasse.bilan, tresoreriePassif_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Fournisseurs débiteurs non reclassés</label>
                <input type="number" required value={liasse.bilan.fournisseursDebiteursNonReclasses_XOF} onChange={(e) => setLiasse({ ...liasse, bilan: { ...liasse.bilan, fournisseursDebiteursNonReclasses_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Clients créditeurs non reclassés</label>
                <input type="number" required value={liasse.bilan.clientsCrediteursNonReclasses_XOF} onChange={(e) => setLiasse({ ...liasse, bilan: { ...liasse.bilan, clientsCrediteursNonReclasses_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 pt-2 border-t border-slate-800">
              📈 Compte de Résultat (XOF)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Chiffre d&apos;Affaires</label>
                <input
                  type="number"
                  value={liasse.compteResultat.chiffreAffaires_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    compteResultat: { ...liasse.compteResultat, chiffreAffaires_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Produits</label>
                <input type="number" required value={liasse.compteResultat.totalProduits_XOF} onChange={(e) => setLiasse({ ...liasse, compteResultat: { ...liasse.compteResultat, totalProduits_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Charges</label>
                <input type="number" required value={liasse.compteResultat.totalCharges_XOF} onChange={(e) => setLiasse({ ...liasse, compteResultat: { ...liasse.compteResultat, totalCharges_XOF: e.target.value === "" ? "" : Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Résultat Net CR</label>
                <input
                  type="number"
                  value={liasse.compteResultat.resultatNetCompteResultat_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    compteResultat: { ...liasse.compteResultat, resultatNetCompteResultat_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Dotations Amort. (681)</label>
                <input
                  type="number"
                  value={liasse.compteResultat.dotationsAmortissementsExercice_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    compteResultat: { ...liasse.compteResultat, dotationsAmortissementsExercice_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">IS / IMF (89)</label>
                <input
                  type="number"
                  value={liasse.compteResultat.impotSurResultat_XOF}
                  onChange={(e) => setLiasse({
                    ...liasse,
                    compteResultat: { ...liasse.compteResultat, impotSurResultat_XOF: e.target.value === "" ? "" : Number(e.target.value) }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 mt-4"
            >
              {loading ? "Vérification..." : "Exécuter les Contrôles de Cohérence"}
            </button>
          </form>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Carte Score Global */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${
                      rapport.liasseValide
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/40"
                        : "text-rose-400 bg-rose-500/10 border-rose-500/40"
                    }`}>
                      <span className="text-3xl">{rapport.scoreFiabilite_100}</span>
                      <span className="text-[10px] font-mono">/100</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase font-medium text-slate-400 block">Indice de Fiabilité Liasse</span>
                      <h3 className="text-lg font-bold text-white">{rapport.societeRaisonSociale}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1.5 ${
                        rapport.liasseValide
                          ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/40"
                          : "text-rose-400 bg-rose-500/20 border-rose-500/40"
                      }`}>
                        {rapport.liasseValide ? "✓ Liasse Cohérente (Prête pour Télé-dépôt)" : "🔴 Incohérences Détectées"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block font-bold">Valides</span>
                      <span className="text-xl font-black text-white">{rapport.nbControlesValides}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-rose-400 block font-bold">Bloquants</span>
                      <span className="text-xl font-black text-white">{rapport.nbErreursBloquantes}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block font-bold">Avertis.</span>
                      <span className="text-xl font-black text-white">{rapport.nbAvertissements}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 pt-4 border-t border-slate-800/80">
                  {rapport.syntheseControleur}
                </p>
              </div>

              {/* Liste des contrôles */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Matrice des 8 Contrôles Croisés
                </h3>
                <div className="space-y-2.5 text-xs">
                  {rapport.controles.map((ctrl) => (
                    <div
                      key={ctrl.id}
                      className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        ctrl.statut === "VALIDE"
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : ctrl.statut === "ERREUR_BLOQUANTE"
                          ? "bg-rose-500/10 border-rose-500/30"
                          : "bg-amber-500/10 border-amber-500/30"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${
                            ctrl.statut === "VALIDE"
                              ? "text-emerald-400"
                              : ctrl.statut === "ERREUR_BLOQUANTE"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }`}>
                            {ctrl.statut === "VALIDE" ? "✓" : ctrl.statut === "ERREUR_BLOQUANTE" ? "🔴" : "⚠️"}
                          </span>
                          <span className="font-semibold text-white">{ctrl.intitule}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{ctrl.explication}</p>
                      </div>

                      <div className="text-right shrink-0">
                        {ctrl.ecart_XOF > 0 && (
                          <span className="font-mono text-rose-400 font-bold block">
                            Écart: {ctrl.ecart_XOF.toLocaleString("fr-FR")} XOF
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block">{ctrl.impactFiscal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {!rapport && <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">Renseignez les états financiers approuvés pour lancer les contrôles de cohérence.</div>}
        </div>
      </div>
    </div>
  );
}
