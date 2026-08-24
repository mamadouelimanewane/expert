import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'tous') {
            const statusMap: Record<string, string> = {
                'a_preparer': 'DRAFT',
                'validation': 'PENDING',
                'teletransmise': 'SUBMITTED',
                'payee': 'VALIDATED'
            };
            where.status = statusMap[status] || status;
        }

        const declarations = await prisma.taxDeclaration.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                client: {
                    select: {
                        id: true,
                        companyName: true,
                        firstName: true,
                        lastName: true,
                        country: true
                    }
                }
            }
        });

        // Format for the UI
        const now = new Date();
        const formatted = declarations.map(d => {
            // Risque derive du delai reel avant echeance : ce champ affichait
            // auparavant "faible" pour toutes les declarations, quelle que soit
            // leur date limite ou leur statut.
            const daysUntilDue = (new Date(d.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            let risk: "faible" | "moyen" | "élevé" = "faible";
            if (d.status !== "VALIDATED" && d.status !== "SUBMITTED") {
                if (daysUntilDue < 0) risk = "élevé";
                else if (daysUntilDue <= 7) risk = "moyen";
            }
            return {
                id: d.id,
                client: d.client.companyName || `${d.client.firstName} ${d.client.lastName}`,
                type: d.type as string,
                month: d.period,
                country: d.client.country,
                amountToPay: d.amount ? d.amount.toLocaleString() : "0",
                status: d.status === "VALIDATED" ? "payee" : (d.status === "SUBMITTED" ? "teletransmise" : (d.status === "PENDING" ? "validation" : "a_preparer")),
                deadline: new Date(d.dueDate).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }),
                risk
            };
        });

        const totalToPay = await prisma.taxDeclaration.aggregate({
            _sum: { amount: true },
            where: { status: { in: ['DRAFT', 'PENDING', 'SUBMITTED'] } }
        });

        const nextDeadline = declarations.length > 0 ? new Date(declarations[0].dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'N/A';

        return NextResponse.json({ 
            declarations: formatted,
            kpis: {
                totalToPay: totalToPay._sum.amount || 0,
                nextDeadline: nextDeadline.toUpperCase()
            }
        });
    } catch (error) {
        console.error('❌ Error fetching declarations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch declarations' },
            { status: 500 }
        );
    }
}
