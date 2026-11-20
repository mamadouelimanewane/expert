import { describe, it, expect } from "vitest";
import {
  evaluerFluxIntragroupe,
  genererDossierPrixTransfert,
  type FluxIntragroupe,
} from "@/lib/ohada/prix-de-transfert";

describe("Prix de Transfert & Management Fees OHADA", () => {
  const caBeneficiaire = 2_000_000_000; // 2 milliards FCFA
  const rexBeneficiaire = 250_000_000;  // 250 millions FCFA

  const fluxConforme: FluxIntragroupe = {
    id: "FLUX-01",
    typeFlux: "MANAGEMENT_FEES",
    entiteEmettrice: "Holding Paris SAS",
    entiteBeneficiaire: "Société Dakar SA",
    paysPartenaire: "FR",
    montantFactureAnnuel: 60_000_000, // 3% du CA (inférieur au plafond de 5% = 100M)
    methodeUtilisee: "COST_PLUS",
    margeAppliqueeTaux: 5, // Médiane standard = 5%
    cleRepartition: "CHIFFRE_AFFAIRES",
    justificatifsDisponibles: true,
    tauxRetenueSourceApplique: 10,
  };

  const fluxSansPreuve: FluxIntragroupe = {
    id: "FLUX-02",
    typeFlux: "ASSISTANCE_TECHNIQUE_IT",
    entiteEmettrice: "Holding Suisse AG",
    entiteBeneficiaire: "Société Dakar SA",
    paysPartenaire: "CH",
    montantFactureAnnuel: 150_000_000,
    methodeUtilisee: "TNMM",
    margeAppliqueeTaux: 12, // Élevé (max 9%)
    cleRepartition: "COUTS_DIRECTS",
    justificatifsDisponibles: false, // Absence de livrables !
    tauxRetenueSourceApplique: 15,
  };

  const fluxPlafondDepasse: FluxIntragroupe = {
    id: "FLUX-03",
    typeFlux: "REDEVANCES_MARQUES_BREVETS",
    entiteEmettrice: "Brand Holdings Lux",
    entiteBeneficiaire: "Société Dakar SA",
    paysPartenaire: "LU",
    montantFactureAnnuel: 120_000_000, // Plafond 4% de 2 Mds = 80M -> dépassement 40M
    methodeUtilisee: "CUP",
    margeAppliqueeTaux: 5,
    cleRepartition: "CHIFFRE_AFFAIRES",
    justificatifsDisponibles: true,
    tauxRetenueSourceApplique: 10,
  };

  it("valide un flux intragroupe conforme aux standards de pleine concurrence", () => {
    const analyse = evaluerFluxIntragroupe(fluxConforme, caBeneficiaire, rexBeneficiaire);
    expect(analyse.conformePleineConcurrence).toBe(true);
    expect(analyse.risqueFiscalNiveau).toBe("FAIBLE");
    expect(analyse.montantPotentiellementReintegrable).toBe(0);
    expect(analyse.estimationRedressementAvecPenalites).toBe(0);
  });

  it("détecte un risque critique de rejet pour défaut de justificatifs matériels", () => {
    const analyse = evaluerFluxIntragroupe(fluxSansPreuve, caBeneficiaire, rexBeneficiaire);
    expect(analyse.risqueFiscalNiveau).toBe("CRITIQUE");
    // Absence de preuves -> rejet intégral
    expect(analyse.montantPotentiellementReintegrable).toBe(150_000_000);
    expect(analyse.estimationRedressementAvecPenalites).toBeGreaterThan(0);
    expect(analyse.pointsDeVigilance.some(p => p.includes("ABSENCE DE PREUVES"))).toBe(true);
  });

  it("calcule la quote-part excédentaire au-delà du plafond de déductibilité fiscale", () => {
    const analyse = evaluerFluxIntragroupe(fluxPlafondDepasse, caBeneficiaire, rexBeneficiaire);
    // Plafond 4% * 2 Mds = 80 M -> excédent = 120M - 80M = 40M
    expect(analyse.plafondDeductibiliteLegal).toBe(80_000_000);
    expect(analyse.montantPotentiellementReintegrable).toBe(40_000_000);
    expect(analyse.pointsDeVigilance.some(p => p.includes("excède le plafond"))).toBe(true);
  });

  it("génère une synthèse globale et le sommaire du Local File", () => {
    const dossier = genererDossierPrixTransfert(
      [fluxConforme, fluxSansPreuve, fluxPlafondDepasse],
      caBeneficiaire,
      rexBeneficiaire
    );

    // Total = 60M + 150M + 120M = 330M
    expect(dossier.totalFluxIntragroupe).toBe(330_000_000);
    expect(dossier.montantTotalExposeRisque).toBeGreaterThan(150_000_000);
    expect(dossier.analysesFlux).toHaveLength(3);
    expect(dossier.sommaireLocalFile).toContain("LOCAL FILE");
    expect(dossier.scoreConformiteDossier).toBeLessThan(80);
  });
});
