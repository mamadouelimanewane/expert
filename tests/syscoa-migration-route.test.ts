import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({
    requireStaff: vi.fn(async () => ({ denied: null, session: { id: "staff", cabinetId: "cabinet" } })),
}));

import { POST } from "@/app/api/comptabilite/syscoa-migration/route";

function request(body: unknown) {
    return new Request("http://localhost/api/comptabilite/syscoa-migration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("validation des imports de migration SYSCOA", () => {
    it("rejette une balance vide", async () => {
        const response = await POST(request({ comptes: [] }) as never);
        expect(response.status).toBe(400);
    });

    it("rejette les comptes dupliqués", async () => {
        const response = await POST(request({ comptes: [
            { numero: "411", libelle: "Clients", solde_XOF: 1000 },
            { numero: "411", libelle: "Clients bis", solde_XOF: 2000 },
        ] }) as never);
        expect(response.status).toBe(400);
        expect((await response.json()).error).toContain("apparaît plusieurs fois");
    });

    it("rejette une ligne sans solde numérique fini", async () => {
        const response = await POST(request({ comptes: [{ numero: "411", libelle: "Clients", solde_XOF: null }] }) as never);
        expect(response.status).toBe(400);
    });
});
