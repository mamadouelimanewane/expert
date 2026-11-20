import { describe, expect, it } from "vitest";
import { echeancesFiscalesAnnuelles, type ProfilCalendrierFiscal } from "@/lib/ohada/annual-tax-calendar";

const company = (overrides: Partial<ProfilCalendrierFiscal> = {}) => ({
    id: "client-1", country: "SN", type: "ENTREPRISE", fiscalRegime: "REEL_NORMAL", ...overrides,
});

describe("échéances fiscales annuelles", () => {
    it("génère les principaux dépôts et acomptes sénégalais et applique l'option foncière", () => {
        const tasks = echeancesFiscalesAnnuelles(company({ taxProfile: { propertyOwner: true } }), 2026);
        expect(tasks.find(task => task.code === "sn-is-return")?.dueDate.toISOString()).toBe("2026-04-30T00:00:00.000Z");
        expect(tasks.find(task => task.code === "sn-is-advance-1")?.dueDate.toISOString()).toBe("2026-02-15T00:00:00.000Z");
        expect(tasks.some(task => task.code === "sn-property-tax")).toBe(true);
        expect(echeancesFiscalesAnnuelles(company(), 2026).some(task => task.code === "sn-property-tax")).toBe(false);
    });

    it("adapte le calendrier ivoirien au contrôle légal des comptes et à l'exercice", () => {
        const ordinary = echeancesFiscalesAnnuelles(company({ country: "CI" }), 2026);
        const audited = echeancesFiscalesAnnuelles(company({ country: "CI", taxProfile: { requiresAudit: true } }), 2026);
        const nonCalendarYear = echeancesFiscalesAnnuelles(company({ country: "CI", taxProfile: { fiscalYearEnd: "06-30" } }), 2026);
        expect(ordinary.find(task => task.code === "ci-result-return")?.dueDate.toISOString()).toBe("2026-05-30T00:00:00.000Z");
        expect(audited.find(task => task.code === "ci-result-return")?.dueDate.toISOString()).toBe("2026-06-30T00:00:00.000Z");
        expect(nonCalendarYear.find(task => task.code === "ci-result-return")?.period).toBe("2026-A");
    });

    it("adapte le dépôt camerounais au centre fiscal", () => {
        const dge = echeancesFiscalesAnnuelles(company({ country: "CM", taxProfile: { taxCenter: "DGE" } }), 2026);
        const cime = echeancesFiscalesAnnuelles(company({ country: "CM", taxProfile: { taxCenter: "CIME" } }), 2026);
        const cdi = echeancesFiscalesAnnuelles(company({ country: "CM", taxProfile: { taxCenter: "CDI" } }), 2026);
        expect(dge[0].dueDate.toISOString()).toBe("2026-03-15T00:00:00.000Z");
        expect(cime[0].dueDate.toISOString()).toBe("2026-04-15T00:00:00.000Z");
        expect(cdi[0].dueDate.toISOString()).toBe("2026-05-15T00:00:00.000Z");
    });

    it("crée au Bénin le dépôt annuel et les quatre échéances d'acomptes", () => {
        const tasks = echeancesFiscalesAnnuelles(company({ country: "BJ" }), 2026);
        expect(tasks.find(task => task.code === "bj-is-return")?.dueDate.toISOString()).toBe("2026-04-30T00:00:00.000Z");
        expect(tasks.filter(task => task.code.startsWith("bj-is-advance-")).map(task => task.dueDate.getUTCDate())).toEqual([10, 10, 10, 10]);
        expect(tasks.filter(task => task.code.startsWith("bj-is-advance-")).map(task => task.dueDate.getUTCMonth() + 1)).toEqual([3, 6, 9, 12]);
    });
});
