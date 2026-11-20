import { describe, it, expect } from "vitest";
import {
  scannerRisquesFiscaux,
  type DonneeControleFiscal,
} from "../src/lib/ohada/scanner-fiscal-predictif";

const dossierSain: DonneeControleFiscal = {
  exercice: 2024,
  pays: "SN",
  chiffreAffairesComptable_XOF: 1_000_000_000,
  totalCaDeclareTva_XOF: 1_000_000_000,
  tvaCollecteeComptabilisee_XOF: 180_000_000,
  tvaCollecteeDeclaree_XOF: 180_000_000,
  dettesFournisseursDormantesPlus4Ans_XOF: 0,
  amortissementsComptabilises_XOF: 40_000_000,
  plafondAmortissementsFiscaux_XOF: 40_000_000,
  honorairesEtCommissionsComptabilises_XOF: 15_000_000,
  honorairesDeclaresSurEtatRecapitulatif_XOF: 15_000_000,
  chargesSousTraitance_XOF: 50_000_000,
  justificatifsSousTraitanceValides: true,
  ecartInventaireStock_XOF: 0,
};

describe("Scanner Prédictif de Contrôle Fiscal DGID / DGI", () => {
  it("attribue un score de 100 et risque faible sur un dossier totalement conforme", () => {
    const res = scannerRisquesFiscaux(dossierSain);
    expect(res.scoreConformiteFiscale).toBe(100);
    expect(res.niveauRisqueGlobal).toBe("FAIBLE");
    expect(res.chefsDeRedressement.length).toBe(0);
    expect(res.expositionFinanciereTotale_XOF).toBe(0);
  });

  it("détecte un écart de CA TVA vs Liasse et chiffre le rappel avec pénalité 40%", () => {
    const dossierEcartTva: DonneeControleFiscal = {
      ...dossierSain,
      chiffreAffairesComptable_XOF: 1_100_000_000, // 100M de plus que déclaré en TVA
    };
    const res = scannerRisquesFiscaux(dossierEcartTva);
    const chefTva = res.chefsDeRedressement.find((c) => c.id === "CADRAGE_CA_TVA");
    expect(chefTva).toBeDefined();
    // Base = 100M, TVA (18%) = 18M, Pénalité (40%) = 7.2M, Intérêts (10%) = 1.8M
    expect(chefTva?.rappelImpotPrincipal_XOF).toBe(18_000_000);
    expect(chefTva?.penaliteEstimee_XOF).toBe(7_200_000);
    expect(chefTva?.severite).toBe("CRITIQUE");
    expect(res.scoreConformiteFiscale).toBeLessThanOrEqual(70);
  });

  it("chiffre la prescription quadriennale des dettes fournisseurs (Art. 18 & 24 CGI)", () => {
    const dossierDettes: DonneeControleFiscal = {
      ...dossierSain,
      dettesFournisseursDormantesPlus4Ans_XOF: 50_000_000,
    };
    const res = scannerRisquesFiscaux(dossierDettes);
    const chefDette = res.chefsDeRedressement.find((c) => c.id === "PRESCRIPTION_FOURNISSEURS");
    expect(chefDette).toBeDefined();
    // 50M * 30% IS = 15M
    expect(chefDette?.rappelImpotPrincipal_XOF).toBe(15_000_000);
    expect(chefDette?.severite).toBe("ELEVEE");
  });

  it("sanctionne les honoraires non déclarés sur la DAS par amende et rejet de charge", () => {
    const dossierDAS: DonneeControleFiscal = {
      ...dossierSain,
      honorairesEtCommissionsComptabilises_XOF: 30_000_000,
      honorairesDeclaresSurEtatRecapitulatif_XOF: 10_000_000, // 20M non déclarés
    };
    const res = scannerRisquesFiscaux(dossierDAS);
    const chefDAS = res.chefsDeRedressement.find((c) => c.id === "HONORAIRES_NON_DECLARES");
    expect(chefDAS).toBeDefined();
    // 20M * 30% IS = 6M + Amende 25% = 5M
    expect(chefDAS?.rappelImpotPrincipal_XOF).toBe(6_000_000);
    expect(chefDAS?.penaliteEstimee_XOF).toBe(5_000_000);
    expect(chefDAS?.expositionTotale_XOF).toBe(11_000_000);
  });
});
