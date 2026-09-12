import { describe, expect, it } from "vitest";
import {
    calculateSenegalPayroll,
    calculerHeuresSupplementaires,
    calculerIrBrutAnnuel,
    calculerParts,
    calculerReductionChargeFamille,
    calculerTrimfMensuel,
    TRANSPORT_EXONERE,
    type PayrollParams,
} from "@/lib/payroll/engines/senegal";
import {
    calculatePayroll,
    estPaysSupporte,
    normaliserPays,
    PaysNonSupporteError,
    PAYS_SUPPORTES,
} from "@/lib/payroll/engines";

const bulletin = (o: Partial<PayrollParams> = {}): PayrollParams => ({
    baseSalary: 300_000,
    absencesDays: 0,
    overtimeHours: 0,
    bonuses: 0,
    transportAllowance: 0,
    maritalStatus: "CELIBATAIRE",
    childrenCount: 0,
    isCadre: false,
    ...o,
});

describe("barème progressif de l'impôt sur le revenu (CGI art. 173)", () => {
    it("n'impose pas la tranche exonérée", () => {
        expect(calculerIrBrutAnnuel(0)).toBe(0);
        expect(calculerIrBrutAnnuel(630_000)).toBe(0);
    });

    it("applique 20 % sur la deuxième tranche", () => {
        // (1 000 000 - 630 000) × 20 %
        expect(calculerIrBrutAnnuel(1_000_000)).toBeCloseTo(74_000, 0);
    });

    it("cumule correctement au sommet de chaque tranche", () => {
        // 630k→1,5M à 20 % = 174 000
        expect(calculerIrBrutAnnuel(1_500_000)).toBeCloseTo(174_000, 0);
        // + 1,5M→4M à 30 % = 750 000
        expect(calculerIrBrutAnnuel(4_000_000)).toBeCloseTo(924_000, 0);
        // + 4M→8M à 35 % = 1 400 000
        expect(calculerIrBrutAnnuel(8_000_000)).toBeCloseTo(2_324_000, 0);
        // + 8M→13,5M à 37 % = 2 035 000
        expect(calculerIrBrutAnnuel(13_500_000)).toBeCloseTo(4_359_000, 0);
    });

    // Régression : le barème s'arrêtait à 37 %, la tranche à 40 % manquait.
    it("applique la tranche marginale à 40 % au-delà de 13,5 M", () => {
        const a = calculerIrBrutAnnuel(13_500_000);
        const b = calculerIrBrutAnnuel(14_500_000);
        expect(b - a).toBeCloseTo(400_000, 0);
    });

    it("est monotone croissant", () => {
        let precedent = -1;
        for (let base = 0; base <= 20_000_000; base += 250_000) {
            const impot = calculerIrBrutAnnuel(base);
            expect(impot).toBeGreaterThanOrEqual(precedent);
            precedent = impot;
        }
    });

    it("ne produit jamais un taux effectif supérieur au taux marginal maximal", () => {
        for (const base of [1_000_000, 5_000_000, 20_000_000, 100_000_000]) {
            expect(calculerIrBrutAnnuel(base) / base).toBeLessThanOrEqual(0.4);
        }
    });
});

describe("nombre de parts", () => {
    it("attribue 1 part à un célibataire sans enfant", () => {
        expect(calculerParts("CELIBATAIRE", 0)).toBe(1);
    });

    // Régression : la version précédente donnait 2 parts à une personne mariée,
    // alors que le CGI sénégalais en prévoit 1,5.
    it("attribue 1,5 part à une personne mariée sans enfant", () => {
        expect(calculerParts("MARIE", 0)).toBe(1.5);
    });

    it("ajoute une demi-part par enfant à charge", () => {
        expect(calculerParts("MARIE", 2)).toBe(2.5);
        expect(calculerParts("CELIBATAIRE", 3)).toBe(2.5);
    });

    it("plafonne à 5 parts", () => {
        expect(calculerParts("MARIE", 12)).toBe(5);
    });

    it("ignore un nombre d'enfants négatif", () => {
        expect(calculerParts("CELIBATAIRE", -4)).toBe(1);
    });
});

