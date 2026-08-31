import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";

// Le type affiche est le libelle du type reel du document. Le mapping precedent
// reetiquetait arbitrairement les documents en artefacts comptables ("FACTURE"
// devenait "FEC", "RELEVE_BANCAIRE" devenait "Grand Livre") et rangeait par
// defaut tout contrat, piece d'identite ou declaration sous "Social".
const LIBELLES_TYPE: Record<string, string> = {
    FACTURE: "Facture",
    RELEVE_BANCAIRE: "Relevé bancaire",
    CONTRAT: "Contrat",
    RAPPORT: "Rapport",
    DECLARATION: "Déclaration",
    PIECE_IDENTITE: "Pièce d'identité",
    AUTRE: "Autre",
};

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const [documents, totalCount, sizeAgg, allForRows] = await Promise.all([
            prisma.document.findMany({
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.document.count(),
            prisma.document.aggregate({ _sum: { fileSize: true } }),
            prisma.document.findMany({ select: { status: true } }),
        ]);

        // `ocrData.entries` n'existe pas : processUploadedInvoice() stocke
        // { success, ocrText, confidence, invoiceData, validation, warnings }.
        // Le compteur valait donc 0 pour toutes les pieces, et l'ecran affichait
        // « Lignes Traitees (OCR) : 0 » comme un resultat mesure. Le nombre de
        // lignes comptables extraites n'est nulle part en base : on ne l'invente
        // pas, on l'affiche comme indisponible.
        const totalRows: number | null = null;
        const errorCount = allForRows.filter(d => d.status === 'ERROR').length;
        const successRatePct = totalCount > 0 ? Math.round(((totalCount - errorCount) / totalCount) * 100) : null;

        const datasets = documents.map(doc => ({
            id: doc.id,
            name: doc.fileName,
            type: LIBELLES_TYPE[doc.type] ?? "Autre",
            size: (doc.fileSize / (1024 * 1024)).toFixed(1) + " MB",
            date: new Date(doc.createdAt).toLocaleDateString("fr-FR"),
            status: doc.status === "PROCESSED" ? "Prêt" : (doc.status === "PROCESSING" ? "Traitement..." : (doc.status === "ERROR" ? "Erreur" : "Importé")),
            rows: null as number | null
        }));

        return NextResponse.json({
            success: true,
            datasets,
            kpis: {
                totalDatasets: totalCount,
                totalStorageBytes: sizeAgg._sum.fileSize || 0,
                totalRows,
                successRatePct,
            },
        });
    } catch (error) {
        console.error("[Datasets API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des datasets" }, { status: 500 });
    }
}
