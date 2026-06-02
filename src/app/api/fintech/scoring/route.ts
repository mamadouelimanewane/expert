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
        
        // Generate a random but realistic score between 400 and 950
        const randomScore = Math.floor(Math.random() * 550) + 400;
        const isEligible = randomScore >= 700;
        
        const factors = {
            paymentHistory: Math.floor(Math.random() * 40) + 60,
            revenueGrowth: Math.floor(Math.random() * 50) + 50,
            debtRatio: Math.floor(Math.random() * 60) + 40,
            clientDiversification: Math.floor(Math.random() * 80) + 20,
        };

        const newScore = await prisma.creditScore.create({
            data: {
                score: randomScore,
                factors: factors,
                isEligible: isEligible,
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
