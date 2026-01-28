import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface AccountingEntry {
    date: Date;
    journal: string;
    accountNumber: string;
    accountLabel: string;
    description: string;
    reference: string;
    debit: number;
    credit: number;
}

export class ExportService {
    /**
     * Génère un fichier FEC (Fichier des Écritures Comptables) au format texte délimité
     * Format standard OHADA / France adapté pour les logiciels comptables
     */
    static generateFEC(entries: AccountingEntry[]): string {
        const headers = [
            "JournalCode", "JournalLib", "EcritureNum", "EcritureDate",
            "CompteNum", "CompteLib", "CompAuxNum", "CompAuxLib",
            "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit",
            "EcritureLet", "DateLet", "ValidDate", "Montantdevise", "Idevise"
        ];

        let content = headers.join("|") + "\r\n";

        entries.forEach((entry, index) => {
            const row = [
                entry.journal,
                entry.journal === "HA" ? "Achats" : "Ventes",
                index + 1,
                format(entry.date, "yyyyMMdd"),
                entry.accountNumber,
                entry.accountLabel,
                "", "", // Auxiliaire
                entry.reference,
                format(entry.date, "yyyyMMdd"),
                entry.description,
                entry.debit.toFixed(2).replace(".", ","),
                entry.credit.toFixed(2).replace(".", ","),
                "", "", "", "", "" // Champs optionnels
            ];
            content += row.join("|") + "\r\n";
        });

        return content;
    }

    /**
     * Génère un fichier Excel pour le reporting financier
     */
    static generateExcel(data: any[], fileName: string): Buffer {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

        return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    }

    /**
     * Convertit les documents traités par OCR en écritures comptables
     */
    static mapDocumentsToEntries(documents: any[]): AccountingEntry[] {
        const entries: AccountingEntry[] = [];

        documents.forEach(doc => {
            if (doc.type === "FACTURE" && doc.ocrData) {
                const ocr = doc.ocrData;
                const date = ocr.date ? new Date(ocr.date) : new Date(doc.createdAt);

                // Entrée fournisseur (TTC au Crédit)
                entries.push({
                    date,
                    journal: "HA",
                    accountNumber: "401000",
                    accountLabel: ocr.merchant || "Fournisseur",
                    description: `Facture ${ocr.invoiceNumber || "Inconnue"}`,
                    reference: ocr.invoiceNumber || doc.originalName,
                    debit: 0,
                    credit: ocr.totalTTC || 0
                });

                // Entrée charge (HT au Débit)
                entries.push({
                    date,
                    journal: "HA",
                    accountNumber: "601000",
                    accountLabel: "Achats de marchandises",
                    description: `Facture ${ocr.invoiceNumber || "Inconnue"}`,
                    reference: ocr.invoiceNumber || doc.originalName,
                    debit: (ocr.totalTTC || 0) - (ocr.totalTVA || 0),
                    credit: 0
                });

                // Entrée TVA (TVA au Débit)
                if (ocr.totalTVA > 0) {
                    entries.push({
                        date,
                        journal: "HA",
                        accountNumber: "445660",
                        accountLabel: "TVA Déductible",
                        description: `TVA Facture ${ocr.invoiceNumber || "Inconnue"}`,
                        reference: ocr.invoiceNumber || doc.originalName,
                        debit: ocr.totalTVA,
                        credit: 0
                    });
                }
            }
        });

        return entries;
    }
}
