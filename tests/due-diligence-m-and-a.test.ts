import { describe, it, expect } from "vitest";
import {
  calculerDueDiligence,
  type DossierDueDiligence,
} from "@/lib/ohada/due-diligence-m-and-a";

describe("Due Diligence Financière & M&A OHADA", () => {
  const dossierSain: DossierDueDiligence = {
    nomCible: "Agro-Industrie du Sine Saloum SA",
    secteurActivite: "Agroalimentaire & Huilerie",
    chiffreAffairesHistorique: 5_000_000_000,
    ebitdaComptableHistorique: 600_000_000,
    retraitementsEbitda: [
      {
        id: "RET-1",
        libelle: "Rémunération excessive de l'actionnaire majoritaire",
        categorie: "REMUNERATION_DIRIGEANT",
        montantImpactEbitda: 50_000_000, // +50M
        justificationAuditeur: "Rémunération de 120M vs salaire de marché de 70M pour DG non actionnaire.",
      },
      {
        id: "RET-2",
        libelle: "Frais d'avocats sur litige foncier soldé",
        categorie: "CHARGE_PRODUIT_EXCEPTIONNEL",
        montantImpactEbitda: 30_000_000, // +30M
        justificationAuditeur: "Dépense juridique one-off liée à l'immatriculation d'un bail emphytéotique.",
      },
      {
        id: "RET-3",
        libelle: "Subvention d'exploitation exceptionnelle",
        categorie: "CHARGE_PRODUIT_EXCEPTIONNEL",
        montantImpactEbitda: -20_000_000, // -20M
        justificationAuditeur: "Aide Covid/Résilience non reconductible.",
      },
    ],
    tresorerieActif: 200_000_000,
    dettesFinancieresBrutes: 800_000_000,
    elementsDetteAssimilee: [
      {
        id: "DA-1",
        libelle: "Contrôle fiscal en cours (redressement prévisible)",
        montant: 80_000_000,
        typeElement: "ARRIERE_FISCAL_SOCIAL",
        probabiliteDecaissement: 75, // 80M * 75% = 60M
      },
      {
        id: "DA-2",
        libelle: "Indemnités de fin de carrière non provisionnées",
        montant: 40_000_000,
        typeElement: "INDEMNITE_RETRAITE",
        probabiliteDecaissement: 100, // 40M
      },
    ],
    bfrReelCloture: 450_000_000,
    bfrNormatifCible: 400_000_000, // BFR réel > cible de +50M
    multipleEbitdaNegocie: 6.0,
  };

  it("calcule avec exactitude l'EBITDA normatif récurrent (QoE)", () => {
    const res = calculerDueDiligence(dossierSain);
    // Ajustements = +50M + 30M - 20M = +60M
    expect(res.totalAjustementsEbitda).toBe(60_000_000);
    // EBITDA Normatif = 600M + 60M = 660M
    expect(res.ebitdaNormatifAjuste).toBe(660_000_000);
    // Marge = 660M / 5 Mds = 13.2%
    expect(res.margeEbitdaNormative).toBe(13.2);
  });

  it("calcule la dette nette ajustée et les éléments assimilés à de la dette", () => {
    const res = calculerDueDiligence(dossierSain);
    // Dette financière nette comptable = 800M - 200M = 600M
    expect(res.detteFinanciereNetteComptable).toBe(600_000_000);
    // Dettes assimilées = 80M*75% (60M) + 40M*100% (40M) = 100M
    expect(res.totalDettesAssimilees).toBe(100_000_000);
    // Ajustement BFR = 450M - 400M = +50M
    expect(res.ajustementBfrSurPeg).toBe(50_000_000);
    // Dette Nette Ajustée = 600M + 100M - 50M = 650M
    expect(res.detteNetteAjusteeTotale).toBe(650_000_000);
  });

  it("détermine la Valeur d'Entreprise (EV) et la Valeur des Titres (Equity Value)", () => {
    const res = calculerDueDiligence(dossierSain);
    // EV = 660M * 6.0 = 3 960 000 000 FCFA
    expect(res.valeurEntrepriseEV).toBe(3_960_000_000);
    // Equity Value = 3 960M - 650M = 3 310 000 000 FCFA
    expect(res.valeurTitresEquityValue).toBe(3_310_000_000);
    expect(res.rapportSyntheseExecutive).toContain("EQUITY VALUE");
  });

  it("identifie les deal killers et formules de protection contractuelle (GAP)", () => {
    const res = calculerDueDiligence(dossierSain);
    // Le redressement fiscal de 80M à 75% est un risque critique
    expect(res.dealKillers.length).toBeGreaterThan(0);
    expect(res.recommandationsGarantieActifPassif.some(r => r.includes("Escrow"))).toBe(true);
  });
});
