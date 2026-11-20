import { describe, it, expect } from "vitest";
import {
  calculerValeurUnitaire,
  calculerPariteEchange,
  calculerResultatFusion,
  type DossierFusion,
} from "../src/lib/ohada/fusions-restructurations";

const dossierStandard: DossierFusion = {
  type: "FUSION_ABSORPTION",
  pays: "SN",
  absorbante: {
    raisonSociale: "GROUPE ABSORBANT SA",
    capitalSocial_XOF: 500_000_000,
    nombreActions: 50_000,
    valeurNominale_XOF: 10_000,
    actifNet_XOF: 800_000_000,
    valeurEconomique_XOF: 2_500_000_000, // 50 000 XOF / action
  },
  absorbee: {
    raisonSociale: "CIBLE ABSORBÉE SA",
    capitalSocial_XOF: 100_000_000,
    nombreActions: 10_000,
    valeurNominale_XOF: 10_000,
    actifNet_XOF: 200_000_000,
    valeurEconomique_XOF: 250_000_000, // 25 000 XOF / action
  },
};

describe("Fusions, Scissions & Restructurations AUSCGIE Art. 189-199", () => {
  it("calcule la valeur unitaire et la parité d'échange exacte", () => {
    const valA = calculerValeurUnitaire(dossierStandard.absorbante);
    const valB = calculerValeurUnitaire(dossierStandard.absorbee);
    expect(valA).toBe(50_000);
    expect(valB).toBe(25_000);

    const parite = calculerPariteEchange(dossierStandard);
    // 25 000 / 50 000 = 0.5 action de A pour 1 action de B
    expect(parite).toBe(0.5);
  });

  it("calcule les actions à émettre, l'augmentation de capital et la prime de fusion", () => {
    const res = calculerResultatFusion(dossierStandard);
    // 10 000 actions B * 0.5 = 5 000 actions A à émettre
    expect(res.actionsAEmettre).toBe(5_000);
    // 5 000 * 10 000 VN = 50 000 000 XOF
    expect(res.augmentationCapital_XOF).toBe(50_000_000);
    // Apport reçu = 250 000 000 - 50 000 000 = 200 000 000 XOF
    expect(res.primeDeFusion_XOF).toBe(200_000_000);
    expect(res.rapportCAA.avisCAA).toBe("FAVORABLE");
  });

  it("détecte le mali technique et le vrai mali lors d'une détention préalable", () => {
    const dossierAvecTitres: DossierFusion = {
      ...dossierStandard,
      absorbee: {
        ...dossierStandard.absorbee,
        // Titres achetés 280M alors qu'actif net = 200M et valeur éco = 250M
        coutTitresChezAbsorbante_XOF: 280_000_000,
      },
    };
    const res = calculerResultatFusion(dossierAvecTitres);
    // Écart total = 280M - 200M = 80M
    // PV latente = 250M - 200M = 50M -> mali technique = 50M
    // Vrai mali = 80M - 50M = 30M
    expect(res.maliTechnique_XOF).toBe(50_000_000);
    expect(res.vraiMali_XOF).toBe(30_000_000);
    expect(res.alertes.some((a) => a.includes("Vrai mali"))).toBe(true);
  });

  it("génère une alerte si décote anormale par rapport à l'actif net", () => {
    const dossierSousEvalue: DossierFusion = {
      ...dossierStandard,
      absorbee: {
        ...dossierStandard.absorbee,
        actifNet_XOF: 300_000_000,
        valeurEconomique_XOF: 150_000_000, // inférieur à l'actif net
      },
    };
    const res = calculerResultatFusion(dossierSousEvalue);
    expect(res.alertes.some((a) => a.includes("sous-évaluation"))).toBe(true);
    expect(res.rapportCAA.avisCAA).toBe("FAVORABLE_AVEC_RESERVES");
  });
});
