import { describe, it, expect } from "vitest";
import {
  analyserPositionDevise,
  genererRapportRisqueChange,
  type PositionDevise,
} from "../src/lib/ohada/simulateur-risque-change";

const POSITION_IMPORTATEUR_USD: PositionDevise = {
  devise: "USD",
  coursSpotActuel_XOF: 620.0,
  creancesDevise: 100_000,
  dettesDevise: 500_000, // Position nette courte : -400 000 USD
  coursComptabilise_XOF: 600.0, // Cours historique
};

describe("Simulateur Multi-Devises & Risque de Change FCFA (Kyriba FX Standard)", () => {
  it("calcule une position nette courte et constate une perte latente (Compte 476)", () => {
    const analyse = analyserPositionDevise(POSITION_IMPORTATEUR_USD);
    expect(analyse.expositionNetteDevise).toBe(-400_000);
    expect(analyse.expositionNette_XOF).toBe(-400_000 * 620);
    // Spot (620) > Comptabilisé (600) sur dettes -> perte de change
    expect(analyse.ecartConversionLatente_XOF).toBeLessThan(0);
    expect(analyse.typeEcart).toBe("ECART_CONVERSION_ACTIF_476");
    expect(analyse.provisionPerteChange_XOF).toBeGreaterThan(0);
  });

  it("génère des simulations de chocs asymétriques pour le dollar US", () => {
    const analyse = analyserPositionDevise(POSITION_IMPORTATEUR_USD);
    expect(analyse.simulations.length).toBe(5);
    const chocPlus10 = analyse.simulations.find((s) => s.variationDevise_pct === 10);
    expect(chocPlus10).toBeDefined();
    expect(chocPlus10?.impactCompteResultat).toBe("PERTE_CHANGE");
    expect(chocPlus10?.nouveauCours_XOF).toBeCloseTo(682.0, 1);
  });

  it("identifie un gain latent (Compte 477) pour un exportateur net", () => {
    const positionExportateur: PositionDevise = {
      devise: "USD",
      coursSpotActuel_XOF: 630.0,
      creancesDevise: 800_000,
      dettesDevise: 200_000, // +600 000 USD net
      coursComptabilise_XOF: 600.0,
    };
    const analyse = analyserPositionDevise(positionExportateur);
    expect(analyse.ecartConversionLatente_XOF).toBeGreaterThan(0);
    expect(analyse.typeEcart).toBe("ECART_CONVERSION_PASSIF_477");
    expect(analyse.provisionPerteChange_XOF).toBe(0);
  });

  it("génère un rapport global de risque de change avec niveau et recommandations", () => {
    const positions: PositionDevise[] = [
      POSITION_IMPORTATEUR_USD,
      {
        devise: "EUR",
        coursSpotActuel_XOF: 655.957,
        creancesDevise: 50_000,
        dettesDevise: 50_000,
        coursComptabilise_XOF: 655.957,
      },
    ];
    const rapport = genererRapportRisqueChange("GROUPE SAHEL IMPORT-EXPORT SA", 2024, positions);
    expect(rapport.positions.length).toBe(2);
    expect(rapport.expositionGlobaleNette_XOF).toBeLessThan(0);
    expect(rapport.recommandationsCouverture.length).toBeGreaterThan(0);
    expect(rapport.syntheseTresorerie).toContain("GROUPE SAHEL IMPORT-EXPORT SA");
  });
});
