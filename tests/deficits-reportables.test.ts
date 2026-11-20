import { describe, it, expect } from "vitest";
import {
    construireBordereauDeficits,
    calculerImputationOptimale,
    projeterDeficits,
    genererRapportDeficits,
} from "@/lib/ohada/deficits-reportables";

describe("Suivi pluriannuel des déficits reportables IS", () => {
    it("construit un bordereau avec déficits ordinaires et ARD", () => {
        const bordereau = construireBordereauDeficits("SN", 2024, [
            { exercice: 2022, montant: 10_000_000, type: "ORDINAIRE" },
            { exercice: 2023, montant: 15_000_000, type: "ORDINAIRE" },
            { exercice: 2021, montant: 5_000_000, type: "AMORTISSEMENT_DIFFERE" },
        ]);

        expect(bordereau.totalDeficitDisponible).toBe(30_000_000);
        expect(bordereau.totalDeficitExpire).toBe(0);
        expect(bordereau.deficits.length).toBe(3);
    });

    it("détecte correctement l'expiration d'un déficit ordinaire après 3 ans", () => {
        // En 2025, un déficit 2021 ordinaire expire (2021 + 3 = 2024)
        const bordereau = construireBordereauDeficits("SN", 2025, [
            { exercice: 2021, montant: 8_000_000, type: "ORDINAIRE" },
            { exercice: 2023, montant: 12_000_000, type: "ORDINAIRE" },
        ]);

        const def2021 = bordereau.deficits.find((d) => d.exercice === 2021);
        expect(def2021?.expire).toBe(true);
        expect(def2021?.soldeDisponible).toBe(0);
        expect(bordereau.totalDeficitExpire).toBe(8_000_000);
        expect(bordereau.totalDeficitDisponible).toBe(12_000_000);
        expect(bordereau.alertesExpiration.some((a) => a.includes("Forclusion"))).toBe(true);
    });

    it("impute selon la règle FIFO les déficits les plus anciens en premier", () => {
        const bordereau = construireBordereauDeficits("CI", 2024, [
            { exercice: 2022, montant: 5_000_000, type: "ORDINAIRE" },
            { exercice: 2023, montant: 10_000_000, type: "ORDINAIRE" },
        ]);

        // Résultat bénéficiaire de 7 000 000 FCFA
        const imputation = calculerImputationOptimale(bordereau, 7_000_000);

        expect(imputation.totalDeficitImpute).toBe(7_000_000);
        expect(imputation.baseImposableApresImputation).toBe(0);
        // Le déficit 2022 doit être totalement absorbé (5M), et 2M pris sur 2023
        expect(imputation.lignesImputation[0].deficitExercice).toBe(2022);
        expect(imputation.lignesImputation[0].montantImpute).toBe(5_000_000);
        expect(imputation.lignesImputation[1].deficitExercice).toBe(2023);
        expect(imputation.lignesImputation[1].montantImpute).toBe(2_000_000);
        expect(imputation.soldeDeficitGlobalRestant).toBe(8_000_000);
    });

    it("projette l'absorption sur plusieurs exercices futurs et génère le rapport", () => {
        const bordereau = construireBordereauDeficits("SN", 2024, [
            { exercice: 2023, montant: 10_000_000, type: "ORDINAIRE" },
        ]);

        const projections = projeterDeficits(bordereau, [4_000_000, 8_000_000], 2024);
        expect(projections.length).toBe(2);
        // 2024 : 4M de bénéfice, impute 4M -> reste 6M
        expect(projections[0].deficitImpute).toBe(4_000_000);
        expect(projections[0].soldeDeficitsFinExercice).toBe(6_000_000);
        // 2025 : 8M de bénéfice, impute les 6M restants -> base imposable = 2M
        expect(projections[1].deficitImpute).toBe(6_000_000);
        expect(projections[1].baseImposable).toBe(2_000_000);
        expect(projections[1].soldeDeficitsFinExercice).toBe(0);

        const rapport = genererRapportDeficits(bordereau);
        expect(rapport).toContain("DÉFICITS REPORTABLES");
        expect(rapport).toContain("Exercice 2023");
    });
});
