import { describe, expect, it } from "vitest";
import { OCREngine } from "@/lib/ocr-engine";
import { normaliserPeriode } from "@/lib/validation";

describe("OCREngine.parseInvoiceData — numéro, date, fournisseur", () => {
    it("ne prend plus le « N » de « N° » pour un numéro de facture", () => {
        const d = OCREngine.parseInvoiceData("FACTURE N° 2026-117\nFournisseur SARR ET FRERES\nMontant HT 100000 FCFA TVA 18000\nTOTAL TTC 118000 FCFA");
        expect(d.invoiceNumber).toBe("2026-117");
        expect(d.supplier).toBe("SARR ET FRERES");
        expect(d.totalHT).toBe(100000);
        expect(d.totalTTC).toBe(118000);
    });

    it("lit « Facture no : F-0042 » et une date « Date : 12/09/2026 »", () => {
        const d = OCREngine.parseInvoiceData("Facture no : F-0042\nDate : 12/09/2026\nSENELEC SA\nTotal TTC : 45 000");
        expect(d.invoiceNumber).toBe("F-0042");
        expect(d.date).toBe("12/09/2026");
    });

    it("retient comme fournisseur la première ligne qui n'est pas l'en-tête FACTURE", () => {
        const d = OCREngine.parseInvoiceData("FACTURE\nQUINCAILLERIE DIOP & FILS\nLe 05/03/2026\nTotal HT 250000");
        expect(d.supplier).toBe("QUINCAILLERIE DIOP & FILS");
        expect(d.date).toBe("05/03/2026");
    });

    it("préfère une mention explicite « Émetteur : »", () => {
        const d = OCREngine.parseInvoiceData("PROFORMA 12\nÉmetteur : Teranga Tech Solutions\nTotal HT 10000");
        expect(d.supplier).toBe("Teranga Tech Solutions");
    });
});

describe("normaliserPeriode", () => {
    it("ramène toutes les formes courantes à AAAA-MM", () => {
        expect(normaliserPeriode("2026-06")).toBe("2026-06");
        expect(normaliserPeriode("2026-6")).toBe("2026-06");
        expect(normaliserPeriode("06/2026")).toBe("2026-06");
        expect(normaliserPeriode("JUIN-2026")).toBe("2026-06");
        expect(normaliserPeriode("juin 2026")).toBe("2026-06");
        expect(normaliserPeriode("Sept-2026")).toBe("2026-09");
        expect(normaliserPeriode("Décembre 2025")).toBe("2025-12");
    });
    it("refuse l'illisible", () => {
        expect(normaliserPeriode("2026-13")).toBeNull();
        expect(normaliserPeriode("PERIODE-INCONNUE")).toBeNull();
        expect(normaliserPeriode(42)).toBeNull();
    });
});
