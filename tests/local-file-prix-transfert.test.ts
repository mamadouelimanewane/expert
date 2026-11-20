import { describe, it, expect } from "vitest";
import {
  analyserTransactionIntragroupe,
  genererDossierLocalFilePT,
  type EntiteDeclarantePT,
} from "../src/lib/ohada/local-file-prix-transfert";

const entiteTest: EntiteDeclarantePT = {
  raisonSociale: "MULTINATIONALE LOGISTIQUE SÉNÉGAL SA",
  ninea_niu: "009876543 2R1",
  pays: "SN",
  exercice: 2024,
  chiffreAffaires_XOF: 2_000_000_000,
  fraisGeneraux_XOF: 400_000_000,
  tauxBceaoReference_pct: 5.5, // Plafond prêt = 7.5%
  transactions: [
    {
      id: "pt-1",
      entiteLieeNom: "GROUPE HOLDING FRANCE SAS",
      paysResidenceLiee: "FR",
      lienCapital_pct: 100,
      natureFlux: "MANAGEMENT_FEES",
      montantAnnuel_XOF: 70_000_000, // Plafond 5% CA = 100M, 20% FG = 80M -> Plafond 80M -> 70M conforme
      methodeRetenue: "COUT_MAJORE",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: true,
    },
    {
      id: "pt-2",
      entiteLieeNom: "GROUPE FINANCE LUXEMBOURG SA",
      paysResidenceLiee: "LU",
      lienCapital_pct: 100,
      natureFlux: "PRET_INTRAGROUPE",
      montantAnnuel_XOF: 500_000_000,
      tauxInteretApplique_pct: 11.5, // 11.5% > 7.5% (dépassement de 4.0%)
      methodeRetenue: "PRIX_COMPARABLE_CUP",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: true,
    },
    {
      id: "pt-3",
      entiteLieeNom: "BRAND IP DUBAI FZE",
      paysResidenceLiee: "AE", // Émirats arabes unis (taux BRS 20%)
      lienCapital_pct: 100,
      natureFlux: "REDEVANCES_MARQUES",
      montantAnnuel_XOF: 120_000_000, // Plafond 4% de 2 Mds = 80M -> Dépassement 40M
      methodeRetenue: "MARGE_NETTE_TNMM",
      substanceEconomiqueVerifiee: true,
      contratEcritExistant: true,
      documentationBenchmarkingDisponible: false,
    },
  ],
};

describe("Local File Prix de Transfert & CbCR Dématérialisé (Art. 31 ter CGI)", () => {
  it("valide les management fees dans la limite du double plafond 5% CA et 20% FG", () => {
    const analyse = analyserTransactionIntragroupe(entiteTest.transactions[0], entiteTest);
    expect(analyse.conformePlafondLegal).toBe(true);
    expect(analyse.montantExcedentaireReintegrable_XOF).toBe(0);
    expect(analyse.risqueRappelIS_XOF).toBe(0);
  });

  it("détecte le dépassement du taux plafond BCEAO + 2 points sur les prêts intra-groupe", () => {
    const analyse = analyserTransactionIntragroupe(entiteTest.transactions[1], entiteTest);
    expect(analyse.conformePlafondLegal).toBe(false);
    // Écart de 4% sur 500M = 20M d'intérêts excédentaires
    expect(analyse.montantExcedentaireReintegrable_XOF).toBe(20_000_000);
    // IS (30%) = 6M
    expect(analyse.risqueRappelIS_XOF).toBe(6_000_000);
  });

  it("sanctionne le dépassement du plafond de redevances et applique la retenue majorée (20%)", () => {
    const analyse = analyserTransactionIntragroupe(entiteTest.transactions[2], entiteTest);
    expect(analyse.conformePlafondLegal).toBe(false);
    // Plafond 4% de 2 Mds = 80M. Montant 120M -> Excédent 40M
    expect(analyse.montantExcedentaireReintegrable_XOF).toBe(40_000_000);
    // BRS 20% sur 40M = 8M
    expect(analyse.risqueBrs_XOF).toBe(8_000_000);
  });

  it("génère le dossier complet de Fichier Local avec texte juridique et recommandations", () => {
    const dossier = genererDossierLocalFilePT(entiteTest);
    expect(dossier.analyses.length).toBe(3);
    expect(dossier.totalFluxIntragroupe_XOF).toBe(690_000_000);
    expect(dossier.totalExcedentReintegrable_XOF).toBe(60_000_000); // 20M + 40M
    expect(dossier.texteIntegralLocalFile).toContain("DOCUMENTATION DES PRIX DE TRANSFERT");
    expect(dossier.texteIntegralLocalFile).toContain("MULTINATIONALE LOGISTIQUE SÉNÉGAL SA");
    expect(dossier.recommandationsPrioritaires.length).toBeGreaterThan(0);
  });
});