describe("réduction pour charge de famille (CGI art. 174)", () => {
    it("est nulle pour une part", () => {
        expect(calculerReductionChargeFamille(1_000_000, 1)).toBe(0);
    });

    it("applique le taux de la tranche entre le plancher et le plafond", () => {
        // 2 parts : 15 %, encadré par 200 000 et 650 000.
        expect(calculerReductionChargeFamille(2_000_000, 2)).toBeCloseTo(300_000, 0);
    });

    it("relève la réduction au plancher quand le taux donne moins", () => {
        // 15 % de 100 000 = 15 000 → plancher 200 000, mais borné à l'impôt dû.
        expect(calculerReductionChargeFamille(100_000, 2)).toBe(100_000);
    });

    it("plafonne la réduction", () => {
        // 15 % de 10 000 000 = 1 500 000 → plafond 650 000.
        expect(calculerReductionChargeFamille(10_000_000, 2)).toBe(650_000);
    });

    it("ne rend jamais l'impôt négatif", () => {
        for (const parts of [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) {
            for (const ir of [0, 50_000, 500_000, 5_000_000]) {
                const reduction = calculerReductionChargeFamille(ir, parts);
                expect(reduction).toBeLessThanOrEqual(ir);
                expect(ir - reduction).toBeGreaterThanOrEqual(0);
            }
        }
    });
});

describe("TRIMF (CGI art. 187)", () => {
    // Régression majeure : les montants du barème ANNUEL étaient prélevés
    // chaque mois, soit douze fois le montant dû.
    it("ramène le barème annuel au mois", () => {
        expect(calculerTrimfMensuel(500_000)).toBeCloseTo(900 / 12, 5);
        expect(calculerTrimfMensuel(800_000)).toBeCloseTo(3_600 / 12, 5);
        expect(calculerTrimfMensuel(1_500_000)).toBeCloseTo(4_800 / 12, 5);
        expect(calculerTrimfMensuel(5_000_000)).toBeCloseTo(12_000 / 12, 5);
        expect(calculerTrimfMensuel(9_000_000)).toBeCloseTo(18_000 / 12, 5);
        expect(calculerTrimfMensuel(20_000_000)).toBeCloseTo(36_000 / 12, 5);
    });

    it("reste très inférieur à l'ancien montant mensuel de 12 000 F", () => {
        expect(calculerTrimfMensuel(5_000_000)).toBeLessThan(12_000);
    });

    it("est nul sur une base nulle", () => {
        expect(calculerTrimfMensuel(0)).toBe(0);
    });
});

describe("heures supplémentaires (Code du travail)", () => {
    const taux = 1_000;

    it("majore de 15 % les huit premières heures hebdomadaires", () => {
        expect(calculerHeuresSupplementaires(taux, 10)).toBeCloseTo(10 * 1150, 0);
    });

    // Régression : toutes les heures étaient majorées à 15 %, y compris au-delà
    // du contingent hebdomadaire.
    it("majore de 40 % au-delà du contingent", () => {
        const seuil = (8 * 52) / 12; // ≈ 34,67 h/mois
        const resultat = calculerHeuresSupplementaires(taux, seuil + 10);
        expect(resultat).toBeCloseTo(seuil * 1150 + 10 * 1400, 0);
    });

    it("majore de 60 % la nuit et de 100 % les jours fériés de nuit", () => {
        expect(calculerHeuresSupplementaires(taux, 0, 5, 0)).toBeCloseTo(5 * 1600, 0);
        expect(calculerHeuresSupplementaires(taux, 0, 0, 5)).toBeCloseTo(5 * 2000, 0);
    });

    it("ignore les heures négatives", () => {
        expect(calculerHeuresSupplementaires(taux, -10, -5, -2)).toBe(0);
    });
});

describe("bulletin de paie complet", () => {
    it("calcule un brut cohérent avec les absences et les primes", () => {
        const r = calculateSenegalPayroll(
            bulletin({ baseSalary: 300_000, absencesDays: 3, bonuses: 50_000 })
        );
        // 300 000 - 3 × 10 000 + 50 000
        expect(r.grossSalary).toBe(320_000);
    });

    it("exonère l'indemnité de transport jusqu'au plafond", () => {
        const sans = calculateSenegalPayroll(bulletin({ transportAllowance: 0 }));
        const avec = calculateSenegalPayroll(
            bulletin({ transportAllowance: TRANSPORT_EXONERE })
        );

        // Le transport exonéré augmente le brut mais pas les cotisations.
        expect(avec.grossSalary).toBe(sans.grossSalary + TRANSPORT_EXONERE);
        expect(avec.socialSecurity).toBe(sans.socialSecurity);
        expect(avec.netSalary).toBe(sans.netSalary + TRANSPORT_EXONERE);
    });

    it("réintègre la fraction de transport excédant le plafond", () => {
        const r = calculateSenegalPayroll(
            bulletin({ baseSalary: 200_000, transportAllowance: TRANSPORT_EXONERE + 30_000 })
        );
        // Assiette sociale = 200 000 + 30 000
        expect(r.detail.ipresRegimeGeneral).toBe(Math.round(230_000 * 0.056));
    });

    it("plafonne l'assiette IPRES du régime général", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 2_000_000 }));
        expect(r.detail.ipresRegimeGeneral).toBe(Math.round(360_000 * 0.056));
        expect(r.detail.ipresRegimeGeneralPatronal).toBe(Math.round(360_000 * 0.084));
    });

    it("n'applique le régime complémentaire qu'aux cadres", () => {
        const nonCadre = calculateSenegalPayroll(bulletin({ baseSalary: 800_000, isCadre: false }));
        const cadre = calculateSenegalPayroll(bulletin({ baseSalary: 800_000, isCadre: true }));

        expect(nonCadre.detail.ipresRegimeComplementaire).toBe(0);
        expect(cadre.detail.ipresRegimeComplementaire).toBe(Math.round(800_000 * 0.024));
        expect(cadre.socialSecurity).toBeGreaterThan(nonCadre.socialSecurity);
    });

    it("plafonne l'assiette CSS à 63 000 F", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 1_000_000 }));
        expect(r.detail.cssPrestationsFamiliales).toBe(Math.round(63_000 * 0.07));
        expect(r.detail.cssAccidentTravail).toBe(Math.round(63_000 * 0.01));
    });

    it("prend en compte la classe de risque accident du travail", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 500_000, accidentRate: 0.05 }));
        expect(r.detail.cssAccidentTravail).toBe(Math.round(63_000 * 0.05));
    });

    it("plafonne l'abattement forfaitaire à 75 000 F par mois", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 2_000_000 }));
        expect(r.detail.abattement).toBe(75_000);
    });

    it("applique 30 % d'abattement en dessous du plafond", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 150_000 }));
        const brutFiscal = 150_000 - 150_000 * 0.056;
        expect(r.detail.abattement).toBe(Math.round(brutFiscal * 0.3));
    });

    // Régression : l'IR était calculé par quotient familial à la française.
    it("réduit l'impôt par la réduction pour charge de famille, pas par un quotient", () => {
        const celibataire = calculateSenegalPayroll(bulletin({ baseSalary: 900_000 }));
        const famille = calculateSenegalPayroll(
            bulletin({ baseSalary: 900_000, maritalStatus: "MARIE", childrenCount: 3 })
        );

        expect(famille.detail.parts).toBe(3);
        expect(famille.detail.irAvantReduction).toBe(celibataire.detail.irAvantReduction);
        expect(famille.detail.reductionChargeFamille).toBeGreaterThan(0);
        expect(famille.taxes).toBeLessThan(celibataire.taxes);
    });

    it("garde le net inférieur au brut et positif sur un salaire ordinaire", () => {
        for (const salaire of [80_000, 150_000, 300_000, 750_000, 1_500_000, 5_000_000]) {
            const r = calculateSenegalPayroll(bulletin({ baseSalary: salaire }));
            expect(r.netSalary).toBeGreaterThan(0);
            expect(r.netSalary).toBeLessThan(r.grossSalary);
            expect(r.avertissements).toEqual([]);
        }
    });

    it("vérifie l'identité brut - cotisations - impôts = net", () => {
        const r = calculateSenegalPayroll(
            bulletin({
                baseSalary: 640_000,
                bonuses: 75_000,
                transportAllowance: 40_000,
                overtimeHours: 12,
                maritalStatus: "MARIE",
                childrenCount: 2,
                isCadre: true,
            })
        );
        expect(r.grossSalary - r.socialSecurity - r.taxes).toBeCloseTo(r.netSalary, 0);
    });

    it("n'impose pas un salaire sous le seuil d'entrée du barème", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 60_000 }));
        expect(r.detail.impotRevenu).toBe(0);
        // Seule la TRIMF reste due.
        expect(r.taxes).toBe(r.detail.trimf);
    });

    it("refuse d'émettre un bulletin à zéro sans le signaler", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 100_000, absencesDays: 30 }));
        expect(r.grossSalary).toBe(0);
        expect(r.avertissements.join(" ")).toContain("Brut nul");
    });

    it("signale un net négatif au lieu de le publier en silence", () => {
        // Cotisations et impôt calculés sur une assiette que la prime gonfle,
        // alors que le brut est écrasé par des absences : cas limite à détecter.
        const r = calculateSenegalPayroll(
            bulletin({ baseSalary: 1_200_000, absencesDays: 30, transportAllowance: 0 })
        );
        expect(r.netSalary).toBeLessThanOrEqual(0);
        expect(r.avertissements.length).toBeGreaterThan(0);
    });

    it("borne les absences à 30 jours", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 300_000, absencesDays: 45 }));
        expect(r.grossSalary).toBe(0);
        expect(r.avertissements.join(" ")).toContain("30 jours");
    });

    it("expose le détail nécessaire à l'édition du bulletin", () => {
        const r = calculateSenegalPayroll(bulletin({ baseSalary: 500_000, isCadre: true }));
        const somme =
            r.detail.ipresRegimeGeneralPatronal +
            r.detail.ipresRegimeComplementairePatronal +
            r.detail.cssPrestationsFamiliales +
            r.detail.cssAccidentTravail +
            r.detail.cfce;
        expect(somme).toBeCloseTo(r.employerContributions, 0);
    });
});

