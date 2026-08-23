import { describe, expect, it } from "vitest";
import {
    analyserRentabilite,
    synthetiserRentabilite,
    type Mission,
} from "@/lib/rentabilite-mission";

const mission = (o: Partial<Mission> = {}): Mission => ({
    id: "m1",
    budgetHonoraires: 4_500_000,
    budgetHeures: 120,
    intervenants: [{ userId: "u1", heures: 105, coutHoraire: 30_000 }],
    ...o,
});

describe("calcul du boni/mali", () => {
    it("calcule un boni quand le coût interne est inférieur au budget", () => {
        const a = analyserRentabilite(mission());
        expect(a.coutInterne).toBe(3_150_000);
        expect(a.boniMali).toBe(1_350_000);
        expect(a.statut).toBe("BONI");
    });

    it("calcule un mali quand le coût interne dépasse le budget", () => {
        const a = analyserRentabilite(
            mission({
                budgetHonoraires: 3_200_000,
                intervenants: [{ userId: "u1", heures: 95, coutHoraire: 40_000 }],
            })
        );
        expect(a.coutInterne).toBe(3_800_000);
        expect(a.boniMali).toBe(-600_000);
        expect(a.statut).toBe("MALI");
    });

    it("classe un écart faible en équilibre", () => {
        const a = analyserRentabilite(
            mission({
                budgetHonoraires: 1_000_000,
                intervenants: [{ userId: "u1", heures: 30, coutHoraire: 33_000 }], // 990 000, écart 1 %
            })
        );
        expect(a.statut).toBe("EQUILIBRE");
    });

    it("classe un écart de 2,5 % en boni, hors tolérance", () => {
        const a = analyserRentabilite(
            mission({
                budgetHonoraires: 1_000_000,
                intervenants: [{ userId: "u1", heures: 30, coutHoraire: 32_500 }], // 975 000, écart 2,5 %
            })
        );
        expect(a.statut).toBe("BONI");
    });

    it("cumule le coût de plusieurs intervenants", () => {
        const a = analyserRentabilite(
            mission({
                budgetHonoraires: 5_000_000,
                intervenants: [
                    { userId: "u1", heures: 50, coutHoraire: 40_000 },
                    { userId: "u2", heures: 30, coutHoraire: 25_000 },
                ],
            })
        );
        expect(a.coutInterne).toBe(2_750_000);
        expect(a.heuresPassees).toBe(80);
    });
});

describe("coût interne indéterminé", () => {
    // Régression : un intervenant sans coût horaire paramétré ne doit jamais
    // produire un coût interne nul (qui afficherait un boni maximal fictif).
    it("ne calcule pas de boni/mali si un intervenant n'a pas de coût horaire", () => {
        const a = analyserRentabilite(
            mission({ intervenants: [{ userId: "u1", heures: 105, coutHoraire: null }] })
        );
        expect(a.coutInterne).toBeNull();
        expect(a.boniMali).toBeNull();
        expect(a.statut).toBe("INDETERMINE");
        expect(a.avertissements.join(" ")).toContain("coût horaire interne");
    });

    it("compte le nombre d'intervenants non paramétrés", () => {
        const a = analyserRentabilite(
            mission({
                intervenants: [
                    { userId: "u1", heures: 50, coutHoraire: 30_000 },
                    { userId: "u2", heures: 20, coutHoraire: undefined },
                    { userId: "u3", heures: 10, coutHoraire: null },
                ],
            })
        );
        expect(a.intervenantsNonParametres).toBe(2);
    });

    it("ignore un intervenant sans coût horaire s'il n'a saisi aucune heure", () => {
        const a = analyserRentabilite(
            mission({
                intervenants: [
                    { userId: "u1", heures: 105, coutHoraire: 30_000 },
                    { userId: "u2", heures: 0, coutHoraire: null },
                ],
            })
        );
        expect(a.coutInterne).not.toBeNull();
    });

    it("signale l'absence de temps saisi", () => {
        const a = analyserRentabilite(mission({ intervenants: [] }));
        expect(a.boniMali).toBeNull();
        expect(a.avertissements.join(" ")).toContain("Aucun temps saisi");
    });

    it("signale un budget d'honoraires non renseigné", () => {
        const a = analyserRentabilite(mission({ budgetHonoraires: 0 }));
        expect(a.tauxBoniMali).toBeNull();
        expect(a.avertissements.join(" ")).toContain("Budget d'honoraires");
    });
});

describe("suivi du budget temps", () => {
    it("calcule le taux de consommation des heures", () => {
        const a = analyserRentabilite(mission());
        expect(a.tauxConsommationHeures).toBeCloseTo(87.5, 1);
        expect(a.ecartHeures).toBe(-15);
    });

    it("signale un dépassement du budget temps", () => {
        const a = analyserRentabilite(
            mission({
                budgetHeures: 200,
                intervenants: [{ userId: "u1", heures: 240, coutHoraire: 38_000 }],
            })
        );
        expect(a.ecartHeures).toBe(40);
        expect(a.avertissements.join(" ")).toContain("dépassé");
    });

    it("n'a pas de taux de consommation sans budget temps", () => {
        const a = analyserRentabilite(mission({ budgetHeures: 0 }));
        expect(a.tauxConsommationHeures).toBeNull();
    });
});

describe("synthèse de portefeuille", () => {
    it("distingue missions évaluées et indéterminées", () => {
        const s = synthetiserRentabilite([
            analyserRentabilite(mission()),
            analyserRentabilite(
                mission({ id: "m2", intervenants: [{ userId: "u2", heures: 10, coutHoraire: null }] })
            ),
        ]);
        expect(s.nbMissions).toBe(2);
        expect(s.nbEvaluees).toBe(1);
        expect(s.nbIndeterminees).toBe(1);
    });

    it("cumule le boni/mali des seules missions évaluées", () => {
        const s = synthetiserRentabilite([
            analyserRentabilite(mission()), // boni 1 350 000
            analyserRentabilite(
                mission({
                    id: "m2",
                    budgetHonoraires: 3_200_000,
                    intervenants: [{ userId: "u1", heures: 95, coutHoraire: 40_000 }], // mali -600 000
                })
            ),
        ]);
        expect(s.boniMaliTotal).toBe(750_000);
        expect(s.nbBoni).toBe(1);
        expect(s.nbMali).toBe(1);
    });

    it("accepte un portefeuille vide", () => {
        const s = synthetiserRentabilite([]);
        expect(s.nbMissions).toBe(0);
        expect(s.boniMaliTotal).toBe(0);
    });
});
