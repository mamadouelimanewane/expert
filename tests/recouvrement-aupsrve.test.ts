import { describe, it, expect } from "vitest";
import {
  calculerDelaisProceduraux,
  genererRequeteInjonctionPayer,
  RequeteIPParams,
} from "@/lib/ohada/recouvrement-aupsrve";

describe("calculerDelaisProceduraux", () => {
  it("calcule un délai d'opposition de 15 jours", () => {
    const res = calculerDelaisProceduraux("2026-06-01");
    expect(res.delaiOppositionJours).toBe(15);
    expect(res.dateLimiteOpposition).toBe("2026-06-16");
  });

  it("calcule un délai de caducité de 3 mois (art. 16 AUPSRVE)", () => {
    const res = calculerDelaisProceduraux("2026-01-10");
    expect(res.delaiCaduciteMois).toBe(3);
    expect(res.dateCaduciteOrdonnance).toBe("2026-04-10");
  });

  it("lève une erreur en cas de date invalide", () => {
    expect(() => calculerDelaisProceduraux("date-invalide")).toThrow("Date de signification invalide");
  });
});

describe("genererRequeteInjonctionPayer", () => {
  const params: RequeteIPParams = {
    juridiction: "Tribunal de Commerce Hors Classe de Dakar",
    ville: "Dakar",
    creancier: {
      denominationOuNom: "Cabinet 360 Conseils SARL",
      formeJuridique: "SARL",
      rccmOuNinea: "SN-DKR-2022-B-1234",
      adresse: "Almadies Zone 4",
      ville: "Dakar",
      pays: "Sénégal",
      representantLegal: "Amadou Diallo, Gérant",
    },
    debiteur: {
      denominationOuNom: "Import-Export Sahel SA",
      formeJuridique: "SA",
      rccmOuNinea: "SN-DKR-2019-B-9988",
      adresse: "Zone Industrielle KM 12",
      ville: "Dakar",
      pays: "Sénégal",
    },
    creancePrincipale: 15_000_000,
    tauxInteretLegalAnnuel: 6.0,
    dateExigibilite: "2026-01-01",
    dateRequete: "2026-07-01", // ~181 jours plus tard
    fraisPoursuiteEstimes: 250_000,
    natureCreance: "Honoraires de révision comptable et assistance fiscale exercice 2025",
    miseEnDemeureDate: "2026-04-15",
    miseEnDemeureHuissier: "Maître Ndiaye, Huissier de Justice à Dakar",
    piecesJustificatives: [
      {
        numero: 1,
        description: "Lettre de mission signée",
        referencePiece: "LDM-2025-01",
        datePiece: "2025-01-15",
      },
      {
        numero: 2,
        description: "Facture impayée N° FAC-2025-089",
        referencePiece: "FAC-2025-089",
        datePiece: "2025-12-01",
        montantPiece: 15_000_000,
      },
      {
        numero: 3,
        description: "Sommation de payer restée infructueuse",
        referencePiece: "ACTE-HUI-456",
        datePiece: "2026-04-15",
      },
    ],
  };

  it("calcule les intérêts légaux moratoires et le total réclamé", () => {
    const res = genererRequeteInjonctionPayer(params);
    expect(res.creancePrincipale).toBe(15_000_000);
    expect(res.nombreJoursRetard).toBeGreaterThan(150);
    expect(res.interetsCalcules).toBeGreaterThan(0);
    expect(res.totalReclame).toBe(res.creancePrincipale + res.interetsCalcules + res.fraisPoursuiteEstimes);
  });

  it("génère le texte formel de la requête et le projet d'ordonnance", () => {
    const res = genererRequeteInjonctionPayer(params);
    expect(res.texteRequete).toContain("REQUÊTE AUX FINS D'INJONCTION DE PAYER");
    expect(res.texteRequete).toContain("Cabinet 360 Conseils SARL");
    expect(res.texteRequete).toContain("Import-Export Sahel SA");
    expect(res.projetOrdonnance).toContain("ORDONNANCE D'INJONCTION DE PAYER");
    expect(res.referencesLegales.length).toBeGreaterThanOrEqual(4);
  });
});
