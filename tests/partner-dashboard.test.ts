import { describe, it, expect } from "vitest";
import {
  evaluerPerformanceAssocie,
  analyserCollegeAssocies,
  type AssocieCabinet,
  type DossierAssocie,
  type OpportuniteCommerciale,
} from "@/lib/ohada/partner-dashboard";

describe("Dashboard Associé & Collège des Associés", () => {
  const associe1: AssocieCabinet = {
    id: "ASS-1",
    nom: "Mamadou Faye",
    email: "mfaye@cabinet-expert.sn",
    specialite: "AUDIT_COMMISSARIAT",
    objectifCAAnnuel: 100_000_000,
    tauxOccupationCible: 75,
  };

  const associe2: AssocieCabinet = {
    id: "ASS-2",
    nom: "Aminata Diallo",
    email: "adiallo@cabinet-expert.sn",
    specialite: "FISCALITE_ET_DROIT",
    objectifCAAnnuel: 80_000_000,
    tauxOccupationCible: 70,
  };

  const dossiers: DossierAssocie[] = [
    {
      id: "D1",
      associeId: "ASS-1",
      clientNom: "TotalEnergies SN",
      statut: "EN_COURS",
      honораiresContractuels: 50_000_000,
      honораiresFactures: 50_000_000,
      honораiresEncaisses: 45_000_000,
      heuresFacturablesPassees: 180,
      heuresBudgetisees: 160,
      dsoMoyenJours: 35,
    },
    {
      id: "D2",
      associeId: "ASS-1",
      clientNom: "Suneor SA",
      statut: "EN_COURS",
      honораiresContractuels: 30_000_000,
      honораiresFactures: 30_000_000,
      honораiresEncaisses: 28_000_000,
      heuresFacturablesPassees: 100,
      heuresBudgetisees: 110,
      dsoMoyenJours: 40,
    },
    {
      id: "D3",
      associeId: "ASS-2",
      clientNom: "Holding Pêche",
      statut: "EN_COURS",
      honораiresContractuels: 25_000_000,
      honораiresFactures: 20_000_000,
      honораiresEncaisses: 10_000_000,
      heuresFacturablesPassees: 90,
      heuresBudgetisees: 80,
      dsoMoyenJours: 85, // DSO élevé !
    },
  ];

  const opportunites: OpportuniteCommerciale[] = [
    {
      id: "OPP-1",
      associeId: "ASS-1",
      prospectNom: "Banque Atlantique",
      typeMission: "AUDIT_CAC",
      montantEstime: 20_000_000,
      probabilite: 60,
      stade: "NEGOCIATION",
    },
    {
      id: "OPP-2",
      associeId: "ASS-2",
      prospectNom: "Bolloré Transport",
      typeMission: "CONSEIL_FISCAL",
      montantEstime: 15_000_000,
      probabilite: 50,
      stade: "OFFRE_EMISE",
    },
  ];

  it("calcule avec rigueur les KPIs individuels de l'associé", () => {
    const perf1 = evaluerPerformanceAssocie(associe1, dossiers, opportunites);
    // CA Facturé = 50M + 30M = 80M
    expect(perf1.caFacture).toBe(80_000_000);
    // Taux atteinte = 80M / 100M = 80%
    expect(perf1.tauxAtteinteObjectif).toBe(80);
    // DSO pondéré = (35*50 + 40*30) / 80 = (1750 + 1200) / 80 = 2950 / 80 = 36.875 -> 37 jours
    expect(perf1.dsoPondere).toBe(37);
    // Pipeline pondéré = 20M * 60% = 12M
    expect(perf1.pipelinePondere).toBe(12_000_000);
    expect(perf1.scorePerformance).toBeGreaterThan(60);
  });

  it("détecte les anomalies de recouvrement et alertes pour l'associé en retard", () => {
    const perf2 = evaluerPerformanceAssocie(associe2, dossiers, opportunites);
    // Taux atteinte = 20M / 80M = 25% (< 50%) -> alerte retard
    expect(perf2.tauxAtteinteObjectif).toBe(25);
    expect(perf2.dsoPondere).toBe(85); // > 75j -> alerte DSO
    expect(perf2.alertes.some((a) => a.includes("DSO"))).toBe(true);
    expect(perf2.alertes.some((a) => a.includes("Retard sur l'objectif"))).toBe(true);
  });

  it("calcule la synthèse globale du Collège des Associés", () => {
    const synthese = analyserCollegeAssocies([associe1, associe2], dossiers, opportunites);
    expect(synthese.caTotalFacture).toBe(100_000_000);
    expect(synthese.caTotalEncaisse).toBe(83_000_000);
    expect(synthese.objectifGlobalCabinet).toBe(180_000_000);
    expect(synthese.pipelineCommercialTotal).toBe(19_500_000); // 12M + 7.5M
    expect(synthese.classementAssocies[0].nom).toBe("Mamadou Faye");
  });
});
