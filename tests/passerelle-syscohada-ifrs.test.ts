import { describe, it, expect } from "vitest";
import {
  calculerValeurActualiseeLeasing,
  convertirSyscohadaVersIFRS,
  type DonneesComptablesSyscohada,
} from "../src/lib/ohada/passerelle-syscohada-ifrs";

const donneesStandard: DonneesComptablesSyscohada = {
  raisonSociale: "SOCIÉTÉ AGRO-ALIMENTAIRE UEMOA SA",
  exercice: 2024,
  ebitdaSyscohada_XOF: 200_000_000,
  resultatExploitationSyscohada_XOF: 140_000_000,
  chargesFinancieresSyscohada_XOF: 20_000_000,
  resultatNetSyscohada_XOF: 80_000_000,
  totalActifSyscohada_XOF: 1_000_000_000,
  dettesFinancieresSyscohada_XOF: 150_000_000,
  capitauxPropresSyscohada_XOF: 450_000_000,
  contratsLeasing: [
    {
      libelle: "Flotte de camions de distribution",
      loyerAnnuel_XOF: 30_000_000,
      dureeRestanteAnnees: 4,
      tauxActualisation_pct: 8.0,
    },
  ],
  retraiteIAS19: {
    masseSalarialeEligible_XOF: 120_000_000, // 10M / mois
    ancienneteMoyenneAnnees: 8,
    tauxActualisationActuariel_pct: 6.5,
    provisionDejaComptabiliseeSyscohada_XOF: 10_000_000,
  },
};

describe("Passerelle de Conversion Bimodale SYSCOHADA ⇄ IFRS", () => {
  it("calcule la valeur actualisée du droit d'usage IFRS 16 et l'amortissement", () => {
    const calc = calculerValeurActualiseeLeasing(donneesStandard.contratsLeasing[0]);
    // 30M sur 4 ans à 8% ~ 99 363 800 XOF
    expect(calc.droitUsageInitial).toBeGreaterThan(95_000_000);
    expect(calc.droitUsageInitial).toBeLessThan(105_000_000);
    expect(calc.amortissementAnnuel).toBeCloseTo(calc.droitUsageInitial / 4, 0);
  });

  it("retraite l'EBITDA à la hausse en neutralisant les loyers de leasing (IFRS 16)", () => {
    const res = convertirSyscohadaVersIFRS(donneesStandard);
    // EBITDA passe de 200M à 230M (+30M de loyers annulés)
    expect(res.tablePassageEbitda.ajustementIFRS16_XOF).toBe(30_000_000);
    expect(res.tablePassageEbitda.ebitdaIFRS_XOF).toBe(230_000_000);
    expect(res.tablePassageEbitda.variation_pct).toBe(15);
  });

  it("calcule le complément d'engagement de retraite actuariel IAS 19", () => {
    const res = convertirSyscohadaVersIFRS(donneesStandard);
    const retraite = res.retraitements.find((r) => r.norme === "IAS 19");
    expect(retraite).toBeDefined();
    expect(retraite?.impactBilanPassif_XOF).toBeGreaterThan(0);
  });

  it("génère le bilan retraité IFRS avec droit d'usage à l'actif et dettes de leasing", () => {
    const res = convertirSyscohadaVersIFRS(donneesStandard);
    expect(res.bilanRetraiteIFRS.actifTotalIFRS_XOF).toBeGreaterThan(donneesStandard.totalActifSyscohada_XOF);
    expect(res.bilanRetraiteIFRS.dettesFinancieresIFRS_XOF).toBeGreaterThan(
      donneesStandard.dettesFinancieresSyscohada_XOF
    );
    expect(res.notesAnnexesIFRS.length).toBe(3);
  });
});
