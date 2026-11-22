import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/api-auth';

export async function GET(_request: NextRequest) {
    try {
        const { denied } = await requireStaff();
        if (denied) return denied;

        // Agrégation des factures pour les KPIs bancaires
        const [paidInvoices, pendingInvoices, overdueInvoices] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'SENT' } }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'OVERDUE' } }),
        ]);

        const [recentTransactions, totalTransactions] = await Promise.all([
            prisma.bankTransaction.findMany({
                take: 10,
                orderBy: { date: 'desc' },
                select: { id: true, date: true, description: true, amount: true, type: true, status: true, invoiceId: true },
            }),
            prisma.bankTransaction.count(),
        ]);

        const transactions = recentTransactions.map((tx) => ({
            id: tx.id,
            date: tx.date.toISOString(),
            description: tx.description,
            amount: tx.amount,
            amountRaw: tx.amount,
            type: tx.type === 'CREDIT' ? 'Crédit' : 'Débit',
            matchStatus: tx.status === 'RECONCILED' ? 'Lettré' : tx.status === 'IGNORED' ? 'Ignoré' : 'À traiter',
            invoiceId: tx.invoiceId,
        }));

        return NextResponse.json({
            kpis: {
                encaisse: paidInvoices._sum.total || 0,
                enAttente: pendingInvoices._sum.total || 0,
                enRetard: overdueInvoices._sum.total || 0,
                totalTransactions,
            },
            transactions,
        });
    } catch (error) {
        console.error('❌ Error fetching banking data:', error);
        return NextResponse.json({ error: 'Failed to fetch banking data' }, { status: 500 });
    }
}
