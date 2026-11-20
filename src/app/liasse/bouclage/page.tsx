"use client";

import { useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Building,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Scale,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  verifierBouclageLiasse,
  type BilanOHADA,
  type CompteResultatOHADA,
  type TftOHADA,
} from "@/lib/ohada/bouclage-liasse-syscohada";

const BILAN_INIT: BilanOHADA = {
  actifImmobilise: 150000000,
  actifCirculant: 95000000,
  tresorerieActif: 35000000,
  totalActif: 280000000,

  capitauxPropresHorsResultat: 120000000,
  resultatNetExercice: 32000000,
  dettesFinancieresLMT: 60000000,
  dettesCirculantes: 60000000,
  tresoreriePassif: 8000000,
  totalPassif: 280000000,
};

const CR_INIT: CompteResultatOHADA = {
  chiffreAffaires: 420000000,
  achatsConsommes: 210000000,
  margeCommerciale: 210000000,
  valeurAjoutee: 145000000,
  ebe: 72000000,
  resultatExploitation: 54000000,
  resultatFinancier: -8000000,
  resultatActivitesOrdinaires: 46000000,
  resultatHorsActivitesOrdinaires: 0,
  impotSurResultatIS: 14000000,
  resultatNet: 32000000,
};

const TFT_INIT: TftOHADA = {
  tresorerieDebut: 18000000,
  fluxExploitation: 45000000,
  fluxInvestissement: -26000000,
  fluxFinancement: -10000000,
  variationTresorerie: 9000000,
  tresorerieFin: 27000000, // 35M actif - 8M passif = 27M
};

export default function BouclageLiassePage() {
  const [bilan, setBilan] = useState<BilanOHADA>(BILAN_INIT);
  const [cr, setCr] = useState<CompteResultatOHADA>(CR_INIT);
  const [tft, setTft] = useState<TftOHADA>(TFT_INIT);
  const [isFiscal, setIsFiscal] = useState<number>(14000000);

  const rapport = verifierBouclageLiasse(bilan, cr, tft, isFiscal);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bouclage Liasse Fiscale SYSCOHADA
            </h1>
            <p className="text-sm text-muted-foreground">
              Contrôles de cohérence Bilan, Compte de Résultat, Tableau des Flux (TFT) et Résultat Fiscal
            </p>
          </div>
        </div>

        {/* Badge Visa */}
        <div>
          {rapport.visaExpertComptableRecommande ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Liasse Prête pour Visa & Télédéclaration
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              Anomalies Bloquantes Détectées ({rapport.anomaliesBloquantes.length})
            </div>
          )}
        </div>
      </div>

      {/* Cartes des 4 Piliers du Bouclage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilier 1 : Équilibre Bilan */}
        <div
          className={`p-4 rounded-xl border ${
            rapport.estEquilibreBilan
              ? "bg-card/40 border-border"
              : "bg-rose-500/10 border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            <span>Équilibre Bilan</span>
            {rapport.estEquilibreBilan ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-lg font-bold font-mono">
            {rapport.estEquilibreBilan ? (
              <span className="text-emerald-400">Équilibré (0 FCFA)</span>
            ) : (
              <span className="text-rose-400">Écart : {rapport.ecartBilan.toLocaleString("fr-FR")} FCFA</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Actif : {bilan.totalActif.toLocaleString("fr-FR")} | Passif : {bilan.totalPassif.toLocaleString("fr-FR")}
          </span>
        </div>

        {/* Pilier 2 : Résultat Net Bilan vs CR */}
        <div
          className={`p-4 rounded-xl border ${
            rapport.estCoherentResultat
              ? "bg-card/40 border-border"
              : "bg-rose-500/10 border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            <span>Poste 13 (Résultat Net)</span>
            {rapport.estCoherentResultat ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-lg font-bold font-mono">
            {rapport.estCoherentResultat ? (
              <span className="text-emerald-400">Conforme ({bilan.resultatNetExercice.toLocaleString("fr-FR")})</span>
            ) : (
              <span className="text-rose-400">Écart : {rapport.ecartResultatBilanCompteResultat.toLocaleString("fr-FR")} FCFA</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Bilan (13) = Compte Résultat (13)
          </span>
        </div>

        {/* Pilier 3 : Trésorerie Bilan vs TFT */}
        <div
          className={`p-4 rounded-xl border ${
            rapport.estCoherentTresorerie
              ? "bg-card/40 border-border"
              : "bg-rose-500/10 border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            <span>Trésorerie Clôture TFT</span>
            {rapport.estCoherentTresorerie ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-lg font-bold font-mono">
            {rapport.estCoherentTresorerie ? (
              <span className="text-emerald-400">Conforme ({tft.tresorerieFin.toLocaleString("fr-FR")})</span>
            ) : (
              <span className="text-rose-400">Écart : {rapport.ecartTresorerieBilanTFT.toLocaleString("fr-FR")} FCFA</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Treso Nette Bilan = TFT Fin
          </span>
        </div>

        {/* Pilier 4 : Impôt IS vs Fiscalité */}
        <div
          className={`p-4 rounded-xl border ${
            rapport.estCoherentImpotIS
              ? "bg-card/40 border-border"
              : "bg-rose-500/10 border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            <span>Cadrage Impôt IS</span>
            {rapport.estCoherentImpotIS ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-lg font-bold font-mono">
            {rapport.estCoherentImpotIS ? (
              <span className="text-emerald-400">Conforme ({isFiscal.toLocaleString("fr-FR")})</span>
            ) : (
              <span className="text-rose-400">Écart : {rapport.ecartISLiasseFiscal.toLocaleString("fr-FR")} FCFA</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Compta CR = Déclaration IS
          </span>
        </div>
      </div>

      {/* Anomalies bloquantes éventuelles */}
      {rapport.anomaliesBloquantes.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Points bloquants interdisant la validation de la liasse :</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-rose-300">
            {rapport.anomaliesBloquantes.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist Normative des 6 Points de Contrôle de Clôture */}
      <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Points de Contrôle Normatifs de Clôture Annuelle SYSCOHADA
            </h2>
            <p className="text-xs text-muted-foreground">
              Vérifications obligatoires préalables à l'arrêté définitif des états financiers
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Score : {rapport.scoreConformiteLiasse}%
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {rapport.pointsControle.map((pt) => (
            <div key={pt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground text-[11px]">{pt.id}</span>
                  <span className="font-semibold text-foreground">{pt.intitule}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                    {pt.normeOhada}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">{pt.commentaire}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {pt.statut === "CONFORME" ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Conforme
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Anomalie
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
