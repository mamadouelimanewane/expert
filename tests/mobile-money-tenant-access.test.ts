import { describe, expect, it, vi } from "vitest";

const { transactionFindMany, transactionCreate, clientFindFirst } = vi.hoisted(() => ({
    transactionFindMany: vi.fn(), transactionCreate: vi.fn(), clientFindFirst: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ prisma: {
    mobileMoneyTransaction: { findMany: transactionFindMany, create: transactionCreate },
    client: { findFirst: clientFindFirst },
} }));

import { GET, POST } from "@/app/api/fintech/mobile-money/route";

describe("transactions Mobile Money cloisonnées par cabinet", () => {
    it("filtre la liste sur le cabinet authentifié", async () => {
        transactionFindMany.mockResolvedValueOnce([]);
        const response = await GET();
        expect(response.status).toBe(200);
        expect(transactionFindMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });

    it("refuse une transaction pour un client d’un autre cabinet", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await POST(new Request("http://localhost/api/fintech/mobile-money", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ operator: "Wave", senderPhone: "+221700000000", clientId: "507f1f77bcf86cd799439099", amount: 5000, type: "IN", reference: "TX-1" }),
        }));
        expect(response.status).toBe(404);
        expect(transactionCreate).not.toHaveBeenCalled();
        expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });
});
