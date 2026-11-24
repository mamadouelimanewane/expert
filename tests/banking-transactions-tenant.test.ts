import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    bankFindMany: vi.fn(),
    bankFindFirst: vi.fn(),
    bankUpdateMany: vi.fn(),
    bankCreateMany: vi.fn(),
    invoiceFindMany: vi.fn(),
    invoiceFindFirst: vi.fn(),
    requireStaff: vi.fn(),
    requireWriteAccess: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        bankTransaction: {
            findMany: mocks.bankFindMany,
            findFirst: mocks.bankFindFirst,
            updateMany: mocks.bankUpdateMany,
            createMany: mocks.bankCreateMany,
        },
        invoice: {
            findMany: mocks.invoiceFindMany,
            findFirst: mocks.invoiceFindFirst,
        },
    },
}));

vi.mock("@/lib/api-auth", () => ({
    requireStaff: mocks.requireStaff,
    requireWriteAccess: mocks.requireWriteAccess,
}));

import { GET, POST } from "@/app/api/banking/transactions/route";

const cabinetId = "507f1f77bcf86cd799439012";

describe("transactions bancaires isolées par cabinet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const session = { id: "507f1f77bcf86cd799439013", role: "ADMIN", cabinetId };
        mocks.requireStaff.mockResolvedValue({ denied: null, session });
        mocks.requireWriteAccess.mockResolvedValue({ denied: null, session });
        mocks.bankFindMany.mockResolvedValue([]);
        mocks.invoiceFindMany.mockResolvedValue([]);
    });

    it("borne les listes de transactions et factures au cabinet courant", async () => {
        const response = await GET();
        expect(response.status).toBe(200);
        expect(mocks.bankFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
        expect(mocks.invoiceFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ cabinetId, client: { cabinetId } }),
        }));
    });

    it("ne permet pas de rapprocher une transaction ou facture d’un autre cabinet", async () => {
        mocks.bankFindFirst.mockResolvedValue(null);
        mocks.invoiceFindFirst.mockResolvedValue(null);

        const response = await POST(new Request("http://localhost/api/banking/transactions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "reconcile", transactionId: "507f1f77bcf86cd799439011", invoiceId: "507f1f77bcf86cd799439099" }),
        }));

        expect(response.status).toBe(404);
        expect(mocks.bankFindFirst).toHaveBeenCalledWith({ where: { id: "507f1f77bcf86cd799439011", cabinetId } });
        expect(mocks.invoiceFindFirst).toHaveBeenCalledWith({ where: { id: "507f1f77bcf86cd799439099", cabinetId } });
        expect(mocks.bankUpdateMany).not.toHaveBeenCalled();
    });

    it("attribue chaque ligne importée au cabinet authentifié", async () => {
        mocks.bankCreateMany.mockResolvedValue({ count: 1 });
        const response = await POST(new Request("http://localhost/api/banking/transactions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                action: "import",
                transactions: [{ date: "2026-10-01", description: "Virement reçu", amount: 125000 }],
            }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.bankCreateMany).toHaveBeenCalledWith({
            data: [{
                cabinetId,
                date: new Date("2026-10-01"),
                description: "Virement reçu",
                amount: 125000,
                type: "CREDIT",
                status: "PENDING",
            }],
        });
    });
});
