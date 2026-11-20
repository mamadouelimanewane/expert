"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type LiaisonEcritureSource,
  type DossierPisteAuditFiable,
  genererDossierPAF,
} from "@/lib/ohada/snip-to-source-paf";

const DEFAULT_LIGNES: LiaisonEcritureSource[] = [
  {
    idEcriture: "ECR-101",
    dateEcriture: "2024-04-12",
    journalCode: "ACH",
    compteNumero: "601100",
    compteLibelle: "Achats de marchandises",
    montantEcriture_XOF: 15_000_000,
    sens: "DEBIT",
    documentSource: {
      id: "DOC-01",
      titre: "Facture Fournisseur SARL DAKAR",
      typeDocument: "FACTURE_FOURNISSEUR",
      nomFichier: "facture_dakar_101.pdf",
      datePiece: "2024-04-10",
      emetteur: "SARL DAKAR DISTRIBUTION",
      montantTotal_XOF: 15_000_000,
    },
    snip: {
      pageNumero: 1,
      boundingBox: { x: 350, y: 520, width: 80, height: 20 },
      texteExtrait: "Total Net à Payer : 15 000 000 XOF",
      valeurNumerique_XOF: 15_000_000,
    },
  },
  {
    idEcriture: "ECR-102",
    dateEcriture: "2024-05-18",
    journalCode: "ACH",
    compteNumero: "624100",
    compteLibelle: "Transports sur achats",
    montantEcriture_XOF: 3_500_000,
    sens: "DEBIT",
    documentSource: {
      id: "DOC-02",
      titre: "Facture Transporteur EXPRESS",
      typeDocument: "FACTURE_FOURNISSEUR",
      nomFichier: "facture_express_202.pdf",
      datePiece: "2024-05-17",
      emetteur: "EXPRESS LOGISTIQUE",
      montantTotal_XOF: 3_000_000,
    },
    snip: {
      pageNumero: 1,
      boundingBox: { x: 300, y: 400, width: 90, height: 22 },
      texteExtrait: "Montant TTC : 3 000 000 XOF",
      valeurNumerique_XOF: 3_000_000,
    },
  },
  {
    idEcriture: "ECR-103",
    dateEcriture: "2024-06-25",
    journalCode: "OD",
    compteNumero: "632400",
    compteLibelle: "Honoraires de conseil fiscal",
    montantEcriture_XOF: 8_000_000,
    sens: "DEBIT",
  },
  {
    idEcriture: "ECR-104",
    dateEcriture: "2024-08-14",
    journalCode: "BQ",
    compteNumero: "521100",
    compteLibelle: "Banque CBAO Courant",
    montantEcriture_XOF: 25_000_000,
    sens: "CREDIT",
    documentSource: {
      id: "DOC-04",
      titre: "Relevé Bancaire Août 2024 CBAO",
      typeDocument: "RELEVE_BANCAIRE",
      nomFichier: "releve_cbao_aout2024.pdf",
      datePiece: "2024-08-31",
      emetteur: "CBAO GROUPE ATTIJARIWAFA BANK",
      montantTotal_XOF: 25_000_000,
    },
    snip: {
      pageNumero: 3,
      boundingBox: { x: 420, y: 610, width: 75, height: 18 },
      texteExtrait: "Virement émis : 25 000 000 XOF",
      valeurNumerique_XOF: 25_000_000,
    },
  },
];

export default function SnipToSourcePage() {
  const [lignes, setLignes] = useState<LiaisonEcritureSource[]>(DEFAULT_LIGNES);
  const [selectedLigne, setSelectedLigne] = useState<LiaisonEcritureSource>(DEFAULT_LIGNES[0]);
  const [dossier, setDossier] = useState<DossierPisteAuditFiable | null>(() =>
    genererDossierPAF("SOCIÉTÉ INDUSTRIELLE SAHEL SA", 2024, DEFAULT_LIGNES)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <span>Inspiré de DataSnipper</span>
            <span>•</span>
            <span>Piste d'Audit Fiable (PAF) & Art. 17 AUDCIF</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Snip-to-Source : Rapprochement Visuel Écritures ⇄ Pièces
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Traçabilité probante immédiate : cliquez sur n'importe quelle ligne comptable pour surligner la pièce source originale
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
            <span className="text-xs text-slate-500">Cliquez pour inspecter</span>
          </div>

          <div className="space-y-2">
            {lignes.map((lig) => {
              const isSelected = selectedLigne.idEcriture === lig.idEcriture;
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
          </div>
        </div>

        {/* Visualiseur de Document Snip */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Visionneuse Document & Surlignage Automatique
            </h2>
            <span className="text-xs text-slate-400">
              {selectedLigne.documentSource ? selectedLigne.documentSource.nomFichier : "Aucune pièce"}
            </span>
          </div>

          {selectedLigne.documentSource && selectedLigne.snip ? (
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

              {/* Simulation Document Paper View avec Bounding Box Surligné */}
              <div className="relative bg-slate-100 text-slate-900 rounded-xl p-6 min-h-[350px] shadow-inner font-serif text-xs space-y-4 overflow-hidden border-4 border-slate-800">
                <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                  <div>
                    <h3 className="font-bold text-sm uppercase">{selectedLigne.documentSource.emetteur}</h3>
                    <p className="text-[10px] text-slate-600">Dakar, Sénégal • NINEA: 00458921 2G3</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold block">{selectedLigne.documentSource.titre}</span>
                    <span className="text-[10px] text-slate-500">Date: {selectedLigne.documentSource.datePiece}</span>
                  </div>
                </div>

                <div className="py-4 space-y-2 text-slate-700">
                  <p>Facturé à : SOCIÉTÉ INDUSTRIELLE SAHEL SA</p>
                  <p>Objet : Prestation contractuelle conforme au bon de commande BC-2024-89</p>
                </div>

                {/* Surlignage Snip Visuel façon DataSnipper */}
                <div className="p-3 bg-amber-300/40 border-2 border-amber-500 rounded-lg shadow-sm flex items-center justify-between font-sans">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 block">
                      [SNIP SOURCE DÉTECTÉ • PAGE {selectedLigne.snip.pageNumero}]
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedLigne.snip.texteExtrait}
                    </span>
                  </div>
                  <span className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded text-xs">
                    {selectedLigne.snip.valeurNumerique_XOF.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 text-center pt-8">
                  Document certifié électroniquement • Piste d'Audit Fiable Horodatée (SHA-256)
                </p>
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
                Cette écriture comptable viole l'article 17 de l'AUDCIF. Veuillez téléverser la facture ou la quittance pour compléter la piste d'audit.
              </p>
              <button
                type="button"
                className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                + Téléverser et créer le Snip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
