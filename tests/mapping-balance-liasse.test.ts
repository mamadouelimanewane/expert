import { describe, it, expect } from "vitest";
import {
  mapperBalanceVersLiasse,
  type LigneBalanceSYSCOHADA,
} from "@/lib/ohada/mapping-balance-liasse";

describe("Mapping Automatique Balance Générale ➔ Liasse SYSCOHADA", () => {
  const balanceNormative: LigneBalanceSYSCOHADA[] = [
    // Classe 1
    { compte: "101000", intitule: "Capital social", soldeDebiteur: 0, soldeCrediteur: 100_000_000 },
    { compte: "162000", intitule: "Emprunts bancaires LMT", soldeDebiteur: 0, soldeCrediteur: 40_000_000 },
    // Classe 2
    { compte: "241000", intitule: "Matériel industriel", soldeDebiteur: 180_000_000, soldeCrediteur: 0 },
    { compte: "284100", intitule: "Amortissements matériel", soldeDebiteur: 0, soldeCrediteur: 20_000_000 },
    // Classe 3
    { compte: "311000", intitule: "Marchandises", soldeDebiteur: 30_000_000, soldeCrediteur: 0 },
    // Classe 4
    { compte: "411100", intitule: "Clients ordinaires", soldeDebiteur: 50_000_000, soldeCrediteur: 0 },
    { compte: "401100", intitule: "Fournisseurs exploitation", soldeDebiteur: 0, soldeCrediteur: 35_000_000 },
    { compte: "447200", intitule: "TVA à décaisser", soldeDebiteur: 0, soldeCrediteur: 5_000_000 },
    // Classe 5
    { compte: "521100", intitule: "Banque CBAO", soldeDebiteur: 25_000_000, soldeCrediteur: 0 },
    { compte: "561000", intitule: "Crédits de trésorerie", soldeDebiteur: 0, soldeCrediteur: 10_000_000 },
    // Classe 6 & 7 & 8
    { compte: "701100", intitule: "Ventes de marchandises", soldeDebiteur: 0, soldeCrediteur: 200_000_000 },
    { compte: "601100", intitule: "Achats de marchandises", soldeDebiteur: 110_000_000, soldeCrediteur: 0 },
    { compte: "661100", intitule: "Salaires bruts", soldeDebiteur: 40_000_000, soldeCrediteur: 0 },
    { compte: "891000", intitule: "Impôt sur le résultat (IS)", soldeDebiteur: 15_000_000, soldeCrediteur: 0 },
    // Contrepartie de balance équilibrée
    { compte: "471000", intitule: "Compte d'attente régul", soldeDebiteur: 0, soldeCrediteur: 40_000_000 },
  ];

  const balanceAvecAnomalies: LigneBalanceSYSCOHADA[] = [
    { compte: "531000", intitule: "Caisse principale", soldeDebiteur: 0, soldeCrediteur: 2_000_000 }, // Caisse créditrice !
    { compte: "411200", intitule: "Client Douteux X", soldeDebiteur: 0, soldeCrediteur: 5_000_000 }, // Client créditeur non reclassé en 419 !
  ];

  it("ventile les comptes vers les postes officiels de la Liasse Bilan et CR", () => {
    const liasse = mapperBalanceVersLiasse(balanceNormative);
    // Actif Immo Net = 180M - 20M = 160M
    const posteImmo = liasse.postesBilanActif.find(p => p.codePoste === "AZ");
    expect(posteImmo?.montantNet).toBe(160_000_000);

    // Chiffre d'Affaires = 200M
    const posteCA = liasse.postesCompteResultat.find(p => p.codePoste === "TA");
    expect(posteCA?.montantNet).toBe(200_000_000);

    // Résultat net = Produits (200M) - Charges (110M + 40M + 15M = 165M) = 35M
    expect(liasse.resultatNetLiasse).toBe(35_000_000);
    expect(liasse.tauxCouvertureComptes).toBe(100);
  });

  it("détecte les anomalies de caisse créditrice et solde client non reclassé", () => {
    const liasse = mapperBalanceVersLiasse(balanceAvecAnomalies);
    const alerteCaisse = liasse.anomaliesImputation.find(a => a.code === "CAISSE_CREDITRICE");
    expect(alerteCaisse).toBeDefined();
    expect(alerteCaisse?.severite).toBe("BLOQUANT");

    const alerteClient = liasse.anomaliesImputation.find(a => a.code === "CLIENT_CREDITEUR");
    expect(alerteClient).toBeDefined();
  });

  it("calcule avec exactitude la trésorerie active et passive du bilan", () => {
    const liasse = mapperBalanceVersLiasse(balanceNormative);
    const posteTresoActif = liasse.postesBilanActif.find(p => p.codePoste === "BQ");
    expect(posteTresoActif?.montantNet).toBe(25_000_000);

    const posteTresoPassif = liasse.postesBilanPassif.find(p => p.codePoste === "DT");
    expect(posteTresoPassif?.montantNet).toBe(10_000_000);
  });

  it("vérifie la complétude du Bilan Passif et la détection d'équilibre de balance", () => {
    const liasse = mapperBalanceVersLiasse(balanceNormative);
    expect(liasse.balanceEquilibree).toBe(true);
    expect(liasse.totalDebitsBalance).toBe(liasse.totalCreditsBalance);
    expect(liasse.postesBilanPassif.length).toBeGreaterThanOrEqual(4);
  });
});
