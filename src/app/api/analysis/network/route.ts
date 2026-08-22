import { NextResponse } from "next/server";
import { NetworkService } from "@/lib/network";

import { requireStaff } from "@/lib/api-auth";
export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { clientId } = await request.json();

        const data = await NetworkService.getNetworkData(clientId);

        return NextResponse.json({
            success: true,
            network: data
        });

    } catch (error) {
        console.error("[Network API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la génération du réseau" }, { status: 500 });
    }
}
