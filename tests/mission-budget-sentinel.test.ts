import { describe, it, expect } from "vitest";
import {
  calculerSizingMission,
  evaluerSentinelleBoniMali,
  MetriquesDossierSizing,
} from "@/lib/ohada/mission-budget-sentinel";

describe("calculerSizingMission", () => {
  it("calcule un dimensionnement d'heures et un budget d'honoraires cohérent pour une tenue comptable", () => {
    const metriques: MetriquesDossierSizing = {
      chiffreAffairesAnnuel: 250_000_000,
      nombreEcrituresAnnuelles: 3_000,
      nombreComptesTiersActifs: 50,
      nombreLignesImmobilisations: 20,
      nombreSalariesMensuel: 10,
      complexiteFiscale: "STANDARD",
      typeMission: "TENUE_COMPTABLE",
    };

    const res = calculerSizingMission(metriques);

    expect(res.heuresTotalesRecommandees).toBeGreaterThan(50);
    expect(res.honorairesRecommandesHT).toBeGreaterThan(0);
    expect(res.honorairesMensuelsHT).toBe(Math.round(res.honorairesRecommandesHT / 12));
    expect(res.repartitionHeures.associe).toBeGreaterThan(0);
    expect(res.repartitionHeures.assistant).toBeGreaterThan(0);
    expect(res.justificationMetriques.length).toBeGreaterThan(3);
  });
});

describe("evaluerSentinelleBoniMali", () => {
  it("détecte un dérapage critique et génère automatiquement un projet d'avenant", () => {
    // 100h prévues, mais déjà 80h consommées à seulement 40% d'avancement !
    // Atterrissage projeté = 80 / 0.4 = 200h (dépassement de 100h)
    const res = evaluerSentinelleBoniMali({
      heuresBudgetees: 100,
      heuresPasseesADate: 80,
      avancementTravauxPourcentage: 40,
      honorairesSignesHT: 2_500_000,
      tauxHoraireMoyenCabinet: 25_000,
    });

    expect(res.heuresAtterrissageProjettées).toBe(200);
    expect(res.ecartHeuresFinal).toBe(100);
    expect(res.statutAlerte).toBe("MALI_CRITIQUE");
    expect(res.projetAvenantLettreMission).toBeDefined();
    expect(res.projetAvenantLettreMission).toContain("PROPOSITION D'AVENANT");
  });

  it("confirme une situation sous contrôle avec boni prévisionnel", () => {
    // 100h prévues, 40h consommées pour 60% d'avancement
    // Atterrissage = 40 / 0.6 = 67h (boni de 33h)
    const res = evaluerSentinelleBoniMali({
      heuresBudgetees: 100,
      heuresPasseesADate: 40,
      avancementTravauxPourcentage: 60,
      honorairesSignesHT: 2_500_000,
      tauxHoraireMoyenCabinet: 25_000,
    });

    expect(res.statutAlerte).toBe("SOUS_CONTROLE");
    expect(res.ecartHeuresFinal).toBeLessThan(0);
  });
});
