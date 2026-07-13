import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const transactions = await prisma.mobileMoneyTransaction.findMany({
            orderBy: { transactionDate: 'desc' }
        });
        return NextResponse.json({
            transactions,
            canSimulate: process.env.NODE_ENV !== "production",
        });
    } catch (error) {
        console.error("Erreur GET MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation stricte : on n'invente jamais de valeurs par défaut pour des
        // données financières (montant, expéditeur). Le formulaire appelant doit
        // fournir des données réelles.
        const missing: string[] = [];
        if (!data.operator) missing.push('operator');
        if (!data.senderPhone) missing.push('senderPhone');
        if (!data.clientId) missing.push('clientId');
        if (data.amount === undefined || data.amount === null || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) missing.push('amount');
        if (!data.type || !['IN', 'OUT'].includes(data.type)) missing.push('type');

        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Champs requis manquants ou invalides : ${missing.join(', ')}` },
                { status: 400 }
            );
        }

        if (!data.reference) {
            return NextResponse.json(
                { error: "Une référence de transaction réelle (fournie par l'opérateur Mobile Money) est requise." },
                { status: 400 }
            );
        }

        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        const tx = await prisma.mobileMoneyTransaction.create({
            data: {
                operator: data.operator,
                reference: data.reference,
                senderName: data.senderName || null,
                senderPhone: data.senderPhone,
                amount: parseFloat(data.amount),
                type: data.type,
                status: 'PENDING',
                transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
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
    // Le rapprochement automatique nécessite une intégration réelle avec l'API de
    // l'opérateur (Wave/Orange/MTN) pour confirmer chaque transaction individuellement.
    // Aucune logique de correspondance fiable n'est câblée : on ne marque donc plus
    // les transactions en attente comme rapprochées en masse.
    return NextResponse.json(
        { error: "Réconciliation automatique non configurée — intégration opérateur (Wave/Orange/MTN) requise." },
        { status: 501 }
    );
}
