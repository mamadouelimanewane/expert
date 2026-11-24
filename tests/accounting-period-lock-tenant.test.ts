import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, lockFindUnique } = vi.hoisted(() => ({ clientFindFirst: vi.fn(), lockFindUnique: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireAdmin: vi.fn(async () => ({ session: { id: "admin", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { client: { findFirst: clientFindFirst }, accountingPeriodLock: { findUnique: lockFindUnique } } }));

import { GET } from "@/app/api/comptabilite/periodes/lock/route";

describe("verrou de période isolé par cabinet", () => {
    it("ne révèle pas le verrou d’un client étranger", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/comptabilite/periodes/lock?clientId=507f1f77bcf86cd799439099&periode=2026-01"));
        expect(response.status).toBe(404);
        expect(lockFindUnique).not.toHaveBeenCalled();
    });
});
