import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get all TPE journals grouped by businessName + periode
        const allJournals = await prisma.tpeJournal.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Group by businessName
        const grouped: Record<string, any> = {};
        for (const j of allJournals) {
            if (!grouped[j.businessName]) {
                grouped[j.businessName] = {
                    businessName: j.businessName,
                    periodes: {},
                    totalEcritures: 0,
                    lastImport: j.createdAt,
                };
            }
            const key = j.periode;
            if (!grouped[j.businessName].periodes[key]) {
                grouped[j.businessName].periodes[key] = {
                    periode: key,
                    count: 0,
                    status: j.status,
                    exportedAt: j.exportedAt,
                    totalEntrees: 0,
                    totalSorties: 0,
                };
            }
            grouped[j.businessName].periodes[key].count++;
            grouped[j.businessName].periodes[key].totalEntrees += j.entree;
            grouped[j.businessName].periodes[key].totalSorties += j.sortie;
            if (j.status === 'EXPORTED') grouped[j.businessName].periodes[key].status = 'EXPORTED';
            grouped[j.businessName].totalEcritures++;
            if (new Date(j.createdAt) > new Date(grouped[j.businessName].lastImport)) {
                grouped[j.businessName].lastImport = j.createdAt;
            }
        }

        const result = Object.values(grouped).map((g: any) => ({
            ...g,
            periodes: Object.values(g.periodes),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Erreur GET TPE Stats:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
