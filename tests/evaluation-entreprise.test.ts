import { describe, it, expect } from "vitest";
import {
  calculerCoutCapitalWACC,
  evaluerEntreprise,
  type ParametresEvaluationDCF,
  type ParametresMultiples,
  type ParametresANR,
} from "@/lib/ohada/evaluation-entreprise";

describe("Évaluation d'Entreprise en Contexte Émergent / OHADA", () => {
  const dcfParams: ParametresEvaluationDCF = {
    waccParams: {
      tauxSansRisque: 6.5,
      betaSecteur: 1.1,
      primeRisqueMarche: 6.0,
      primeRisquePaysCRP: 3.5, // Sénégal
      tauxInteretDette: 8.5,
      tauxIS: 0.3,
      proportionFondsPropres: 0.6,
      proportionDette: 0.4,
    },
    tauxCroissancePerpetuelle: 2.5,
    projections: [
      {
        annee: 1,
        chiffreAffaires: 2_000_000_000,
        ebit: 300_000_000,
        impotTheorique: 90_000_000,
        dotationsAmortissements: 80_000_000,
        capexInvestissements: 60_000_000,
        variationBFR: 20_000_000,
        freeCashFlowToFirm: 210_000_000,
      },
      {
        annee: 2,
        chiffreAffaires: 2_200_000_000,
        ebit: 340_000_000,
        impotTheorique: 102_000_000,
        dotationsAmortissements: 85_000_000,
        capexInvestissements: 65_000_000,
        variationBFR: 22_000_000,
        freeCashFlowToFirm: 236_000_000,
      },
      {
        annee: 3,
        chiffreAffaires: 2_400_000_000,
        ebit: 380_000_000,
        impotTheorique: 114_000_000,
        dotationsAmortissements: 90_000_000,
        capexInvestissements: 70_000_000,
        variationBFR: 25_000_000,
        freeCashFlowToFirm: 261_000_000,
      },
    ],
    tresorerieCloture: 150_000_000,
    dettesFinancieresCloture: 400_000_000,
  };

  const multiplesParams: ParametresMultiples = {
    ebitdaCible: 450_000_000,
    multipleEbitdaSectoriel: 6.0,
    decoteIlliquidite: 25, // 25% décote non coté
    tresorerieNetteComptable: -250_000_000, // 150M - 400M
  };

  const anrParams: ParametresANR = {
    actifNetComptable: 800_000_000,
    plusValuesLatentesImmo: 450_000_000,
    provisionsNonJustifiees: 50_000_000,
    valeurFondsDeCommerce: 300_000_000,
  };

  it("calcule avec exactitude le WACC intégrant la prime de risque pays (CRP)", () => {
    const { ke, kdApresImpot, wacc } = calculerCoutCapitalWACC(dcfParams.waccParams);
    // Ke = 6.5 + 1.1 * 6.0 + 3.5 = 6.5 + 6.6 + 3.5 = 16.6%
    expect(ke).toBe(16.6);
    // Kd après impôt = 8.5 * (1 - 0.3) = 5.95%
    expect(kdApresImpot).toBe(5.95);
    // WACC = 0.6 * 16.6 + 0.4 * 5.95 = 9.96 + 2.38 = 12.34%
    expect(wacc).toBe(12.34);
  });

  it("calcule l'évaluation DCF avec valeur terminale Gordon Shapiro", () => {
    const res = evaluerEntreprise(
      "Dakar Logistique SA",
      "Transport & Logistique",
      "Sénégal",
      dcfParams,
      multiplesParams,
      anrParams
    );

    expect(res.valeurEntrepriseDCF).toBeGreaterThan(1_000_000_000);
    expect(res.equityValueDCF).toBe(res.valeurEntrepriseDCF - 250_000_000); // dette nette = 400M - 150M = 250M
  });

  it("calcule la valorisation par multiples BRVM après décote d'illiquidité", () => {
    const res = evaluerEntreprise(
      "Dakar Logistique SA",
      "Transport & Logistique",
      "Sénégal",
      dcfParams,
      multiplesParams,
      anrParams
    );

    // EV = 450M * 6.0 = 2 700 000 000 * (1 - 0.25) = 2 025 000 000 FCFA
    // Equity Value = 2 025 000 000 - 250 000 000 = 1 775 000 000 FCFA
    expect(res.equityValueMultiples).toBe(1_775_000_000);
  });

  it("calcule l'Actif Net Réévalué (ANR) et la synthèse pondérée 50/30/20", () => {
    const res = evaluerEntreprise(
      "Dakar Logistique SA",
      "Transport & Logistique",
      "Sénégal",
      dcfParams,
      multiplesParams,
      anrParams
    );

    // ANR = 800M + 450M + 50M + 300M = 1 600 000 000 FCFA
    expect(res.equityValueANR).toBe(1_600_000_000);
    expect(res.valeurCentraleRetenue).toBeGreaterThan(0);
    expect(res.fourchetteBasse).toBeLessThan(res.valeurCentraleRetenue);
    expect(res.fourchetteHaute).toBeGreaterThan(res.valeurCentraleRetenue);
    expect(res.rapportEvaluationFormel).toContain("RAPPORT D'ÉVALUATION");
  });
});
