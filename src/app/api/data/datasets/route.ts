import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            include: { client: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const datasets = documents.map(doc => ({
            id: doc.id,
            name: doc.fileName,
            type: doc.type === "RELEVE_BANCAIRE" ? "Grand Livre" : (doc.type === "FACTURE" ? "FEC" : (doc.type === "RAPPORT" ? "Balance" : "Social")),
            size: (doc.fileSize / (1024 * 1024)).toFixed(1) + " MB",
            date: new Date(doc.createdAt).toLocaleDateString("fr-FR"),
            status: doc.status === "PROCESSED" ? "Prêt" : (doc.status === "PROCESSING" ? "Traitement..." : "Importé"),
            // Extract from JSON or rough estimation
            rows: doc.ocrData && (doc.ocrData as any).entries ? (doc.ocrData as any).entries : 0
        }));

        return NextResponse.json({
            success: true,
            datasets
        });
    } catch (error) {
        console.error("[Datasets API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des datasets" }, { status: 500 });
    }
}