describe("routage multi-pays", () => {
    it("reconnaît les alias du Sénégal", () => {
        expect(normaliserPays("SN")).toBe("SN");
        expect(normaliserPays("senegal")).toBe("SN");
        expect(normaliserPays(" Sénégal ")).toBe("SN");
        expect(estPaysSupporte("SN")).toBe(true);
    });

    // Régression critique : la version précédente appliquait silencieusement le
    // barème sénégalais au Cameroun, au Bénin, et à tout pays inconnu.
    it("refuse de calculer un pays non implémenté au lieu d'appliquer le barème sénégalais", () => {
        for (const pays of ["CM", "BJ", "TG", "ML", "XX", ""]) {
            expect(() => calculatePayroll(pays, bulletin())).toThrow(PaysNonSupporteError);
            expect(estPaysSupporte(pays)).toBe(false);
        }
    });

    it("accepte la Côte d'Ivoire depuis l'implémentation du barème ITS 2024", () => {
        expect(estPaysSupporte("CI")).toBe(true);
        expect(normaliserPays("Côte d'Ivoire")).toBe("CI");
        expect(calculatePayroll("CI", bulletin()).taxes).toBeGreaterThan(0);
    });

    it("nomme les pays disponibles dans le message d'erreur", () => {
        try {
            calculatePayroll("CM", bulletin());
            expect.unreachable("le calcul aurait dû échouer");
        } catch (e) {
            expect((e as Error).message).toContain(PAYS_SUPPORTES.join(", "));
        }
    });

    it("produit le même résultat que le moteur sénégalais direct", () => {
        const params = bulletin({ baseSalary: 450_000, isCadre: true });
        expect(calculatePayroll("SN", params)).toEqual(calculateSenegalPayroll(params));
    });
});
