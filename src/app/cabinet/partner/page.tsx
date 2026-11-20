"use client";

import { useState } from "react";
import {
  Users,
  Award,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Briefcase,
  PieChart,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import {
  evaluerPerformanceAssocie,
  analyserCollegeAssocies,
  type AssocieCabinet,
  type DossierAssocie,
  type OpportuniteCommerciale,
} from "@/lib/ohada/partner-dashboard";

const ASSOCIES_INIT: AssocieCabinet[] = [
  {
    id: "ASS-1",
    nom: "Mamadou Faye",
    email: "mfaye@cabinet-expert.sn",
    specialite: "AUDIT_COMMISSARIAT",
    objectifCAAnnuel: 120000000,
    tauxOccupationCible: 75,
  },
  {
    id: "ASS-2",
    nom: "Aminata Diallo",
    email: "adiallo@cabinet-expert.sn",
    specialite: "FISCALITE_ET_DROIT",
    objectifCAAnnuel: 100000000,
    tauxOccupationCible: 70,
  },
  {
    id: "ASS-3",
    nom: "Cheikh Tidiane Diop",
    email: "ctdiop@cabinet-expert.sn",
    specialite: "TRANSACTION_ET_CONSEIL",
    objectifCAAnnuel: 80000000,
    tauxOccupationCible: 65,
  },
];

const DOSSIERS_INIT: DossierAssocie[] = [
  {
    id: "D1",
    associeId: "ASS-1",
    clientNom: "TotalEnergies Sénégal",
    statut: "EN_COURS",
    honораiresContractuels: 65000000,
    honораiresFactures: 65000000,
    honораiresEncaisses: 60000000,
    heuresFacturablesPassees: 220,
    heuresBudgetisees: 200,
    dsoMoyenJours: 38,
  },
  {
    id: "D2",
    associeId: "ASS-1",
    clientNom: "Banque Islamique du Sénégal",
    statut: "EN_COURS",
    honораiresContractuels: 40000000,
    honораiresFactures: 40000000,
    honораiresEncaisses: 38000000,
    heuresFacturablesPassees: 140,
    heuresBudgetisees: 150,
    dsoMoyenJours: 32,
  },
  {
    id: "D3",
    associeId: "ASS-2",
    clientNom: "Groupe Kirène",
    statut: "EN_COURS",
    honораiresContractuels: 45000000,
    honораiresFactures: 35000000,
    honораiresEncaisses: 25000000,
    heuresFacturablesPassees: 130,
    heuresBudgetisees: 120,
    dsoMoyenJours: 55,
  },
  {
    id: "D4",
    associeId: "ASS-3",
    clientNom: "Free Sénégal (Teyliom)",
    statut: "EN_COURS",
    honораiresContractuels: 55000000,
    honораiresFactures: 50000000,
    honораiresEncaisses: 42000000,
    heuresFacturablesPassees: 160,
    heuresBudgetisees: 170,
    dsoMoyenJours: 44,
  },
];

const OPPORTUNITES_INIT: OpportuniteCommerciale[] = [
  {
    id: "OPP-1",
    associeId: "ASS-1",
    prospectNom: "Port Autonome de Dakar",
    typeMission: "Commissariat aux Comptes",
    montantEstime: 30000000,
    probabilite: 70,
    stade: "NEGOCIATION",
  },
  {
    id: "OPP-2",
    associeId: "ASS-2",
    prospectNom: "Société des Mines de Sabodala",
    typeMission: "Audit Fiscal & Prix de Transfert",
    montantEstime: 25000000,
    probabilite: 60,
    stade: "OFFRE_EMISE",
  },
  {
    id: "OPP-3",
    associeId: "ASS-3",
    prospectNom: "Wari FinTech",
    typeMission: "Due Diligence M&A",
    montantEstime: 20000000,
    probabilite: 40,
    stade: "PROSPECTION",
  },
];

export default function PartnerDashboardPage() {
  const [associes] = useState<AssocieCabinet[]>(ASSOCIES_INIT);
  const [dossiers] = useState<DossierAssocie[]>(DOSSIERS_INIT);
  const [opportunites] = useState<OpportuniteCommerciale[]>(OPPORTUNITES_INIT);
  const [selectedAssocieId, setSelectedAssocieId] = useState<string>(ASSOCIES_INIT[0].id);

  const synthese = analyserCollegeAssocies(associes, dossiers, opportunites);
  const perfActive =
    synthese.associesPerformances.find((p) => p.associe.id === selectedAssocieId) ||
    synthese.associesPerformances[0];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Associés & Gouvernance Cabinet
            </h1>
            <p className="text-sm text-muted-foreground">
              Suivi des objectifs de facturation, délai moyen de règlement (DSO) et pipeline d'affaires
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Cabinet Globaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            CA Facturé Collège
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {synthese.caTotalFacture.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Objectif : {synthese.objectifGlobalCabinet.toLocaleString("fr-FR")} FCFA
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Taux d'Atteinte Global
          </span>
          <div className="text-xl font-bold font-mono text-blue-400">
            {synthese.tauxAtteinteGlobal}%
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Budget annuel consolidé
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Encaissements Réalisés
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">
            {synthese.caTotalEncaisse.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            {Math.round((synthese.caTotalEncaisse / synthese.caTotalFacture) * 100)}% encaissé
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            DSO Moyen Cabinet
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {synthese.dsoMoyenCabinet} <span className="text-xs text-muted-foreground font-normal">jours</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Cible : &lt; 45 jours
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            Pipeline Commercial
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {synthese.pipelineCommercialTotal.toLocaleString("fr-FR")} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">
            Pondéré par probabilités
          </span>
        </div>
      </div>

      {/* Main Grid: Classement / Sélection Associé + Fiche Associé */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Collège des associés & Podium */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Collège des Associés ({associes.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {synthese.associesPerformances.map((perf, index) => {
              const isSelected = perf.associe.id === selectedAssocieId;
              return (
                <div
                  key={perf.associe.id}
                  onClick={() => setSelectedAssocieId(perf.associe.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-card/90 border-indigo-500/50 shadow-sm"
                      : "bg-card/30 border-border hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{perf.associe.nom}</div>
                        <div className="text-xs text-muted-foreground">
                          {perf.associe.specialite.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Score : {perf.scorePerformance}/100
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-border/40 pt-2.5">
                    <div>
                      <span className="text-muted-foreground block">Facturation :</span>
                      <span className="font-mono font-semibold text-foreground">
                        {perf.caFacture.toLocaleString("fr-FR")} FCFA ({perf.tauxAtteinteObjectif}%)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block">DSO Client :</span>
                      <span className="font-mono font-semibold text-amber-400">
                        {perf.dsoPondere} jours
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : Fiche détaillée de l'associé sélectionné */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-5">
            {/* Header associé */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono">
                  {perfActive.associe.id} • {perfActive.associe.email}
                </span>
                <h2 className="text-xl font-bold">{perfActive.associe.nom}</h2>
                <span className="text-xs text-indigo-400 font-medium">
                  Associé Référent — {perfActive.associe.specialite.replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Objectif Annuel</span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {perfActive.associe.objectifCAAnnuel.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Alertes d'activité associées */}
            {perfActive.alertes.length > 0 && (
              <div className="space-y-2">
                {perfActive.alertes.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Performance commerciale & indicateurs */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Facturation Réalisée</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {perfActive.caFacture.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {perfActive.tauxAtteinteObjectif}% de l'objectif
                </span>
              </div>

              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Délai Moyen (DSO)</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {perfActive.dsoPondere} j
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Règlement clients
                </span>
              </div>

              <div className="p-3 bg-card/60 rounded-lg border border-border">
                <span className="text-[11px] text-muted-foreground block">Pipeline Détecté</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {perfActive.pipelinePondere.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  FCFA pondéré
                </span>
              </div>
            </div>

            {/* Dossiers rattachés */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Portefeuille Actif ({perfActive.nbDossiersActifs} dossiers)
              </h3>
              <div className="space-y-2">
                {dossiers
                  .filter((d) => d.associeId === perfActive.associe.id)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-card/60 rounded-lg border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{d.clientNom}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {d.heuresFacturablesPassees}h passées • DSO {d.dsoMoyenJours}j
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-semibold text-emerald-400">
                          {d.honораiresFactures.toLocaleString("fr-FR")} FCFA
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Encaissé : {d.honораiresEncaisses.toLocaleString("fr-FR")} FCFA
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Opportunités du pipeline */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline Commercial Associé
              </h3>
              <div className="space-y-2">
                {opportunites
                  .filter((o) => o.associeId === perfActive.associe.id)
                  .map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 bg-card/60 rounded-lg border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{opp.prospectNom}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {opp.typeMission} • Probabilité : {opp.probabilite}%
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-cyan-400 block">
                          {opp.montantEstime.toLocaleString("fr-FR")} FCFA
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-border text-muted-foreground">
                          {opp.stade}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
