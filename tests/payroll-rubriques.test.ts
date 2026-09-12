import { describe, expect, it } from "vitest";
import { calculateSenegalPayroll } from "@/lib/payroll/engines/senegal";
import { calculateCoteIvoirePayroll } from "@/lib/payroll/engines/cote-ivoire";
import { ligneLivreDePaie, rubriquesBulletin, type BulletinEntree } from "@/lib/payroll/rubriques";

const entree = (pays: "SN" | "CI", extra: Partial<Parameters<typeof calculateSenegalPayroll>[0]> = {}): BulletinEntree => {
    const params = {
        baseSalary: 450_000,
        absencesDays: 2,
        overtimeHours: 4,
        bonuses: 25_000,
        transportAllowance: 20_000,
        maritalStatus: "MARIE",
        childrenCount: 1,
        isCadre: true,
        benefitsInKind: 30_000,
        ...extra,
    };
    const r = pays === "SN" ? calculateSenegalPayroll(params) : calculateCoteIvoirePayroll(params);
    return {
        pays,
        baseSalary: params.baseSalary,
        absencesDays: params.absencesDays,
        overtimeHours: params.overtimeHours,
        bonuses: params.bonuses,
        transportAllowance: params.transportAllowance,
        grossSalary: r.grossSalary,
        taxableIncome: r.taxableIncome,
        socialSecurity: r.socialSecurity,
        taxes: r.taxes,
        netSalary: r.netSalary,
        employerContributions: r.employerContributions,
        detail: r.detail as unknown as Record<string, number>,
    };
};

describe("rubriques du bulletin", () => {
    it("recompose le brut sénégalais à partir des gains affichés", () => {
        const b = entree("SN");
        const gains = rubriquesBulletin(b).find((s) => s.titre === "Gains")!.rubriques;
        const brut = gains.find((r) => r.code === "199")!.salarie!;
        const somme = gains.filter((r) => r.code !== "199").reduce((a, r) => a + (r.salarie ?? 0), 0);
        expect(brut).toBe(b.grossSalary);
        expect(Math.abs(somme - brut)).toBeLessThanOrEqual(2); // arrondis du moteur
    });

    it("fait descendre les retenues salariales jusqu'au net à payer", () => {
        for (const pays of ["SN", "CI"] as const) {
            const b = entree(pays);
            const sections = rubriquesBulletin(b);
            const retenues = sections
                .filter((s) => s.titre !== "Gains" && s.titre !== "Net")
                .flatMap((s) => s.rubriques)
                .reduce((a, r) => a + Math.min(0, r.salarie ?? 0), 0);
            expect(-retenues).toBe(b.socialSecurity + b.taxes);
            const net = sections.find((s) => s.titre === "Net")!.rubriques.find((r) => r.code === "999")!.salarie;
            expect(net).toBe(b.netSalary);
            // Brut − retenues − avantages en nature = net (à l'arrondi près : le
            // moteur arrondit chaque montant séparément)
            expect(Math.abs(b.grossSalary + retenues - (b.detail!.avantagesNature ?? 0) - b.netSalary)).toBeLessThanOrEqual(1);
        }
    });

    it("totalise les charges patronales listées", () => {
        for (const pays of ["SN", "CI"] as const) {
            const b = entree(pays);
            const patronal = rubriquesBulletin(b)
                .find((s) => s.titre === "Cotisations sociales")!
                .rubriques.reduce((a, r) => a + (r.employeur ?? 0), 0);
            expect(patronal).toBe(b.employerContributions);
        }
    });

    it("nomme les rubriques propres à chaque pays", () => {
        const sn = rubriquesBulletin(entree("SN")).flatMap((s) => s.rubriques.map((r) => r.libelle)).join(" ");
        const ci = rubriquesBulletin(entree("CI")).flatMap((s) => s.rubriques.map((r) => r.libelle)).join(" ");
        expect(sn).toMatch(/IPRES/);
        expect(sn).toMatch(/TRIMF/);
        expect(sn).not.toMatch(/CNPS/);
        expect(ci).toMatch(/CNPS/);
        expect(ci).toMatch(/ITS/);
        expect(ci).not.toMatch(/IPRES/);
    });

    it("omet les lignes à zéro (pas d'IPRES complémentaire pour un non-cadre)", () => {
        const b = entree("SN", { isCadre: false });
        const libelles = rubriquesBulletin(b).flatMap((s) => s.rubriques.map((r) => r.libelle));
        expect(libelles.some((l) => l.includes("complémentaire"))).toBe(false);
    });
});

describe("livre de paie", () => {
    it("produit une ligne plate cohérente avec le bulletin", () => {
        const b = entree("SN");
        const l = ligneLivreDePaie({ ...b, salarie: "Test", poste: "Comptable" });
        expect(l["Salaire brut"]).toBe(b.grossSalary);
        expect(l["Net à payer"]).toBe(b.netSalary);
        expect(l["Total retenues"]).toBe(b.socialSecurity + b.taxes);
        expect(l["Coût employeur"]).toBe(b.grossSalary + b.employerContributions);
        expect(Object.keys(l)).toContain("TRIMF");
    });

    it("adapte les colonnes à la Côte d'Ivoire", () => {
        const l = ligneLivreDePaie({ ...entree("CI"), salarie: "Test" });
        expect(Object.keys(l)).toContain("ITS retenu");
        expect(Object.keys(l)).not.toContain("TRIMF");
    });
});
