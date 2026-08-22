import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
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
            prisma.document.findMany({ select: { ocrData: true, status: true } }),
        ]);

        const totalRows = allForRows.reduce((sum, d) => {
            const ocr = d.ocrData as any;
            const entries = ocr && typeof ocr === 'object' && typeof ocr.entries === 'number' ? ocr.entries : 0;
            return sum + entries;
        }, 0);
        const errorCount = allForRows.filter(d => d.status === 'ERROR').length;
        const successRatePct = totalCount > 0 ? Math.round(((totalCount - errorCount) / totalCount) * 100) : null;

        const datasets = documents.map(doc => ({
            id: doc.id,
            name: doc.fileName,
            type: doc.type === "RELEVE_BANCAIRE" ? "Grand Livre" : (doc.type === "FACTURE" ? "FEC" : (doc.type === "RAPPORT" ? "Balance" : "Social")),
            size: (doc.fileSize / (1024 * 1024)).toFixed(1) + " MB",
            date: new Date(doc.createdAt).toLocaleDateString("fr-FR"),
            status: doc.status === "PROCESSED" ? "Prêt" : (doc.status === "PROCESSING" ? "Traitement..." : (doc.status === "ERROR" ? "Erreur" : "Importé")),
            // Extract from JSON or rough estimation
            rows: doc.ocrData && (doc.ocrData as any).entries ? (doc.ocrData as any).entries : 0
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
