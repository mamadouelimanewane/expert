import { describe, it, expect } from "vitest";
import {
  genererPrevisionCash13Semaines,
} from "../src/lib/ohada/cash-forecast-13-semaines";

// Génère 13 semaines de flux avec encaissements > décaissements (croissant)
function fluxCroissants() {
  return Array.from({ length: 13 }, (_, i) => ({
    encaissements: 5_000_000 + i * 100_000,
    decaissements: 3_000_000,
  }));
}

// Génère 13 semaines avec un déficit à la semaine 5
function fluxAvecDeficit() {
  return Array.from({ length: 13 }, (_, i) => ({
    encaissements: i === 4 ? 500_000 : 3_000_000,   // semaine 5 : encaissement très faible
    decaissements: 4_000_000,                        // toujours supérieur aux encaissements
  }));
}

// 13 semaines bien excédentaires (0 critique)
function fluxExcedentaires() {
  return Array.from({ length: 13 }, () => ({
    encaissements: 10_000_000,
    decaissements: 2_000_000,
  }));
}

// 13 semaines toutes déficitaires
function fluxToutesCritiques() {
  return Array.from({ length: 13 }, () => ({
    encaissements: 1_000_000,
    decaissements: 5_000_000,
  }));
}

describe("genererPrevisionCash13Semaines", () => {
  it("1. calcule correctement 13 semaines avec soldes cumulés croissants", () => {
    const flux = fluxCroissants();
    const result = genererPrevisionCash13Semaines(
      "Société Alpha SA",
      10_000_000,
      flux,
      "2024-01-01"
    );

    expect(result.semaines).toHaveLength(13);

    // Chaque solde de fin doit être supérieur au précédent (flux croissants)
    for (let i = 1; i < 13; i++) {
      expect(result.semaines[i].soldeFin_XOF).toBeGreaterThan(
        result.semaines[i - 1].soldeFin_XOF
      );
    }

    // Vérification du solde final calculé manuellement
    let soldeAttendu = 10_000_000;
    for (const f of flux) {
      soldeAttendu += f.encaissements - f.decaissements;
    }
    expect(result.soldeFinalPrevu_XOF).toBe(soldeAttendu);

    // Toutes les semaines doivent être POSITIF
    expect(result.semaines.every((s) => s.alerteSolde === "POSITIF")).toBe(true);
    expect(result.semainesCritiques).toHaveLength(0);
  });

  it("2. identifie une semaine critique quand le solde passe en négatif", () => {
    // Solde initial faible pour que la semaine 5 (encaissement 500k vs dépense 4M) soit négative
    const flux = fluxAvecDeficit();
    const result = genererPrevisionCash13Semaines(
      "Société Beta SARL",
      5_000_000,
      flux,
      "2024-01-01"
    );

    // Il doit y avoir au moins une semaine critique
    expect(result.semainesCritiques.length).toBeGreaterThan(0);

    // Vérifier qu'il y a au moins une semaine NEGATIF
    const semNeg = result.semaines.filter((s) => s.alerteSolde === "NEGATIF");
    expect(semNeg.length).toBeGreaterThan(0);
    // Ces semaines doivent avoir un solde négatif
    for (const s of semNeg) {
      expect(s.soldeFin_XOF).toBeLessThan(0);
    }
  });

  it("3. génère un conseil trésorier cohérent quand 0 semaine critique", () => {
    const flux = fluxExcedentaires();
    const result = genererPrevisionCash13Semaines(
      "Société Gamma GIE",
      50_000_000,
      flux,
      "2024-01-01"
    );

    expect(result.semainesCritiques).toHaveLength(0);
    // Le conseil doit mentionner que la trésorerie est saine
    expect(result.conseilTresorier.toLowerCase()).toContain("saine");
    // Pas de mention d'alerte ou de crise
    expect(result.conseilTresorier.toLowerCase()).not.toContain("alerte");
    expect(result.conseilTresorier.toLowerCase()).not.toContain("crise");
  });

  it("4. génère un conseil trésorier d'alerte quand plus de 3 semaines critiques", () => {
    // Avec un solde initial faible et des flux toujours déficitaires, toutes les semaines seront critiques
    const flux = fluxToutesCritiques();
    const result = genererPrevisionCash13Semaines(
      "Société Delta SA",
      2_000_000,
      flux,
      "2024-01-01"
    );

    expect(result.semainesCritiques.length).toBeGreaterThan(3);
    // Le conseil doit contenir un mot d'alerte / urgence
    const conseil = result.conseilTresorier.toLowerCase();
    const motsCles = ["critique", "crise", "alerte", "urgence", "immédiat"];
    expect(motsCles.some((m) => conseil.includes(m))).toBe(true);
  });
});
