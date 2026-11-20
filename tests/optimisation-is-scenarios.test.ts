import { describe, it, expect } from "vitest";
import { simulerScenariosIS } from "@/lib/ohada/optimisation-is-scenarios";

describe("Optimisation IS par scénarios What-If (OHADA)", () => {
    it("calcule les 3 scénarios et respecte le plancher de l'Impôt Minimum Forfaitaire (IMF)", () => {
        // Entreprise SN avec 100M CA et 10M résultat comptable
        const comparatif = simulerScenariosIS("SN", 2024, 100_000_000, 10_000_000, {
            surcroitAmortissementEligible: 2_000_000,
            deficitsAnterieursDisponibles: 3_000_000,
        });

        expect(comparatif.pays).toBe("SN");
        expect(comparatif.scenarios.base).toBeDefined();
        expect(comparatif.scenarios.prudent).toBeDefined();
        expect(comparatif.scenarios.optimise).toBeDefined();

        // Plancher IMF pour SN : 0.5% du CA = 500 000 FCFA
        expect(comparatif.scenarios.base.impotMinimumForfaitaire).toBe(500_000);
        expect(comparatif.scenarios.optimise.isLiquide).toBeGreaterThanOrEqual(500_000);
    });

    it("vérifie que le scénario optimisé génère une économie d'IS supérieure ou égale au scénario prudent", () => {
        const comparatif = simulerScenariosIS("CI", 2024, 200_000_000, 30_000_000, {
            surcroitAmortissementEligible: 5_000_000,
            provisionsDeductiblesJustifiees: 3_000_000,
            deficitsAnterieursDisponibles: 10_000_000,
            plusValuesReinvesties: 2_000_000,
        });

        const { base, prudent, optimise } = comparatif.scenarios;

        expect(optimise.economieImpotVsBase).toBeGreaterThanOrEqual(prudent.economieImpotVsBase);
        expect(base.isLiquide).toBeGreaterThan(optimise.isLiquide);
        expect(comparatif.economieMaximalePossible).toBeGreaterThan(0);
    });

    it("attribue des scores de risque fiscal proportionnels aux leviers mobilisés", () => {
        const comparatif = simulerScenariosIS("SN", 2024, 150_000_000, 20_000_000, {
            surcroitAmortissementEligible: 4_000_000,
            deficitsAnterieursDisponibles: 8_000_000,
        });

        const { base, prudent, optimise } = comparatif.scenarios;

        expect(base.scoreRisqueFiscal).toBeLessThan(prudent.scoreRisqueFiscal);
        expect(prudent.scoreRisqueFiscal).toBeLessThan(optimise.scoreRisqueFiscal);
        expect(optimise.scoreRisqueFiscal).toBeLessThanOrEqual(50); // Risque reste modéré et maîtrisé
    });

    it("applique le régime incitatif PME lorsque le paramètre est fourni", () => {
        const comparatif = simulerScenariosIS("SN", 2024, 80_000_000, 15_000_000, {
            eligibleRegimePME: true,
            tauxPME: 20, // Taux préférentiel 20% au lieu du taux standard SN (30%)
        });

        expect(comparatif.scenarios.optimise.tauxISApplique).toBe(20);
        expect(comparatif.scenarios.base.tauxISApplique).toBe(30);
        expect(comparatif.syntheseConseil).toContain("2024");
    });
});
