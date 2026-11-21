import { describe, it, expect } from "vitest";
import {
  validerCoherenceLiasseSYSCOHADA,
  type InputValidationLiasse,
} from "../src/lib/ohada/validateur-coherence-liasse";

const LIASSE_VALIDE: InputValidationLiasse = {
  societeRaisonSociale: "SOCIÉTÉ COMMERCIALE D'IMPORTATION SA",
  exercice: 2024,
  bilan: {
    totalActifBrut_XOF: 500_000_000,
    totalAmortissementsProvisions_XOF: 100_000_000,
    totalActifNet_XOF: 400_000_000,
    totalPassif_XOF: 400_000_000,
    capitalSocial_XOF: 100_000_000,
    capitauxPropres_XOF: 160_000_000,
    resultatNetBilan_XOF: 45_000_000,
    tresorerieActif_XOF: 35_000_000,
    tresoreriePassif_XOF: 5_000_000,
    fournisseursDebiteursNonReclasses_XOF: 0,
    clientsCrediteursNonReclasses_XOF: 0,
  },
  compteResultat: {
    chiffreAffaires_XOF: 850_000_000,
    totalProduits_XOF: 870_000_000,
    totalCharges_XOF: 825_000_000,
    dotationsAmortissementsExercice_XOF: 25_000_000, // <= 100M
    resultatNetCompteResultat_XOF: 45_000_000,     // == 45M
    impotSurResultat_XOF: 15_000_000,
  },
};

describe("Validateur de Cohérence Liasse Fiscale SYSCOHADA (CaseWare Standard)", () => {
  it("valide une liasse sans écart arithmétique avec score 100", () => {
    const res = validerCoherenceLiasseSYSCOHADA(LIASSE_VALIDE);
    expect(res.liasseValide).toBe(true);
    expect(res.scoreFiabilite_100).toBe(100);
    expect(res.nbErreursBloquantes).toBe(0);
    expect(res.nbControlesValides).toBe(res.totalControles);
  });

  it("détecte une erreur bloquante si Actif Net != Passif", () => {
    const liasseDesequilibree: InputValidationLiasse = {
      ...LIASSE_VALIDE,
      bilan: {
        ...LIASSE_VALIDE.bilan,
        totalPassif_XOF: 410_000_000, // +10M de déséquilibre
      },
    };
    const res = validerCoherenceLiasseSYSCOHADA(liasseDesequilibree);
    expect(res.liasseValide).toBe(false);
    expect(res.nbErreursBloquantes).toBeGreaterThan(0);
    const ctrlBilan = res.controles.find((c) => c.id === "CTRL_01_EQUILIBRE_BILAN");
    expect(ctrlBilan?.statut).toBe("ERREUR_BLOQUANTE");
    expect(ctrlBilan?.ecart_XOF).toBe(10_000_000);
  });

  it("détecte une divergence entre Résultat Bilan et Résultat Compte de Résultat", () => {
    const liasseDivergence: InputValidationLiasse = {
      ...LIASSE_VALIDE,
      compteResultat: {
        ...LIASSE_VALIDE.compteResultat,
        resultatNetCompteResultat_XOF: 40_000_000, // vs 45M au bilan
      },
    };
    const res = validerCoherenceLiasseSYSCOHADA(liasseDivergence);
    expect(res.liasseValide).toBe(false);
    const ctrlRes = res.controles.find((c) => c.id === "CTRL_02_COHERENCE_RESULTAT");
    expect(ctrlRes?.statut).toBe("ERREUR_BLOQUANTE");
    expect(ctrlRes?.ecart_XOF).toBe(5_000_000);
  });

  it("génère des avertissements pour les comptes de tiers non reclassés", () => {
    const liasseNonReclassee: InputValidationLiasse = {
      ...LIASSE_VALIDE,
      bilan: {
        ...LIASSE_VALIDE.bilan,
        fournisseursDebiteursNonReclasses_XOF: 4_500_000,
        clientsCrediteursNonReclasses_XOF: 2_000_000,
      },
    };
    const res = validerCoherenceLiasseSYSCOHADA(liasseNonReclassee);
    expect(res.nbAvertissements).toBe(2);
    expect(res.scoreFiabilite_100).toBeLessThan(100);
  });
});
