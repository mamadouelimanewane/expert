import { NextResponse } from "next/server";
import { NetworkService } from "@/lib/network";

export async function POST(request: Request) {
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
