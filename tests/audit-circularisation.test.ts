import { describe, it, expect } from "vitest";
import {
  selectionnerEchantillonCircularisation,
  genererLettreCircularisation,
  rapprocherReponseTiers,
  TiersACirculariser,
} from "@/lib/ohada/audit-circularisation";

describe("selectionnerEchantillonCircularisation", () => {
  it("filtre les tiers au-dessus du seuil de matérialité", () => {
    const tiers: TiersACirculariser[] = [
      { id: "1", categorie: "FOURNISSEUR", numeroCompte: "401100", denominationOuNom: "Fournisseur A", adresse: "Dakar", soldeComptableLivre: 15_000_000, devise: "XOF" },
      { id: "2", categorie: "FOURNISSEUR", numeroCompte: "401200", denominationOuNom: "Fournisseur B", adresse: "Dakar", soldeComptableLivre: 500_000, devise: "XOF" },
      { id: "3", categorie: "CLIENT", numeroCompte: "411100", denominationOuNom: "Client C", adresse: "Abidjan", soldeComptableLivre: 8_000_000, devise: "XOF" },
    ];

    const seuil = 5_000_000;
    const echantillon = selectionnerEchantillonCircularisation(tiers, seuil);

    expect(echantillon).toHaveLength(2);
    expect(echantillon.map((t) => t.id)).toEqual(["1", "3"]);
  });
});

describe("genererLettreCircularisation", () => {
  it("génère une lettre conforme ISA 505 avec mentions légales", () => {
    const lettre = genererLettreCircularisation(
      { denomination: "SARL SAHEL DISTRIB", ville: "Dakar" },
      { id: "1", categorie: "FOURNISSEUR", numeroCompte: "401100", denominationOuNom: "TOTAL ENERGIES", adresse: "Route des hydrocarbures", soldeComptableLivre: 12_000_000, devise: "XOF" },
      { denomination: "Cabinet 360 Audit", adresse: "Plateau Dakar", email: "audit@cabinet360.sn" },
      "31/12/2025"
    );

    expect(lettre).toContain("DEMANDE DE CONFIRMATION DIRECTE DE SOLDE");
    expect(lettre).toContain("ISA 505");
    expect(lettre).toContain("TOTAL ENERGIES");
    expect(lettre.replace(/\u202F|\u00A0/g, " ")).toContain("12 000 000 XOF");
  });
});

describe("rapprocherReponseTiers", () => {
  it("valide un rapprochement avec décalages justifiés de règlements en circulation", () => {
    const tiers: TiersACirculariser = {
      id: "1",
      categorie: "FOURNISSEUR",
      numeroCompte: "401100",
      denominationOuNom: "FOURNISSEUR TECH",
      adresse: "Dakar",
      soldeComptableLivre: 10_000_000,
      devise: "XOF",
    };

    // Le fournisseur dit qu'on lui doit 13_000_000 (écart brut = -3_000_000)
    // Justifié par 2_000_000 de règlements en circulation et 1_000_000 de factures non parvenues
    const reponse = {
      tiersId: "1",
      dateReponse: "2026-02-15",
      soldeConfirmeParTiers: 13_000_000,
      montantReglementsEnCirculation: 2_000_000,
      montantFacturesNonComptabilisees: 1_000_000,
    };

    const res = rapprocherReponseTiers(tiers, reponse);
    expect(res.statutAudit).toBe("ECART_JUSTIFIE");
    expect(res.justificationsRapprochement.ecartInexplique).toBe(0);
  });

  it("détecte une anomalie non élucidée en présence d'un écart non expliqué", () => {
    const tiers: TiersACirculariser = {
      id: "2",
      categorie: "CLIENT",
      numeroCompte: "411100",
      denominationOuNom: "CLIENT XYZ",
      adresse: "Abidjan",
      soldeComptableLivre: 8_000_000,
      devise: "XOF",
    };

    const reponse = {
      tiersId: "2",
      dateReponse: "2026-02-20",
      soldeConfirmeParTiers: 5_000_000,
      montantReglementsEnCirculation: 0,
      montantFacturesNonComptabilisees: 0,
    };

    const res = rapprocherReponseTiers(tiers, reponse);
    expect(res.statutAudit).toBe("ANOMALIE_NON_ELUCIDEE");
    expect(res.justificationsRapprochement.ecartInexplique).toBe(3_000_000);
  });
});
