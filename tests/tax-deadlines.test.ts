import { describe, expect, it } from "vitest";
import { echeanceTVA, jourLimiteTVA } from "@/lib/ohada/tax-deadlines";

describe("échéances mensuelles TVA selon la juridiction", () => {
    it("applique le 10 du mois au Bénin et le 15 au Sénégal et au Cameroun", () => {
        expect(jourLimiteTVA({ country: "BJ" })).toBe(10);
        expect(jourLimiteTVA({ country: "SN" })).toBe(15);
        expect(jourLimiteTVA({ country: "CM" })).toBe(15);
    });

    it("différencie les échéances ivoiriennes DGE/DME selon le secteur", () => {
        expect(jourLimiteTVA({ country: "CI", taxCenter: "DGE", sector: "industrie pétrolière" })).toBe(10);
        expect(jourLimiteTVA({ country: "CI", taxCenter: "DME", sector: "commerce" })).toBe(15);
        expect(jourLimiteTVA({ country: "CI", taxCenter: "DGE", sector: "prestations de services" })).toBe(20);
    });

    it("retient la date générale lorsque le profil ivoirien ne précise pas le centre", () => {
        expect(jourLimiteTVA({ country: "CI", sector: "industrie" })).toBe(15);
    });

    it("calcule une vraie date UTC dans le mois demandé", () => {
        expect(echeanceTVA({ country: "BJ" }, 2026, 1).toISOString()).toBe("2026-02-10T00:00:00.000Z");
    });
});
