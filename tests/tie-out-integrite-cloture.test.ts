import { describe, it, expect } from "vitest";
import {
  calculerFingerprint,
  sceller,
  verifierIntegriteSection,
  genererRapportTieOut,
  type LigneCloture,
} from "../src/lib/ohada/tie-out-integrite-cloture";

const LIGNES_BILAN_ACTIF: LigneCloture[] = [
  { compteOHADA: "211000", libelle: "Terrains", debit_XOF: 150_000_000, credit_XOF: 0 },
  { compteOHADA: "221000", libelle: "Bâtiments", debit_XOF: 85_000_000, credit_XOF: 0 },
  { compteOHADA: "411000", libelle: "Clients", debit_XOF: 42_000_000, credit_XOF: 0 },
];

describe("Tie-Out Intégrité de Clôture SYSCOHADA (FloQast Standard)", () => {
  it("scelle une section et détecte une intégrité conforme quand les lignes sont identiques", () => {
    const section = sceller(
      "BILAN_ACTIF",
      "BILAN — Actif immobilisé",
      "Expert Amadou SOW",
      "2024-11-30",
      LIGNES_BILAN_ACTIF
    );
    expect(section.statut).toBe("CADRE_CONFORME");
    expect(section.fingerprint).toBeTruthy();
    expect(section.fingerprint).toHaveLength(8);

    // Vérification sur les mêmes lignes → intègre
    const { integre, ecarts } = verifierIntegriteSection(section, [...LIGNES_BILAN_ACTIF]);
    expect(integre).toBe(true);
    expect(ecarts).toHaveLength(0);
  });

  it("détecte une modification de montant débit post-validation (altération CRITIQUE)", () => {
    const section = sceller(
      "BILAN_ACTIF",
      "BILAN — Actif immobilisé",
      "Expert Amadou SOW",
      "2024-11-30",
      LIGNES_BILAN_ACTIF
    );

    // Modification post-validation : terrain passe de 150M à 160M
    const lignesModifiees: LigneCloture[] = [
      { compteOHADA: "211000", libelle: "Terrains", debit_XOF: 160_000_000, credit_XOF: 0 },
      { compteOHADA: "221000", libelle: "Bâtiments", debit_XOF: 85_000_000, credit_XOF: 0 },
      { compteOHADA: "411000", libelle: "Clients", debit_XOF: 42_000_000, credit_XOF: 0 },
    ];

    const { integre, ecarts } = verifierIntegriteSection(section, lignesModifiees);
    expect(integre).toBe(false);
    expect(ecarts.length).toBeGreaterThan(0);

    const ecartTerrain = ecarts.find((e) => e.compteOHADA === "211000");
    expect(ecartTerrain).toBeDefined();
    expect(ecartTerrain!.natureDelta).toBe("DEBIT_MODIFIE");
    expect(ecartTerrain!.delta_XOF).toBe(10_000_000);
    expect(ecartTerrain!.risqueAudit).toBe("CRITIQUE");
  });

  it("détecte une ligne injectée après validation (écriture fantôme)", () => {
    const section = sceller(
      "BILAN_PASSIF",
      "BILAN — Passif",
      "Expert Fatou DIOP",
      "2024-11-30",
      [{ compteOHADA: "101000", libelle: "Capital social", debit_XOF: 0, credit_XOF: 500_000_000 }]
    );

    // Injection d'une nouvelle ligne après validation
    const lignesAvecInjection: LigneCloture[] = [
      { compteOHADA: "101000", libelle: "Capital social", debit_XOF: 0, credit_XOF: 500_000_000 },
      { compteOHADA: "165000", libelle: "Dépôts et cautionnements fictifs", debit_XOF: 0, credit_XOF: 25_000_000 },
    ];

    const { integre, ecarts } = verifierIntegriteSection(section, lignesAvecInjection);
    expect(integre).toBe(false);
    const ecartInjection = ecarts.find((e) => e.natureDelta === "LIGNE_AJOUTEE");
    expect(ecartInjection).toBeDefined();
    expect(ecartInjection!.compteOHADA).toBe("165000");
    expect(ecartInjection!.montantActuel_XOF).toBe(25_000_000);
  });

  it("génère un rapport tie-out complet avec conclusionIntegrite ALTERE si toutes sections modifiées", () => {
    const section1 = sceller("S1", "Résultat", "Expert A", "2024-11-30", [
      { compteOHADA: "130000", libelle: "Résultat net", debit_XOF: 0, credit_XOF: 12_000_000 },
    ]);
    const section2 = sceller("S2", "Dettes fournisseurs", "Expert A", "2024-11-30", [
      { compteOHADA: "401000", libelle: "Fournisseurs", debit_XOF: 0, credit_XOF: 8_500_000 },
    ]);

    // Grand livre actuel — toutes les sections modifiées
    const grandLivre = new Map<string, LigneCloture[]>([
      ["S1", [{ compteOHADA: "130000", libelle: "Résultat net", debit_XOF: 0, credit_XOF: 15_000_000 }]],
      ["S2", [{ compteOHADA: "401000", libelle: "Fournisseurs", debit_XOF: 0, credit_XOF: 7_000_000 }]],
    ]);

    const rapport = genererRapportTieOut("SOCIÉTÉ TEST SA", 2024, [section1, section2], grandLivre);
    expect(rapport.conclusionIntegrite).toBe("ALTERE");
    expect(rapport.sectionsModifiees).toBe(2);
    expect(rapport.sectionsConformes).toBe(0);
    expect(rapport.ecarts.length).toBeGreaterThanOrEqual(2);
    expect(rapport.narratifTieOut).toContain("ALERTE TIE-OUT");
  });
});
