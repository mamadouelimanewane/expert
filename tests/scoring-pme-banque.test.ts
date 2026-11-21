import { describe, it, expect } from "vitest";
import {
  evaluerDossierCreditPME,
  type DossierCreditPME,
} from "../src/lib/ohada/scoring-pme-banque";

const DOSSIER_SAIN: DossierCreditPME = {
  raisonSociale: "AGRO-INDUSTRIE DU SÉNÉGAL SA",
  secteurActivite: "Agroalimentaire",
  paysUEMOA: "SN",
  chiffreAffaires_XOF: 500_000_000,
  resultatNet_XOF: 45_000_000,
  capitauxPropres_XOF: 200_000_000,
  dettesFinancieres_XOF: 80_000_000,
  tresorerie_XOF: 40_000_000,
  ebe_XOF: 75_000_000,
  ancienneteAns: 8,
  nombreEmployes: 35,
  garantiesDisponibles_XOF: 150_000_000,
  historiqueCredit: "BON",
};

describe("Scoring PME Banque BCEAO", () => {
  it("attribue une notation A ou B à une PME avec d'excellents ratios et historique BON", () => {
    const res = evaluerDossierCreditPME(DOSSIER_SAIN);
    expect(res.scoreTotal).toBeGreaterThanOrEqual(65);
    expect(["A", "B"]).toContain(res.notation);
    expect(res.avisCredit).toBe("FAVORABLE");
    expect(res.pointsForts.length).toBeGreaterThan(0);
  });

  it("attribue une notation D ou E à une PME surendettée (ratio endettement > 300%)", () => {
    const dossierSurendette: DossierCreditPME = {
      ...DOSSIER_SAIN,
      capitauxPropres_XOF: 20_000_000,
      dettesFinancieres_XOF: 150_000_000, // 750% d'endettement
      resultatNet_XOF: -10_000_000,
      ebe_XOF: 5_000_000,
      tresorerie_XOF: 1_000_000,
      historiqueCredit: "MOYEN",
    };
    const res = evaluerDossierCreditPME(dossierSurendette);
    expect(res.ratiosFinanciers.ratioEndettement_pct).toBeGreaterThan(300);
    expect(["D", "E"]).toContain(res.notation);
    expect(res.pointsFaibles.length).toBeGreaterThan(0);
  });

  it("calcule correctement le montant de crédit recommandé (≤ 3× EBE)", () => {
    const res = evaluerDossierCreditPME(DOSSIER_SAIN);
    const maxCredit = DOSSIER_SAIN.ebe_XOF * 3;
    expect(res.montantCreditRecommande_XOF).toBeLessThanOrEqual(maxCredit);
    expect(res.montantCreditRecommande_XOF).toBeGreaterThan(0);
    expect(res.dureeCreditRecommandee_mois).toBeGreaterThan(0);
  });

  it("génère un avis DEFAVORABLE si le ratio de service de la dette est critique", () => {
    const dossierCritique: DossierCreditPME = {
      ...DOSSIER_SAIN,
      capitauxPropres_XOF: 30_000_000,
      dettesFinancieres_XOF: 250_000_000,
      ebe_XOF: 2_000_000, // EBE / Dettes = 0.8% < 10%
      historiqueCredit: "MAUVAIS",
    };
    const res = evaluerDossierCreditPME(dossierCritique);
    expect(res.avisCredit).toBe("DEFAVORABLE");
    expect(res.pointsFaibles).toContain("Historique de crédit défavorable – incidents de paiement signalés");
  });
});
