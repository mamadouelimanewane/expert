import { describe, it, expect } from "vitest";
import {
  extrairePremierChiffre,
  evaluerEcritureForensique,
  analyserLoiBenford,
  executerAuditForensiqueISA240,
  type EcritureGrandLivreJET,
} from "../src/lib/ohada/audit-forensique-jet";

const ecritureNormale: EcritureGrandLivreJET = {
  id: "JET-01",
  dateComptable: "2024-03-12",
  heureSaisie: "14:30",
  jourSemaine: 2, // Mardi
  utilisateur: "comptable_1",
  valideur: "chef_comptable",
  journalCode: "ACH",
  compteDebit: "601100",
  compteCredit: "401100",
  libelle: "Achat fournitures consommables",
  montant_XOF: 1_452_300,
  hasPieceJustificative: true,
};

const ecritureFraude31Decembre: EcritureGrandLivreJET = {
  id: "JET-02",
  dateComptable: "2024-12-31",
  heureSaisie: "23:45", // Nuit
  jourSemaine: 2,
  utilisateur: "admin_dg",
  valideur: "admin_dg", // Auto-validation
  journalCode: "OD",
  compteDebit: "632400",
  compteCredit: "521100", // 6 vers 5 sans passer par 401
  libelle: "Régularisation honoraires exceptionnels",
  montant_XOF: 9_900_000, // Seuil juste en dessous de 10M + montant rond
  hasPieceJustificative: false, // Pas de pièce
};

describe("Audit Forensique Intégral ISA 240 (MindBridge Standard)", () => {
  it("extrait correctement le premier chiffre d'un montant pour Benford", () => {
    expect(extrairePremierChiffre(1_452_300)).toBe(1);
    expect(extrairePremierChiffre(9_900_000)).toBe(9);
    expect(extrairePremierChiffre(500_000)).toBe(5);
  });

  it("classe une écriture standard en risque FAIBLE (Score < 20)", () => {
    const scored = evaluerEcritureForensique(ecritureNormale);
    expect(scored.scoreRisque).toBe(0);
    expect(scored.niveauRisque).toBe("FAIBLE");
    expect(scored.controlesDeclenches.length).toBe(0);
  });

  it("attribue un risque CRITIQUE avec alertes multiples sur écriture suspecte du 31/12", () => {
    const scored = evaluerEcritureForensique(ecritureFraude31Decembre);
    expect(scored.scoreRisque).toBeGreaterThanOrEqual(60);
    expect(scored.niveauRisque).toBe("CRITIQUE");
    // Déclenche: Nuit, 31/12 sans pièce, seuil en-dessous de 10M, croisement 6 vers 5, cumul saisie/validation
    expect(scored.controlesDeclenches.some((c) => c.code === "CLOTURE_31_DECEMBRE_SANS_PIECE")).toBe(true);
    expect(scored.controlesDeclenches.some((c) => c.code === "HORAIRE_SUSPECT_NUIT_WEEKEND")).toBe(true);
    expect(scored.controlesDeclenches.some((c) => c.code === "SEUIL_JUSTE_EN_DESSOUS")).toBe(true);
    expect(scored.controlesDeclenches.some((c) => c.code === "CROISEMENT_COMPTE_ATYPIQUE")).toBe(true);
  });

  it("exécute l'audit complet ISA 240 avec distribution Benford et synthèse", () => {
    const rapport = executerAuditForensiqueISA240("SOCIÉTÉ COMMERCIALE SA", 2024, [
      ecritureNormale,
      ecritureFraude31Decembre,
    ]);

    expect(rapport.totalEcrituresAuditees).toBe(2);
    expect(rapport.nbEcrituresCritiques).toBe(1);
    expect(rapport.nbEcrituresFaibles).toBe(1);
    expect(rapport.distributionBenford.length).toBe(9);
    expect(rapport.syntheseISA240).toContain("norme ISA 240");
  });
});
