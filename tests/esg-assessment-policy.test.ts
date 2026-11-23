import { describe, expect, it } from "vitest";
import { validerDonneesESG } from "@/lib/esg-assessment-policy";
import type { InputESG } from "@/lib/ohada/reporting-esg";

const input: InputESG = {
  raisonSociale: "Saisie libre à ignorer", exercice: 2025, pays: "FAUX",
  ca_XOF: 1_000_000, effectifTotal: 10, consommationCarburantLitres: 100,
  consommationElectriciteKWh: 1000, achatEnergieMWh: 0, nbContratsFormels: 8,
  nbFemmes: 5, nbAffiliesSante: 9, accidentsWork: 0, masseSalariale_XOF: 500_000,
  lcbftConforme: false, registreBeneficiairesEffectifs: false,
  administrateursIndependants_pct: 20, comiteAudit: false, codeEthiqueAdopte: false,
};

describe("validation des dossiers ESG", () => {
  it("rattache le nom et le pays depuis le client du cabinet", () => {
    const result = validerDonneesESG(input, "Client vérifié SA", "SN");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.raisonSociale).toBe("Client vérifié SA");
      expect(result.input.pays).toBe("SN");
    }
  });

  it("refuse un effectif incohérent et un chiffre d'affaires nul", () => {
    expect(validerDonneesESG({ ...input, nbFemmes: 11 }, "Client", "SN").ok).toBe(false);
    expect(validerDonneesESG({ ...input, ca_XOF: 0 }, "Client", "SN").ok).toBe(false);
  });

  it("refuse les effectifs fractionnaires et les valeurs non finies", () => {
    expect(validerDonneesESG({ ...input, effectifTotal: 3.5 }, "Client", "SN").ok).toBe(false);
    expect(validerDonneesESG({ ...input, consommationElectriciteKWh: Number.POSITIVE_INFINITY }, "Client", "SN").ok).toBe(false);
  });
});
