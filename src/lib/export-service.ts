import * as XLSX from "xlsx";
import { format } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// Conversion des pièces numérisées en écritures comptables exportables.
//
// Deux défauts corrigés ici :
//
// 1. Les champs lus n'existaient pas. Le code attendait `ocrData.merchant`,
//    `ocrData.totalTTC`, `ocrData.totalTVA`, `ocrData.invoiceNumber` alors que
//    processUploadedInvoice() stocke `{ success, ocrText, confidence,
//    invoiceData: { supplier, date, invoiceNumber, totalTTC, tva, totalHT } }`.
//    Toutes ces lectures valaient donc `undefined`, et chaque ligne du FEC ou
//    du fichier Excel sortait à 0,00 au débit comme au crédit, libellée
//    « Fournisseur » / « Facture Inconnue ».
//
// 2. Le sens de la facture était présumé. Toute pièce de type FACTURE était
//    passée en journal d'ACHATS (fournisseur / achats / TVA déductible). Une
//    facture de vente numérisée par le même écran produisait donc des écritures
//    d'achat avec TVA récupérable — l'inverse exact de la réalité. Le sens est
//    désormais une donnée explicite ; sans elle, la pièce n'est pas exportée et
//    est signalée à l'appelant.
//
// Les comptes suivent le SYSCOHADA, comme le moteur d'imputation
// (src/lib/accounting-engine.ts) : 401/601/4452 à l'achat, 411/701/4431 à la
// vente. Le code précédent utilisait le PCG français (445660), incohérent avec
// le reste de l'application.
// ─────────────────────────────────────────────────────────────────────────────

export type SensFacture = "achat" | "vente";

interface DonneesFacture {
    supplier?: string;
    date?: string;
    invoiceNumber?: string;
    totalTTC?: number;
    totalHT?: number;
    tva?: number;
}

interface OcrDocument {
    id?: string;
    type?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ocrData?: any;
    createdAt?: string | Date;
    originalName?: string;
}

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

export interface ResultatMapping {
    entries: AccountingEntry[];
    /** Pièces écartées, avec le motif : l'export ne doit jamais être amputé en silence. */
    piecesEcartees: { document: string; motif: string }[];
}

const COMPTES = {
    achat: {
        journal: "HA",
        tiers: { numero: "401", libelle: "Fournisseurs" },
        contrepartie: { numero: "601", libelle: "Achats de marchandises" },
        tva: { numero: "4452", libelle: "État, TVA récupérable" },
    },
    vente: {
        journal: "VE",
        tiers: { numero: "411", libelle: "Clients" },
        contrepartie: { numero: "701", libelle: "Ventes de marchandises" },
        tva: { numero: "4431", libelle: "État, TVA facturée" },
    },
} as const;

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
     * Génère un fichier Excel à partir d'un tableau d'objets.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static generateExcel(data: any[], sheetName = "Données"): Buffer {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    }

    static mapDocumentsToEntries(documents: OcrDocument[]): ResultatMapping {
        const entries: AccountingEntry[] = [];
        const piecesEcartees: { document: string; motif: string }[] = [];

        for (const doc of documents) {
            const nom = doc.originalName || doc.id || "Pièce sans nom";

            if (doc.type !== "FACTURE") continue;

            const ocr = doc.ocrData as { invoiceData?: DonneesFacture; sens?: string } | null | undefined;
            const facture: DonneesFacture | undefined = ocr?.invoiceData;

            if (!facture) {
                piecesEcartees.push({ document: nom, motif: "Aucune donnée extraite par l'OCR." });
                continue;
            }

            const sens = ocr?.sens === "achat" || ocr?.sens === "vente" ? (ocr.sens as SensFacture) : null;
            if (!sens) {
                piecesEcartees.push({
                    document: nom,
                    motif: "Sens de la facture non renseigné (achat ou vente) : l'imputation ne peut pas être déduite.",
                });
                continue;
            }

            const totalTTC = Number(facture.totalTTC ?? 0);
            const tva = Number(facture.tva ?? 0);
            if (!Number.isFinite(totalTTC) || totalTTC <= 0) {
                piecesEcartees.push({ document: nom, motif: "Montant TTC absent ou illisible." });
                continue;
            }
            const montantTVA = Number.isFinite(tva) && tva > 0 ? tva : 0;
            const montantHT = Number((totalTTC - montantTVA).toFixed(2));

            const dateBrute = facture.date ? new Date(facture.date) : new Date(doc.createdAt ?? Date.now());
            const date = isNaN(dateBrute.getTime()) ? new Date(doc.createdAt ?? Date.now()) : dateBrute;

            const plan = COMPTES[sens];
            const reference = facture.invoiceNumber || nom;
            const description = `Facture ${facture.invoiceNumber || nom}`;
            const tiers = facture.supplier || plan.tiers.libelle;

            // Tiers : TTC (crédit à l'achat, débit à la vente)
            entries.push({
                date,
                journal: plan.journal,
                accountNumber: plan.tiers.numero,
                accountLabel: tiers,
                description,
                reference,
                debit: sens === "vente" ? totalTTC : 0,
                credit: sens === "achat" ? totalTTC : 0,
            });

            // Contrepartie : HT (débit à l'achat, crédit à la vente)
            entries.push({
                date,
                journal: plan.journal,
                accountNumber: plan.contrepartie.numero,
                accountLabel: plan.contrepartie.libelle,
                description,
                reference,
                debit: sens === "achat" ? montantHT : 0,
                credit: sens === "vente" ? montantHT : 0,
            });

            // TVA : récupérable au débit à l'achat, facturée au crédit à la vente
            if (montantTVA > 0) {
                entries.push({
                    date,
                    journal: plan.journal,
                    accountNumber: plan.tva.numero,
                    accountLabel: plan.tva.libelle,
                    description: `TVA ${description}`,
                    reference,
                    debit: sens === "achat" ? montantTVA : 0,
                    credit: sens === "vente" ? montantTVA : 0,
                });
            }
        }

        return { entries, piecesEcartees };
    }
}
