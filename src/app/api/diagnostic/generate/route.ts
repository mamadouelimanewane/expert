import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DiagnosticService } from "@/lib/diagnostic";

export async function POST(request: Request) {
    try {
        const { clientId } = await request.json();

        let targetClientId = clientId;
        // Si pas d'ID valide, on prend le client SIB par défaut pour la démo
        if (!targetClientId || targetClientId.length !== 24) {
            const firstClient = await prisma.client.findFirst({
                where: { companyName: { contains: "Ivoirienne" } }
            });
            targetClientId = firstClient?.id || null;
        }

        if (!targetClientId) {
            return NextResponse.json({ error: "ClientId requis" }, { status: 400 });
        }

        const diagnostic = await DiagnosticService.getDiagnosticForClient(targetClientId);

        if (!diagnostic) {
            return NextResponse.json({ 
                error: "Données financières insuffisantes pour générer un diagnostic réel pour ce client." 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            diagnostic
        });

    } catch (error) {
        console.error("[Diagnostic API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du diagnostic" }, { status: 500 });
    }
}
