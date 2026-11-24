import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api-auth", () => ({ requireStaff: vi.fn(async () => ({ session: {}, denied: null })) }));

import { POST } from "@/app/api/legal/generate-act/route";

function request(body: unknown) {
    return new Request("http://localhost/api/legal/generate-act", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    }) as never;
}

const pv = {
    denomination: "Société Exemple", formeSociale: "SARL", capitalSocial: 1_000_000,
    siegeSocial: "Dakar", rccm: "SN-DKR-2025-B-1", dateAssemblee: "2025-06-30",
    heureAssemblee: "10:00", dateCloture: "2024-12-31", lieuAssemblee: "Dakar",
    exerciceClos: 2024, resultatNet: 100_000, affectationReserveLegale: 10_000,
    dividendesDistribues: 50_000, nomGerantOuPresident: "A. Exemple",
    presentsOuRepresentesPourcentage: 100, voteApprobation: "majorite",
    voteAffectation: "unanimite", voteFormalites: "unanimite",
};

describe("API de génération d’actes", () => {
    it("rejette les paramètres absents et les pays inconnus", async () => {
        expect((await POST(request({ type: "PV_AGOA", pays: "sn" }))).status).toBe(400);
        expect((await POST(request({ type: "PV_AGOA", params: pv, pays: "XX" }))).status).toBe(400);
    });

    it("génère un projet avec les dates et votes réellement reçus", async () => {
        const response = await POST(request({ type: "PV_AGOA", params: pv, pays: "sn" }));
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.acte.texteIntegral).toContain("31/12/2024");
        expect(data.acte.texteIntegral).toContain("adoptée à la majorité");
        expect(data.acte.texteIntegral).not.toContain("L'an deux mille vingt-cinq");
    });
});
