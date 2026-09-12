import { describe, expect, it } from "vitest";
import {
    calculateCoteIvoirePayroll,
    calculerHeuresSupplementairesCI,
    calculerItsBrutMensuel,
    calculerPartsCI,
    calculerRicf,
    CMU_PATRONAL,
    CMU_SALARIAL,
    PLAFOND_CNPS_PF,
    PLAFOND_CNPS_RETRAITE,
    SMIG_CI,
    TRANSPORT_EXONERE_CI,
} from "@/lib/payroll/engines/cote-ivoire";
import { calculatePayroll, LEGISLATION_PAIE, PAYS_SUPPORTES } from "@/lib/payroll/engines";
import type { PayrollParams } from "@/lib/payroll/engines";

const bulletin = (o: Partial<PayrollParams> = {}): PayrollParams => ({
    baseSalary: 400_000,
    absencesDays: 0,
    overtimeHours: 0,
    bonuses: 0,
    transportAllowance: 0,
    maritalStatus: "CELIBATAIRE",
    childrenCount: 0,
    isCadre: false,
    ...o,
});

describe("barème ITS mensuel (réforme 2024)", () => {
    it("exonère les salaires jusqu'à 75 000 F", () => {
        expect(calculerItsBrutMensuel(0)).toBe(0);
        expect(calculerItsBrutMensuel(75_000)).toBe(0);
    });

    it("applique 16 % sur la deuxième tranche", () => {
        // (100 000 − 75 000) × 16 %
        expect(calculerItsBrutMensuel(100_000)).toBeCloseTo(4_000, 0);
    });

    it("reproduit l'exemple publié : 400 000 F → 60 000 F d'ITS brut", () => {
        // 165 000 × 16 % + 160 000 × 21 % = 26 400 + 33 600
        expect(calculerItsBrutMensuel(400_000)).toBeCloseTo(60_000, 0);
    });

    it("atteint la tranche marginale de 32 %", () => {
        const a = calculerItsBrutMensuel(8_000_000);
        const b = calculerItsBrutMensuel(8_100_000);
        expect(b - a).toBeCloseTo(32_000, 0);
    });
});

describe("parts et réduction pour charges de famille (RICF)", () => {
    it("compte 1 part pour un célibataire, 2 pour un marié, 0,5 par enfant, 5 au plus", () => {
        expect(calculerPartsCI("CELIBATAIRE", 0)).toBe(1);
        expect(calculerPartsCI("MARIE", 0)).toBe(2);
        expect(calculerPartsCI("MARIE", 2)).toBe(3);
        expect(calculerPartsCI("MARIE", 9)).toBe(5);
    });

    it("accorde 5 500 F par demi-part au-delà de la première part", () => {
        expect(calculerRicf(100_000, 1)).toBe(0);
        expect(calculerRicf(100_000, 1.5)).toBe(5_500);
        expect(calculerRicf(100_000, 2)).toBe(11_000);
        expect(calculerRicf(100_000, 5)).toBe(44_000);
    });

    it("ne rend jamais l'impôt négatif", () => {
        expect(calculerRicf(3_000, 5)).toBe(3_000);
    });
});

describe("heures supplémentaires (Code du travail ivoirien)", () => {
    it("majore de 15 % les six premières heures hebdomadaires puis de 50 %", () => {
        const taux = 1_000;
        const seuil = (6 * 52) / 12;
        expect(calculerHeuresSupplementairesCI(taux, seuil)).toBeCloseTo(seuil * 1_150, 0);
        expect(calculerHeuresSupplementairesCI(taux, seuil + 10)).toBeCloseTo(seuil * 1_150 + 10 * 1_500, 0);
    });

    it("majore de 75 % la nuit et de 100 % les fériés de nuit", () => {
        expect(calculerHeuresSupplementairesCI(1_000, 0, 2, 1)).toBeCloseTo(2 * 1_750 + 2_000, 0);
    });
});

