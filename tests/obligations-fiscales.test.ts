import { describe, expect, it } from "vitest";
import {
    echeancePour,
    obligationsPourPays,
    OBLIGATIONS_FISCALES,
    urgenceDe,
} from "@/lib/ohada/obligations-fiscales";

describe("catalogue des obligations fiscales", () => {
    it("attribue un identifiant unique à chaque obligation", () => {
        const ids = OBLIGATIONS_FISCALES.map((o) => o.id);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    });

    it("cite le texte applicable pour chaque obligation", () => {
        const sansReference = OBLIGATIONS_FISCALES.filter((o) => !o.reference?.trim());
        expect(sansReference.map((o) => o.id)).toEqual([]);
    });

    it("rattache chaque obligation à au moins un type de déclaration", () => {
        const orphelines = OBLIGATIONS_FISCALES.filter((o) => o.typesDeclaration.length === 0);
        expect(orphelines.map((o) => o.id)).toEqual([]);
    });

    it("n'emploie que des codes pays sur deux lettres", () => {
        for (const o of OBLIGATIONS_FISCALES) {
            expect(o.pays.length, o.id).toBeGreaterThan(0);
            for (const p of o.pays) expect(p, `${o.id} → ${p}`).toMatch(/^[A-Z]{2}$/);
        }
    });

    it("fixe un jour d'échéance valide", () => {
        for (const o of OBLIGATIONS_FISCALES) {
            expect(o.jourEcheance, o.id).toBeGreaterThanOrEqual(1);
            expect(o.jourEcheance, o.id).toBeLessThanOrEqual(31);
        }
    });

    it("couvre les obligations sénégalaises structurantes", () => {
        const ids = obligationsPourPays("SN").map((o) => o.id);
        for (const attendu of ["tva-mensuelle", "ipres-css", "cfce", "impot-minimum"]) {
            expect(ids, attendu).toContain(attendu);
        }
    });

    it("filtre par pays sans tenir compte de la casse ni des espaces", () => {
        expect(obligationsPourPays(" sn ").length).toBe(obligationsPourPays("SN").length);
    });

    it("ne renvoie rien pour un pays hors zone", () => {
        expect(obligationsPourPays("FR")).toEqual([]);
    });
});

describe("calcul des échéances", () => {
    const tva = OBLIGATIONS_FISCALES.find((o) => o.id === "tva-mensuelle")!;
    const annuelle = OBLIGATIONS_FISCALES.find((o) => o.id === "impot-minimum")!;

    it("place l'échéance au jour prévu", () => {
        const d = echeancePour(tva, 2026, 5); // juin
        expect(d.getUTCDate()).toBe(15);
        expect(d.getUTCMonth()).toBe(5);
        expect(d.getUTCFullYear()).toBe(2026);
    });

    it("recule au dernier jour du mois quand le mois est plus court", () => {
        // Échéance au 30 appliquée à février.
        expect(echeancePour(annuelle, 2026, 1).getUTCDate()).toBe(28);
        // Année bissextile.
        expect(echeancePour(annuelle, 2024, 1).getUTCDate()).toBe(29);
    });

    it("gère les mois de 30 et 31 jours", () => {
        expect(echeancePour(annuelle, 2026, 3).getUTCDate()).toBe(30); // avril
        expect(echeancePour(annuelle, 2026, 4).getUTCDate()).toBe(30); // mai
    });
});

describe("niveau d'urgence", () => {
    const reference = new Date("2026-06-01T00:00:00Z");
    const dans = (jours: number) =>
        new Date(reference.getTime() + jours * 86_400_000);

    it("signale une échéance dépassée", () => {
        expect(urgenceDe(dans(-1), reference)).toBe("DEPASSEE");
        expect(urgenceDe(dans(-30), reference)).toBe("DEPASSEE");
    });

    it("signale une échéance imminente sous sept jours", () => {
        expect(urgenceDe(dans(0), reference)).toBe("IMMINENTE");
        expect(urgenceDe(dans(7), reference)).toBe("IMMINENTE");
    });

    it("signale une échéance proche entre huit et vingt et un jours", () => {
        expect(urgenceDe(dans(8), reference)).toBe("PROCHE");
        expect(urgenceDe(dans(21), reference)).toBe("PROCHE");
    });

    it("classe le reste en échéance normale", () => {
        expect(urgenceDe(dans(22), reference)).toBe("NORMALE");
        expect(urgenceDe(dans(120), reference)).toBe("NORMALE");
    });
});
