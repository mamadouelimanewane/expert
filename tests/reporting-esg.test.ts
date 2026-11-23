import { describe, it, expect } from "vitest";
import {
  calculerBilanCarbone,
  calculerScoreESG,
  determinerNiveauMaturite,
  genererRapportESG,
  type InputESG,
} from "../src/lib/ohada/reporting-esg";

const baseInput: InputESG = {
  raisonSociale: "SOCIÉTÉ TEST SA",
  exercice: 2024,
  pays: "SN",
  ca_XOF: 1_000_000_000,
  effectifTotal: 100,
  consommationCarburantLitres: 10_000,
  consommationElectriciteKWh: 50_000,
  achatEnergieMWh: 0,
  nbContratsFormels: 90,
  nbFemmes: 40,
  nbAffiliesSante: 100,
  accidentsWork: 0,
  masseSalariale_XOF: 200_000_000,
  lcbftConforme: true,
  registreBeneficiairesEffectifs: true,
  administrateursIndependants_pct: 25,
  comiteAudit: true,
  codeEthiqueAdopte: true,
};

describe("Calcul indicatif du reporting ESG", () => {
  it("calcule le bilan carbone correctement (Scope 1 et 2)", () => {
    const bc = calculerBilanCarbone(baseInput);
    // 10 000 L * 2.68 / 1000 = 26.8 tCO2
    expect(bc.scope1Carburant_tCO2).toBeCloseTo(26.8, 1);
    // 50 000 kWh * 0.45 / 1000 = 22.5 tCO2
    expect(bc.scope2Electricite_tCO2).toBeCloseTo(22.5, 1);
    expect(bc.totalEmissions_tCO2).toBeCloseTo(49.3, 1);
    expect(bc.intensiteCarbone_tCO2parM_XOF).toBeGreaterThan(0);
  });

  it("retourne scoreESG.G = 100 si tous critères gouvernance cochés", () => {
    const score = calculerScoreESG(baseInput);
    expect(score.G).toBe(100);
  });

  it("détermine le niveau de maturité correctement", () => {
    expect(determinerNiveauMaturite(20)).toBe("DEBUTANT");
    expect(determinerNiveauMaturite(45)).toBe("EN_PROGRESSION");
    expect(determinerNiveauMaturite(70)).toBe("AVANCE");
    expect(determinerNiveauMaturite(85)).toBe("LEADER");
  });

  it("génère des recommandations quand des indicateurs déclarés signalent des écarts", () => {
    const inputNonConforme: InputESG = {
      ...baseInput,
      lcbftConforme: false,
      registreBeneficiairesEffectifs: false,
      nbContratsFormels: 50,
      nbAffiliesSante: 50,
      accidentsWork: 2,
    };
    const rapport = genererRapportESG(inputNonConforme);
    expect(rapport.recommandations.length).toBeGreaterThan(0);
    expect(rapport.recommandations.some((r) => r.includes("LCB-FT"))).toBe(true);
    expect(rapport.recommandations.some((r) => r.toLowerCase().includes("bénéficiaires effectifs"))).toBe(true);
  });
});
