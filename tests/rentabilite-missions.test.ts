// Tests — Rentabilité des Missions Cabinet
import { describe, it, expect } from "vitest";
import {
  calculerRentabilite,
  calculerKpiCabinet,
  type DossierMission,
} from "@/lib/ohada/rentabilite-missions";

const dossierBon: DossierMission = {
  id: "D-001",
  client: "SARL Ndiaye & Frères",
  typeMission: "AUDIT_CAC",
  statut: "FACTUREE",
  dateDebut: "2025-01-01",
  honораiresContractuel: 5_000_000,
  factureEmise: 5_000_000,
  encaisse: 4_500_000,
  debourses: 150_000,
  lignesBudget: [
    { collaborateur: "Diallo A.", gradeCollaborateur: "ASSOCIE", heuresBudgetisees: 20, heuresRealisees: 22, tauxHoraire: 50_000 },
    { collaborateur: "Seck B.", gradeCollaborateur: "SENIOR", heuresBudgetisees: 60, heuresRealisees: 65, tauxHoraire: 20_000 },
    { collaborateur: "Ndir C.", gradeCollaborateur: "JUNIOR", heuresBudgetisees: 80, heuresRealisees: 80, tauxHoraire: 10_000 },
  ],
};

const dossierDeficitaire: DossierMission = {
  id: "D-002",
  client: "ETS Koné Import",
  typeMission: "TENUE_COMPTABLE",
  statut: "TERMINEE",
  dateDebut: "2025-03-01",
  dateFin: "2025-06-30",
  honораiresContractuel: 1_200_000,
  factureEmise: 0, // non facturée !
  encaisse: 0,
  debourses: 50_000,
  lignesBudget: [
    { collaborateur: "Ndir C.", gradeCollaborateur: "JUNIOR", heuresBudgetisees: 40, heuresRealisees: 100, tauxHoraire: 10_000 },
  ],
};

describe("Rentabilité des Missions", () => {
  it("calcule correctement le coût de revient et la marge sur un dossier sain", () => {
    const analyse = calculerRentabilite(dossierBon);
    // Coût collab = 22×50000 + 65×20000 + 80×10000 = 1100000+1300000+800000 = 3200000
    // Charges indirectes = 25% × 3200000 = 800000
    // Coût total = 3200000 + 150000 + 800000 = 4150000
    expect(analyse.coutRevientCollab).toBe(3_200_000);
    expect(analyse.chargesIndirectes).toBe(800_000);
    expect(analyse.coutRevientTotal).toBe(4_150_000);
    expect(analyse.margeContractuelle).toBe(850_000);
    expect(analyse.tauxMargeContractuelle).toBeGreaterThan(10);
  });

  it("détecte le dépassement heures et génère une alerte", () => {
    const analyse = calculerRentabilite(dossierBon);
    // heures réalisées = 22+65+80 = 167 / budgétisées = 20+60+80 = 160 → dépassement ~4%
    expect(analyse.ecartHeures).toBe(7);
    // 4% < 10% → pas d'alerte dépassement
    const alertesDepassement = analyse.alertes.filter(a => a.code.includes("DEPASSEMENT"));
    expect(alertesDepassement).toHaveLength(0);
  });

  it("détecte mission terminée non facturée et marge insuffisante sur dossier déficitaire", () => {
    const analyse = calculerRentabilite(dossierDeficitaire);
    // coût = 100×10000 = 1000000 + chargesInd 250000 + débours 50000 = 1300000
    expect(analyse.coutRevientTotal).toBe(1_300_000);
    // marge = 1200000 - 1300000 = -100000
    expect(analyse.margeContractuelle).toBeLessThan(0);
    expect(analyse.niveauRentabilite).toBe("DEFICITAIRE");
    const codes = analyse.alertes.map(a => a.code);
    expect(codes).toContain("MISSION_TERMINEE_NON_FACTUREE");
    expect(codes).toContain("MARGE_INSUFFISANTE");
  });

  it("calcule le dépassement heures critique (> 25%) et génère alerte CRITIQUE", () => {
    const dossierDepassement: DossierMission = {
      ...dossierBon,
      id: "D-003",
      lignesBudget: [
        { collaborateur: "X", gradeCollaborateur: "JUNIOR", heuresBudgetisees: 40, heuresRealisees: 60, tauxHoraire: 10_000 },
      ],
    };
    const analyse = calculerRentabilite(dossierDepassement);
    // dépassement = (60-40)/40 = 50%
    expect(analyse.tauxDepassement).toBe(50);
    const alerte = analyse.alertes.find(a => a.code === "DEPASSEMENT_CRITIQUE");
    expect(alerte).toBeDefined();
    expect(alerte?.severite).toBe("CRITIQUE");
  });

  it("calcule les KPIs cabinet sur un portefeuille de dossiers", () => {
    const kpi = calculerKpiCabinet([dossierBon, dossierDeficitaire], 1200);
    expect(kpi.nbMissions).toBe(2);
    expect(kpi.heuresTotales).toBeGreaterThan(100);
    expect(kpi.chiffreAffairesContractuel).toBe(6_200_000);
    expect(kpi.missionsDeficitaires).toBe(1);
    expect(kpi.tauxOccupation).toBeGreaterThan(0);
  });

  it("identifie le Top et Flop des missions par marge", () => {
    const kpi = calculerKpiCabinet([dossierBon, dossierDeficitaire], 1200);
    // Top = mission bon (marge positive)
    expect(kpi.topMissions[0].margeReelle).toBeGreaterThan(0);
    // Flop = mission déficitaire (marge négative ou nulle)
    const flopMarges = kpi.flop3Missions.map(m => m.margeReelle);
    expect(Math.min(...flopMarges)).toBeLessThanOrEqual(kpi.topMissions[0].margeReelle);
  });
});
