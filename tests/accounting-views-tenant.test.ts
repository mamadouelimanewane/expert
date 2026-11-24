import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, journalFindMany, balanceFindUnique, invoiceFindMany } = vi.hoisted(() => ({
    clientFindFirst: vi.fn(), journalFindMany: vi.fn(), balanceFindUnique: vi.fn(), invoiceFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
    client: { findFirst: clientFindFirst },
    tpeJournal: { findMany: journalFindMany },
    balanceImportee: { findUnique: balanceFindUnique, findMany: vi.fn() },
    invoice: { findMany: invoiceFindMany },
} }));

import { GET as getCaisse } from "@/app/api/comptabilite/caisse/route";
import { GET as getBalance } from "@/app/api/comptabilite/balance/route";
import { GET as getAuxiliaire } from "@/app/api/comptabilite/auxiliaire/route";
import { POST as weeklyReport } from "@/app/api/tpe/weekly-report/route";

const foreignClient = "507f1f77bcf86cd799439099";
const url = (path: string) => `http://localhost${path}?clientId=${foreignClient}`;

describe("vues comptables isolées par cabinet", () => {
    it("ne charge pas le brouillard de caisse d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getCaisse(new Request(url("/api/comptabilite/caisse")) as never);
        expect(response.status).toBe(404);
        expect(journalFindMany).not.toHaveBeenCalled();
    });

    it("ne retourne pas de balance d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getBalance(new Request(url("/api/comptabilite/balance") as never));
        expect(response.status).toBe(404);
        expect(balanceFindUnique).not.toHaveBeenCalled();
    });

    it("ne charge pas les factures auxiliaires d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await getAuxiliaire(new Request(url("/api/comptabilite/auxiliaire")) as never);
        expect(response.status).toBe(404);
        expect(invoiceFindMany).not.toHaveBeenCalled();
    });

    it("refuse un rapport hebdomadaire demandé pour un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await weeklyReport(new Request("http://localhost/api/tpe/weekly-report", {
            method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: foreignClient }),
        }));
        expect(response.status).toBe(404);
        expect(journalFindMany).not.toHaveBeenCalled();
    });
});