describe("bulletin complet — Côte d'Ivoire", () => {
    it("reproduit l'exemple publié pour un célibataire à 400 000 F", () => {
        const r = calculateCoteIvoirePayroll(bulletin());
        expect(r.grossSalary).toBe(400_000);
        expect(r.detail.itsAvantReduction).toBe(60_000);
        expect(r.detail.reductionChargesFamille).toBe(0);
        expect(r.taxes).toBe(60_000);
        expect(r.detail.cnpsRetraite).toBe(25_200); // 6,3 %
        expect(r.detail.cmuSalarial).toBe(CMU_SALARIAL);
        // 400 000 − 60 000 − 25 200 − 500 (CMU)
        expect(r.netSalary).toBe(314_300);
    });

    it("applique la RICF d'un salarié marié avec deux enfants (3 parts)", () => {
        const r = calculateCoteIvoirePayroll(bulletin({ maritalStatus: "MARIE", childrenCount: 2 }));
        expect(r.detail.parts).toBe(3);
        expect(r.detail.reductionChargesFamille).toBe(22_000);
        expect(r.taxes).toBe(38_000);
    });

    it("plafonne les assiettes CNPS", () => {
        const r = calculateCoteIvoirePayroll(bulletin({ baseSalary: 5_000_000 }));
        expect(r.detail.cnpsRetraite).toBe(Math.round(PLAFOND_CNPS_RETRAITE * 0.063));
        expect(r.detail.cnpsPrestationsFamiliales).toBe(Math.round(PLAFOND_CNPS_PF * 0.05));
        expect(r.detail.cnpsMaternite).toBe(Math.round(PLAFOND_CNPS_PF * 0.0075));
        expect(r.detail.cnpsAccidentTravail).toBe(Math.round(PLAFOND_CNPS_PF * 0.02));
    });

    it("exonère l'indemnité de transport jusqu'à 30 000 F et réintègre l'excédent", () => {
        const exonere = calculateCoteIvoirePayroll(bulletin({ transportAllowance: TRANSPORT_EXONERE_CI }));
        expect(exonere.taxableIncome).toBe(400_000);
        expect(exonere.grossSalary).toBe(430_000);

        const excedent = calculateCoteIvoirePayroll(bulletin({ transportAllowance: TRANSPORT_EXONERE_CI + 10_000 }));
        expect(excedent.taxableIncome).toBe(410_000);
    });

    it("calcule les charges patronales : CNPS, CMU et taxes FDFP", () => {
        const r = calculateCoteIvoirePayroll(bulletin());
        expect(r.detail.cnpsRetraitePatronal).toBe(30_800); // 7,7 %
        expect(r.detail.taxeApprentissage).toBe(1_600); // 0,4 %
        expect(r.detail.formationProfessionnelle).toBe(4_800); // 1,2 %
        expect(r.detail.cmuPatronal).toBe(CMU_PATRONAL);
        expect(r.employerContributions).toBe(
            30_800 + 3_500 + 525 + 1_400 + CMU_PATRONAL + 1_600 + 4_800
        );
    });

    it("signale un salaire de base sous le SMIG et un taux AT hors fourchette", () => {
        const r = calculateCoteIvoirePayroll(bulletin({ baseSalary: SMIG_CI - 1, accidentRate: 0.1 }));
        expect(r.avertissements.some((a) => a.includes("SMIG"))).toBe(true);
        expect(r.avertissements.some((a) => a.includes("accident"))).toBe(true);
    });

    it("n'émet aucun avertissement sur un bulletin ordinaire", () => {
        expect(calculateCoteIvoirePayroll(bulletin()).avertissements).toEqual([]);
    });

    it("déduit les absences au trentième", () => {
        const r = calculateCoteIvoirePayroll(bulletin({ baseSalary: 300_000, absencesDays: 3 }));
        expect(r.grossSalary).toBe(270_000);
    });
});

describe("routage par pays", () => {
    it("liste la Côte d'Ivoire parmi les pays supportés, avec sa législation", () => {
        expect(PAYS_SUPPORTES).toContain("CI");
        expect(LEGISLATION_PAIE.CI).toMatch(/ITS/);
    });

    it("produit le même résultat que le moteur ivoirien direct", () => {
        const params = bulletin({ baseSalary: 650_000, maritalStatus: "MARIE", childrenCount: 1 });
        expect(calculatePayroll("CIV", params)).toEqual(calculateCoteIvoirePayroll(params));
    });
});
