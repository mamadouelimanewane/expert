import { describe, it, expect } from "vitest";
import {
  rapprocherTransaction,
  executerRapprochementIA,
  type TransactionFlux,
  type FactureOuverte,
} from "../src/lib/ohada/rapprochement-ia-banque-mobile";

const FACTURES_TEST: FactureOuverte[] = [
  {
    idFacture: "FAC-01",
    numeroFacture: "FAC-2024-0891",
    compteOHADA: "411",
    tiersNom: "SOCIETE COMMERCIALE DU SENEGAL",
    dateEmission: "2024-11-01",
    dateEcheance: "2024-11-30",
    montantTTC_XOF: 3_500_000,
    montantDejaRegle_XOF: 0,
    soldeRestantDu_XOF: 3_500_000,
  },
  {
    idFacture: "FAC-02",
    numeroFacture: "FAC-2024-0942",
    compteOHADA: "401",
    tiersNom: "FOURNISSEUR SODATEL",
    dateEmission: "2024-11-05",
    dateEcheance: "2024-12-05",
    montantTTC_XOF: 1_250_000,
    montantDejaRegle_XOF: 0,
    soldeRestantDu_XOF: 1_250_000,
  },
];

describe("Moteur de Rapprochement Intelligent IA — Banque & Mobile Money", () => {
  it("lettre automatiquement un encaissement Wave avec montant exact et référence facture", () => {
    const tx: TransactionFlux = {
      id: "TX-01",
      source: "WAVE",
      dateTransaction: "2024-11-15",
      libelleBrut: "Paiement Wave FAC-2024-0891 de SOCIETE COMMERCIALE",
      montant_XOF: 3_500_000,
    };
    const prop = rapprocherTransaction(tx, FACTURES_TEST);
    expect(prop.statutLettrage).toBe("LETTRAGE_AUTOMATIQUE");
    expect(prop.scoreConfiance_pct).toBeGreaterThanOrEqual(80);
    expect(prop.factureAssociee?.idFacture).toBe("FAC-01");
    expect(prop.compteContrepartiePropose).toBe("411100");
  });

  it("détecte et isole une commission de transaction Mobile Money au compte 628", () => {
    const txFrais: TransactionFlux = {
      id: "TX-02",
      source: "ORANGE_MONEY",
      dateTransaction: "2024-11-15",
      libelleBrut: "Frais de retrait et transfert commission OM",
      montant_XOF: -25_000,
    };
    const prop = rapprocherTransaction(txFrais, FACTURES_TEST);
    expect(prop.statutLettrage).toBe("FRAIS_COMMISSION");
    expect(prop.compteContrepartiePropose).toBe("628200");
  });

  it("propose un lettrage A_CONFIRMER pour un règlement partiel", () => {
    const txPartielle: TransactionFlux = {
      id: "TX-03",
      source: "BANQUE_TRADITIONNELLE",
      dateTransaction: "2024-11-18",
      libelleBrut: "Virement SODATEL paiement partiel",
      montant_XOF: -500_000, // vs facture 1 250 000
    };
    const prop = rapprocherTransaction(txPartielle, FACTURES_TEST);
    expect(prop.statutLettrage).toBe("A_CONFIRMER");
    expect(prop.factureAssociee?.idFacture).toBe("FAC-02");
  });

  it("génère un rapport global avec taux de couverture automatique", () => {
    const transactions: TransactionFlux[] = [
      {
        id: "T1",
        source: "WAVE",
        dateTransaction: "2024-11-15",
        libelleBrut: "Paiement Wave FAC-2024-0891",
        montant_XOF: 3_500_000,
      },
      {
        id: "T2",
        source: "BANQUE_TRADITIONNELLE",
        dateTransaction: "2024-11-20",
        libelleBrut: "Frais de tenue de compte mensuels agios",
        montant_XOF: -15_000,
      },
      {
        id: "T3",
        source: "FREE_MONEY",
        dateTransaction: "2024-11-22",
        libelleBrut: "Dépôt inconnu sans référence",
        montant_XOF: 42_000,
      },
    ];
    const rapport = executerRapprochementIA(transactions, FACTURES_TEST);
    expect(rapport.totalTransactions).toBe(3);
    expect(rapport.nbLettragesAutomatiques).toBe(1);
    expect(rapport.nbCommissionsDetectees).toBe(1);
    expect(rapport.nbNonRapproches).toBe(1);
    expect(rapport.tauxCouvertureAutomatique_pct).toBeGreaterThan(60);
  });
});
