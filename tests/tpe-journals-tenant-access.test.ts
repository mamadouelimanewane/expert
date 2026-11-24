import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, journalFindMany, journalFindFirst, journalUpdateMany, journalCreateMany } = vi.hoisted(() => ({
    clientFindFirst: vi.fn(), journalFindMany: vi.fn(), journalFindFirst: vi.fn(), journalUpdateMany: vi.fn(), journalCreateMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
    client: { findFirst: clientFindFirst },
    tpeJournal: { findMany: journalFindMany, findFirst: journalFindFirst, updateMany: journalUpdateMany, createMany: journalCreateMany },
} }));
vi.mock("@/lib/accounting-engine", () => ({ AccountingEngine: { processEntry: vi.fn(), toPairedEntries: vi.fn() } }));

import { GET, PATCH } from "@/app/api/tpe/journals/route";
import { POST as importTransactions } from "@/app/api/ingest/import/route";

describe("écritures TPE isolées par cabinet", () => {
    it("limite la liste au cabinet actif", async () => {
        journalFindMany.mockResolvedValueOnce([]);
        const response = await GET(new Request("http://localhost/api/tpe/journals"));
        expect(response.status).toBe(200);
        expect(journalFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { cabinetId: "507f1f77bcf86cd799439011", source: { not: "WHATSAPP_TEST" } },
        }));
    });

    it("refuse l’approbation d’une écriture d’un autre cabinet", async () => {
        journalFindFirst.mockResolvedValueOnce(null);
        const response = await PATCH(new Request("http://localhost/api/tpe/journals", {
            method: "PATCH", headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: "507f1f77bcf86cd799439099", status: "APPROVED" }),
        }));
        expect(response.status).toBe(404);
        expect(journalUpdateMany).not.toHaveBeenCalled();
    });

    it("refuse l’import d’écritures pour un client d’un autre cabinet", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await importTransactions(new Request("http://localhost/api/ingest/import", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ clientId: "507f1f77bcf86cd799439099", transactions: [{ date: "2026-01-10", libelle: "Vente", amount: 100, type: "income" }] }),
        }));
        expect(response.status).toBe(404);
        expect(journalCreateMany).not.toHaveBeenCalled();
    });
});
