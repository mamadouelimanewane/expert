import { describe, expect, it } from "vitest";
import {
  calculerCadrageTVA,
  comparerTVAUEMOA,
  getRegimeTVA,
  REFERENTIEL_TVA_UEMOA,
} from "@/lib/ohada/tva-uemoa-multi-pays";

// ─────────────────────────────────────────────────────────────────────────────
// Tests — TVA UEMOA Multi-Pays
// ─────────────────────────────────────────────────────────────────────────────

describe("TVA UEMOA Multi-Pays — calculerCadrageTVA", () => {
  // ─── Test 1 : Crédit TVA Sénégal (taux 18%) ───────────────────────────────
  it("calcule un crédit TVA correct pour le Sénégal (taux 18%)", () => {
    // CA HT 100M XOF, TVA collectée 10M, TVA déductible 15M → crédit 5M
    const caHT = 100_000_000;
    const tvaCollectee = 10_000_000;
    const tvaDeductible = 15_000_000;

    const result = calculerCadrageTVA("SN", caHT, tvaCollectee, tvaDeductible);

    // Solde = collectée - déductible = 10M - 15M = -5M (crédit)
    expect(result.soldeTVA_XOF).toBe(-5_000_000);
    expect(result.typePosition).toBe("CREDIT_TVA");

    // TVA théorique = 100M * 18% = 18M
    expect(result.tvaTheorique_XOF).toBe(18_000_000);

    // Le régime doit être Sénégal 18%
    expect(result.regimePays.pays).toBe("SN");
    expect(result.regimePays.tauxNormal_pct).toBe(18);

    // Une alerte créditrice doit être émise
    const alerteCredit = result.alerteConformite.some((a) =>
      a.includes("créditrice"),
    );
    expect(alerteCredit).toBe(true);

    // Alerte pour TVA collectée sous-déclarée vs théorique (10M vs 18M → écart > 5%)
    const alerteEcart = result.alerteConformite.some((a) =>
      a.includes("sous-déclarée"),
    );
    expect(alerteEcart).toBe(true);
  });

  // ─── Test 2 : Débit TVA + alerte de conformité ────────────────────────────
  it("identifie un débit TVA et génère une alerte de conformité", () => {
    // CA HT 200M XOF, TVA collectée 50M (taux effectif 25% >> 18% nominal), TVA ded. 5M
    const caHT = 200_000_000;
    const tvaCollectee = 50_000_000; // taux effectif = 25%
    const tvaDeductible = 5_000_000;

    const result = calculerCadrageTVA("SN", caHT, tvaCollectee, tvaDeductible);

    // Solde = 50M - 5M = 45M → débit
    expect(result.soldeTVA_XOF).toBe(45_000_000);
    expect(result.typePosition).toBe("DEBIT_TVA");

    // Taux effectif = 50M / 200M * 100 = 25%
    expect(result.tauxEffectif_pct).toBe(25);

    // Alerte taux effectif > 110% du taux nominal (18% * 1.1 = 19.8%)
    const alerteTaux = result.alerteConformite.some((a) =>
      a.includes("supérieur au taux nominal"),
    );
    expect(alerteTaux).toBe(true);

    // Au moins 1 alerte de conformité doit être présente
    expect(result.alerteConformite.length).toBeGreaterThan(0);
  });

  // ─── Test 3 : Comparaison multi-pays UEMOA ────────────────────────────────
  it("compare la TVA théorique entre au moins 3 pays UEMOA différents", () => {
    const caHT = 500_000_000; // 500M XOF

    const resultats = comparerTVAUEMOA(caHT);

    // Doit couvrir au moins 8 pays
    expect(resultats.length).toBeGreaterThanOrEqual(8);

    // Trouver SN, CI, NE dans les résultats
    const sn = resultats.find((r) => r.pays === "SN");
    const ci = resultats.find((r) => r.pays === "CI");
    const ne = resultats.find((r) => r.pays === "NE");

    expect(sn).toBeDefined();
    expect(ci).toBeDefined();
    expect(ne).toBeDefined();

    // SN taux 18% → 500M * 18% = 90M
    expect(sn!.tvaTheorique_XOF).toBe(90_000_000);
    expect(sn!.tauxNormal_pct).toBe(18);

    // CI taux 18% → 90M
    expect(ci!.tvaTheorique_XOF).toBe(90_000_000);
    expect(ci!.tauxNormal_pct).toBe(18);

    // NE taux 19% → 500M * 19% = 95M (plus élevé)
    expect(ne!.tvaTheorique_XOF).toBe(95_000_000);
    expect(ne!.tauxNormal_pct).toBe(19);

    // NE doit avoir plus de TVA que SN
    expect(ne!.tvaTheorique_XOF).toBeGreaterThan(sn!.tvaTheorique_XOF);

    // Vérifier la matrice d'économies : SN vs NE = 95M - 90M = +5M (SN économise vs NE)
    expect(sn!.economieVsPays["NE"]).toBe(5_000_000);

    // NE vs SN = 90M - 95M = -5M (NE coûte 5M de plus que SN)
    expect(ne!.economieVsPays["SN"]).toBe(-5_000_000);

    // Chaque pays doit avoir les autres pays dans sa matrice
    for (const r of resultats) {
      const autresPays = resultats.filter((x) => x.pays !== r.pays);
      for (const autre of autresPays) {
        expect(r.economieVsPays).toHaveProperty(autre.pays);
      }
    }
  });

  // ─── Test 4 : Seuil d'assujettissement Côte d'Ivoire ─────────────────────
  it("vérifie que le seuil d'assujettissement est correctement retourné pour la Côte d'Ivoire", () => {
    // Le seuil CI est 200M XOF — vérifier via getRegimeTVA
    const regime = getRegimeTVA("CI");

    expect(regime).toBeDefined();
    expect(regime!.pays).toBe("CI");
    expect(regime!.nomPays).toBe("Côte d'Ivoire");
    expect(regime!.seuilAssujettissement_XOF).toBe(200_000_000);

    // Cadrage avec CA < seuil CI → alerte sous-seuil
    const caHT = 150_000_000; // < 200M
    const result = calculerCadrageTVA("CI", caHT, 10_000_000, 5_000_000);

    const alerteSeuil = result.alerteConformite.some((a) =>
      a.includes("seuil d'assujettissement"),
    );
    expect(alerteSeuil).toBe(true);

    // Le régime retourné doit correspondre à la CI
    expect(result.regimePays.seuilAssujettissement_XOF).toBe(200_000_000);
    expect(result.regimePays.tauxNormal_pct).toBe(18);
    expect(result.regimePays.tauxReduit_pct).toBe(9);

    // Cadrage avec CA > seuil CI → pas d'alerte sous-seuil
    const result2 = calculerCadrageTVA("CI", 250_000_000, 45_000_000, 10_000_000);
    const alerteSeuil2 = result2.alerteConformite.some((a) =>
      a.includes("seuil d'assujettissement"),
    );
    expect(alerteSeuil2).toBe(false);

    // Vérifier aussi que le référentiel contient bien CI
    expect(REFERENTIEL_TVA_UEMOA["CI"]).toBeDefined();
    expect(REFERENTIEL_TVA_UEMOA["CI"].seuilAssujettissement_XOF).toBe(200_000_000);
  });
});
