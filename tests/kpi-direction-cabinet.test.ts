import { describe, it, expect } from "vitest";
import {
  genererRapportDirection,
  type KPICabinet,
} from "../src/lib/ohada/kpi-direction-cabinet";

const KPIS_SAINS: KPICabinet = {
  periode: "Novembre 2024",
  factureEmises_XOF: 50_000_000,
  factureEncaissees_XOF: 45_000_000,
  enCoursRecouvrement_XOF: 5_000_000,
  tauxRecouvrement_pct: 90,
  wip_XOF: 6_000_000, // 12% des factures émises
  wipParCollaborateur: [
    { nom: "Amadou SOW", wip_XOF: 3_000_000, objectif_XOF: 5_000_000 },
    { nom: "Fatou DIOP", wip_XOF: 3_000_000, objectif_XOF: 5_000_000 },
  ],
  nbMissionsActives: 25,
  nbMissionsEnRetard: 2, // 8% de retard
  margeGlobaleMissions_pct: 42,
  delaiMoyenRecouvrement_jours: 32,
  delaiMoyenProduction_jours: 18,
  alertes: [],
};

describe("Tableau de Bord Direction Executive Cabinet (KPIs Temps Réel)", () => {
  it("calcule un score de performance global cohérent pour un cabinet sain", () => {
    const rapport = genererRapportDirection("Cabinet EXPERT 360", KPIS_SAINS);
    expect(rapport.scorePerformanceGlobal).toBeGreaterThanOrEqual(70);
    expect(rapport.cabinet).toBe("Cabinet EXPERT 360");
    expect(rapport.narratifExecutif).toContain("Cabinet EXPERT 360");
  });

  it("génère une alerte CRITICAL si le taux de recouvrement est inférieur à 60%", () => {
    const kpisDegrades: KPICabinet = {
      ...KPIS_SAINS,
      tauxRecouvrement_pct: 52,
      factureEncaissees_XOF: 26_000_000,
    };
    const rapport = genererRapportDirection("Cabinet EXPERT 360", kpisDegrades);
    const alerteCritique = rapport.kpis.alertes.find((a) => a.niveau === "CRITICAL");
    expect(alerteCritique).toBeDefined();
    expect(alerteCritique?.message).toContain("recouvrement");
  });

  it("détermine la tendance HAUSSE si le taux de recouvrement N > N-1 de plus de 2 pts", () => {
    const kpisN1: Partial<KPICabinet> = {
      tauxRecouvrement_pct: 82, // N est à 90% (+8 pts)
    };
    const rapport = genererRapportDirection("Cabinet EXPERT 360", KPIS_SAINS, kpisN1);
    expect(rapport.tendance).toBe("HAUSSE");
  });

  it("génère au moins une recommandation si le score est inférieur à 70", () => {
    const kpisMoyens: KPICabinet = {
      ...KPIS_SAINS,
      tauxRecouvrement_pct: 68,
      margeGlobaleMissions_pct: 25,
      delaiMoyenProduction_jours: 45,
      wip_XOF: 35_000_000,
    };
    const rapport = genererRapportDirection("Cabinet EXPERT 360", kpisMoyens);
    expect(rapport.scorePerformanceGlobal).toBeLessThan(70);
    expect(rapport.recommandationsDirection.length).toBeGreaterThan(0);
  });
});
