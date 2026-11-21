import { describe, it, expect } from "vitest";
import {
  evaluerGageWarrantAgricole,
  type InputGageAgricole,
} from "../src/lib/ohada/gages-warrants-agricoles";

const INPUT_TEST_CACAO: InputGageAgricole = {
  societeEmprunteur: "SOCIÉTÉ COMMERCIALE DE CACAO SA",
  banquePreteuse: "BANQUE NATIONALE D'INVESTISSEMENT (BNI)",
  exercice: 2024,
  creditBancaireTire_XOF: 300_000_000,
  seuilLtvAlerte_pct: 80,
  prixSpotTonne_XOF: 2_500_000, // 2.5M XOF / Tonne
  lots: [
    {
      idLot: "LOT-01",
      speculation: "CACAO",
      entrepotNom: "Magasin Central San Pedro",
      localisation: "San Pedro, Côte d'Ivoire",
      quantite_tonnes: 120,
      qualiteGrade: "Grade 1 Export",
      numeroRecepisseEntrepot: "REC-SP-9921",
      nomTiersDetenteur: "SGS SURVEILLANCE CÔTE D'IVOIRE",
    },
    {
      idLot: "LOT-02",
      speculation: "CACAO",
      entrepotNom: "Magasin Vridi Port",
      localisation: "Abidjan, Côte d'Ivoire",
      quantite_tonnes: 80,
      qualiteGrade: "Grade 1 Export",
      numeroRecepisseEntrepot: "REC-VR-4412",
      nomTiersDetenteur: "SGS SURVEILLANCE CÔTE D'IVOIRE",
    },
  ],
};

describe("Smart Collateral : Gages Agricoles & Warrants (Tierce Détention OHADA)", () => {
  it("calcule avec exactitude la valorisation totale et le LTV pour un portefeuille nanti", () => {
    // 200 tonnes * 2 500 000 XOF = 500 000 000 XOF valeur stock
    // Crédit : 300 000 000 XOF -> LTV = 300 / 500 = 60%
    const res = evaluerGageWarrantAgricole(INPUT_TEST_CACAO);
    expect(res.totalQuantite_tonnes).toBe(200);
    expect(res.valeurTotaleStock_XOF).toBe(500_000_000);
    expect(res.ratioLTV_pct).toBe(60);
    expect(res.statutCouverture).toBe("SURCOUVERTURE_CONFORTABLE");
    expect(res.montantAppelDeMarge_XOF).toBe(0);
  });

  it("déclenche une alerte et chiffre l'appel de marge si la valeur du stock chute", () => {
    // Si le cours mondial chute à 1 500 000 XOF/tonne
    // Valeur stock = 200t * 1.5M = 300 000 000 XOF
    // Crédit = 300 000 000 XOF -> LTV = 100% > seuil 80%
    const inputChuteCours: InputGageAgricole = {
      ...INPUT_TEST_CACAO,
      prixSpotTonne_XOF: 1_500_000,
    };

    const res = evaluerGageWarrantAgricole(inputChuteCours);
    expect(res.ratioLTV_pct).toBe(100);
    expect(res.statutCouverture).toBe("ALERTE_APPEL_DE_MARGE");
    // Crédit max admissible à 80% = 300M * 80% = 240M
    // Appel de marge = 300M - 240M = 60M
    expect(res.montantAppelDeMarge_XOF).toBe(60_000_000);
  });

  it("calcule avec précision le remboursement requis lors d'une mainlevée partielle de stock", () => {
    // Mainlevée de 50 tonnes sur 200 tonnes (25% du stock)
    // Remboursement crédit requis = 300M * 25% = 75M
    const res = evaluerGageWarrantAgricole(INPUT_TEST_CACAO, 50);
    expect(res.simulationMainlevee.tonnesALiberer).toBe(50);
    expect(res.simulationMainlevee.valeurMarchandeLot_XOF).toBe(125_000_000);
    expect(res.simulationMainlevee.remboursementCreditRequis_XOF).toBe(75_000_000);
    expect(res.simulationMainlevee.nouveauLTV_pct).toBe(60);
  });

  it("génère l'attestation de tierce détention conforme à l'AUS OHADA", () => {
    const res = evaluerGageWarrantAgricole(INPUT_TEST_CACAO);
    expect(res.certificatTierceDetentionTexte).toContain("ATTESTATION DE TIERCE DÉTENTION");
    expect(res.certificatTierceDetentionTexte).toContain("ART. 92 À 117 AUS");
    expect(res.certificatTierceDetentionTexte).toContain("SOCIÉTÉ COMMERCIALE DE CACAO SA");
    expect(res.certificatTierceDetentionTexte).toContain("BANQUE NATIONALE D'INVESTISSEMENT (BNI)");
    expect(res.certificatTierceDetentionTexte).toContain("SGS SURVEILLANCE CÔTE D'IVOIRE");
  });
});
