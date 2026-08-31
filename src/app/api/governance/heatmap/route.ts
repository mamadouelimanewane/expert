
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

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

        // Les quatre champs de gouvernance sont optionnels au schema : ils valent
        // null tant qu'aucun controle n'a ete fait. Les rabattre sur "valid"
        // affichait comme conforme un client dont l'AG, les mandats, le depot des
        // comptes ou surtout le KYC n'avaient jamais ete verifies — indiscernable
        // d'un client reellement controle. "inconnu" est rendu en gris par la
        // matrice et exclu de l'indice de conformite.
        const formattedClients = clients.map(c => ({
            id: c.id,
            name: c.companyName || "Client Sans Nom",
            status: {
                ag: c.agStatus || "inconnu",
                mandats: c.mandatStatus || "inconnu",
                depot: c.depotComptesStatus || "inconnu",
                kyc: c.kycStatus || "inconnu"
            }
        }));

        return NextResponse.json(formattedClients);
    } catch (error) {
        console.error("[API Heatmap] Error:", error);
        return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
    }
}
