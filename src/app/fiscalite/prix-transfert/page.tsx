"use client";

import { useState } from "react";
import {
  Globe,
  ShieldAlert,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  TrendingDown,
  Building,
} from "lucide-react";
import {
  evaluerFluxIntragroupe,
  genererDossierPrixTransfert,
  type FluxIntragroupe,
  type TypeFluxIntragroupe,
} from "@/lib/ohada/prix-de-transfert";

const FLUX_EXEMPLES: FluxIntragroupe[] = [
  {
    id: "FLUX-01",
    typeFlux: "MANAGEMENT_FEES",
    entiteEmettrice: "Holding Paris SAS (France)",
    entiteBeneficiaire: "Société Dakar SA (Sénégal)",
    paysPartenaire: "FR",
    montantFactureAnnuel: 65000000,
    methodeUtilisee: "COST_PLUS",
    margeAppliqueeTaux: 5,
    cleRepartition: "CHIFFRE_AFFAIRES",
    justificatifsDisponibles: true,
    tauxRetenueSourceApplique: 10,
  },
  {
    id: "FLUX-02",
    typeFlux: "ASSISTANCE_TECHNIQUE_IT",
    entiteEmettrice: "Tech Hub London Ltd (Royaume-Uni)",
    entiteBeneficiaire: "Société Dakar SA (Sénégal)",
    paysPartenaire: "GB",
    montantFactureAnnuel: 140000000,
    methodeUtilisee: "TNMM",
    margeAppliqueeTaux: 11,
    cleRepartition: "COUTS_DIRECTS",
    justificatifsDisponibles: false,
    tauxRetenueSourceApplique: 15,
  },
  {
    id: "FLUX-03",
    typeFlux: "REDEVANCES_MARQUES_BREVETS",
    entiteEmettrice: "Brand Holdings Lux (Luxembourg)",
    entiteBeneficiaire: "Société Dakar SA (Sénégal)",
    paysPartenaire: "LU",
    montantFactureAnnuel: 95000000,
    methodeUtilisee: "CUP",
    margeAppliqueeTaux: 5,
    cleRepartition: "CHIFFRE_AFFAIRES",
    justificatifsDisponibles: true,
    tauxRetenueSourceApplique: 10,
  },
];

