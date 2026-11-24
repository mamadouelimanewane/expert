import { describe, expect, it, vi } from "vitest";

const { findMany, aggregate, findFirst, updateMany } = vi.hoisted(() => ({
    findMany: vi.fn(), aggregate: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ AuthService: { getSession: vi.fn(async () => ({ id: "user", role: "EXPERT", cabinetId: "507f1f77bcf86cd799439011" })) } }));
vi.mock("@/lib/prisma", () => ({ default: { taxDeclaration: { findMany, aggregate, findFirst, updateMany } } }));

import { GET } from "@/app/api/declarations/route";
import { PATCH } from "@/app/api/declarations/[id]/route";

describe("déclarations fiscales isolées par cabinet", () => {
    it("filtre la liste, le total et la prochaine échéance sur le cabinet", async () => {
        findMany.mockResolvedValueOnce([]);
        aggregate.mockResolvedValueOnce({ _sum: { amount: 0 } });
        findFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/declarations") as never);
        expect(response.status).toBe(200);
        expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
        expect(aggregate).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ cabinetId: "507f1f77bcf86cd799439011" }) }));
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ cabinetId: "507f1f77bcf86cd799439011" }) }));
    });

    it("ne permet pas de modifier la déclaration d’un autre cabinet", async () => {
        findFirst.mockResolvedValueOnce(null);
        const response = await PATCH(new Request("http://localhost/api/declarations/507f1f77bcf86cd799439099", {
            method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount: 10 }),
        }) as never, { params: Promise.resolve({ id: "507f1f77bcf86cd799439099" }) });
        expect(response.status).toBe(404);
        expect(updateMany).not.toHaveBeenCalled();
    });
});
