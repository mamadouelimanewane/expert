import { describe, it, expect } from "vitest";
import {
  genererStorytellingFinancier,
  type InputFinancierCFO,
} from "../src/lib/ohada/agent-cfo-storytelling";

const DONNEES_ENTREPRISE_SAINE: InputFinancierCFO = {
  societeNom: "AGRO-INDUSTRIES DU SÉNÉGAL SA",
  secteurActivite: "Agroalimentaire & Transformation",
  exercice: 2024,
  chiffreAffairesN_XOF: 1_200_000_000,
  chiffreAffairesN1_XOF: 1_000_000_000, // +20%
  margeBruteN_XOF: 480_000_000,        // 40%
  margeBruteN1_XOF: 380_000_000,
  ebeN_XOF: 180_000_000,               // 15%
  ebeN1_XOF: 140_000_000,
  resultatNetN_XOF: 96_000_000,        // 8%
  resultatNetN1_XOF: 70_000_000,
  bfrJoursCA: 45,
  dsoClientsJours: 52,
  dpoFournisseursJours: 48,
  tresorerieNette_XOF: 150_000_000,
  cashBurnMensuelMoyen_XOF: 15_000_000, // 10 mois de runway
};

describe("Agent IA CFO Storytelling — Vulgarisation & Synthèse Direction Générale", () => {
  it("calcule avec exactitude la croissance du CA (+20%), la marge EBE et le runway", () => {
    const res = genererStorytellingFinancier(DONNEES_ENTREPRISE_SAINE);
    expect(res.kpis.croissanceCA_pct).toBe(20);
    expect(res.kpis.tauxMargeBrute_pct).toBe(40);
    expect(res.kpis.tauxMargeEBE_pct).toBe(15);
    expect(res.kpis.cashRunwayMois).toBe(10);
    expect(res.kpis.statutTresorerie).toBe("TRESORERIE_SAINE");
  });

  it("déclenche une ALERTE_LIQUIDITE_CRITIQUE si la trésorerie couvre moins de 3 mois de cash burn", () => {
    const donneesTendues: InputFinancierCFO = {
      ...DONNEES_ENTREPRISE_SAINE,
      tresorerieNette_XOF: 25_000_000,
      cashBurnMensuelMoyen_XOF: 15_000_000, // Runway = 1.7 mois
    };
    const res = genererStorytellingFinancier(donneesTendues);
    expect(res.kpis.cashRunwayMois).toBeLessThan(3);
    expect(res.kpis.statutTresorerie).toBe("ALERTE_LIQUIDITE_CRITIQUE");
  });

  it("propose un plan d'actions stratégique avec quantification du gain cash sur réduction du DSO", () => {
    const res = genererStorytellingFinancier(DONNEES_ENTREPRISE_SAINE);
    expect(res.planActionStrategique.length).toBeGreaterThanOrEqual(3);

    const actionDso = res.planActionStrategique.find((a) => a.levier.includes("DSO"));
    expect(actionDso).toBeDefined();
    expect(actionDso?.priorite).toBe("IMMEDIATE");
    expect(actionDso?.gainEstime_XOF).toBeGreaterThan(0);
  });

  it("génère une note de synthèse pour le Conseil d'Administration claire et vulgarisée", () => {
    const res = genererStorytellingFinancier(DONNEES_ENTREPRISE_SAINE);
    expect(res.noteSyntheseConseilAdministration).toContain("AGRO-INDUSTRIES DU SÉNÉGAL SA");
    expect(res.noteSyntheseConseilAdministration).toContain("CONSEIL D'ADMINISTRATION");
    expect(res.noteSyntheseConseilAdministration).toContain("DIAGNOSTIC DE TRÉSORERIE");
    expect(res.executiveSummary.length).toBeGreaterThanOrEqual(3);
  });
});