export default function PrixDeTransfertPage() {
  const [caBeneficiaire, setCaBeneficiaire] = useState(1800000000); // 1.8 Mds
  const [rexBeneficiaire, setRexBeneficiaire] = useState(220000000);
  const [fluxList] = useState<FluxIntragroupe[]>(FLUX_EXEMPLES);
  const [selectedFluxId, setSelectedFluxId] = useState<string>(FLUX_EXEMPLES[0].id);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const dossier = genererDossierPrixTransfert(fluxList, caBeneficiaire, rexBeneficiaire);
  const selectedAnalyse =
    dossier.analysesFlux.find((a) => a.flux.id === selectedFluxId) || dossier.analysesFlux[0];

  const handleCopier = (texte: string) => {
    navigator.clipboard.writeText(texte);
    setCopieEffectuee(true);
    setTimeout(() => setCopieEffectuee(false), 2000);
  };

  const badgeColorRisque = (niveau: string) => {
    switch (niveau) {
      case "FAIBLE":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "MODERE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ELEVE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Prix de Transfert & Management Fees
            </h1>
            <p className="text-sm text-muted-foreground">
              Audit des flux intragroupes, conformité pleine concurrence et documentation Local File OHADA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Chiffre d'Affaires Filiale</span>
            <input
              type="number"
              value={caBeneficiaire}
              onChange={(e) => setCaBeneficiaire(Number(e.target.value))}
              className="w-36 bg-card/60 border border-border rounded px-2.5 py-1 text-sm text-right font-mono"
            />
            <span className="text-xs text-muted-foreground ml-1">FCFA</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Volume des Flux Intragroupes
          </span>
          <div className="text-xl font-bold font-mono text-foreground">
            {dossier.totalFluxIntragroupe.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            {fluxList.length} contrat(s) audité(s)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Montant Exposé à Réintégration
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {dossier.montantTotalExposeRisque.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Défaut de preuve ou dépassement
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Risque Financier Estimé (IS + Pénalités)
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {dossier.redressementEstimeGlobal.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Taux IS 30% + majorations
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Score Conformité Documentation
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {dossier.scoreConformiteDossier}%
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Directives UEMOA & Local File
          </span>
        </div>
      </div>

      {/* Main Grid: Liste des flux + Détails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Liste des transactions intragroupes */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Transactions Intragroupes ({fluxList.length})
          </h2>

          <div className="space-y-2">
            {dossier.analysesFlux.map((a) => {
              const isSelected = a.flux.id === selectedFluxId;
              return (
                <div
                  key={a.flux.id}
                  onClick={() => setSelectedFluxId(a.flux.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-card/90 border-indigo-500/50 shadow-sm"
                      : "bg-card/30 border-border hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{a.flux.typeFlux.replace(/_/g, " ")}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.flux.entiteEmettrice} ➔ {a.flux.entiteBeneficiaire}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColorRisque(
                        a.risqueFiscalNiveau
                      )}`}
                    >
                      {a.risqueFiscalNiveau}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Rémunération : </span>
                      <span className="font-mono font-bold text-foreground">
                        {a.flux.montantFactureAnnuel.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <span className="text-muted-foreground font-mono">
                      Méthode : {a.flux.methodeUtilisee} ({a.flux.margeAppliqueeTaux}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : Détails du flux & Benchmark de pleine concurrence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-5">
            {/* Header transaction */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedAnalyse.flux.id} • Méthode {selectedAnalyse.flux.methodeUtilisee}
                </span>
                <h2 className="text-xl font-bold">
                  {selectedAnalyse.flux.typeFlux.replace(/_/g, " ")}
                </h2>
                <span className="text-xs text-indigo-400">
                  Partenaire : {selectedAnalyse.flux.entiteEmettrice} ({selectedAnalyse.flux.paysPartenaire})
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColorRisque(
                  selectedAnalyse.risqueFiscalNiveau
                )}`}
              >
                Risque Fiscal : {selectedAnalyse.risqueFiscalNiveau}
              </span>
            </div>

            {/* Benchmark pleine concurrence */}
            <div className="p-4 bg-card/60 rounded-xl border border-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fourchette Interquartile de Pleine Concurrence (OCDE)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-card/80 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground block">Minimum</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedAnalyse.intervallePleineConcurrence.min}%
                  </span>
                </div>
                <div className="p-2.5 bg-card/80 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground block">Médiane</span>
                  <span className="font-mono font-bold text-blue-400">
                    {selectedAnalyse.intervallePleineConcurrence.mediane}%
                  </span>
                </div>
                <div className="p-2.5 bg-card/80 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground block">Maximum</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedAnalyse.intervallePleineConcurrence.max}%
                  </span>
                </div>
                <div className="p-2.5 bg-card/80 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground block">Taux Appliqué</span>
                  <span
                    className={`font-mono font-bold ${
                      selectedAnalyse.conformePleineConcurrence
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {selectedAnalyse.flux.margeAppliqueeTaux}%
                  </span>
                </div>
              </div>
            </div>

            {/* Points de vigilance fiscale */}
            {selectedAnalyse.pointsDeVigilance.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Alertes & Motifs de Redressement Détectés
                </h3>
                <div className="space-y-1.5">
                  {selectedAnalyse.pointsDeVigilance.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300"
                    >
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sommaire Local File */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Extrait Documentation Fichier Local (Local File)
                </span>
                <button
                  onClick={() => handleCopier(dossier.sommaireLocalFile)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-card/60 hover:bg-card border border-border rounded text-xs font-medium transition"
                >
                  {copieEffectuee ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier le Local File
                    </>
                  )}
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3.5 rounded-lg border border-border leading-relaxed max-h-52 overflow-y-auto">
                {dossier.sommaireLocalFile}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
