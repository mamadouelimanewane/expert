import { describe, it, expect } from "vitest";
import {
  migrerBalanceSYSCOA,
  CompteSYSCOA,
} from "../src/lib/ohada/syscoa-migration-engine";

describe("SYSCOA → SYSCOHADA Migration Engine", () => {
  // -------------------------------------------------------------------------
  // Test 1 : Reclassement automatique d'un compte SYSCOA connu
  // -------------------------------------------------------------------------
  it("reclasse automatiquement un compte SYSCOA connu vers le bon compte SYSCOHADA", () => {
    const comptes: CompteSYSCOA[] = [
      { numero: "421", libelle: "Personnel avances", solde_XOF: 1_500_000 },
    ];

    const rapport = migrerBalanceSYSCOA(comptes);

    expect(rapport.totalComptes).toBe(1);
    expect(rapport.comptesReclassesAuto).toBe(1);
    expect(rapport.comptesManuelRequis).toBe(0);
    expect(rapport.comptesSupprimesOuFusionnes).toBe(0);

    const r = rapport.reclassements[0];
    expect(r.compteOHADA).toBe("421");
    expect(r.statutReclassement).toBe("AUTOMATIQUE");
    expect(r.libelleOHADA).toBe("Personnel, avances et acomptes");
  });

  // -------------------------------------------------------------------------
  // Test 2 : Compte inconnu → reclassement manuel requis
  // -------------------------------------------------------------------------
  it("identifie un compte nécessitant un reclassement manuel (compte inconnu)", () => {
    const comptes: CompteSYSCOA[] = [
      { numero: "999", libelle: "Compte inconnu SYSCOA", solde_XOF: 500_000 },
    ];

    const rapport = migrerBalanceSYSCOA(comptes);

    expect(rapport.totalComptes).toBe(1);
    expect(rapport.comptesReclassesAuto).toBe(0);
    expect(rapport.comptesManuelRequis).toBe(1);

    const r = rapport.reclassements[0];
    expect(r.statutReclassement).toBe("MANUEL_REQUIS");
    expect(rapport.alertesMigration.length).toBeGreaterThan(0);
    expect(rapport.alertesMigration.some((a) => a.includes("999"))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 3 : Balance SYSCOHADA cohérente (mêmes comptes reclassés auto)
  // -------------------------------------------------------------------------
  it("génère une balance SYSCOHADA cohérente avec le même nombre de comptes reclassés auto", () => {
    const comptes: CompteSYSCOA[] = [
      { numero: "101", libelle: "Capital social", solde_XOF: 10_000_000 },
      { numero: "411", libelle: "Clients", solde_XOF: 3_200_000 },
      { numero: "521", libelle: "Banque", solde_XOF: 4_500_000 },
      { numero: "701", libelle: "Ventes marchandises", solde_XOF: 8_000_000 },
      { numero: "601", libelle: "Achats marchandises", solde_XOF: 5_000_000 },
    ];

    const rapport = migrerBalanceSYSCOA(comptes);

    // Tous sont des comptes connus → 5 reclassements automatiques
    expect(rapport.comptesReclassesAuto).toBe(5);
    expect(rapport.comptesManuelRequis).toBe(0);

    // La balance OHADA doit avoir exactement 5 lignes (numéros distincts)
    expect(rapport.balanceOHADA.length).toBe(5);

    // Les soldes doivent être conservés
    const totalSourceXOF = comptes.reduce((s, c) => s + c.solde_XOF, 0);
    const totalOHADAXOF = rapport.balanceOHADA.reduce((s, c) => s + c.solde_XOF, 0);
    expect(totalOHADAXOF).toBe(totalSourceXOF);
  });

  // -------------------------------------------------------------------------
  // Test 4 : Détection des comptes supprimés ou fusionnés dans SYSCOHADA
  // -------------------------------------------------------------------------
  it("détecte les comptes supprimés ou fusionnés dans SYSCOHADA", () => {
    const comptes: CompteSYSCOA[] = [
      { numero: "481", libelle: "Charges à répartir", solde_XOF: 250_000 },
    ];

    const rapport = migrerBalanceSYSCOA(comptes);

    expect(rapport.totalComptes).toBe(1);
    expect(rapport.comptesSupprimesOuFusionnes).toBe(1);
    expect(rapport.comptesReclassesAuto).toBe(0);

    const r = rapport.reclassements[0];
    expect(r.statutReclassement).toBe("COMPTE_SUPPRIME");
    expect(r.compteOHADA).toBe("476"); // reclassé vers CCA en SYSCOHADA

    // Une alerte doit être générée
    expect(rapport.alertesMigration.some((a) => a.includes("supprimé") || a.includes("fusionné"))).toBe(true);
  });
});
