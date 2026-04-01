import { NextResponse } from "next/server";
import { AuditService } from "@/lib/audit";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let clientId = searchParams.get("clientId");

    // Si pas de clientId, on prend le premier client pour la démo
    if (!clientId) {
        const firstClient = await prisma.client.findFirst();
        clientId = firstClient?.id || null;
    }

    if (!clientId) {
        return NextResponse.json({ error: "Aucun client trouvé" }, { status: 404 });
    }

    try {
        const riskData = await AuditService.calculateRiskScore(clientId);
        return NextResponse.json(riskData);
    } catch (error) {
        console.error("[Risk API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du calcul du risque" }, { status: 500 });
    }
}
