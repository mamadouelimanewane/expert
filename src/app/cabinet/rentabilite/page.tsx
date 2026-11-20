"use client";

import { useState } from "react";
import {
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Target,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  calculerRentabilite,
  calculerKpiCabinet,
  type DossierMission,
  type TypeMissionCabinet,
  type StatutMission,
} from "@/lib/ohada/rentabilite-missions";

const DOSSIERS_EXEMPLES: DossierMission[] = [
  {
    id: "DOS-001",
    client: "SONACOS SA",
    typeMission: "AUDIT_CAC",
    statut: "EN_COURS",
    dateDebut: "2025-01-15",
    honораiresContractuel: 12000000,
    factureEmise: 6000000,
    encaisse: 6000000,
    debourses: 450000,
    lignesBudget: [
      { collaborateur: "M. Faye (Associé)", gradeCollaborateur: "ASSOCIE", heuresBudgetisees: 30, heuresRealisees: 28, tauxHoraire: 60000 },
      { collaborateur: "A. Sow (Senior)", gradeCollaborateur: "SENIOR", heuresBudgetisees: 80, heuresRealisees: 95, tauxHoraire: 25000 },
      { collaborateur: "P. Diop (Junior)", gradeCollaborateur: "JUNIOR", heuresBudgetisees: 120, heuresRealisees: 110, tauxHoraire: 12000 },
    ],
  },
  {
    id: "DOS-002",
    client: "Afrique BTP SARL",
    typeMission: "EXPERTISE_JUDICIAIRE",
    statut: "FACTUREE",
    dateDebut: "2025-02-01",
    honораiresContractuel: 4500000,
    factureEmise: 4500000,
    encaisse: 2000000,
    debourses: 200000,
    lignesBudget: [
      { collaborateur: "M. Faye (Associé)", gradeCollaborateur: "ASSOCIE", heuresBudgetisees: 25, heuresRealisees: 35, tauxHoraire: 60000 },
      { collaborateur: "A. Sow (Senior)", gradeCollaborateur: "SENIOR", heuresBudgetisees: 30, heuresRealisees: 40, tauxHoraire: 25000 },
    ],
  },
  {
    id: "DOS-003",
    client: "Pharmacie Guigon",
    typeMission: "TENUE_COMPTABLE",
    statut: "TERMINEE",
    dateDebut: "2024-11-01",
    honораiresContractuel: 1500000,
    factureEmise: 0,
    encaisse: 0,
    debourses: 80000,
    lignesBudget: [
      { collaborateur: "P. Diop (Junior)", gradeCollaborateur: "JUNIOR", heuresBudgetisees: 40, heuresRealisees: 85, tauxHoraire: 12000 },
    ],
  },
];

