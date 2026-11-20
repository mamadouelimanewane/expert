"use client";

import { useState } from "react";
import {
  TrendingUp,
  Scale,
  PieChart,
  DollarSign,
  Copy,
  CheckCircle2,
  Building2,
  Globe,
  Sliders,
  Layers,
} from "lucide-react";
import {
  evaluerEntreprise,
  calculerCoutCapitalWACC,
  type ParametresEvaluationDCF,
  type ParametresMultiples,
  type ParametresANR,
} from "@/lib/ohada/evaluation-entreprise";

const DCF_INIT: ParametresEvaluationDCF = {
  waccParams: {
    tauxSansRisque: 6.5,
    betaSecteur: 1.1,
    primeRisqueMarche: 6.0,
    primeRisquePaysCRP: 3.5,
    tauxInteretDette: 8.5,
    tauxIS: 0.3,
    proportionFondsPropres: 0.6,
    proportionDette: 0.4,
  },
  tauxCroissancePerpetuelle: 2.5,
  projections: [
    {
      annee: 1,
      chiffreAffaires: 2100000000,
      ebit: 310000000,
      impotTheorique: 93000000,
      dotationsAmortissements: 80000000,
      capexInvestissements: 65000000,
      variationBFR: 22000000,
      freeCashFlowToFirm: 210000000,
    },
    {
      annee: 2,
      chiffreAffaires: 2350000000,
      ebit: 350000000,
      impotTheorique: 105000000,
      dotationsAmortissements: 85000000,
      capexInvestissements: 70000000,
      variationBFR: 25000000,
      freeCashFlowToFirm: 235000000,
    },
    {
      annee: 3,
      chiffreAffaires: 2600000000,
      ebit: 390000000,
      impotTheorique: 117000000,
      dotationsAmortissements: 90000000,
      capexInvestissements: 75000000,
      variationBFR: 28000000,
      freeCashFlowToFirm: 260000000,
    },
  ],
  tresorerieCloture: 180000000,
  dettesFinancieresCloture: 420000000,
};

const MULTIPLES_INIT: ParametresMultiples = {
  ebitdaCible: 460000000,
  multipleEbitdaSectoriel: 6.0,
  decoteIlliquidite: 25,
  tresorerieNetteComptable: -240000000,
};

const ANR_INIT: ParametresANR = {
  actifNetComptable: 850000000,
  plusValuesLatentesImmo: 480000000,
  provisionsNonJustifiees: 45000000,
  valeurFondsDeCommerce: 320000000,
};

export default function EvaluationEntreprisePage() {
  const [nomEntreprise, setNomEntreprise] = useState("Dakar Logistique SA");
  const [secteur, setSecteur] = useState("Transport & Supply Chain");
  const [pays, setPays] = useState("Sénégal");

  const [dcfParams, setDcfParams] = useState<ParametresEvaluationDCF>(DCF_INIT);
  const [multiplesParams, setMultiplesParams] = useState<ParametresMultiples>(MULTIPLES_INIT);
  const [anrParams, setAnrParams] = useState<ParametresANR>(ANR_INIT);
  const [copieEffectuee, setCopieEffectuee] = useState(false);

  const evaluation = evaluerEntreprise(
    nomEntreprise,
    secteur,
    pays,
    dcfParams,
    multiplesParams,
    anrParams
  );

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
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Évaluation Financière d'Entreprise
            </h1>
            <p className="text-sm text-muted-foreground">
              Approche multicritères : DCF (avec Risque Pays UEMOA), Multiples BRVM et Actif Net Réévalué
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nomEntreprise}
            onChange={(e) => setNomEntreprise(e.target.value)}
            className="bg-card/60 border border-border rounded px-3 py-1.5 text-xs font-semibold"
            placeholder="Nom de l'entreprise"
          />
        </div>
      </div>

      {/* Cartes Synthèse Multicritères */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Valeur Centrale Retenue
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {evaluation.valeurCentraleRetenue.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Pondération (50% DCF, 30% Multiples, 20% ANR)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Méthode DCF (Flux de Tréso)
          </span>
          <div className="text-lg font-bold font-mono text-cyan-400">
            {evaluation.equityValueDCF.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            WACC : {evaluation.waccCalcule}% (CRP : +{dcfParams.waccParams.primeRisquePaysCRP}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Méthode Multiples BRVM
          </span>
          <div className="text-lg font-bold font-mono text-blue-400">
            {evaluation.equityValueMultiples.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Multiple {multiplesParams.multipleEbitdaSectoriel}x (décote {multiplesParams.decoteIlliquidite}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Méthode ANR (Patrimoniale)
          </span>
          <div className="text-lg font-bold font-mono text-purple-400">
            {evaluation.equityValueANR.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Actif net réévalué + Goodwill
          </span>
        </div>
      </div>

      {/* Grille principale : Paramètres WACC & Rapport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Paramètres WACC et Risque Pays */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Paramètres du Coût du Capital (WACC / CMPC)
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Taux sans risque UEMOA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dcfParams.waccParams.tauxSansRisque}
                    onChange={(e) =>
                      setDcfParams((prev) => ({
                        ...prev,
                        waccParams: { ...prev.waccParams, tauxSansRisque: Number(e.target.value) },
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Prime Risque Pays (CRP)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dcfParams.waccParams.primeRisquePaysCRP}
                    onChange={(e) =>
                      setDcfParams((prev) => ({
                        ...prev,
                        waccParams: { ...prev.waccParams, primeRisquePaysCRP: Number(e.target.value) },
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right text-emerald-400 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-foreground block mb-1">Bêta Sectoriel</label>
                  <input
                    type="number"
                    step="0.05"
                    value={dcfParams.waccParams.betaSecteur}
                    onChange={(e) =>
                      setDcfParams((prev) => ({
                        ...prev,
                        waccParams: { ...prev.waccParams, betaSecteur: Number(e.target.value) },
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Croissance perpétuelle (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dcfParams.tauxCroissancePerpetuelle}
                    onChange={(e) =>
                      setDcfParams((prev) => ({
                        ...prev,
                        tauxCroissancePerpetuelle: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-card/60 border border-border rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span>Coût des Fonds Propres (Ke) :</span>
                  <span className="font-mono text-emerald-400">{evaluation.coutFondsPropres}%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Taux WACC retenu :</span>
                  <span className="font-mono text-emerald-400">{evaluation.waccCalcule}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Rapport d'évaluation officiel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Rapport d'Évaluation Financière (Normes ONECCA)
              </h2>
              <button
                onClick={() => handleCopier(evaluation.rapportEvaluationFormel)}
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
              {evaluation.rapportEvaluationFormel}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
