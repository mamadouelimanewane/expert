
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            where: { healthScore: { not: null } },
            orderBy: { healthScore: 'desc' },
            take: 5
        });

        const formatted = clients.map(c => ({
            id: c.id,
            name: c.companyName || "Client Stratégique",
            sector: c.sector || "Activité Diversifiée",
            score: c.healthScore,
            rating: c.rating || "A",
            ratios: [
                { label: "Liquidité Générale", value: Math.floor(Math.random() * 20) + 70, ideal: 90, color: "text-blue-400" },
                { label: "Solvabilité", value: Math.floor(Math.random() * 20) + 60, ideal: 75, color: "text-indigo-400" },
                { label: "Rentabilité Net", value: Math.floor(Math.random() * 15) + 20, ideal: 30, color: "text-emerald-400" },
                { label: "Conformité Fiscale", value: 95, ideal: 100, color: "text-cyan-400" },
            ]
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("[API Health] Error:", error);
        return NextResponse.json({ error: "Failed to fetch health data" }, { status: 500 });
    }
}
