"use client";

import { useState } from "react";
import Link from "next/link";
import {
  executerRapprochementIA,
  type TransactionFlux,
  type FactureOuverte,
  type RapportRapprochementIA,
} from "@/lib/ohada/rapprochement-ia-banque-mobile";

const TRANSACTIONS_DEFAUT: TransactionFlux[] = [
  {
    id: "TX-01",
    source: "WAVE",
    dateTransaction: "2024-11-20",
    libelleBrut: "Paiement Wave FAC-2024-0891 de SOCIETE COMMERCIALE",
    montant_XOF: 3_500_000,
  },
  {
    id: "TX-02",
    source: "ORANGE_MONEY",
    dateTransaction: "2024-11-20",
    libelleBrut: "Commission retrait marchand Orange Money",
    montant_XOF: -35_000,
  },
  {
    id: "TX-03",
    source: "BANQUE_TRADITIONNELLE",
    dateTransaction: "2024-11-22",
    libelleBrut: "Virement émis SODATEL règlement partiel",
    montant_XOF: -600_000,
  },
  {
    id: "TX-04",
    source: "FREE_MONEY",
    dateTransaction: "2024-11-23",
    libelleBrut: "Dépôt compte espèces sans référence",
    montant_XOF: 150_000,
  },
];

const FACTURES_DEFAUT: FactureOuverte[] = [
  {
    idFacture: "FAC-01",
    numeroFacture: "FAC-2024-0891",
    compteOHADA: "411",
    tiersNom: "SOCIETE COMMERCIALE DU SENEGAL",
    dateEmission: "2024-11-01",
    dateEcheance: "2024-11-30",
    montantTTC_XOF: 3_500_000,
    montantDejaRegle_XOF: 0,
    soldeRestantDu_XOF: 3_500_000,
  },
  {
    idFacture: "FAC-02",
    numeroFacture: "FAC-2024-0942",
    compteOHADA: "401",
    tiersNom: "FOURNISSEUR SODATEL",
    dateEmission: "2024-11-05",
    dateEcheance: "2024-12-05",
    montantTTC_XOF: 1_250_000,
    montantDejaRegle_XOF: 0,
    soldeRestantDu_XOF: 1_250_000,
  },
];

export default function RapprochementIaPage() {
  const [transactions, setTransactions] = useState<TransactionFlux[]>(TRANSACTIONS_DEFAUT);
  const [factures, setFactures] = useState<FactureOuverte[]>(FACTURES_DEFAUT);
  const [rapport, setRapport] = useState<RapportRapprochementIA | null>(() => {
    return executerRapprochementIA(TRANSACTIONS_DEFAUT, FACTURES_DEFAUT);
  });
  const [loading, setLoading] = useState(false);

  const handleLancer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comptabilite/rapprochement-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, factures }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(executerRapprochementIA(transactions, factures));
      }
    } catch {
      setRapport(executerRapprochementIA(transactions, factures));
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadge = (src: string) => {
    switch (src) {
      case "WAVE":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      case "ORANGE_MONEY":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "FREE_MONEY":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  const getStatutBadge = (st: string) => {
    switch (st) {
      case "LETTRAGE_AUTOMATIQUE":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "A_CONFIRMER":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "FRAIS_COMMISSION":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            <span>Fintech & Ingestion Bancaire UEMOA</span>
            <span>•</span>
            <span>Plaid / Bridge Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Hub Intégration Bancaire & Rapprochement IA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Lettrage multicritère intelligent des flux bancaires (EBICS, MT940) et Mobile Money (Wave, Orange Money, Free) avec les comptes 411/401
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/comptabilite/rapprochement-bancaire"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Rapprochement Standard
          </Link>
          <Link
            href="/fintech/mobile-money"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Mobile Money Hub →
          </Link>
        </div>
      </div>

      {/* Cartes KPI */}
      {rapport && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block">Total Flux</span>
            <span className="text-xl font-black text-white mt-0.5 block">{rapport.totalTransactions}</span>
            <span className="text-[10px] text-slate-500 font-mono">{rapport.totalMontantFlux_XOF.toLocaleString("fr-FR")} XOF</span>
          </div>

          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-emerald-400 block">Auto-Lettrés</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{rapport.nbLettragesAutomatiques}</span>
            <span className="text-[10px] text-emerald-500/80 font-bold">{rapport.tauxCouvertureAutomatique_pct}% taux auto</span>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-amber-400 block">À Confirmer</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{rapport.nbAConfirmer}</span>
            <span className="text-[10px] text-amber-500/80">Partiels / Écarts</span>
          </div>

          <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-purple-400 block">Commissions</span>
            <span className="text-xl font-black text-purple-400 mt-0.5 block">{rapport.nbCommissionsDetectees}</span>
            <span className="text-[10px] text-purple-400/80 font-mono">{rapport.totalFraisCommissions_XOF.toLocaleString("fr-FR")} XOF</span>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block">Non Rapprochés</span>
            <span className="text-xl font-black text-slate-300 mt-0.5 block">{rapport.nbNonRapproches}</span>
            <span className="text-[10px] text-slate-500">Compte 471</span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
        <div className="text-xs text-slate-400">
          Source : <strong>4 flux bancaires & mobile money</strong> ingérés ⇄ <strong>2 factures ouvertes</strong>
        </div>
        <button
          type="button"
          onClick={handleLancer}
          disabled={loading}
          className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-cyan-950/50"
        >
          {loading ? "Lettrage en cours..." : "Relancer le Rapprochement IA"}
        </button>
      </div>

      {/* Grille des propositions de lettrage */}
      {rapport && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Détail des Écritures & Propositions de Contrepartie
          </h2>

          <div className="space-y-3">
            {rapport.propositions.map((prop, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSourceBadge(prop.transaction.source)}`}>
                      {prop.transaction.source.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{prop.transaction.dateTransaction}</span>
                    <span className="text-white font-medium">{prop.transaction.libelleBrut}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-black text-sm ${prop.transaction.montant_XOF > 0 ? "text-emerald-400" : "text-slate-200"}`}>
                      {prop.transaction.montant_XOF > 0 ? "+" : ""}
                      {prop.transaction.montant_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatutBadge(prop.statutLettrage)}`}>
                      {prop.statutLettrage.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Contrepartie Proposée</span>
                    <span className="font-mono font-bold text-cyan-400 text-xs">{prop.compteContrepartiePropose}</span>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Indice de Confiance IA</span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            prop.scoreConfiance_pct >= 80
                              ? "bg-emerald-500"
                              : prop.scoreConfiance_pct >= 45
                              ? "bg-amber-500"
                              : "bg-slate-600"
                          }`}
                          style={{ width: `${prop.scoreConfiance_pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">{prop.scoreConfiance_pct}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Facture Associée</span>
                    <span className="font-mono text-slate-300">
                      {prop.factureAssociee
                        ? `${prop.factureAssociee.numeroFacture} (${prop.factureAssociee.tiersNom})`
                        : "Aucune"}
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] italic">
                  💡 {prop.explicationIA}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
