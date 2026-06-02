import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to get or create a default client to attach transactions to
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
        const transactions = await prisma.mobileMoneyTransaction.findMany({
            orderBy: { transactionDate: 'desc' }
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Erreur GET MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const client = await getDefaultClient();
        
        const tx = await prisma.mobileMoneyTransaction.create({
            data: {
                operator: data.operator || 'Wave',
                reference: 'REF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                senderName: data.senderName || 'Client Inconnu',
                senderPhone: data.senderPhone || '+225 00000000',
                amount: parseFloat(data.amount) || 150000,
                type: data.type || 'IN',
                status: 'PENDING',
                transactionDate: new Date(),
                clientId: client.id
            }
        });
        
        return NextResponse.json(tx, { status: 201 });
    } catch (error) {
        console.error("Erreur POST MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH() {
    try {
        // IA Reconciliation simulation: mark all PENDING as RECONCILED
        const result = await prisma.mobileMoneyTransaction.updateMany({
            where: { status: 'PENDING' },
            data: { status: 'RECONCILED', reconciledAt: new Date() }
        });
        
        return NextResponse.json({ message: `${result.count} transactions rapprochées avec succès.` });
    } catch (error) {
        console.error("Erreur PATCH MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
