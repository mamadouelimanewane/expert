import { describe, expect, it } from "vitest";
import {
    calculateANR,
    calculateDCF,
    calculateEBITDAMultiple,
    ValorisationError,
} from "@/lib/valuation-engine";
import { simulateCorporateTax, REGLES_FISCALES, type TaxSimulation } from "@/lib/tax-simulator";
import { detectCriticalPoints, projeterTresorerie, type EncaissementAttendu } from "@/lib/forecast-engine";

// ═══════════════════════════════════════════════════════════════════════════
// Valorisation — DCF
// ═══════════════════════════════════════════════════════════════════════════

describe("valorisation par actualisation des flux", () => {
    it("actualise correctement un flux unique", () => {
        // CA 1 000 000, marge 15 % → flux initial 150 000, croissance 0 %,
        // actualisation 10 % sur 1 an → 150 000 / 1,1 ≈ 136 364.
        const r = calculateDCF(1_000_000, 0, 10, 1);
        expect(r.values).toHaveLength(1);
        expect(r.values[0]).toBeCloseTo(150_000 / 1.1, 0);
    });

    it("produit autant de flux que d'années d'horizon", () => {
        expect(calculateDCF(5_000_000, 5, 12, 7).values).toHaveLength(7);
    });

    it("décroît quand le taux d'actualisation augmente", () => {
        const bas = calculateDCF(10_000_000, 5, 8, 5).enterpriseValue;
        const haut = calculateDCF(10_000_000, 5, 15, 5).enterpriseValue;
        expect(haut).toBeLessThan(bas);
    });

    it("croît avec la marge de flux de trésorerie", () => {
        const faible = calculateDCF(10_000_000, 5, 12, 5, { margeFluxTresorerie: 5 });
        const forte = calculateDCF(10_000_000, 5, 12, 5, { margeFluxTresorerie: 25 });
        expect(forte.enterpriseValue).toBeGreaterThan(faible.enterpriseValue);
    });

    // Régression : le flux initial était figé à 15 % du chiffre d'affaires
    // ("for demo"), sans possibilité de paramétrage par la mission.
    it("laisse paramétrer la marge plutôt que de la figer à 15 %", () => {
        const parDefaut = calculateDCF(1_000_000, 0, 10, 1);
        const explicite = calculateDCF(1_000_000, 0, 10, 1, { margeFluxTresorerie: 30 });
        expect(explicite.values[0]).toBeCloseTo(parDefaut.values[0] * 2, 0);
    });

    // Régression critique : quand le taux d'actualisation était inférieur ou
    // égal à la croissance perpétuelle, la valeur terminale de Gordon-Shapiro
    // renvoyait Infinity ou une valeur négative, sans le signaler.
    it("refuse un taux d'actualisation inférieur ou égal à la croissance perpétuelle", () => {
        expect(() => calculateDCF(1_000_000, 5, 2, 5)).toThrow(ValorisationError);
        expect(() => calculateDCF(1_000_000, 5, 1, 5)).toThrow(/Gordon-Shapiro/);
        expect(() => calculateDCF(1_000_000, 5, 3, 5, { croissancePerpetuelle: 3 })).toThrow(
            ValorisationError
        );
    });

    it("ne renvoie jamais une valeur d'entreprise infinie ou NaN", () => {
        for (const k of [3, 5, 8, 12, 20, 40]) {
            const r = calculateDCF(2_500_000, 6, k, 5);
            expect(Number.isFinite(r.enterpriseValue)).toBe(true);
            expect(r.enterpriseValue).toBeGreaterThan(0);
        }
    });

    it("rejette un horizon nul ou non entier", () => {
        expect(() => calculateDCF(1_000_000, 5, 10, 0)).toThrow(/horizon/i);
        expect(() => calculateDCF(1_000_000, 5, 10, 2.5)).toThrow(/horizon/i);
    });

    it("rejette un chiffre d'affaires négatif", () => {
        expect(() => calculateDCF(-1, 5, 10, 3)).toThrow(/chiffre d'affaires/i);
    });

    it("rejette un taux d'actualisation nul", () => {
        expect(() => calculateDCF(1_000_000, 5, 0, 3)).toThrow(/actualisation/i);
    });

    it("vérifie que la valeur d'entreprise est la somme de ses composantes", () => {
        const r = calculateDCF(8_000_000, 4, 11, 6);
        expect(r.valeurActuelleFlux + r.terminalValue).toBeCloseTo(r.enterpriseValue, 5);
        expect(r.values.reduce((s, v) => s + v, 0)).toBeCloseTo(r.valeurActuelleFlux, 5);
    });

    it("alerte quand la valeur terminale pèse trop lourd", () => {
        const r = calculateDCF(1_000_000, 3, 9, 2);
        expect(r.poidsValeurTerminale).toBeGreaterThan(75);
        expect(r.avertissements.join(" ")).toContain("valeur terminale");
    });

    it("alerte quand la croissance dépasse le coût du capital", () => {
        const r = calculateDCF(1_000_000, 20, 10, 5);
        expect(r.avertissements.join(" ")).toContain("coût du capital");
    });
});

describe("autres méthodes de valorisation", () => {
    it("applique le multiple d'EBITDA", () => {
        expect(calculateEBITDAMultiple(4_000_000, 6)).toBe(24_000_000);
    });

    it("refuse un multiple négatif", () => {
        expect(() => calculateEBITDAMultiple(1_000_000, -2)).toThrow(ValorisationError);
    });

    it("calcule l'actif net réévalué", () => {
        expect(calculateANR(10_000_000, 4_000_000, 1_500_000)).toBe(7_500_000);
    });

    it("accepte un ANR négatif (situation nette négative)", () => {
        expect(calculateANR(1_000_000, 3_000_000, 0)).toBe(-2_000_000);
    });

    it("rejette des paramètres non numériques", () => {
        expect(() => calculateANR(NaN, 0, 0)).toThrow(ValorisationError);
        expect(() => calculateEBITDAMultiple(Infinity, 5)).toThrow(ValorisationError);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Simulateur d'imposition des bénéfices
// ═══════════════════════════════════════════════════════════════════════════

const simulation = (o: Partial<TaxSimulation> = {}): TaxSimulation => ({
    baseImposable: 10_000_000,
    pays: "sn",
    regime: "reel",
    secteur: "services",
    chiffreAffaires: 40_000_000,
    ...o,
});

describe("impôt sur les sociétés", () => {
    it("applique le taux de droit commun de chaque pays", () => {
        expect(simulateCorporateTax(simulation({ pays: "sn" })).tauxIS).toBe(0.3);
        expect(simulateCorporateTax(simulation({ pays: "ci" })).tauxIS).toBe(0.25);
        expect(simulateCorporateTax(simulation({ pays: "cm" })).tauxIS).toBe(0.33);
        expect(simulateCorporateTax(simulation({ pays: "bj" })).tauxIS).toBe(0.3);
    });

    it("calcule l'IS sur le résultat fiscal", () => {
        expect(simulateCorporateTax(simulation({ baseImposable: 10_000_000, pays: "sn" })).is).toBe(
            3_000_000
        );
    });

    it("n'impose pas un résultat déficitaire au barème", () => {
        expect(simulateCorporateTax(simulation({ baseImposable: -5_000_000 })).is).toBe(0);
    });
});

describe("impôt minimum forfaitaire", () => {
    // Régression : l'impôt minimum n'existait pas. Une entreprise déficitaire
    // se voyait annoncer zéro impôt alors qu'elle en doit un.
    it("reste dû malgré un déficit", () => {
        const r = simulateCorporateTax(
            simulation({ baseImposable: -8_000_000, chiffreAffaires: 200_000_000, pays: "sn" })
        );
        expect(r.is).toBe(0);
        expect(r.impotMinimum).toBeGreaterThan(0);
        expect(r.isDu).toBe(r.impotMinimum);
        expect(r.minimumApplique).toBe(true);
        expect(r.total).toBeGreaterThan(0);
        expect(r.avertissements.join(" ")).toContain("minimum");
    });

    it("applique le taux sur le chiffre d'affaires", () => {
        const r = simulateCorporateTax(
            simulation({ baseImposable: 0, chiffreAffaires: 200_000_000, pays: "sn" })
        );
        // 0,5 % de 200 M = 1 M, dans les bornes [500 000 ; 5 000 000].
        expect(r.impotMinimum).toBe(1_000_000);
    });

    it("n'applique pas de plancher non publié dans le référentiel du Sénégal", () => {
        const r = simulateCorporateTax(
            simulation({ baseImposable: 0, chiffreAffaires: 1_000_000, pays: "sn" })
        );
        expect(REGLES_FISCALES.sn.minimum.plancher).toBe(0);
        expect(r.impotMinimum).toBe(5_000);
    });

    it("respecte le plafond", () => {
        const r = simulateCorporateTax(
            simulation({ baseImposable: 0, chiffreAffaires: 50_000_000_000, pays: "sn" })
        );
        expect(r.impotMinimum).toBe(REGLES_FISCALES.sn.minimum.plafond);
    });

    it("retient toujours le plus élevé de l'IS et du minimum", () => {
        const beneficiaire = simulateCorporateTax(
            simulation({ baseImposable: 50_000_000, chiffreAffaires: 200_000_000 })
        );
        expect(beneficiaire.isDu).toBe(beneficiaire.is);
        expect(beneficiaire.minimumApplique).toBe(false);
    });
});

describe("paramètres autrefois ignorés", () => {
    // Régression : `regime` et `secteur` étaient acceptés puis jamais lus.
    it("estime le chiffre d'affaires à partir du secteur quand il manque", () => {
        const services = simulateCorporateTax(
            simulation({ chiffreAffaires: undefined, secteur: "services" })
        );
        const commerce = simulateCorporateTax(
            simulation({ chiffreAffaires: undefined, secteur: "commerce" })
        );
        // Le commerce a une marge plus faible, donc un CA implicite plus élevé.
        expect(commerce.impotMinimum).toBeGreaterThan(services.impotMinimum);
        expect(services.hypotheses.join(" ")).toContain("secteur");
    });

    it("signale l'hypothèse retenue faute de chiffre d'affaires", () => {
        const r = simulateCorporateTax(simulation({ chiffreAffaires: undefined }));
        expect(r.hypotheses.join(" ")).toContain("non renseigné");
    });
});

describe("CFCE et TVA", () => {
    // Régression : la CFCE était calculée à 3 % du BÉNÉFICE pour les quatre
    // pays, alors qu'elle est sénégalaise et assise sur la masse salariale.
    it("assoit la CFCE sur la masse salariale, au Sénégal uniquement", () => {
        const sn = simulateCorporateTax(simulation({ pays: "sn", masseSalariale: 30_000_000 }));
        expect(sn.cfce).toBe(900_000);

        for (const pays of ["ci", "cm", "bj"] as const) {
            expect(simulateCorporateTax(simulation({ pays, masseSalariale: 30_000_000 })).cfce).toBe(0);
        }
    });

    it("chiffre la CFCE à zéro sans masse salariale, en le signalant", () => {
        const r = simulateCorporateTax(simulation({ pays: "sn", masseSalariale: undefined }));
        expect(r.cfce).toBe(0);
        expect(r.hypotheses.join(" ")).toContain("Masse salariale");
    });

    // Régression : la TVA était additionnée au coût fiscal alors qu'elle est
    // un flux neutre pour l'entreprise.
    it("exclut la TVA du total des charges fiscales", () => {
        const r = simulateCorporateTax(simulation({ pays: "sn", masseSalariale: 0 }));
        expect(r.total).toBe(r.isDu + r.cfce);
        expect(r.tvaMoyenne).toBeGreaterThan(0);
        expect(r.total).toBeLessThan(r.isDu + r.cfce + r.tvaMoyenne);
    });

    it("applique le taux de TVA propre au Cameroun", () => {
        expect(simulateCorporateTax(simulation({ pays: "cm" })).tauxTVA).toBe(0.1925);
        expect(simulateCorporateTax(simulation({ pays: "sn" })).tauxTVA).toBe(0.18);
    });

    it("applique le taux PME camerounais au CA sous le seuil, CAC inclus", () => {
        const r = simulateCorporateTax(simulation({ pays: "cm", baseImposable: 10_000_000, chiffreAffaires: 2_000_000_000, centreFiscal: "CDI" }));
        expect(r.tauxIS).toBe(0.275);
        expect(r.is).toBe(2_750_000);
        expect(r.avertissements.join(" ")).not.toContain("centre fiscal n’est pas indiqué");
    });

    it("garde le taux camerounais de droit commun au-dessus du seuil PME", () => {
        const r = simulateCorporateTax(simulation({ pays: "cm", chiffreAffaires: 3_000_000_001 }));
        expect(r.tauxIS).toBe(0.33);
    });

    it("ne retient pas le taux PME camerounais à partir d'un chiffre d'affaires estimé", () => {
        const r = simulateCorporateTax(simulation({ pays: "cm", chiffreAffaires: undefined }));
        expect(r.tauxIS).toBe(0.33);
        expect(r.avertissements.join(" ")).toContain("taux réduit conditionnel");
    });

    it("exige un centre fiscal éligible au taux PME camerounais", () => {
        const dge = simulateCorporateTax(simulation({ pays: "cm", chiffreAffaires: 2_000_000_000, centreFiscal: "DGE" }));
        const inconnu = simulateCorporateTax(simulation({ pays: "cm", chiffreAffaires: 2_000_000_000 }));
        expect(dge.tauxIS).toBe(0.33);
        expect(inconnu.tauxIS).toBe(0.33);
        expect(inconnu.avertissements.join(" ")).toContain("centre fiscal n’est pas indiqué");
    });

    it("différencie les assiettes minimales camerounaises selon l'activité et le régime", () => {
        const standard = simulateCorporateTax(simulation({ pays: "cm", baseImposable: 0, chiffreAffaires: 100_000_000, minimumCamerounais: "STANDARD" }));
        const marge = simulateCorporateTax(simulation({ pays: "cm", baseImposable: 0, chiffreAffaires: 100_000_000, minimumCamerounais: "MARGE_ADMINISTREE" }));
        const simplifie = simulateCorporateTax(simulation({ pays: "cm", baseImposable: 0, chiffreAffaires: 100_000_000, regime: "simplifie" }));
        expect(standard.impotMinimum).toBe(2_200_000);
        expect(marge.impotMinimum).toBe(15_400_000);
        expect(simplifie.impotMinimum).toBe(5_500_000);
    });

    it("applique les minima béninois par activité et conserve les sources", () => {
        const standard = simulateCorporateTax(simulation({ pays: "bj", baseImposable: 0, chiffreAffaires: 10_000_000, produitsEncaissables: 10_000_000 }));
        const btp = simulateCorporateTax(simulation({ pays: "bj", baseImposable: 0, chiffreAffaires: 10_000_000, produitsEncaissables: 10_000_000, secteur: "construction" }));
        const station = simulateCorporateTax(simulation({ pays: "bj", baseImposable: 0, chiffreAffaires: 1_000_000, secteur: "station_service" }));
        expect(standard.impotMinimum).toBe(500_000);
        expect(btp.impotMinimum).toBe(500_000);
        expect(station.impotMinimum).toBe(250_000);
        expect(standard.editionReglementaire).toContain("2026");
        expect(standard.sourceReglementaire).toContain("impots.bj");
        expect(standard.couvertureReglementaire).toBe("PARTIELLE");
    });

    it("applique le taux sectoriel ivoirien des télécommunications", () => {
        const r = simulateCorporateTax(simulation({ pays: "ci", secteur: "telecommunications" }));
        expect(r.tauxIS).toBe(0.3);
    });

    it("rejette un pays inconnu", () => {
        expect(() =>
            simulateCorporateTax(simulation({ pays: "zz" as TaxSimulation["pays"] }))
        ).toThrow(/non pris en charge/);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Projection de trésorerie
// ═══════════════════════════════════════════════════════════════════════════

describe("projection de trésorerie", () => {
    const SANS_MESURE = { retardMoyenJours: null };
    const echeances: EncaissementAttendu[] = [
        { echeance: "2026-03-08", montant: 2_000_000, enRetard: false },
        { echeance: "2026-02-01", montant: 3_000_000, enRetard: true },
    ];
    const depart = new Date("2026-03-01T00:00:00.000Z");

    it("produit treize points hebdomadaires", () => {
        expect(projeterTresorerie(5_000_000, [], "realiste", SANS_MESURE, depart)).toHaveLength(13);
    });

    it("part de la trésorerie de départ", () => {
        expect(projeterTresorerie(5_000_000, [], "realiste", SANS_MESURE, depart)[0].cash).toBe(5_000_000);
    });

    it("classe les scénarios dans l'ordre attendu", () => {
        // L'ordre ne vient plus de coefficients arbitraires : le pessimiste
        // écarte les créances déjà échues, donc encaisse strictement moins.
        const fin = (s: "optimiste" | "realiste" | "pessimiste") =>
            projeterTresorerie(5_000_000, echeances, s, { retardMoyenJours: 14 }, depart).at(-1)!.cash;
        expect(fin("optimiste")).toBeGreaterThanOrEqual(fin("realiste"));
        expect(fin("realiste")).toBeGreaterThan(fin("pessimiste"));
    });

    it("identifie le point bas et la date de rupture", () => {
        const points = [
            { week: 0, date: "2026-01-01", cash: 1_000_000 },
            { week: 1, date: "2026-01-08", cash: 200_000 },
            { week: 2, date: "2026-01-15", cash: -300_000 },
            { week: 3, date: "2026-01-22", cash: -800_000 },
        ];
        const r = detectCriticalPoints(points);
        expect(r.minCash).toBe(-800_000);
        expect(r.criticalDate).toBe("2026-01-15");
    });

    it("ne signale aucune rupture quand la trésorerie reste positive", () => {
        const r = detectCriticalPoints(projeterTresorerie(500_000_000, echeances, "optimiste", SANS_MESURE, depart));
        expect(r.criticalDate).toBeNull();
    });

    // Régression : la lecture de `forecast[0].cash` plantait sur une liste vide.
    it("accepte une projection vide sans planter", () => {
        expect(detectCriticalPoints([])).toEqual({ minCash: 0, criticalDate: null });
    });
});
