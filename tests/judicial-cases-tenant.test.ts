import { describe, expect, it, vi } from "vitest";

const { caseFindMany, clientFindFirst } = vi.hoisted(() => ({ caseFindMany: vi.fn(), clientFindFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { id: "user", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { judicialCase: { findMany: caseFindMany }, client: { findFirst: clientFindFirst } } }));

import { GET, POST } from "@/app/api/judicial-cases/route";

describe("affaires judiciaires isolées par cabinet", () => {
    it("filtre le registre sur le cabinet courant", async () => {
        caseFindMany.mockResolvedValueOnce([]);
        const response = await GET(new Request("http://localhost/api/judicial-cases") as never);
        expect(response.status).toBe(200);
        expect(caseFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
    });

    it("ne rattache pas une affaire au client d’un autre cabinet", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await POST(new Request("http://localhost/api/judicial-cases", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ caseNumber: "2026/1", court: "Dakar", parties: "A contre B", clientId: "507f1f77bcf86cd799439099" }),
        }) as never);
        expect(response.status).toBe(404);
        expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" } }));
    });
});
