import { describe, expect, it } from "vitest";
import { extraireMontant } from "@/lib/whatsapp-processor";

describe("extraireMontant", () => {
    it("ne retient plus la première suite de chiffres du message", () => {
        // `text.match(/(\d[\d\s,]*)/)` retenait « 3 » : une vente de 45 000 FCFA
        // était comptabilisée pour 3 FCFA dans le journal du client.
        expect(extraireMontant("Vente 3 sacs de riz 45000")).toBe(45000);
        expect(extraireMontant("Le 15/03 vente 50000")).toBe(50000);
        expect(extraireMontant("achat 2 sacs ciment 12000")).toBe(12000);
    });

    it("lit les montants formatés", () => {
        expect(extraireMontant("Vente 45 000 FCFA")).toBe(45000);
        expect(extraireMontant("Vente 1 250 000")).toBe(1250000);
        expect(extraireMontant("Vente 45000,50")).toBe(45000.5);
        expect(extraireMontant("Vente 1.250.000")).toBe(1250000);
    });

    it("renvoie null quand aucun montant n'apparaît", () => {
        // L'ancien code laissait `montant` à 0 et enregistrait quand même une
        // écriture nulle, confirmée au client comme comptabilisée.
        expect(extraireMontant("Bonjour, comment ça va ?")).toBeNull();
        expect(extraireMontant("")).toBeNull();
    });

    it("ignore les zéros et les valeurs négatives", () => {
        expect(extraireMontant("Vente 0")).toBeNull();
    });

    it("retient le plus grand montant d'un message qui en cite plusieurs", () => {
        expect(extraireMontant("Acompte 10000 sur facture de 90000")).toBe(90000);
    });
});
