import { describe, it, expect } from "vitest";
import { calculerIndemnitesRupture, calculerAnciennete } from "@/lib/payroll/indemnites-rupture";

describe("calculerAnciennete", () => {
  it("calcule correctement l'ancienneté en années et mois", () => {
    const res = calculerAnciennete("2020-01-01", "2025-07-01");
    expect(res.annees).toBe(5);
    expect(res.mois).toBe(6);
    expect(res.ancienneteTotaleDecimale).toBe(5.5);
  });
});

describe("calculerIndemnitesRupture", () => {
  it("calcule les indemnités de licenciement avec préavis non effectué pour un cadre au Sénégal", () => {
    const res = calculerIndemnitesRupture({
      pays: "SN",
      nomSalarie: "Fatou Sow",
      statut: "CADRE_DIRIGEANT",
      dateEmbauche: "2018-01-01",
      dateFinContrat: "2025-01-01", // 7 ans d'ancienneté
      motif: "LICENCIEMENT_MOTIF_PERSONNEL",
      salaireMoyen12DerniersMois: 1_000_000,
      dernierSalaireBrut: 1_000_000,
      joursCongesRestants: 15,
      preavisEffectue: false, // préavis de 3 mois à payer
    });

    expect(res.ancienneteAnnees).toBe(7);
    // Tranche 1 (5 ans à 25%) : 5 * 250_000 = 1_250_000
    // Tranche 2 (2 ans à 30%) : 2 * 300_000 = 600_000
    // Total indemnité licenciement : 1_850_000
    expect(res.indemniteDepart).toBe(1_850_000);

    // Préavis cadre (3 mois) : 3_000_000
    expect(res.indemnitePreavis).toBe(3_000_000);
    expect(res.dureePreavisMois).toBe(3);

    // Congés payés (15 jours) : 500_000
    expect(res.indemniteCongesPayes).toBe(500_000);

    expect(res.netAPayerSolde).toBeGreaterThan(0);
    expect(res.recuPourSoldeTexte).toContain("REÇU POUR SOLDE DE TOUT COMPTE");
    expect(res.recuPourSoldeTexte).toContain("Fatou Sow");
  });

  it("n'ouvre pas droit à indemnité de licenciement en cas de démission", () => {
    const res = calculerIndemnitesRupture({
      pays: "CI",
      nomSalarie: "Koffi Kouamé",
      statut: "OUVRIER_EMPLOYE",
      dateEmbauche: "2020-01-01",
      dateFinContrat: "2024-01-01",
      motif: "DEMISSION",
      salaireMoyen12DerniersMois: 300_000,
      dernierSalaireBrut: 300_000,
      joursCongesRestants: 5,
      preavisEffectue: true,
    });

    expect(res.indemniteDepart).toBe(0);
    expect(res.indemnitePreavis).toBe(0);
    expect(res.indemniteCongesPayes).toBe(50_000);
  });
});
