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
            // Mapping UI status to Prisma status
            const statusMap: Record<string, string> = {
                'payee': 'PAID',
                'en_attente': 'SENT',
                'retard': 'OVERDUE',
                'brouillon': 'DRAFT'
            };
            where.status = statusMap[status] || status;
        }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: {
                        id: true,
                        companyName: true,
                    }
                }
            }
        });

        // Calcul des KPIs
        const totalPaid = await prisma.invoice.aggregate({
            _sum: { total: true },
            where: { status: 'PAID' }
        });

        const totalPending = await prisma.invoice.aggregate({
            _sum: { total: true },
            where: { OR: [{ status: 'SENT' }, { status: 'OVERDUE' }] }
        });

        const overdueCount = await prisma.invoice.count({
            where: { status: 'OVERDUE' }
        });

        return NextResponse.json({
            invoices,
            kpis: {
                paid: totalPaid._sum.total || 0,
                pending: totalPending._sum.total || 0,
                overdueCount
            }
        });
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
