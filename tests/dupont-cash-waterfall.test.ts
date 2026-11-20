import { describe, it, expect } from "vitest";
import {
  calculerDuPont,
  genererWaterfallTresorerie,
  calculerCashRunway,
  genererRapportDuPontCashflow,
  type InputDuPont,
} from "../src/lib/ohada/dupont-cash-waterfall";

const INPUT_DUPONT_NORMAL: InputDuPont = {
  exercice: 2024,
  resultatNet_XOF: 48_000_000,
  chiffreAffaires_XOF: 400_000_000,
  totalActif_XOF: 350_000_000,
  capitauxPropres_XOF: 120_000_000,
  // N-1
  exerciceN1: 2023,
  resultatNetN1_XOF: 32_000_000,
  chiffreAffairesN1_XOF: 380_000_000,
  totalActifN1_XOF: 340_000_000,
  capitauxPropresN1_XOF: 115_000_000,
};

describe("Cockpit DuPont & Cash Waterfall (Fathom/Syft Standard)", () => {
  it("décompose correctement le ROE DuPont en 3 composantes et détecte une progression N vs N-1", () => {
    const result = calculerDuPont(INPUT_DUPONT_NORMAL);

    // Marge nette = 48M / 400M = 12%
    expect(result.margeNette_pct).toBeCloseTo(12.0, 1);
    // Rotation actif = 400M / 350M ≈ 1.143
    expect(result.rotationActif).toBeCloseTo(1.143, 2);
    // Levier = 350M / 120M ≈ 2.917
    expect(result.levierFinancier).toBeCloseTo(2.917, 2);
    // ROE = 12% × 1.143 × 2.917 ≈ 40%
    expect(result.roe_pct).toBeGreaterThan(30);
    // Comparaison N-1 → delta positif
    expect(result.deltaRoe_pts).toBeDefined();
    expect(result.deltaRoe_pts!).toBeGreaterThan(0);
    expect(result.diagnosticDuPont).toContain("ROE");
  });

  it("génère un waterfall de trésorerie cohérent de l'EBE à la trésorerie nette", () => {
    const wf = genererWaterfallTresorerie(
      95_000_000,   // EBE
      -15_000_000,  // Dégradation BFR
      30_000_000,   // Investissements
      20_000_000,   // Remboursements
      8_000_000     // IS
    );

    // EBE + BFR = 80M (opérationnel)
    expect(wf.cashFlowOperationnel_XOF).toBe(80_000_000);
    // Trésorerie nette = 95 - 15 - 30 - 20 - 8 = 22M
    expect(wf.tresorerieNette_XOF).toBe(22_000_000);
    expect(wf.etapes.length).toBeGreaterThanOrEqual(5);
    // Dernière étape = TOTAL
    const derniereEtape = wf.etapes[wf.etapes.length - 1];
    expect(derniereEtape.type).toBe("TOTAL");
    expect(derniereEtape.cumul_XOF).toBe(22_000_000);
  });

  it("calcule le cash runway et émet l'alerte CRITIQUE si < 1 mois de trésorerie", () => {
    const runway = calculerCashRunway(8_000_000, 10_000_000); // 0.8 mois
    expect(runway.alerteNiveau).toBe("CRITIQUE");
    expect(runway.runwayMois).toBeLessThan(1);
    expect(runway.narratifRunway).toContain("CRITIQUE");
    expect(runway.narratifRunway).toContain("jours");
  });

  it("génère un rapport complet DuPont + Waterfall + Runway avec synthèse narrative", () => {
    const rapport = genererRapportDuPontCashflow(
      "SAHEL INDUSTRIES SA",
      INPUT_DUPONT_NORMAL,
      95_000_000,
      -15_000_000,
      30_000_000,
      20_000_000,
      8_000_000,
      55_000_000,   // trésorerie actuelle
      7_500_000     // burn mensuel
    );

    expect(rapport.societeRaisonSociale).toBe("SAHEL INDUSTRIES SA");
    expect(rapport.decompositionDuPont.roe_pct).toBeGreaterThan(0);
    expect(rapport.waterfall.tresorerieNette_XOF).toBe(22_000_000);
    expect(rapport.cashRunway.alerteNiveau).toBe("SECURISE"); // 55M / 7.5M ≈ 7.3 mois
    expect(rapport.syntheseStrategique).toContain("SAHEL INDUSTRIES SA");
    expect(rapport.syntheseStrategique).toContain("2024");
  });
});
