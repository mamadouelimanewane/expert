import { describe, expect, it } from "vitest";
import { chiffresTelephone } from "@/lib/whatsapp-processor";

describe("chiffresTelephone", () => {
    it("ramène au même identifiant les formats de saisie et celui de Meta", () => {
        // Meta transmet « 221771234567 ». Les fiches clients portent le numéro
        // tel qu'il a été saisi. La comparaison exacte de chaînes ne reconnaissait
        // donc aucun client : tout message tombait en unknown_client.
        const attendu = "221771234567";

        expect(chiffresTelephone("221771234567")).toBe(attendu);
        expect(chiffresTelephone("+221771234567")).toBe(attendu);
        expect(chiffresTelephone("+221 77 123 45 67")).toBe(attendu);
        expect(chiffresTelephone("+221 77 12 34 567")).toBe(attendu);
        expect(chiffresTelephone("+221-77-123-45-67")).toBe(attendu);
        expect(chiffresTelephone("(+221) 77 123 45 67")).toBe(attendu);
        expect(chiffresTelephone("+221 77 123 45 67")).toBe(attendu);
    });

    it("gère l'absence de numéro sans lever d'exception", () => {
        expect(chiffresTelephone(null)).toBe("");
        expect(chiffresTelephone(undefined)).toBe("");
        expect(chiffresTelephone("")).toBe("");
        expect(chiffresTelephone("pas de numero")).toBe("");
    });

    it("conserve les indicatifs distincts, pour ne pas confondre deux pays", () => {
        // Sénégal et Côte d'Ivoire : les chiffres complets diffèrent.
        expect(chiffresTelephone("+221 77 123 45 67")).not.toBe(
            chiffresTelephone("+225 77 123 45 67")
        );
    });
});
