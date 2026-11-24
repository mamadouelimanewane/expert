import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({ requireStaff: vi.fn(async () => null) }));

import { POST } from "@/app/api/liasse/validateur-coherence/route";

function request(body: unknown) {
    return new Request("http://localhost/api/liasse/validateur-coherence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
}

const chiffresComplets = {
    totalActifBrut_XOF: 100,
    totalAmortissementsProvisions_XOF: 10,
    totalActifNet_XOF: 90,
    totalPassif_XOF: 90,
    capitalSocial_XOF: 50,
    capitauxPropres_XOF: 60,
    resultatNetBilan_XOF: 10,
    tresorerieActif_XOF: 5,
    tresoreriePassif_XOF: 1,
    fournisseursDebiteursNonReclasses_XOF: 0,
    clientsCrediteursNonReclasses_XOF: 0,
};

describe("validation de la liasse à partir des chiffres reçus", () => {
    it("rejette une liasse vide ou incomplète", async () => {
        const response = await POST(request({ liasse: { societeRaisonSociale: "Société", exercice: 2025 } }));
        expect(response.status).toBe(400);
    });

    it("rejette les montants non numériques", async () => {
        const response = await POST(request({ liasse: {
            societeRaisonSociale: "Société", exercice: 2025,
            bilan: { ...chiffresComplets, totalActifNet_XOF: "" },
            compteResultat: {
                chiffreAffaires_XOF: 100, totalProduits_XOF: 100, totalCharges_XOF: 90,
                dotationsAmortissementsExercice_XOF: 1, resultatNetCompteResultat_XOF: 10, impotSurResultat_XOF: 0,
            },
        } }));
        expect(response.status).toBe(400);
    });

    it("produit un contrôle seulement après réception des 17 chiffres", async () => {
        const response = await POST(request({ liasse: {
            societeRaisonSociale: "Société Cliente", exercice: 2025,
            bilan: chiffresComplets,
            compteResultat: {
                chiffreAffaires_XOF: 100, totalProduits_XOF: 100, totalCharges_XOF: 90,
                dotationsAmortissementsExercice_XOF: 1, resultatNetCompteResultat_XOF: 10, impotSurResultat_XOF: 0,
            },
        } }));
        expect(response.status).toBe(200);
        expect((await response.json()).societeRaisonSociale).toBe("Société Cliente");
    });
});
