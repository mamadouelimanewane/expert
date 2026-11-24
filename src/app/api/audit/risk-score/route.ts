import { NextResponse } from "next/server";
import { AuditService } from "@/lib/audit";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
export async function GET(request: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "Un clientId valide est obligatoire." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) {
        return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    }

    try {
        const riskData = await AuditService.calculateRiskScore(clientId);
        return NextResponse.json(riskData);
    } catch (error) {
        console.error("[Risk API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du calcul du risque" }, { status: 500 });
    }
}
