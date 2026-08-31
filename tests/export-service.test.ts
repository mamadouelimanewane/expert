import { describe, expect, it } from "vitest";
import { ExportService } from "@/lib/export-service";

/** Forme réellement stockée par processUploadedInvoice() dans Document.ocrData. */
const piece = (sens: string | null, invoiceData: Record<string, unknown> | null) => ({
    id: "doc1",
    type: "FACTURE",
    originalName: "facture-001.jpg",
    createdAt: "2026-03-10T08:00:00.000Z",
    ocrData: {
        success: true,
        ocrText: "…",
        confidence: 92,
        ...(invoiceData ? { invoiceData } : {}),
        ...(sens ? { sens } : {}),
    },
});

const FACTURE = {
    supplier: "SENELEC",
    date: "2026-03-05",
    invoiceNumber: "F-2026-118",
    totalTTC: 1180000,
    tva: 180000,
    totalHT: 1000000,
};

describe("mapDocumentsToEntries", () => {
    it("lit les montants là où l'OCR les stocke réellement", () => {
        // Le code lisait ocrData.totalTTC / ocrData.totalTVA / ocrData.merchant,
        // qui n'existent pas : toutes les lignes exportées sortaient à 0,00.
        const { entries } = ExportService.mapDocumentsToEntries([piece("achat", FACTURE)]);

        expect(entries).toHaveLength(3);
        expect(entries.some((e) => e.credit === 1180000)).toBe(true);
        expect(entries.some((e) => e.debit === 1000000)).toBe(true);
        expect(entries.some((e) => e.debit === 180000)).toBe(true);
        expect(entries[0].accountLabel).toBe("SENELEC");
        expect(entries[0].reference).toBe("F-2026-118");
    });

    it("impute un achat au plan SYSCOHADA, TVA récupérable au débit", () => {
        const { entries } = ExportService.mapDocumentsToEntries([piece("achat", FACTURE)]);
        const comptes = entries.map((e) => e.accountNumber);

        expect(comptes).toEqual(["401", "601", "4452"]);
        expect(entries.every((e) => e.journal === "HA")).toBe(true);
    });

    it("impute une vente en sens inverse, TVA facturée au crédit", () => {
        // Toute facture était présumée d'achat : une facture de vente produisait
        // des écritures d'achat avec TVA récupérable, l'inverse de la réalité.
        const { entries } = ExportService.mapDocumentsToEntries([piece("vente", FACTURE)]);

        expect(entries.map((e) => e.accountNumber)).toEqual(["411", "701", "4431"]);
        expect(entries.every((e) => e.journal === "VE")).toBe(true);
        expect(entries[0].debit).toBe(1180000); // client débité du TTC
        expect(entries[1].credit).toBe(1000000); // vente créditée du HT
        expect(entries[2].credit).toBe(180000); // TVA facturée au crédit
    });

    it("équilibre la partie double dans les deux sens", () => {
        for (const sens of ["achat", "vente"]) {
            const { entries } = ExportService.mapDocumentsToEntries([piece(sens, FACTURE)]);
            const debit = entries.reduce((s, e) => s + e.debit, 0);
            const credit = entries.reduce((s, e) => s + e.credit, 0);
            expect(debit).toBe(credit);
        }
    });

    it("écarte et signale une pièce dont le sens n'est pas renseigné", () => {
        const { entries, piecesEcartees } = ExportService.mapDocumentsToEntries([piece(null, FACTURE)]);

        expect(entries).toHaveLength(0);
        expect(piecesEcartees).toHaveLength(1);
        expect(piecesEcartees[0].document).toBe("facture-001.jpg");
    });

    it("écarte une pièce sans données OCR ou sans montant, plutôt que d'exporter des zéros", () => {
        const sansOcr = ExportService.mapDocumentsToEntries([piece("achat", null)]);
        expect(sansOcr.entries).toHaveLength(0);
        expect(sansOcr.piecesEcartees).toHaveLength(1);

        const sansMontant = ExportService.mapDocumentsToEntries([
            piece("achat", { ...FACTURE, totalTTC: 0 }),
        ]);
        expect(sansMontant.entries).toHaveLength(0);
        expect(sansMontant.piecesEcartees[0].motif).toContain("TTC");
    });

    it("traite une facture sans TVA sans produire de ligne de TVA nulle", () => {
        const { entries } = ExportService.mapDocumentsToEntries([
            piece("achat", { ...FACTURE, tva: 0, totalTTC: 500000 }),
        ]);

        expect(entries).toHaveLength(2);
        expect(entries[1].debit).toBe(500000);
    });
});
