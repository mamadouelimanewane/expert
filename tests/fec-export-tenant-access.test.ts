import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, journalFindMany } = vi.hoisted(() => ({ clientFindFirst: vi.fn(), journalFindMany: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })) }));
vi.mock("@/lib/prisma", () => ({ default: { client: { findFirst: clientFindFirst }, tpeJournal: { findMany: journalFindMany } } }));

import { GET } from "@/app/api/fec-export/route";

describe("export FEC isolé par cabinet", () => {
    it("ne charge les écritures qu’après avoir vérifié le propriétaire du client", async () => {
        clientFindFirst.mockResolvedValueOnce(null);
        const response = await GET(new Request("http://localhost/api/fec-export?clientId=507f1f77bcf86cd799439099&dateDebut=2025-01-01&dateFin=2025-12-31") as never);
        expect(response.status).toBe(404);
        expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" } }));
        expect(journalFindMany).not.toHaveBeenCalled();
    });
});
