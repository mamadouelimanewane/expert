
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            where: { healthScore: { not: null } },
            orderBy: { healthScore: 'desc' },
            take: 5,
            include: {
                financialData: { orderBy: { year: 'desc' }, take: 1 },
                tpeJournals: { orderBy: { createdAt: 'desc' }, take: 60 },
                declarations: true,
            }
        });

        const formatted = clients.map(c => {
            const fd = c.financialData[0];
            const totalEntree = c.tpeJournals.reduce((s, j) => s + j.entree, 0);
            const totalSortie = c.tpeJournals.reduce((s, j) => s + j.sortie, 0);

            const liquidite = fd && fd.totalBilan > 0
                ? clamp((fd.netCash / fd.totalBilan) * 100)
                : clamp((totalEntree + totalSortie) > 0 ? (totalEntree / (totalEntree + totalSortie)) * 100 : 0);

            const solvabilite = fd && fd.totalBilan > 0 ? clamp((fd.equity / fd.totalBilan) * 100) : 0;
            const rentabilite = fd && fd.ca > 0 ? clamp((fd.netResult / fd.ca) * 100) : 0;

            const now = new Date();
            const lateDeclarations = c.declarations.filter(d => d.status === 'PENDING' && new Date(d.dueDate) < now).length;
            const conformite = c.declarations.length > 0
                ? clamp(((c.declarations.length - lateDeclarations) / c.declarations.length) * 100)
                : 100;

            return {
                id: c.id,
                name: c.companyName || "Client Stratégique",
                sector: c.sector || "Activité Diversifiée",
                score: c.healthScore,
                rating: c.rating || "A",
                ratios: [
                    { label: "Liquidité Générale", value: liquidite, ideal: 90, color: "text-blue-400" },
                    { label: "Solvabilité", value: solvabilite, ideal: 75, color: "text-indigo-400" },
                    { label: "Rentabilité Net", value: rentabilite, ideal: 30, color: "text-emerald-400" },
                    { label: "Conformité Fiscale", value: conformite, ideal: 100, color: "text-cyan-400" },
                ]
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("[API Health] Error:", error);
        return NextResponse.json({ error: "Failed to fetch health data" }, { status: 500 });
    }
}
