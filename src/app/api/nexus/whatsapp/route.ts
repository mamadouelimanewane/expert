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
        const communications = await prisma.communication.findMany({
            where: { type: 'whatsapp' },
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(communications);
    } catch (error) {
        console.error("Erreur GET WhatsApp:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const client = await getDefaultClient();
        
        // Save user message
        const userMsg = await prisma.communication.create({
            data: {
                type: 'whatsapp',
                sender: data.sender || 'Client',
                content: data.content,
                clientId: client.id,
                date: new Date(),
                read: true,
                tags: ['client_msg']
            }
        });

        // Simulate IA response
        const iaResponseContent = `✅ C'est noté ! J'ai bien analysé votre message : "${data.content}". L'écriture comptable correspondante sera générée sous peu.`;
        
        const iaMsg = await prisma.communication.create({
            data: {
                type: 'whatsapp',
                sender: 'Nexus IA',
                content: iaResponseContent,
                clientId: client.id,
                date: new Date(new Date().getTime() + 1500), // 1.5s later
                read: true,
                tags: ['ia_msg']
            }
        });
        
        return NextResponse.json({ userMsg, iaMsg }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST WhatsApp:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
