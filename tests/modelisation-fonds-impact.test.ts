import { describe, it, expect } from "vitest";
import {
  calculerWaccPaysOHADA,
  genererModeleFinancierImpact,
  type InputModelisationImpact,
} from "../src/lib/ohada/modelisation-fonds-impact";

const INPUT_TEST_PROJET: InputModelisationImpact = {
  projetNom: "BIO-AGRO TRANSFORMATION DU SAHEL SA",
  secteur: "Agroalimentaire & Énergie Verte",
  paysImplantation: "Sénégal",
  chiffreAffairesAn1_XOF: 500_000_000,
  tauxCroissanceAnnuel_pct: 15, // +15% / an
  margeEbe_pct: 22,
  besoinFinancementTotal_XOF: 400_000_000,
  partFondsPropresApportee_pct: 30, // 30% FP / 70% Dette
  tauxEmpruntBancaire_pct: 8.5,
  tauxImpotIS_pct: 25,
  spreadRisquePays_bps: 500, // 5.0%
  impactMetriques: {
    emploisDirectsPrevus: 150,
    partFemmes_pct: 45,
    producteursLocauxSoutenus: 350,
    tonnesCO2EviteesAn: 1200,
  },
};

describe("Modélisation Financière & Dossier Fonds d'Impact (BAD, Proparco, BOAD)", () => {
  it("calcule le WACC Pays OHADA intégrant le spread souverain local", () => {
    // Rf=4%, Spread=5%, Prime=6*1.1=6.6% -> Ke = 15.6%
    // Kd = 8.5% * (1 - 0.25) = 6.4%
    // WACC = 30% * 15.6% + 70% * 6.4% = 4.68% + 4.48% = 9.2%
    const res = calculerWaccPaysOHADA(8.5, 25, 500, 70);
    expect(res.spreadSouverainPays_pct).toBe(5.0);
    expect(res.coutFondsPropres_pct).toBeCloseTo(15.6, 1);
    expect(res.coutDetteApresImpot_pct).toBeCloseTo(6.4, 1);
    expect(res.waccFinal_pct).toBeCloseTo(9.2, 1);
  });

  it("génère des projections financières complètes sur 5 ans", () => {
    const res = genererModeleFinancierImpact(INPUT_TEST_PROJET);
    expect(res.projections5Ans).toHaveLength(5);
    expect(res.projections5Ans[0].chiffreAffaires_XOF).toBe(500_000_000);
    // Année 2 : 500M * 1.15 = 575M
    expect(res.projections5Ans[1].chiffreAffaires_XOF).toBe(575_000_000);
    expect(res.projections5Ans[4].fluxTresorerieLibreFCFF_XOF).toBeGreaterThan(0);
  });

  it("calcule la valorisation d'entreprise DCF avec valeur terminale", () => {
    const res = genererModeleFinancierImpact(INPUT_TEST_PROJET);
    expect(res.valorisationDCF.valeurActuelleFlux5Ans_XOF).toBeGreaterThan(0);
    expect(res.valorisationDCF.valeurTerminaleActualisee_XOF).toBeGreaterThan(0);
    expect(res.valorisationDCF.valeurEntrepriseDCF_XOF).toBeGreaterThan(res.valorisationDCF.valeurActuelleFlux5Ans_XOF);
    expect(res.indicateursInvestisseurs.triEstimeProjet_pct).toBeGreaterThan(12);
  });

  it("évalue le score d'impact ODD et génère le teaser pour comités d'investissement", () => {
    const res = genererModeleFinancierImpact(INPUT_TEST_PROJET);
    expect(res.scoreImpactBailleurs_100).toBeGreaterThanOrEqual(80);
    expect(res.teaserInvestisseurTexte).toContain("BIO-AGRO TRANSFORMATION DU SAHEL SA");
    expect(res.teaserInvestisseurTexte).toContain("PROPARCO");
    expect(res.teaserInvestisseurTexte).toContain("WACC Pays OHADA");
    expect(res.teaserInvestisseurTexte).toContain("ODD");
  });
});
