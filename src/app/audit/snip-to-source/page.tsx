"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type LiaisonEcritureSource,
  type DossierPisteAuditFiable,
} from "@/lib/ohada/snip-to-source-paf";

export default function SnipToSourcePage() {
  const [lignes] = useState<LiaisonEcritureSource[]>([]);
  const [selectedLigne, setSelectedLigne] = useState<LiaisonEcritureSource | null>(null);
  const [dossier] = useState<DossierPisteAuditFiable | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>Piste d&apos;audit documentée</span>
            <span>•</span>
            <span>Revue manuelle des justificatifs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Traçabilité des écritures et de leurs justificatifs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rattachez les écritures et pièces réelles du dossier après leur chargement dans la production comptable et la GED.
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
            href="/audit/forensique-jet"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Audit Forensique JET →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {dossier && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Taux de Couverture PAF</span>
            <span className="text-2xl font-bold text-amber-400">
              {dossier.tauxCouverturePAF_pct}%
            </span>
            <span className="text-[10px] text-slate-500 block">
              {dossier.lignesJustifiees} / {dossier.totalLignesGrandLivre} lignes justifiées
            </span>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Montant Vérifié Exact</span>
            <span className="text-2xl font-bold text-emerald-400">
              {dossier.montantTotalVerifie_XOF.toLocaleString("fr-FR")}
            </span>
            <span className="text-[10px] text-slate-500 block">XOF validés par Snip</span>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Écarts Constatés</span>
            <span className={`text-2xl font-bold ${dossier.lignesEnEcart > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {dossier.lignesEnEcart}
            </span>
            <span className="text-[10px] text-slate-500 block">Divergence montant</span>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Pièces Manquantes</span>
            <span className={`text-2xl font-bold ${dossier.lignesSansJustificatif > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {dossier.lignesSansJustificatif}
            </span>
            <span className="text-[10px] text-slate-500 block">Défaut de justificatif</span>
          </div>
        </div>
      )}

      {/* Split View : Liste des Écritures (Gauche) vs Document Viewer Snip (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table des Écritures */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Grand Livre & Écritures à Justifier
            </h2>
            <span className="text-xs text-slate-500">{lignes.length} écriture(s)</span>
          </div>

          <div className="space-y-2">
            {lignes.map((lig) => {
              const isSelected = selectedLigne?.idEcriture === lig.idEcriture;
              const hasDoc = !!lig.documentSource && !!lig.snip;
              const hasEcart = hasDoc && lig.montantEcriture_XOF !== lig.snip?.valeurNumerique_XOF;

              return (
                <div
                  key={lig.idEcriture}
                  onClick={() => setSelectedLigne(lig)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{lig.compteNumero}</span>
                      <span className="text-slate-300 font-medium">{lig.compteLibelle}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {lig.montantEcriture_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {lig.dateEcriture} • Journal {lig.journalCode} • {lig.sens}
                    </span>
                    <span
                      className={`font-semibold ${
                        !hasDoc
                          ? "text-rose-400"
                          : hasEcart
                          ? "text-orange-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {!hasDoc
                        ? "⚠ Pièce manquante"
                        : hasEcart
                        ? "⚠ Écart détecté"
                        : "✓ Snip vérifié"}
                    </span>
                  </div>
                </div>
              );
            })}
            {lignes.length === 0 && <p className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-xs text-slate-400">Aucune écriture chargée. Les exemples ont été retirés ; seules les données du dossier peuvent alimenter cette piste d&apos;audit.</p>}
          </div>
        </div>

        {/* Visualiseur de Document Snip */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Métadonnées et extrait déclarés
            </h2>
            <span className="text-xs text-slate-400">
              {selectedLigne?.documentSource ? selectedLigne.documentSource.nomFichier : "Aucune pièce liée"}
            </span>
          </div>

          {selectedLigne?.documentSource && selectedLigne.snip ? (
            <div className="space-y-4">
              {/* Carte Document Métadonnées */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Émetteur :</span>
                  <span className="font-bold text-slate-200">{selectedLigne.documentSource.emetteur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date de la pièce :</span>
                  <span className="text-slate-200">{selectedLigne.documentSource.datePiece}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type de document :</span>
                  <span className="text-slate-200">{selectedLigne.documentSource.typeDocument}</span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-100 space-y-2">
                <p className="font-semibold">Extrait documentaire saisi pour revue — aperçu original non disponible dans cette version.</p>
                <p>{selectedLigne.snip.texteExtrait}</p>
                <p>Page {selectedLigne.snip.pageNumero} · Montant rapproché : {selectedLigne.snip.valeurNumerique_XOF.toLocaleString("fr-FR")} XOF</p>
                <p className="text-amber-200/70">Cette comparaison ne constitue ni une certification électronique, ni une preuve d’intégrité cryptographique.</p>
              </div>

              {/* Statut de concordance */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Statut de la vérification :</span>
                <span
                  className={`font-bold ${
                    selectedLigne.montantEcriture_XOF === selectedLigne.snip.valeurNumerique_XOF
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {selectedLigne.montantEcriture_XOF === selectedLigne.snip.valeurNumerique_XOF
                    ? "✓ Concordance parfaite (Écart = 0 XOF)"
                    : `⚠ Écart de ${Math.abs(
                        selectedLigne.montantEcriture_XOF - selectedLigne.snip.valeurNumerique_XOF
                      ).toLocaleString("fr-FR")} XOF`}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <span className="text-3xl block">📁</span>
              <p className="text-sm font-semibold text-rose-400">Aucune pièce justificative rattachée</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                L&apos;absence de pièce doit être évaluée par le professionnel selon le dossier ; elle ne permet pas, seule, de conclure à une violation.
              </p>
              <Link href="/documents" className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Ouvrir la GED</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
