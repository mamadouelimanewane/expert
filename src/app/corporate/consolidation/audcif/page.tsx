"use client";

import { useState } from "react";
import {
  Layers,
  Building2,
  DollarSign,
  Copy,
  CheckCircle2,
  Globe,
  PieChart,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  consoliderComptesSYSCOHADA,
  type DossierConsolidation,
} from "@/lib/ohada/consolidation-syscohada";

const DOSSIER_DEMO: DossierConsolidation = {
  societeMere: {
    raisonSociale: "Holding Panafricaine SA (Dakar)",
    totalActif: 12500000000,
    capitauxPropres: 7000000000,
    dettes: 5500000000,
    chiffreAffaires: 9200000000,
    resultatNet: 880000000,
  },
  filiales: [
    {
      id: "FIL-1",
      raisonSociale: "Filiale Abidjan SA (Côte d'Ivoire)",
      pays: "Côte d'Ivoire",
      devise: "XOF",
      tauxConversionVersXOF: 1.0,
      pourcentageDetention: 80,
      pourcentageControle: 80,
      methodeConsolidation: "INTEGRATION_GLOBALE",
      totalActifLocal: 4500000000,
      capitauxPropresLocaux: 2200000000,
      dettesLocales: 2300000000,
      chiffreAffairesLocal: 3800000000,
      resultatNetLocal: 420000000,
      valeurTitresDansMere: 2000000000,
    },
    {
      id: "FIL-2",
      raisonSociale: "JV Douala SARL (Cameroun)",
      pays: "Cameroun",
      devise: "XAF",
      tauxConversionVersXOF: 1.0,
      pourcentageDetention: 50,
      pourcentageControle: 50,
      methodeConsolidation: "INTEGRATION_PROPORTIONNELLE",
      totalActifLocal: 2400000000,
      capitauxPropresLocaux: 1100000000,
      dettesLocales: 1300000000,
      chiffreAffairesLocal: 1500000000,
      resultatNetLocal: 180000000,
      valeurTitresDansMere: 550000000,
    },
  ],
  operationsReciproques: [
    {
      id: "OP-1",
      societeA: "Holding Panafricaine SA",
      societeB: "Filiale Abidjan SA",
      typeFlux: "CREANCE_DETTE",
      montant: 350000000,
    },
    {
      id: "OP-2",
      societeA: "Holding Panafricaine SA",
      societeB: "Filiale Abidjan SA",
      typeFlux: "ACHAT_VENTE",
      montant: 580000000,
    },
    {
      id: "OP-3",
      societeA: "Filiale Abidjan SA",
      societeB: "Holding Panafricaine SA",
      typeFlux: "DIVIDENDE_INTERNE",
      montant: 120000000,
    },
  ],
};

export default function ConsolidationAudcifPage() {
  const [dossier] = useState<DossierConsolidation>(DOSSIER_DEMO);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const rapport = consoliderComptesSYSCOHADA(dossier);

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
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Consolidation SYSCOHADA (AUDCIF Art. 74-110)
            </h1>
            <p className="text-sm text-muted-foreground">
              Intégration Globale, Proportionnelle, Élimination des réciproques et calcul du Goodwill
            </p>
          </div>
        </div>
      </div>

      {/* Cartes KPI Consolidation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Actif Total Consolidé
          </span>
          <div className="text-xl font-bold font-mono text-foreground">
            {rapport.bilanConsolide.totalActifConsolide.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Goodwill : {rapport.bilanConsolide.goodwillTotal.toLocaleString("fr-FR")} FCFA
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Chiffre d'Affaires Consolidé
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {rapport.compteResultatConsolide.chiffreAffairesConsolide.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Après neutralisation ventes internes
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Résultat Net Part du Groupe
          </span>
          <div className="text-xl font-bold font-mono text-blue-400">
            {rapport.compteResultatConsolide.partDuGroupe.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Minoritaires : {rapport.compteResultatConsolide.partDesMinoritaires.toLocaleString("fr-FR")} FCFA
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Capitaux Propres Consolidés
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">
            {rapport.bilanConsolide.capitauxPropresPartDuGroupe.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Intérêts minoritaires : {rapport.bilanConsolide.interetsMinoritairesCapitaux.toLocaleString("fr-FR")} FCFA
          </span>
        </div>
      </div>

      {/* Main Grid: Filiales / Goodwill & Écritures d'élimination */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Périmètre & Goodwill */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Périmètre de Consolidation & Goodwill
            </h2>

            <div className="space-y-3">
              {dossier.filiales.map((f, i) => {
                const gw = rapport.tableauGoodwillParFiliale.find((g) => g.filiale === f.raisonSociale);
                return (
                  <div key={f.id} className="p-3.5 bg-card/60 rounded-xl border border-border space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-foreground">{f.raisonSociale}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {f.pays} • Détention : {f.pourcentageDetention}% • Méthode : {f.methodeConsolidation.replace(/_/g, " ")}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        CA : {f.chiffreAffairesLocal.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">Écart d'Acquisition (Goodwill) :</span>
                      <span className="font-mono font-bold text-indigo-400">
                        {gw?.goodwill.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Écritures d'élimination */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Journal des Écritures d'Élimination Intragroupe
              </h3>
              <div className="space-y-2">
                {rapport.ecrituresElimination.map((ec) => (
                  <div
                    key={ec.numero}
                    className="p-3 bg-card/60 rounded-lg border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-muted-foreground text-[10px] block">
                        Écriture #{ec.numero}
                      </span>
                      <span className="font-medium text-foreground">{ec.libelle}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400">
                      - {ec.montant.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Rapport officiel de consolidation AUDCIF */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Rapport de Consolidation (AUDCIF Art. 74 à 110)
              </h2>
              <button
                onClick={() => handleCopier(rapport.syntheseRapportAUDCIF)}
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

            <pre className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground bg-muted/10 p-3.5 rounded-lg border border-border leading-relaxed max-h-80 overflow-y-auto">
              {rapport.syntheseRapportAUDCIF}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
