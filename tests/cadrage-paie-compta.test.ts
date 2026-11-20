import { describe, it, expect } from "vitest";
import { executerCadragePaieCompta } from "@/lib/payroll/cadrage-paie-compta";

describe("executerCadragePaieCompta", () => {
  it("valide une concordance parfaite entre paie et comptabilité (100% conforme)", () => {
    const res = executerCadragePaieCompta(
      "SN",
      2025,
      "Décembre 2025",
      {
        brutImposable: 10_000_000,
        chargesPatronalesSociales: 1_800_000,
        chargesSalarialesSociales: 700_000,
        impotsRetenusSource: 1_200_000,
        netAPayer: 8_100_000,
        avancesEtAcomptes: 0,
      },
      {
        solde661_Remunerations: 10_000_000,
        solde664_ChargesSocialesPatronales: 1_800_000,
        solde422_PersonnelRemunerationsDues: 8_100_000,
        solde43_OrganismesSociaux: 2_500_000, // 1.8M patronal + 700k salarial
        solde447_RetenuesFiscalesSalaires: 1_200_000,
        solde421_AvancesAcomptes: 0,
      }
    );

    expect(res.tauxConformiteGlobal).toBe(100);
    expect(res.totalEcartsAbsolus).toBe(0);
    expect(res.syntheseRisqueSocial).toBe("FAIBLE");
    expect(res.ecarts.every((e) => e.statut === "CONFORME")).toBe(true);
  });

  it("détecte des anomalies avec risque de redressement social en cas d'écart sur les charges", () => {
    const res = executerCadragePaieCompta(
      "CI",
      2025,
      "T4 2025",
      {
        brutImposable: 20_000_000,
        chargesPatronalesSociales: 3_500_000,
        chargesSalarialesSociales: 1_200_000,
        impotsRetenusSource: 2_000_000,
        netAPayer: 16_800_000,
        avancesEtAcomptes: 0,
      },
      {
        solde661_Remunerations: 18_000_000, // Ecart de 2M sur salaires bruts
        solde664_ChargesSocialesPatronales: 2_800_000, // Ecart de 700k sur charges patronales
        solde422_PersonnelRemunerationsDues: 16_800_000,
        solde43_OrganismesSociaux: 4_700_000,
        solde447_RetenuesFiscalesSalaires: 2_000_000,
        solde421_AvancesAcomptes: 0,
      }
    );

    expect(res.tauxConformiteGlobal).toBeLessThan(100);
    expect(res.totalEcartsAbsolus).toBeGreaterThan(1_000_000);
    expect(["ELEVE", "CRITIQUE"]).toContain(res.syntheseRisqueSocial);

    const ecart661 = res.ecarts.find((e) => e.poste === "SALAIRES_BRUTS");
    expect(ecart661?.statut).toBe("RISQUE_REDRESSEMENT");
  });
});
