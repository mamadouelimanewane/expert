import { describe, it, expect } from "vitest";
import {
  calculerScoringESGBRVM,
  evaluerPilierEnvironnement,
  evaluerPilierSocial,
  evaluerPilierGouvernance,
  type InputScoringESGBRVM,
} from "../src/lib/ohada/scoring-esg-brvm";

const INPUT_EXCELLENT: InputScoringESGBRVM = {
  societeRaisonSociale: "SOCIÉTÉ AGRO-INDUSTRIELLE COTÉE BRVM SA",
  secteur: "Agro-Industrie",
  exercice: 2024,
  environnement: {
    emissionsGES_tCO2e: 3200,
    partEnergieRenouvelable_pct: 45,
    consommationEau_m3: 35000,
    tauxRecyclageDechets_pct: 68,
    certificationsVertes: ["ISO 14001", "ISO 50001"],
  },
  social: {
    effectifTotal: 450,
    tauxFeminisation_pct: 40,
    tauxFeminisationCadres_pct: 38,
    tauxAccidentTravail_pct: 0,
    heuresFormationParSalarie: 28,
    tauxEmploiNationalLocal_pct: 92,
  },
  gouvernance: {
    nombreAdministrateurs: 9,
    partAdministrateursIndependants_pct: 44,
    presenceComiteAudit: true,
    presenceComiteRSE: true,
    politiqueAntiCorruptionLCBFT: true,
    publicationTransparenteRemuneration: true,
    separationPresidentEtDG: true,
  },
};

describe("Moteur Scoring ESG BRVM & Green Bonds BOAD", () => {
  it("calcule une notation AAA ou AA pour une entreprise leader en RSE", () => {
    const res = calculerScoringESGBRVM(INPUT_EXCELLENT);
    expect(res.scoreGlobal_100).toBeGreaterThanOrEqual(80);
    expect(["AAA", "AA"]).toContain(res.notationBRVM);
    expect(res.eligibiliteGreenBondBOAD).toBe(true);
    expect(res.syntheseInvestisseurs).toContain("ÉLIGIBLE");
  });

  it("évalue le pilier Environnement et attribue l'appréciation EXCELLENT pour de hauts standards", () => {
    const pilierE = evaluerPilierEnvironnement(INPUT_EXCELLENT.environnement);
    expect(pilierE.score).toBeGreaterThanOrEqual(28);
    expect(pilierE.pourcentage).toBeGreaterThanOrEqual(80);
    expect(pilierE.appreciation).toBe("EXCELLENT");
  });

  it("détecte les faiblesses de gouvernance et formule des recommandations appropriées", () => {
    const inputFaibleGouv: InputScoringESGBRVM = {
      ...INPUT_EXCELLENT,
      gouvernance: {
        nombreAdministrateurs: 5,
        partAdministrateursIndependants_pct: 10,
        presenceComiteAudit: false,
        presenceComiteRSE: false,
        politiqueAntiCorruptionLCBFT: false,
        publicationTransparenteRemuneration: false,
        separationPresidentEtDG: false,
      },
    };
    const res = calculerScoringESGBRVM(inputFaibleGouv);
    expect(res.pilierGouvernance.score).toBeLessThan(15);
    expect(res.recommandationsESG.some((r) => r.includes("Comité d'Audit"))).toBe(true);
    expect(res.recommandationsESG.some((r) => r.includes("LCB-FT"))).toBe(true);
  });

  it("refuse l'éligibilité Green Bond si le score environnemental est insuffisant", () => {
    const inputFaibleEnv: InputScoringESGBRVM = {
      ...INPUT_EXCELLENT,
      environnement: {
        emissionsGES_tCO2e: 45000,
        partEnergieRenouvelable_pct: 5,
        consommationEau_m3: 200000,
        tauxRecyclageDechets_pct: 10,
        certificationsVertes: [],
      },
    };
    const res = calculerScoringESGBRVM(inputFaibleEnv);
    expect(res.eligibiliteGreenBondBOAD).toBe(false);
  });
});
