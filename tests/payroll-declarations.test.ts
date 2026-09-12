import { describe, expect, it } from "vitest";
import { calculateSenegalPayroll, PLAFOND_IPRES_RG } from "@/lib/payroll/engines/senegal";
import { calculateCoteIvoirePayroll } from "@/lib/payroll/engines/cote-ivoire";
import { bordereauxDeclarations, type BulletinDeclaration } from "@/lib/payroll/declarations";

type ParamsSN = Parameters<typeof calculateSenegalPayroll>[0];

const bulletin = (pays: "SN" | "CI", nom: string, extra: Partial<ParamsSN> = {}): BulletinDeclaration => {
    const params: ParamsSN = {
        baseSalary: 450_000,
        absencesDays: 0,
        overtimeHours: 0,
        bonuses: 0,
        transportAllowance: 25_000,
        maritalStatus: "MARIE",
        childrenCount: 2,
        isCadre: false,
        ...extra,
    };
    const r = pays === "SN" ? calculateSenegalPayroll({ ...params, ipmRateSalarial: 0.03, ipmRatePatronal: 0.03 }) : calculateCoteIvoirePayroll(params);
    return {
        salarie: nom,
        isCadre: params.isCadre,
        grossSalary: r.grossSalary,
        taxableIncome: r.taxableIncome,
        transportAllowance: params.transportAllowance,
        employeeSocials: r.socialSecurity,
        employerSocials: r.employerContributions,
        taxes: r.taxes,
        detail: r.detail as unknown as Record<string, number>,
    };
};

const effectifSN = () => [bulletin("SN", "Diop"), bulletin("SN", "Ndiaye", { baseSalary: 1_500_000, isCadre: true }), bulletin("SN", "Sow", { baseSalary: 120_000 })];
const effectifCI = () => [bulletin("CI", "Koné"), bulletin("CI", "Yao", { baseSalary: 4_000_000, isCadre: true })];

describe("bordereaux Sénégal", () => {
    it("produit IPRES, CSS, IPM et DGID, chacun équilibré (salarial + patronal = total)", () => {
        const bs = bordereauxDeclarations("SN", effectifSN());
        expect(bs.map((b) => b.organisme)).toEqual(["IPRES", "CSS", "IPM", "DGID"]);
        for (const b of bs) {
            expect(b.effectif).toBe(3);
            expect(b.total).toBe(b.totalSalarial + b.totalPatronal);
            expect(b.nominatif).toHaveLength(3);
            expect(b.nominatif.every((l) => l.length === b.colonnes.length)).toBe(true);
        }
    });

    it("retrouve la totalité des cotisations salariales et des impôts des bulletins", () => {
        const eff = effectifSN();
        const bs = bordereauxDeclarations("SN", eff);
        const salarial = bs.reduce((a, b) => a + b.totalSalarial, 0);
        const attendu = eff.reduce((a, b) => a + b.employeeSocials + b.taxes, 0);
        expect(Math.abs(salarial - attendu)).toBeLessThanOrEqual(eff.length); // arrondis par rubrique
        const patronal = bs.reduce((a, b) => a + b.totalPatronal, 0);
        expect(Math.abs(patronal - eff.reduce((a, b) => a + b.employerSocials, 0))).toBeLessThanOrEqual(eff.length);
    });

    it("plafonne l'assiette IPRES RG et réserve le régime complémentaire aux cadres", () => {
        const ipres = bordereauxDeclarations("SN", effectifSN()).find((b) => b.organisme === "IPRES")!;
        const rg = ipres.lignes[0];
        const rc = ipres.lignes[1];
        // Ndiaye (1,5 M) est plafonné à 432 000 ; Diop et Sow en dessous du plafond.
        const assiettesRg = ipres.nominatif.map((l) => Number(l[2]));
        expect(Math.max(...assiettesRg)).toBe(PLAFOND_IPRES_RG);
        expect(rg.assiette).toBe(assiettesRg.reduce((a, b) => a + b, 0));
        expect(Math.round(rg.assiette! * 0.056)).toBeCloseTo(rg.salarial, -1);
        // Un seul cadre : une seule assiette RC non nulle
        expect(ipres.nominatif.filter((l) => Number(l[5]) > 0)).toHaveLength(1);
        expect(rc.salarial).toBeGreaterThan(0);
    });

    it("déduit le taux effectif d'accident du travail des montants", () => {
        const css = bordereauxDeclarations("SN", effectifSN()).find((b) => b.organisme === "CSS")!;
        expect(css.lignes[0].tauxPatronal).toBe(0.07);
        expect(css.lignes[1].tauxPatronal).toBe(0.01);
        expect(css.totalSalarial).toBe(0);
    });

    it("omet le bordereau IPM quand l'employeur n'en a pas", () => {
        const sans = effectifSN().map((b) => ({ ...b, detail: { ...b.detail, ipmSalarial: 0, ipmPatronal: 0 } }));
        expect(bordereauxDeclarations("SN", sans).map((b) => b.organisme)).toEqual(["IPRES", "CSS", "DGID"]);
    });

    it("reconstitue les assiettes des bulletins anciens sans assiettes enregistrées", () => {
        const eff = effectifSN();
        const anciens = eff.map((b) => {
            const { brutSocial: _a, assietteIpresRg: _b, assietteIpresRc: _c, assietteCss: _d, assietteIpm: _e, ...detail } = b.detail!;
            return { ...b, detail };
        });
        const neuf = bordereauxDeclarations("SN", eff);
        const ancien = bordereauxDeclarations("SN", anciens);
        for (let i = 0; i < neuf.length; i++) {
            expect(ancien[i].lignes.map((l) => l.assiette)).toEqual(neuf[i].lignes.map((l) => l.assiette));
            expect(ancien[i].total).toBe(neuf[i].total);
        }
    });

    it("retourne une liste vide sans bulletin", () => {
        expect(bordereauxDeclarations("SN", [])).toEqual([]);
    });
});

describe("bordereaux Côte d'Ivoire", () => {
    it("produit CNPS, CNAM, DGI et FDFP équilibrés", () => {
        const eff = effectifCI();
        const bs = bordereauxDeclarations("CI", eff);
        expect(bs.map((b) => b.organisme)).toEqual(["CNPS", "CNAM", "DGI", "FDFP"]);
        const salarial = bs.reduce((a, b) => a + b.totalSalarial, 0);
        expect(Math.abs(salarial - eff.reduce((a, b) => a + b.employeeSocials + b.taxes, 0))).toBeLessThanOrEqual(eff.length);
        const patronal = bs.reduce((a, b) => a + b.totalPatronal, 0);
        expect(Math.abs(patronal - eff.reduce((a, b) => a + b.employerSocials, 0))).toBeLessThanOrEqual(eff.length);
    });

    it("applique le forfait CMU par salarié et le plafond CNPS retraite", () => {
        const bs = bordereauxDeclarations("CI", effectifCI());
        const cnam = bs.find((b) => b.organisme === "CNAM")!;
        expect(cnam.totalSalarial).toBe(2 * 500);
        expect(cnam.totalPatronal).toBe(2 * 500);
        const cnps = bs.find((b) => b.organisme === "CNPS")!;
        // Yao (4 M) est plafonné à 3 375 000 pour la retraite et 70 000 pour PF/AT
        const assiettesRetraite = cnps.nominatif.map((l) => Number(l[2]));
        expect(Math.max(...assiettesRetraite)).toBe(3_375_000);
        expect(cnps.lignes[1].assiette).toBe(2 * 70_000);
    });
});
