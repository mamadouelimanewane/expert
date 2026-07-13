import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getDefaultClient() {
    let client = await prisma.client.findFirst();
    if (!client) {
        client = await prisma.client.create({
            data: {
                type: 'ENTREPRISE',
                companyName: 'Cabinet 360 Client Default',
                email: 'contact@defaultclient.com',
                phone: '+225 00000000',
            }
        });
    }
    return client;
}

export async function GET() {
    try {
        const client = await getDefaultClient();
        const score = await prisma.creditScore.findFirst({
            where: { clientId: client.id },
            orderBy: { evaluatedAt: 'desc' }
        });
        
        return NextResponse.json(score || null);
    } catch (error) {
        console.error("Erreur GET CreditScore:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const client = await getDefaultClient();

        const [invoices, journals, mmTx] = await Promise.all([
            prisma.invoice.findMany({ where: { clientId: client.id } }),
            prisma.tpeJournal.findMany({ where: { clientId: client.id, source: { not: 'WHATSAPP_TEST' } }, orderBy: { createdAt: 'desc' } }),
            prisma.mobileMoneyTransaction.findMany({ where: { clientId: client.id } }),
        ]);

        // 1. Historique de paiement : proportion de factures payées
        const paymentHistory = invoices.length > 0
            ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100)
            : 50;

        // 2. Croissance du CA : comparaison des deux dernières périodes du journal TPE
        const periods = Array.from(new Set(journals.map(j => j.periode))).sort();
        let revenueGrowth = 50;
        if (periods.length >= 2) {
            const lastP = periods[periods.length - 1];
            const prevP = periods[periods.length - 2];
            const lastCA = journals.filter(j => j.periode === lastP).reduce((s, j) => s + j.entree, 0);
            const prevCA = journals.filter(j => j.periode === prevP).reduce((s, j) => s + j.entree, 0);
            revenueGrowth = prevCA > 0 ? Math.max(0, Math.min(100, Math.round(50 + ((lastCA - prevCA) / prevCA) * 100))) : 50;
        }

        // 3. Ratio d'endettement (proxy) : part des sorties dans le flux total
        const totalEntree = journals.reduce((s, j) => s + j.entree, 0);
        const totalSortie = journals.reduce((s, j) => s + j.sortie, 0);
        const debtRatio = (totalEntree + totalSortie) > 0
            ? Math.round(100 - (totalSortie / (totalEntree + totalSortie)) * 100)
            : 50;

        // 4. Diversification des revenus : nombre de canaux d'encaissement distincts utilisés
        const channels = new Set(mmTx.map(t => t.operator));
        const clientDiversification = Math.min(100, 20 + channels.size * 20);

        const score = Math.round(400 + ((paymentHistory + revenueGrowth + debtRatio + clientDiversification) / 400) * 550);
        const isEligible = score >= 700;

        const factors = { paymentHistory, revenueGrowth, debtRatio, clientDiversification };

        const newScore = await prisma.creditScore.create({
            data: {
                score,
                factors,
                isEligible,
                clientId: client.id,
                evaluatedAt: new Date()
            }
        });

        return NextResponse.json(newScore, { status: 201 });
    } catch (error) {
        console.error("Erreur POST CreditScore:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
