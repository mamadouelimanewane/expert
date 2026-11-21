import { describe, it, expect } from "vitest";
import {
  evaluerReglesOrigineZLECAf,
  simulerArbitrageZLECAf,
  type InputArbitrageZLECAf,
} from "../src/lib/ohada/zlecaf-arbitrage-douanier";

describe("Moteur ZLECAf & Arbitrage Douanier Intra-Africain", () => {
  it("valide l'origine préférentielle si la Valeur Ajoutée Locale dépasse 35%", () => {
    // Usine : 100M, intrants hors zone : 40M -> VAL = 60%
    const res = evaluerReglesOrigineZLECAf(100_000_000, 40_000_000, 35);
    expect(res.estEligibleZLECAf).toBe(true);
    expect(res.tauxValeurAjouteeLocale_pct).toBe(60);
    expect(res.motifRejetOuValidation).toContain("dépasse le seuil minimum");
  });

  it("rejette l'éligibilité ZLECAf si la Valeur Ajoutée Locale est inférieure à 35%", () => {
    // Usine : 100M, intrants hors zone : 80M -> VAL = 20%
    const res = evaluerReglesOrigineZLECAf(100_000_000, 80_000_000, 35);
    expect(res.estEligibleZLECAf).toBe(false);
    expect(res.tauxValeurAjouteeLocale_pct).toBe(20);
    expect(res.motifRejetOuValidation).toContain("inférieure au seuil");
  });

  it("calcule avec précision l'économie douanière et les prélèvements sur un corridor", () => {
    const input: InputArbitrageZLECAf = {
      produitDesignation: "Huile de palme raffinée conditionnée",
      codeSH6: "151190",
      paysOrigine: "Côte d'Ivoire",
      paysDestination: "Mali",
      corridor: "ABIDJAN_OUAGADOUGOU",
      valeurDepartUsine_XOF: 50_000_000,
      valeurMatieresImporteesHorsZone_XOF: 15_000_000, // VAL = 70% >= 35%
      droitDouaneStandard_pct: 20, // 20% TEC
      tauxDroitZLECAf_pct: 0,     // 0% démantèlement
      volumeMarchandise_tonnes: 45,
      fraisTransportEstimes_XOF: 5_000_000, // CAF = 55M
    };

    const sim = simulerArbitrageZLECAf(input);
    expect(sim.regleOrigine.estEligibleZLECAf).toBe(true);
    // Base CAF = 55 000 000
    // Standard 20% = 11 000 000
    // ZLECAf 0% = 0
    // Prelevements 1.5% = 825 000
    expect(sim.comparatif.montantDroitStandard_XOF).toBe(11_000_000);
    expect(sim.comparatif.montantDroitZLECAf_XOF).toBe(0);
    expect(sim.comparatif.prelevementsStatistiquesEtComm_XOF).toBe(825_000);
    expect(sim.comparatif.economieDouaniereNette_XOF).toBe(11_000_000);
    expect(sim.comparatif.tauxGainFiscal_pct).toBeGreaterThan(80);
  });

  it("génère le certificat d'origine dématérialisé avec référence réglementaire", () => {
    const input: InputArbitrageZLECAf = {
      produitDesignation: "Ciments et liants hydrauliques",
      codeSH6: "252329",
      paysOrigine: "Sénégal",
      paysDestination: "Mali",
      corridor: "DAKAR_BAMAKO",
      valeurDepartUsine_XOF: 80_000_000,
      valeurMatieresImporteesHorsZone_XOF: 20_000_000,
      droitDouaneStandard_pct: 10,
      tauxDroitZLECAf_pct: 0,
      volumeMarchandise_tonnes: 120,
      fraisTransportEstimes_XOF: 8_000_000,
    };

    const sim = simulerArbitrageZLECAf(input);
    expect(sim.certificatOrigineRecommande.statutEligibilite).toBe("ELIGIBLE_PREFERENTIEL");
    expect(sim.certificatOrigineRecommande.numeroCertificatProvisoire).toContain("ZLECAF-SE-");
    expect(sim.certificatOrigineRecommande.declarationOrigineTexte).toContain("Zone de Libre-Échange Continentale Africaine");
    expect(sim.recommandationsCorridor.length).toBeGreaterThanOrEqual(2);
  });
});
