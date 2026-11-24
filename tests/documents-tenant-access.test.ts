import { describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { document: { findMany } } }));

import { GET } from "@/app/api/documents/route";

describe("liste GED isolée par cabinet", () => {
    it("n’interroge que les pièces du cabinet authentifié", async () => {
        findMany.mockResolvedValueOnce([]);
        const response = await GET(new Request("http://localhost/api/documents") as never);
        expect(response.status).toBe(200);
        expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });

    it("rejette un identifiant client mal formé avant la requête", async () => {
        findMany.mockClear();
        const response = await GET(new Request("http://localhost/api/documents?clientId=autre-cabinet") as never);
        expect(response.status).toBe(400);
        expect(findMany).not.toHaveBeenCalled();
    });
});
