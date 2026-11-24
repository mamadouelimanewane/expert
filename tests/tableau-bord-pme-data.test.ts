import { describe, expect, it } from "vitest";
import { extraireIndicateursBalancePME } from "@/lib/ohada/tableau-bord-pme-data";

describe("lecture des indicateurs du tableau de bord PME", () => {
  it("calcule les soldes à partir des comptes SYSCOHADA importés", () => {
    const result = extraireIndicateursBalancePME([
      { numero: "701", debit: 0, credit: 12_000_000 },
      { numero: "601", debit: 4_000_000, credit: 0 },
      { numero: "622", debit: 2_000_000, credit: 0 },
      { numero: "311", debit: 1_500_000, credit: 0 },
      { numero: "411", debit: 900_000, credit: 0 },
      { numero: "401", debit: 0, credit: 800_000 },
      { numero: "443", debit: 0, credit: 200_000 },
      { numero: "521", debit: 500_000, credit: 0 },
      { numero: "571", debit: 100_000, credit: 0 },
      { numero: "561", debit: 0, credit: 50_000 },
    ]);

    expect(result).toEqual({
      chiffreAffairesHT: 12_000_000,
      achatsEtChargesVariables: 4_000_000,
      chargesFixesExploitation: 2_000_000,
      stocksActuels: 1_500_000,
      creancesClients: 900_000,
      dettesFournisseurs: 800_000,
      dettesFiscalesSociales: 200_000,
      disponibilitesBancaires: 500_000,
      encaissePhysiqueCaisse: 100_000,
      concoursBancairesCourants: 50_000,
    });
  });

  it("refuse une balance partiellement mal formée au lieu d'en agréger une partie", () => {
    expect(extraireIndicateursBalancePME([
      { numero: "701", debit: 0, credit: 12_000_000 },
      { numero: "601", debit: "invalide", credit: 0 },
    ])).toBeNull();
    expect(extraireIndicateursBalancePME([])).toBeNull();
  });
});
