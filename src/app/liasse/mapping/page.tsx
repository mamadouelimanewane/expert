"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Upload,
  Copy,
  Layers,
  ShieldCheck,
  TrendingUp,
  Table,
} from "lucide-react";
import {
  mapperBalanceVersLiasse,
  type LigneBalanceSYSCOHADA,
} from "@/lib/ohada/mapping-balance-liasse";

const BALANCE_DEMO: LigneBalanceSYSCOHADA[] = [
  { compte: "101000", intitule: "Capital social", soldeDebiteur: 0, soldeCrediteur: 120000000 },
  { compte: "162000", intitule: "Emprunts bancaires LMT", soldeDebiteur: 0, soldeCrediteur: 60000000 },
  { compte: "211000", intitule: "Frais de développement", soldeDebiteur: 25000000, soldeCrediteur: 0 },
  { compte: "241000", intitule: "Matériel et outillage", soldeDebiteur: 150000000, soldeCrediteur: 0 },
  { compte: "284100", intitule: "Amortissements du matériel", soldeDebiteur: 0, soldeCrediteur: 35000000 },
  { compte: "311000", intitule: "Stocks de marchandises", soldeDebiteur: 45000000, soldeCrediteur: 0 },
  { compte: "411100", intitule: "Clients ordinaires", soldeDebiteur: 65000000, soldeCrediteur: 0 },
  { compte: "401100", intitule: "Fournisseurs exploitation", soldeDebiteur: 0, soldeCrediteur: 48000000 },
  { compte: "447200", intitule: "TVA à décaisser", soldeDebiteur: 0, soldeCrediteur: 6000000 },
  { compte: "521100", intitule: "Banque SGBS", soldeDebiteur: 38000000, soldeCrediteur: 0 },
  { compte: "561000", intitule: "Crédits de trésorerie", soldeDebiteur: 0, soldeCrediteur: 12000000 },
  { compte: "701100", intitule: "Ventes de marchandises", soldeDebiteur: 0, soldeCrediteur: 260000000 },
  { compte: "601100", intitule: "Achats consommés", soldeDebiteur: 140000000, soldeCrediteur: 0 },
  { compte: "661100", intitule: "Charges de personnel", soldeDebiteur: 55000000, soldeCrediteur: 0 },
  { compte: "891000", intitule: "Impôt sur le résultat (IS)", soldeDebiteur: 19000000, soldeCrediteur: 0 },
  { compte: "471000", intitule: "Comptes de régularisation", soldeDebiteur: 0, soldeCrediteur: 46000000 },
];

export default function MappingBalanceLiassePage() {
  const [lignes, setLignes] = useState<LigneBalanceSYSCOHADA[]>(BALANCE_DEMO);
  const [sectionActive, setSectionActive] = useState<"ACTIF" | "PASSIF" | "CR">("ACTIF");

  const liasse = mapperBalanceVersLiasse(lignes);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mapping Balance Générale ➔ Liasse SYSCOHADA
            </h1>
            <p className="text-sm text-muted-foreground">
              Ventilation intelligente des comptes 1 à 8 du plan OHADA vers les postes officiels de la Liasse Fiscale
            </p>
          </div>
        </div>

        {/* Status Balance */}
        <div>
          {liasse.balanceEquilibree ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Balance Équilibrée (Débits = Crédits)
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Écart de Balance : {liasse.ecartBalance.toLocaleString("fr-FR")} FCFA
            </div>
          )}
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Total Débits / Crédits
          </span>
          <div className="text-lg font-bold font-mono text-foreground">
            {liasse.totalDebitsBalance.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            {lignes.length} comptes analysés
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Total Actif Net Liasse
          </span>
          <div className="text-lg font-bold font-mono text-cyan-400">
            {liasse.totalActifNetLiasse.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Actif immobilisé + circulant + tréso
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Résultat Net Dégagé (CR)
          </span>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {liasse.resultatNetLiasse.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Poste XZ de la liasse
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Taux de Couverture des Comptes
          </span>
          <div className="text-lg font-bold font-mono text-purple-400">
            {liasse.tauxCouvertureComptes}%
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Zéro compte orphelin
          </span>
        </div>
      </div>

      {/* Anomalies d'imputation éventuelles */}
      {liasse.anomaliesImputation.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomalies d'imputation comptable détectées dans la balance :</span>
          </div>
          <div className="space-y-1 text-amber-300">
            {liasse.anomaliesImputation.map((alt, idx) => (
              <div key={idx}>• {alt.message}</div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sections Liasse */}
      <div className="flex gap-2 p-1 bg-card/60 border border-border rounded-lg w-fit">
        <button
          onClick={() => setSectionActive("ACTIF")}
          className={`px-4 py-1.5 rounded text-xs font-medium transition ${
            sectionActive === "ACTIF"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Postes Bilan Actif ({liasse.postesBilanActif.length})
        </button>
        <button
          onClick={() => setSectionActive("PASSIF")}
          className={`px-4 py-1.5 rounded text-xs font-medium transition ${
            sectionActive === "PASSIF"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Postes Bilan Passif ({liasse.postesBilanPassif.length})
        </button>
        <button
          onClick={() => setSectionActive("CR")}
          className={`px-4 py-1.5 rounded text-xs font-medium transition ${
            sectionActive === "CR"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Postes Compte de Résultat ({liasse.postesCompteResultat.length})
        </button>
      </div>

      {/* Tableau des Postes Mappés */}
      <div className="p-5 rounded-xl bg-card/40 border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2.5">Code Poste</th>
                <th className="py-2.5">Intitulé Liasse SYSCOHADA</th>
                <th className="py-2.5">Racines de Comptes</th>
                <th className="py-2.5 text-right">Montant Brut</th>
                <th className="py-2.5 text-right">Amort. / Prov.</th>
                <th className="py-2.5 text-right">Montant Net (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(sectionActive === "ACTIF"
                ? liasse.postesBilanActif
                : sectionActive === "PASSIF"
                ? liasse.postesBilanPassif
                : liasse.postesCompteResultat
              ).map((p) => (
                <tr key={p.codePoste} className="font-mono">
                  <td className="py-2.5 font-bold text-foreground">{p.codePoste}</td>
                  <td className="py-2.5 font-sans font-medium text-foreground">{p.intitulePoste}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {p.comptesAssocies.join(", ")}
                  </td>
                  <td className="py-2.5 text-right text-foreground">
                    {p.montantBrut.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 text-right text-rose-400">
                    {p.amortissementsProvisions.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-400">
                    {p.montantNet.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
