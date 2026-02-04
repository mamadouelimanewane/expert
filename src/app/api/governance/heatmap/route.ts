
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            select: {
                id: true,
                companyName: true,
                agStatus: true,
                mandatStatus: true,
                depotComptesStatus: true,
                kycStatus: true,
                healthScore: true,
                rating: true
            }
        });

        // Mapping to match the Heatmap UI
        const formattedClients = clients.map(c => ({
            id: c.id,
            name: c.companyName || "Client Sans Nom",
            status: {
                ag: c.agStatus || "valid",
                mandats: c.mandatStatus || "valid",
                depot: c.depotComptesStatus || "valid",
                kyc: c.kycStatus || "valid"
            }
        }));

        return NextResponse.json(formattedClients);
    } catch (error) {
        console.error("[API Heatmap] Error:", error);
        return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
    }
}
