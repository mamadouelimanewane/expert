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
        const formatted = declarations.map(d => ({
            id: d.id,
            client: d.client.companyName || `${d.client.firstName} ${d.client.lastName}`,
            type: d.type as string,
            month: d.period,
            country: d.client.country,
            amountToPay: d.amount ? d.amount.toLocaleString() : "0",
            status: d.status === "VALIDATED" ? "payee" : (d.status === "SUBMITTED" ? "teletransmise" : (d.status === "PENDING" ? "validation" : "a_preparer")),
            deadline: new Date(d.dueDate).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }),
            risk: "faible" 
        }));

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
