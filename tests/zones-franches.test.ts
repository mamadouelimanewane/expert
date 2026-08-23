import { describe, expect, it } from "vitest";
import {
    simulerZoneFranche,
    TEC_PAR_DEFAUT,
    ZONES_FRANCHES,
    type ZoneFranche,
} from "@/lib/ohada/zones-franches";

const zone = (id: string): ZoneFranche => ZONES_FRANCHES.find((z) => z.id === id)!;

describe("référentiel des zones franches", () => {
    it("attribue un identifiant unique à chaque zone", () => {
        const ids = ZONES_FRANCHES.map((z) => z.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    });

    it("cite le texte instituant chaque régime", () => {
        const sansSource = ZONES_FRANCHES.filter((z) => !z.source?.trim());
        expect(sansSource.map((z) => z.id)).toEqual([]);
    });

    it("n'annonce que des taux plausibles", () => {
        for (const z of ZONES_FRANCHES) {
            expect(z.tauxIS, z.id).toBeGreaterThanOrEqual(0);
            expect(z.tauxIS, z.id).toBeLessThanOrEqual(35);
            expect(z.dureeAnnees, z.id).toBeGreaterThan(0);
        }
    });
});

describe("économie d'impôt sur les sociétés", () => {
    // Regression : le taux de droit commun etait fige a 30 % pour tous les pays.
    it("retient le taux de droit commun propre au pays", () => {
        const sn = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });
        const ci = simulerZoneFranche(zone("abidjan"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });
        const cm = simulerZoneFranche(zone("douala"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });

        expect(sn.tauxISDroitCommun).toBe(30);
        expect(ci.tauxISDroitCommun).toBe(25);
        expect(cm.tauxISDroitCommun).toBeCloseTo(33, 5);
    });

    it("calcule l'écart entre droit commun et régime de zone", () => {
        // Résultat imposable = 100 M × 10 % = 10 M ; 30 % → 15 % = 1,5 M d'économie.
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });

        expect(r.resultatImposable).toBe(10_000_000);
        expect(r.isDroitCommun).toBe(3_000_000);
        expect(r.isZone).toBe(1_500_000);
        expect(r.economieIS).toBe(1_500_000);
    });

    // Regression : le taux de marge etait fige a 30 % sans etre affiche.
    it("fait varier l'économie avec le taux de marge saisi", () => {
        const faible = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 5,
        });
        const forte = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 20,
        });

        expect(forte.economieIS).toBe(faible.economieIS * 4);
    });

    it("ne dégage aucune économie sur un résultat nul", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 0,
        });

        expect(r.economieIS).toBe(0);
        expect(r.avertissements.join(" ")).toContain("Résultat imposable nul");
    });

    it("ne renvoie jamais une économie négative", () => {
        for (const z of ZONES_FRANCHES) {
            const r = simulerZoneFranche(z, { chiffreAffaires: 50_000_000, tauxMargeNette: 12 });
            expect(r.economieIS, z.id).toBeGreaterThanOrEqual(0);
        }
    });
});

describe("traitement de la TVA", () => {
    // Regression majeure : l'exoneration de TVA etait comptee comme une economie
    // de 18 % du chiffre d'affaires, alors que la TVA est collectee puis
    // reversee et ne greve pas le resultat.
    it("n'intègre pas l'exonération de TVA dans l'économie chiffrée", () => {
        const ca = 500_000_000;
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: ca,
            tauxMargeNette: 10,
        });

        // L'ancien calcul ajoutait 18 % du CA, soit 90 M.
        expect(r.economieAnnuelle).toBe(r.economieIS + r.economieDouane);
        expect(r.economieAnnuelle).toBeLessThan(ca * 0.18);
    });

    it("explique pourquoi la TVA est exclue", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });
        expect(r.hypotheses.join(" ")).toContain("collectée");
    });
});

describe("économie de droits de douane", () => {
    it("applique l'écart entre le tarif extérieur et le taux de zone", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
            valeurImportations: 50_000_000,
        });

        expect(r.economieDouane).toBe((50_000_000 * TEC_PAR_DEFAUT) / 100);
    });

    it("accepte un tarif hors zone personnalisé", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
            valeurImportations: 10_000_000,
            tauxDouaneHorsZone: 10,
        });

        expect(r.economieDouane).toBe(1_000_000);
    });

    it("signale l'absence d'assiette d'importation", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 10,
        });

        expect(r.economieDouane).toBe(0);
        expect(r.hypotheses.join(" ")).toContain("importations");
    });
});

describe("restitution de la simulation", () => {
    it("étale l'économie sur la durée de l'agrément", () => {
        const z = zone("dakar");
        const r = simulerZoneFranche(z, { chiffreAffaires: 100_000_000, tauxMargeNette: 10 });
        expect(r.economieTotale).toBe(r.economieAnnuelle * z.dureeAnnees);
    });

    it("rappelle systématiquement que l'agrément conditionne l'avantage", () => {
        for (const z of ZONES_FRANCHES) {
            const r = simulerZoneFranche(z, { chiffreAffaires: 10_000_000, tauxMargeNette: 10 });
            expect(r.avertissements.join(" "), z.id).toContain("agrément");
        }
    });

    it("expose le taux de marge retenu dans les hypothèses", () => {
        const r = simulerZoneFranche(zone("dakar"), {
            chiffreAffaires: 100_000_000,
            tauxMargeNette: 12,
        });
        expect(r.hypotheses.join(" ")).toContain("12 %");
    });

    it("tolère un chiffre d'affaires nul", () => {
        const r = simulerZoneFranche(zone("dakar"), { chiffreAffaires: 0, tauxMargeNette: 10 });
        expect(r.economieAnnuelle).toBe(0);
        expect(Number.isFinite(r.economieTotale)).toBe(true);
    });
});
