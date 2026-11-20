"use client";

import { useState } from "react";
import {
  TrendingUp,
  Briefcase,
  AlertOctagon,
  Scale,
  DollarSign,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import {
  calculerDueDiligence,
  type DossierDueDiligence,
  type RetraitementEbitda,
  type ElementDetteAssimilee,
} from "@/lib/ohada/due-diligence-m-and-a";

const DOSSIER_DEFAUT: DossierDueDiligence = {
  nomCible: "Agro-Industrie du Sine Saloum SA",
  secteurActivite: "Agroalimentaire & Huilerie",
  chiffreAffairesHistorique: 4800000000,
  ebitdaComptableHistorique: 580000000,
  retraitementsEbitda: [
    {
      id: "RET-1",
      libelle: "Rémunération de l'actionnaire majoritaire (surcoût marché)",
      categorie: "REMUNERATION_DIRIGEANT",
      montantImpactEbitda: 45000000,
      justificationAuditeur: "Normalisation du salaire DG au niveau benchmark UEMOA.",
    },
    {
      id: "RET-2",
      libelle: "Frais de litige foncier (non récurrents)",
      categorie: "CHARGE_PRODUIT_EXCEPTIONNEL",
      montantImpactEbitda: 28000000,
      justificationAuditeur: "Avocats et géomètres pour titre foncier définitif.",
    },
    {
      id: "RET-3",
      libelle: "Subvention d'aide d'urgence exceptionnelle",
      categorie: "CHARGE_PRODUIT_EXCEPTIONNEL",
      montantImpactEbitda: -18000000,
      justificationAuditeur: "Produit one-off non reconductible sur l'exercice futur.",
    },
  ],
  tresorerieActif: 180000000,
  dettesFinancieresBrutes: 720000000,
  elementsDetteAssimilee: [
    {
      id: "DA-1",
      libelle: "Notification de redressement fiscal CNPS / TVA (risque probable)",
      montant: 65000000,
      typeElement: "ARRIERE_FISCAL_SOCIAL",
      probabiliteDecaissement: 80,
    },
    {
      id: "DA-2",
      libelle: "Indemnités de départ à la retraite non provisionnées",
      montant: 35000000,
      typeElement: "INDEMNITE_RETRAITE",
      probabiliteDecaissement: 100,
    },
  ],
  bfrReelCloture: 410000000,
  bfrNormatifCible: 380000000,
  multipleEbitdaNegocie: 6.5,
};

export default function DueDiligencePage() {
  const [onglet, setOnglet] = useState<"QOE" | "BRIDGE">("QOE");
  const [dossier, setDossier] = useState<DossierDueDiligence>(DOSSIER_DEFAUT);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const resultat = calculerDueDiligence(dossier);

  const handleCopier = (texte: string) => {
    navigator.clipboard.writeText(texte);
    setCopieEffectuee(true);
    setTimeout(() => setCopieEffectuee(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Due Diligence Financière & M&A
            </h1>
            <p className="text-sm text-muted-foreground">
              Quality of Earnings (QoE), EBITDA Normatif, Bridge Dette Nette & Valorisation des Titres
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex p-1 bg-card/60 border border-border rounded-lg">
          <button
            onClick={() => setOnglet("QOE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition ${
              onglet === "QOE"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Quality of Earnings (QoE)
          </button>
          <button
            onClick={() => setOnglet("BRIDGE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition ${
              onglet === "BRIDGE"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Bridge Dette Nette & Equity
          </button>
        </div>
      </div>

      {/* KPI Cards Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            EBITDA Normatif (QoE)
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {resultat.ebitdaNormatifAjuste.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Marge normative : <span className="text-foreground font-semibold">{resultat.margeEbitdaNormative}%</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Valeur d'Entreprise (EV)
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">
            {resultat.valeurEntrepriseEV.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Multiple appliqué : {dossier.multipleEbitdaNegocie}x
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Dette Nette Ajustée
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {resultat.detteNetteAjusteeTotale.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Inclut {resultat.totalDettesAssimilees.toLocaleString("fr-FR")} FCFA debt-like
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Valeur des Titres (Equity Value)
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {resultat.valeurTitresEquityValue.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Prix net des actions négociables
          </span>
        </div>
      </div>

      {onglet === "QOE" ? (
        /* Onglet QoE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Retraitements d'EBITDA */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Retraitements de Normalisation d'EBITDA ({dossier.retraitementsEbitda.length})
              </h2>

              <div className="space-y-2.5">
                {dossier.retraitementsEbitda.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3.5 bg-card/60 rounded-xl border border-border flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{ret.libelle}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {ret.justificationAuditeur}
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm whitespace-nowrap ${
                        ret.montantImpactEbitda >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {ret.montantImpactEbitda >= 0 ? "+" : ""}
                      {ret.montantImpactEbitda.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite : Synthèse de passage EBITDA Brut ➔ Normatif */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cascade de Normalisation de la Rentabilité (QoE)
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-muted-foreground">EBITDA Comptable Historique</span>
                  <span className="font-mono font-bold text-foreground">
                    {resultat.ebitdaComptable.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <div className="flex justify-between p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-muted-foreground">Ajustements Réintégrés / Déduits</span>
                  <span
                    className={`font-mono font-bold ${
                      resultat.totalAjustementsEbitda >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {resultat.totalAjustementsEbitda >= 0 ? "+" : ""}
                    {resultat.totalAjustementsEbitda.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex justify-between p-4 bg-cyan-950/20 rounded-xl border border-cyan-500/30">
                  <span className="font-bold text-cyan-300">EBITDA NORMATIF RÉCURRENT</span>
                  <span className="font-mono font-bold text-base text-cyan-400">
                    {resultat.ebitdaNormatifAjuste.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Onglet Bridge & Valorisation */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Dettes assimilées & BFR */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Éléments Assimilés à de la Dette (Debt-Like Items)
              </h2>

              <div className="space-y-2">
                {dossier.elementsDetteAssimilee.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-card/60 rounded-lg border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{item.libelle}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Montant brut : {item.montant.toLocaleString("fr-FR")} FCFA • Proba : {item.probabiliteDecaissement}%
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">
                      - {Math.round((item.montant * item.probabiliteDecaissement) / 100).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>

              {/* Ajustement BFR */}
              <div className="p-3 bg-card/60 rounded-lg border border-border text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold block text-foreground">Ajustement BFR vs Peg Cible</span>
                  <span className="text-muted-foreground text-[11px]">
                    BFR Réel ({dossier.bfrReelCloture.toLocaleString("fr-FR")}) - Cible ({dossier.bfrNormatifCible.toLocaleString("fr-FR")})
                  </span>
                </div>
                <span
                  className={`font-mono font-bold ${
                    resultat.ajustementBfrSurPeg >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {resultat.ajustementBfrSurPeg >= 0 ? "+" : ""}
                  {resultat.ajustementBfrSurPeg.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Colonne droite : Rapport exécutif pour investisseurs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Rapport Exécutif de Due Diligence (Fonds M&A)
                </h2>
                <button
                  onClick={() => handleCopier(resultat.rapportSyntheseExecutive)}
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
                      Copier le Rapport
                    </>
                  )}
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3.5 rounded-lg border border-border leading-relaxed max-h-72 overflow-y-auto">
                {resultat.rapportSyntheseExecutive}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
