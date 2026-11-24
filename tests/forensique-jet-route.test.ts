import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({ requireStaff: vi.fn(async () => null) }));

import { POST } from "@/app/api/audit/forensique-jet/route";

const ecriture = {
    id: "GL-2025-001",
    dateComptable: "2025-03-15",
    heureSaisie: "10:30",
    jourSemaine: 6,
    utilisateur: "comptable",
    journalCode: "ACH",
    compteDebit: "601100",
    compteCredit: "401100",
    libelle: "Facture fournisseur",
    montant_XOF: 125000,
    hasPieceJustificative: true,
};

function request(body: unknown) {
    return new Request("http://localhost/api/audit/forensique-jet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("contrôles d’entrée du JET ISA 240", () => {
    it("refuse un audit sans écritures", async () => {
        const response = await POST(request({ societeRaisonSociale: "Société", exercice: 2025, ecritures: [] }));
        expect(response.status).toBe(400);
    });

    it("refuse les écritures hors exercice ou avec un jour incohérent", async () => {
        const response = await POST(request({
            societeRaisonSociale: "Société", exercice: 2025,
            ecritures: [{ ...ecriture, jourSemaine: 1 }],
        }));
        expect(response.status).toBe(400);
    });

    it("analyse une écriture source valide", async () => {
        const response = await POST(request({ societeRaisonSociale: "Société Cliente", exercice: 2025, ecritures: [ecriture] }));
        expect(response.status).toBe(200);
        expect((await response.json()).totalEcrituresAuditees).toBe(1);
    });
});
