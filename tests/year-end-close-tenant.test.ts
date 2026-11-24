import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, closeFindFirst, lockFindMany, journalFindMany } = vi.hoisted(() => ({
    clientFindFirst: vi.fn(), closeFindFirst: vi.fn(), lockFindMany: vi.fn(), journalFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", name: "Expert", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
    client: { findFirst: clientFindFirst },
    yearEndClose: { findFirst: closeFindFirst },
    accountingPeriodLock: { findMany: lockFindMany },
    tpeJournal: { findMany: journalFindMany },
} }));

import { GET } from "@/app/api/comptabilite/cloture-annuelle/route";

describe("clôture annuelle isolée par cabinet", () => {
    it("refuse un client étranger sans charger la clôture ni les écritures", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/comptabilite/cloture-annuelle?clientId=507f1f77bcf86cd799439099&fiscalYear=2025"));
        expect(response.status).toBe(404);
        expect(closeFindFirst).not.toHaveBeenCalled();
        expect(lockFindMany).not.toHaveBeenCalled();
        expect(journalFindMany).not.toHaveBeenCalled();
    });
});
