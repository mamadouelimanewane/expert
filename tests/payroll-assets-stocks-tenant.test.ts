import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, payrollFindMany, assetsFindMany, productFindMany } = vi.hoisted(() => ({
    clientFindFirst: vi.fn(), payrollFindMany: vi.fn(), assetsFindMany: vi.fn(), productFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
    client: { findFirst: clientFindFirst },
    payrollPeriod: { findMany: payrollFindMany },
    fixedAsset: { findMany: assetsFindMany },
    product: { findMany: productFindMany },
} }));

import { GET as getPayroll } from "@/app/api/payroll/periodes/route";
import { GET as getAssets } from "@/app/api/audit/fixed-assets/route";
import { GET as getStocks, POST as postStocks } from "@/app/api/comptabilite/stocks/route";

const clientId = "507f1f77bcf86cd799439099";
const requestFor = (path: string) => new Request(`http://localhost${path}?clientId=${clientId}`);

describe("paie, immobilisations et stocks isolés par cabinet", () => {
    it("ne charge pas les périodes de paie d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getPayroll(requestFor("/api/payroll/periodes"));
        expect(response.status).toBe(404);
        expect(payrollFindMany).not.toHaveBeenCalled();
    });

    it("ne charge pas les immobilisations d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getAssets(requestFor("/api/audit/fixed-assets") as never);
        expect(response.status).toBe(404);
        expect(assetsFindMany).not.toHaveBeenCalled();
    });

    it("ne retourne pas les articles d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getStocks(new Request(`http://localhost/api/comptabilite/stocks?clientId=${clientId}&exercice=2025`) as never);
        expect(response.status).toBe(404);
        expect(productFindMany).not.toHaveBeenCalled();
    });

    it("refuse la simulation d’inventaire sur un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await postStocks(new Request("http://localhost/api/comptabilite/stocks", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ clientId, exercice: 2025, articles: [{ id: "507f1f77bcf86cd799439001" }] }),
        }) as never);
        expect(response.status).toBe(404);
        expect(productFindMany).not.toHaveBeenCalled();
    });
});
