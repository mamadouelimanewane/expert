import { describe, expect, it, vi } from "vitest";

const { scoreFindFirst, clientFindFirst, invoiceFindMany, journalFindMany, mmFindMany } = vi.hoisted(() => ({
    scoreFindFirst: vi.fn(), clientFindFirst: vi.fn(), invoiceFindMany: vi.fn(), journalFindMany: vi.fn(), mmFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({ requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })) }));
vi.mock("@/lib/prisma", () => ({ prisma: {
    creditScore: { findFirst: scoreFindFirst },
    client: { findFirst: clientFindFirst },
    invoice: { findMany: invoiceFindMany },
    tpeJournal: { findMany: journalFindMany },
    mobileMoneyTransaction: { findMany: mmFindMany },
} }));

import { GET } from "@/app/api/fintech/scoring/route";

describe("score financier isolé par cabinet", () => {
    it("ne lit que les évaluations du client et cabinet demandés", async () => {
        scoreFindFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/fintech/scoring?clientId=507f1f77bcf86cd799439099"));
        expect(response.status).toBe(200);
        expect(scoreFindFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { clientId: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });
});
