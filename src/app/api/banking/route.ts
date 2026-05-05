import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Agrégation des factures pour les KPIs bancaires
        const [paidInvoices, pendingInvoices, overdueInvoices] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'SENT' } }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'OVERDUE' } }),
        ]);

        const recentInvoices = await prisma.invoice.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' },
            where: { status: { in: ['PAID', 'SENT', 'OVERDUE'] } },
            include: {
                client: { select: { companyName: true, firstName: true, lastName: true, type: true } }
            },
        });

        // Transactions simulées enrichies avec données réelles
        const transactions = recentInvoices.map((inv, i) => ({
            id: `TR-${String(i + 1).padStart(3, '0')}`,
            date: new Date(inv.updatedAt).toLocaleDateString('fr-FR'),
            description: `${inv.status === 'PAID' ? 'Encaissement' : 'Facture'} — ${inv.client?.companyName || 'Client'}`,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.total.toLocaleString('fr-FR'),
            amountRaw: inv.total,
            type: inv.status === 'PAID' ? 'Crédit' : 'Débit',
            matchStatus: inv.status === 'PAID' ? 'Matching IA 98%' : inv.status === 'OVERDUE' ? 'Non réconcilié' : 'Partiel',
            category: 'Honoraires',
        }));

        return NextResponse.json({
            kpis: {
                encaisse: paidInvoices._sum.total || 0,
                enAttente: pendingInvoices._sum.total || 0,
                enRetard: overdueInvoices._sum.total || 0,
                totalTransactions: recentInvoices.length,
            },
            transactions,
        });
    } catch (error) {
        console.error('❌ Error fetching banking data:', error);
        return NextResponse.json({ error: 'Failed to fetch banking data' }, { status: 500 });
    }
}
