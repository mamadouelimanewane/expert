import { describe, expect, it } from "vitest";
import { normaliserEnteteCsv, parseCsv } from "@/lib/csv";

describe("lecteur CSV", () => {
    it("lit BOM, point-virgules et guillemets échappés", () => {
        expect(parseCsv(`\uFEFFid;libelle;montant\r\n1;"Fournisseur; O'Brien";"1 250"`)).toEqual([
            ["id", "libelle", "montant"],
            ["1", "Fournisseur; O'Brien", "1 250"],
        ]);
    });

    it("conserve les retours à la ligne dans un champ cité", () => {
        expect(parseCsv('id,libelle\n1,"Ligne A\nLigne B"')).toEqual([
            ["id", "libelle"],
            ["1", "Ligne A\nLigne B"],
        ]);
    });

    it("normalise les entêtes accentuées", () => {
        expect(normaliserEnteteCsv("N° Compte Débit")).toBe("ncomptedebit");
    });

    it("rejette les champs entre guillemets non terminés", () => {
        expect(() => parseCsv('id,libelle\n1,"incomplet')).toThrow("n’est pas fermé");
    });
});
