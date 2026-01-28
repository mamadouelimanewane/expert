import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ExportService } from "@/lib/export-service";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "excel"; // excel, fec
        const clientId = searchParams.get("clientId");

        // Récupérer les documents traités pour l'export
        const documents = await prisma.document.findMany({
            where: {
                status: "PROCESSED",
                ...(clientId ? { clientId } : {})
            },
            orderBy: { createdAt: "desc" }
        });

        if (format === "fec") {
            const entries = ExportService.mapDocumentsToEntries(documents);
            const fecContent = ExportService.generateFEC(entries);

            return new Response(fecContent, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="export_fec_${new Date().getTime()}.txt"`
                }
            });
        } else {
            // Excel par défaut
            const entries = ExportService.mapDocumentsToEntries(documents);
            const excelBuffer = ExportService.generateExcel(entries, "Export_Comptable");

            return new Response(new Uint8Array(excelBuffer), {
                headers: {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": `attachment; filename="export_comptable_${new Date().getTime()}.xlsx"`
                }
            });
        }

    } catch (error) {
        console.error("[Export API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
    }
}
