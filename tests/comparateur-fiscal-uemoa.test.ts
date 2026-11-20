import { describe, it, expect } from "vitest";
import {
  calculerFiscalitePays,
  comparerFiscaliteRegionale,
  REFERENTIEL_FISCAL_PAYS,
  type InputComparateurFiscal,
} from "../src/lib/ohada/comparateur-fiscal-uemoa";

describe("Comparateur de Pression Fiscale Sectorielle UEMOA & CEMAC", () => {
  const baseInput: InputComparateurFiscal = {
    chiffreAffaires_XOF: 1_000_000_000,
    resultatFiscal_XOF: 100_000_000,
    secteur: "COMMERCE",
    tauxDistributionDividendes_pct: 50,
  };

  it("calcule correctement l'IS, l'IMF et les retenues dividendes pour le Sénégal", () => {
    const resSN = calculerFiscalitePays(REFERENTIEL_FISCAL_PAYS["SN"], baseInput);
    // IS théorique = 100M * 30% = 30M
    expect(resSN.montantIsTheorique_XOF).toBe(30_000_000);
    // IMF = 1 000M * 0.5% = 5M (plafonné à 20M, min 500k)
    expect(resSN.montantImf_XOF).toBe(5_000_000);
    // max(IS, IMF) = 30M
    expect(resSN.impotSocieteDu_XOF).toBe(30_000_000);
    expect(resSN.regimeApplique).toBe("IS");

    // Bénéfice net = 100M - 30M = 70M. Dividendes bruts (50%) = 35M.
    // Retenue (10%) = 3.5M. Dividendes nets = 31.5M.
    expect(resSN.retenueDividendes_XOF).toBe(3_500_000);
    expect(resSN.dividendesNetsDistribues_XOF).toBe(31_500_000);
    expect(resSN.totalPrelevementsDirects_XOF).toBe(33_500_000);
  });

  it("applique le taux réduit de 25% pour l'industrie au Bénin", () => {
    const inputIndustrie: InputComparateurFiscal = {
      ...baseInput,
      secteur: "INDUSTRIE",
    };
    const resBJ = calculerFiscalitePays(REFERENTIEL_FISCAL_PAYS["BJ"], inputIndustrie);
    expect(resBJ.tauxIsApplicable).toBe(0.25);
    expect(resBJ.montantIsTheorique_XOF).toBe(25_000_000);
  });

  it("déclenche l'application de l'IMF en cas de résultat fiscal nul ou déficitaire", () => {
    const inputDeficitaire: InputComparateurFiscal = {
      ...baseInput,
      resultatFiscal_XOF: 0,
    };
    const resCI = calculerFiscalitePays(REFERENTIEL_FISCAL_PAYS["CI"], inputDeficitaire);
    expect(resCI.montantIsTheorique_XOF).toBe(0);
    expect(resCI.regimeApplique).toBe("IMF");
    // IMF CI = 1 000M * 0.5% = 5M
    expect(resCI.impotSocieteDu_XOF).toBe(5_000_000);
  });

  it("génère le classement régional et calcule l'économie fiscale maximale", () => {
    const comparaison = comparerFiscaliteRegionale(baseInput);
    expect(comparaison.classement.length).toBeGreaterThanOrEqual(6);
    expect(comparaison.meilleurPays.rangCompetitivite).toBe(1);
    expect(comparaison.economieFiscaleMax_XOF).toBeGreaterThan(0);
    expect(comparaison.recommandations.length).toBeGreaterThan(0);
  });
});