export default function RentabiliteMissionsPage() {
  const [dossiers, setDossiers] = useState<DossierMission[]>(DOSSIERS_EXEMPLES);
  const [capaciteHeures, setCapaciteHeures] = useState(600);
  const [selectedDossierId, setSelectedDossierId] = useState<string>(DOSSIERS_EXEMPLES[0].id);

  // Formulaire nouveau dossier
  const [nouveauClient, setNouveauClient] = useState("");
  const [nouveauType, setNouveauType] = useState<TypeMissionCabinet>("CONSEIL_FISCAL");
  const [nouveauHonoraires, setNouveauHonoraires] = useState(3000000);
  const [nouveauDebourses, setNouveauDebourses] = useState(100000);

  const kpis = calculerKpiCabinet(dossiers, capaciteHeures);
  const analyses = dossiers.map(calculerRentabilite);
  const selectedAnalyse = analyses.find((a) => a.id === selectedDossierId) || analyses[0];

  const handleAjouterDossier = () => {
    if (!nouveauClient.trim()) return;
    const nouveau: DossierMission = {
      id: `DOS-00${dossiers.length + 1}`,
      client: nouveauClient,
      typeMission: nouveauType,
      statut: "EN_COURS",
      dateDebut: new Date().toISOString().split("T")[0],
      honораiresContractuel: Number(nouveauHonoraires),
      factureEmise: 0,
      encaisse: 0,
      debourses: Number(nouveauDebourses),
      lignesBudget: [
        {
          collaborateur: "Responsable Mission",
          gradeCollaborateur: "SENIOR",
          heuresBudgetisees: 40,
          heuresRealisees: 10,
          tauxHoraire: 25000,
        },
      ],
    };
    setDossiers([...dossiers, nouveau]);
    setSelectedDossierId(nouveau.id);
    setNouveauClient("");
  };

  const badgeColorRentabilite = (niveau: string) => {
    switch (niveau) {
      case "EXCELLENT":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "BON":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ACCEPTABLE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "INSUFFISANT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Pilotage & Rentabilité des Missions
              </h1>
              <p className="text-sm text-muted-foreground">
                Suivi budgétaire, coût de revient collaborateurs, marges réelles et KPIs Cabinet OHADA
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Capacité Mensuelle</span>
            <input
              type="number"
              value={capaciteHeures}
              onChange={(e) => setCapaciteHeures(Number(e.target.value))}
              className="w-24 bg-card/60 border border-border rounded px-2 py-1 text-sm text-right font-mono"
            />
            <span className="text-xs text-muted-foreground ml-1">h</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-border backdrop-blur">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">CA Contractuel</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono">
            {kpis.chiffreAffairesContractuel.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Facturé : {kpis.chiffreAffairesFacture.toLocaleString("fr-FR")} FCFA
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border backdrop-blur">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Marge Globale</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {kpis.margeGlobale.toLocaleString("fr-FR")} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Taux moyen : <span className="font-semibold text-foreground">{kpis.tauxMargeGlobal}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border backdrop-blur">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux d'Occupation</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono">
            {kpis.tauxOccupation}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.heuresTotales}h passées / {capaciteHeures}h
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border backdrop-blur">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Recouvrement</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono">
            {kpis.tauxEncaissement}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Encaissé : {kpis.encaissementTotal.toLocaleString("fr-FR")} FCFA
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-border backdrop-blur">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alertes Rentabilité</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {kpis.missionsDeficitaires + kpis.missionsMargeFaible}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.missionsDeficitaires} déficitaire(s) / {kpis.missionsMargeFaible} critique(s)
          </div>
        </div>
      </div>

      {/* Main Grid: Liste Missions + Détails */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Portefeuille de Missions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Dossiers & Missions en Cours ({dossiers.length})
            </h2>
          </div>

          <div className="space-y-2">
            {analyses.map((m) => {
              const isSelected = m.id === selectedDossierId;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedDossierId(m.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-card/90 border-emerald-500/50 shadow-sm"
                      : "bg-card/30 border-border hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{m.client}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{m.typeMission}</span>
                        <span>•</span>
                        <span>{m.heuresRealisees}h / {m.heuresBudgetisees}h</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColorRentabilite(
                        m.niveauRentabilite
                      )}`}
                    >
                      {m.niveauRentabilite}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Honoraires : </span>
                      <span className="font-mono font-medium">
                        {m.honораiresContractuel.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div className="font-mono font-semibold">
                      Marge :{" "}
                      <span
                        className={
                          m.tauxMargeContractuelle >= 20
                            ? "text-emerald-400"
                            : m.tauxMargeContractuelle > 0
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {m.tauxMargeContractuelle}%
                      </span>
                    </div>
                  </div>

                  {m.alertes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{m.alertes[0].message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulaire ajout rapide de dossier */}
          <div className="p-4 rounded-xl bg-card/20 border border-border border-dashed space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Ajouter une nouvelle mission
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nom du client / dossier"
                value={nouveauClient}
                onChange={(e) => setNouveauClient(e.target.value)}
                className="col-span-2 bg-card/60 border border-border rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60"
              />
              <select
                value={nouveauType}
                onChange={(e) => setNouveauType(e.target.value as TypeMissionCabinet)}
                className="bg-card/60 border border-border rounded px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="AUDIT_CAC">Audit CAC</option>
                <option value="COMMISSARIAT_APPORTS">Commissariat aux Apports</option>
                <option value="EXPERTISE_JUDICIAIRE">Expertise Judiciaire</option>
                <option value="CONSEIL_FISCAL">Conseil Fiscal</option>
                <option value="TENUE_COMPTABLE">Tenue Comptable</option>
                <option value="PAIE">Gestion Paie & Social</option>
                <option value="JURIDIQUE">Secrétariat Juridique</option>
                <option value="DUE_DILIGENCE">Due Diligence</option>
              </select>
              <input
                type="number"
                placeholder="Honoraires FCFA"
                value={nouveauHonoraires}
                onChange={(e) => setNouveauHonoraires(Number(e.target.value))}
                className="bg-card/60 border border-border rounded px-2.5 py-1.5 text-xs text-foreground text-right font-mono"
              />
            </div>
            <button
              onClick={handleAjouterDossier}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
            >
              Enregistrer la Mission
            </button>
          </div>
        </div>

        {/* Colonne droite : Détails Rentabilité de la mission sélectionnée */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-card/40 border border-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedAnalyse.id} • {selectedAnalyse.typeMission}
                </span>
                <h2 className="text-xl font-bold">{selectedAnalyse.client}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColorRentabilite(
                    selectedAnalyse.niveauRentabilite
                  )}`}
                >
                  Score : {selectedAnalyse.scoreRentabilite}/100 • {selectedAnalyse.niveauRentabilite}
                </span>
              </div>
            </div>

            {/* Note de synthèse */}
            <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Diagnostic économique : </span>
              {selectedAnalyse.noteSynthese}
            </div>

            {/* Alertes spécifiques */}
            {selectedAnalyse.alertes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Points de vigilance & Alertes
                </h3>
                {selectedAnalyse.alertes.map((alt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                      alt.severite === "CRITIQUE"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : alt.severite === "AVERTISSEMENT"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">{alt.code}</span>
                      <span>{alt.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Décomposition financière */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Structure de Coût de Revient vs Honoraires
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-[11px] text-muted-foreground block">Temps Passé</span>
                  <span className="text-base font-bold font-mono">
                    {selectedAnalyse.heuresRealisees}h
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    (Budgétisé: {selectedAnalyse.heuresBudgetisees}h)
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-[11px] text-muted-foreground block">Coût Collab</span>
                  <span className="text-base font-bold font-mono">
                    {selectedAnalyse.coutRevientCollab.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">FCFA</span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-[11px] text-muted-foreground block">Charges Indirectes</span>
                  <span className="text-base font-bold font-mono">
                    {selectedAnalyse.chargesIndirectes.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    (25% structure)
                  </span>
                </div>

                <div className="p-3 bg-card/60 rounded-lg border border-border">
                  <span className="text-[11px] text-muted-foreground block">Coût de Revient Total</span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {selectedAnalyse.coutRevientTotal.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">FCFA</span>
                </div>
              </div>
            </div>

            {/* Marges et Trésorerie */}
            <div className="p-4 rounded-xl bg-card/60 border border-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marge & Rentabilité Nette
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Honoraires Contractuels</span>
                  <span className="font-mono font-medium">
                    {selectedAnalyse.honораiresContractuel.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Moins Coût de Revient Complet</span>
                  <span className="font-mono font-medium text-rose-400">
                    - {selectedAnalyse.coutRevientTotal.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span>Marge Nette Dégagée</span>
                  <span
                    className={`font-mono ${
                      selectedAnalyse.margeContractuelle >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {selectedAnalyse.margeContractuelle.toLocaleString("fr-FR")} FCFA (
                    {selectedAnalyse.tauxMargeContractuelle}%)
                  </span>
                </div>
              </div>

              {/* Progress bar de rentabilité */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Taux de Marge</span>
                  <span>Cible Cabinet : 30%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedAnalyse.tauxMargeContractuelle >= 30
                        ? "bg-emerald-500"
                        : selectedAnalyse.tauxMargeContractuelle >= 15
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, selectedAnalyse.tauxMargeContractuelle))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
