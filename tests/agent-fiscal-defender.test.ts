import { describe, it, expect } from "vitest";
import {
  executerAuditFiscalDefender,
  type LigneRisqueFiscal,
} from "../src/lib/ohada/agent-fiscal-defender";

describe("Agent IA Fiscal Defender — Contrôle Fiscal Prédictif & Mémoire DGID", () => {
  it("calcule avec exactitude les droits et pénalités sur un véhicule de tourisme au-delà du plafond", () => {
    const lignes: LigneRisqueFiscal[] = [
      {
        rubrique: "AMORTISSEMENT_VEHICULE_TOURISME",
        libelle: "Amortissement Range Rover excédent plafond 20M",
        baseConcernee_XOF: 10_000_000,
        tauxImposition_pct: 25, // IS 25%
        tauxPenalite_pct: 25,   // Pénalités 25%
        justificationEntreprise: "Véhicule de fonction direction générale",
      },
    ];

    const res = executerAuditFiscalDefender("SOCIÉTÉ COMMERCIALE DAKAROISE SAS", "Sénégal", 2024, lignes);
    expect(res.totalBaseRedressable_XOF).toBe(10_000_000);
    expect(res.totalDroitsSimples_XOF).toBe(2_500_000); // 10M * 25%
    expect(res.totalPenalites_XOF).toBe(625_000);       // 2.5M * 25%
    expect(res.risqueFiscalTotal_XOF).toBe(3_125_000);
    expect(res.provisionRecommandee_XOF).toBe(2_500_000);
  });

  it("gère un portefeuille multi-risques (charges art. 8 et retenue à la source étrangère)", () => {
    const lignes: LigneRisqueFiscal[] = [
      {
        rubrique: "CHARGES_NON_JUSTIFIEES_ART8",
        libelle: "Frais de réception sans factures normalisées",
        baseConcernee_XOF: 8_000_000,
        tauxImposition_pct: 25,
        tauxPenalite_pct: 25,
        justificationEntreprise: "Événements clients",
      },
      {
        rubrique: "RETENUE_SOURCE_PRESTATAIRE_ETRANGER",
        libelle: "Honoraires conseil informatique payés en Europe sans BRS",
        baseConcernee_XOF: 12_000_000,
        tauxImposition_pct: 20, // BRS 20%
        tauxPenalite_pct: 25,
        justificationEntreprise: "Prestation SaaS cloud",
      },
    ];

    const res = executerAuditFiscalDefender("TECH AFRIQUE SARL", "Côte d'Ivoire", 2024, lignes);
    expect(res.lignesAnalysees).toHaveLength(2);
    expect(res.totalBaseRedressable_XOF).toBe(20_000_000);
    // Droits : 8M*25% = 2M, 12M*20% = 2.4M -> total 4.4M
    expect(res.totalDroitsSimples_XOF).toBe(4_400_000);
    // Pénalités : 4.4M * 25% = 1.1M
    expect(res.totalPenalites_XOF).toBe(1_100_000);
    expect(res.scoreSecuriteFiscale_100).toBeLessThan(100);
  });

  it("génère le texte complet du mémoire en défense préventif argumenté", () => {
    const lignes: LigneRisqueFiscal[] = [
      {
        rubrique: "REMUNERATION_EXCESSIVE_DIRIGEANT",
        libelle: "Rémunération gérant majoritaire",
        baseConcernee_XOF: 15_000_000,
        tauxImposition_pct: 25,
        tauxPenalite_pct: 25,
        justificationEntreprise: "Travail effectif sur chantiers miniers",
      },
    ];

    const res = executerAuditFiscalDefender("MINES DU SAHEL SA", "Mali", 2024, lignes);
    expect(res.memoireDefensePreventif).toContain("MINES DU SAHEL SA");
    expect(res.memoireDefensePreventif).toContain("MALI");
    expect(res.memoireDefensePreventif).toContain("MÉMOIRE EN DÉFENSE PRÉVENTIF");
    expect(res.memoireDefensePreventif).toContain("Article 8");
    expect(res.argumentsJuridiquesCGI.length).toBeGreaterThanOrEqual(3);
  });

  it("délivre un score parfait de 100 si aucune irrégularité fiscale n'est identifiée", () => {
    const res = executerAuditFiscalDefender("ENTREPRISE SAINE SAS", "Sénégal", 2024, []);
    expect(res.scoreSecuriteFiscale_100).toBe(100);
    expect(res.risqueFiscalTotal_XOF).toBe(0);
    expect(res.provisionRecommandee_XOF).toBe(0);
    expect(res.lignesAnalysees).toHaveLength(0);
  });
});
