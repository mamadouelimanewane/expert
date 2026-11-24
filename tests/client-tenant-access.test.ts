import { describe, expect, it, vi } from "vitest";

const { findFirst } = vi.hoisted(() => ({ findFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
    requireWriteAccess: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { client: { findFirst } } }));

import { GET as getClient } from "@/app/api/clients/[id]/route";
import { GET as getFiscalProfile } from "@/app/api/clients/[id]/fiscal-profile/route";

const context = { params: Promise.resolve({ id: "507f1f77bcf86cd799439099" }) };

describe("accès aux dossiers clients isolé par cabinet", () => {
    it("scinde la fiche client sur le cabinet de la session", async () => {
        findFirst.mockResolvedValueOnce({ id: "client" });
        const response = await getClient(new Request("http://localhost/api/clients/id"), context);
        expect(response.status).toBe(200);
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });

    it("scinde aussi la lecture du profil fiscal", async () => {
        findFirst.mockResolvedValueOnce({ id: "client", country: "SN" });
        const response = await getFiscalProfile(new Request("http://localhost/api/clients/id") as never, context);
        expect(response.status).toBe(200);
        expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" },
        }));
    });
});
