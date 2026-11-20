import { describe, it, expect } from "vitest";
import {
  calculerEvolutionPct,
  calculerAffectationResultat,
  genererRapportGestion,
  type InputRapportGestion,
} from "../src/lib/ohada/rapport-de-gestion";

const inputExemple: InputRapportGestion = {
  entite: {
    raisonSociale: "SOCIÉTÉ COMMERCIALE D'AFRIQUE DE L'OUEST SA",
    formeJuridique: "SA",
    capitalSocial_XOF: 100_000_000,
    rccm: "SN-DKR-2020-B-12345",
    identifiantFiscal: "001234567 2G3",
    siegeSocial: "Dakar, Sénégal",
    exercice: 2024,
    dirigeant: {
      nom: "Mamadou DIOP",
      titre: "Directeur Général",
    },
  },
  soldesN: {
    chiffreAffaires_XOF: 1_200_000_000,
    valeurAjoutee_XOF: 400_000_000,
    ebe_XOF: 180_000_000,
    resultatExploitation_XOF: 120_000_000,
    resultatFinancier_XOF: -10_000_000,
    resultatHAO_XOF: 0,
    impotSocietes_XOF: 33_000_000,
    resultatNet_XOF: 77_000_000,
    tresorerieNette_XOF: 50_000_000,
  },
  soldesNMoins1: {
    chiffreAffaires_XOF: 1_000_000_000,
    valeurAjoutee_XOF: 350_000_000,
    ebe_XOF: 150_000_000,
    resultatExploitation_XOF: 100_000_000,
    resultatFinancier_XOF: -8_000_000,
    resultatHAO_XOF: 0,
    impotSocietes_XOF: 27_000_000,
    resultatNet_XOF: 65_000_000,
    tresorerieNette_XOF: 30_000_000,
  },
  affectation: {
    reportANouveauInitial_XOF: 15_000_000,
    dotationReservesStatutaires_XOF: 5_000_000,
    dividendesProposes_XOF: 40_000_000,
  },
};

describe("Générateur Automatisé de Rapport de Gestion AGOA (AUSCGIE Art. 138-143)", () => {
  it("calcule les pourcentages d'évolution des SIG avec précision", () => {
    // CA : 1 200M vs 1 000M = +20.00%
    const evolCA = calculerEvolutionPct(
      inputExemple.soldesN.chiffreAffaires_XOF,
      inputExemple.soldesNMoins1.chiffreAffaires_XOF
    );
    expect(evolCA).toBe(20);

    // RN : 77M vs 65M = +18.46%
    const evolRN = calculerEvolutionPct(
      inputExemple.soldesN.resultatNet_XOF,
      inputExemple.soldesNMoins1.resultatNet_XOF
    );
    expect(evolRN).toBe(18.46);
  });

  it("calcule l'affectation du résultat avec réserve légale automatique (10% AUSCGIE Art. 346)", () => {
    const affectation = calculerAffectationResultat(
      inputExemple.entite.capitalSocial_XOF, // 100M -> réserve légale max 20M
      77_000_000, // Bénéfice net
      inputExemple.affectation
    );

    // 10% de 77M = 7 700 000 XOF
    expect(affectation.reserveLegale_XOF).toBe(7_700_000);
    expect(affectation.beneficeDistribuable_XOF).toBe(77_000_000 + 15_000_000); // 92 000 000
    expect(affectation.dividendes_XOF).toBe(40_000_000);

    // Nouveau report = 92M - (7.7M + 5M + 40M) = 39.3M
    expect(affectation.nouveauReportANouveau_XOF).toBe(39_300_000);
    expect(affectation.tauxDistribution_pct).toBeCloseTo(51.95, 1);
  });

  it("génère le rapport de gestion complet et les résolutions d'AGOA", () => {
    const rapport = genererRapportGestion(inputExemple);

    expect(rapport.texteIntegralRapport).toContain("RAPPORT DE GESTION");
    expect(rapport.texteIntegralRapport).toContain("SOCIÉTÉ COMMERCIALE D'AFRIQUE DE L'OUEST SA");
    expect(rapport.texteIntegralRapport).toContain(inputExemple.soldesN.chiffreAffaires_XOF.toLocaleString("fr-FR"));
    expect(rapport.resolutionsProposees.length).toBe(3);
    expect(rapport.resolutionsProposees[0]).toContain("PREMIÈRE RÉSOLUTION");
    expect(rapport.resolutionsProposees[2]).toContain("TROISIÈME RÉSOLUTION");
  });

  it("plafonne la réserve légale à 20% du capital social", () => {
    // Si capital = 10M, plafond = 2M. Bénéfice = 50M -> 10% = 5M -> ramené à 2M
    const affectationPlafonnee = calculerAffectationResultat(
      10_000_000, // Capital
      50_000_000, // Gros bénéfice
      {
        reportANouveauInitial_XOF: 0,
        dotationReservesStatutaires_XOF: 0,
        dividendesProposes_XOF: 0,
      }
    );
    expect(affectationPlafonnee.reserveLegale_XOF).toBe(2_000_000);
  });
});
