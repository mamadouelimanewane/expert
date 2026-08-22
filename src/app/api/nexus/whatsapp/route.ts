import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isLLMConfigured, askNexus } from '@/lib/llm';

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const communications = await prisma.communication.findMany({
            where: { type: 'whatsapp' },
            orderBy: { date: 'asc' }
        });
        return NextResponse.json({ communications, isLLMConfigured: isLLMConfigured() });
    } catch (error) {
        console.error("Erreur GET WhatsApp:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const data = await request.json();

        // Enregistrement du message utilisateur (sans client fictif : clientId
        // reste null tant qu'aucun client réel n'est associé à la conversation).
        const userMsg = await prisma.communication.create({
            data: {
                type: 'whatsapp',
                sender: data.sender || 'Client',
                content: data.content,
                date: new Date(),
                read: true,
                tags: ['client_msg']
            }
        });

        let iaResponseContent: string;
        if (isLLMConfigured()) {
            try {
                iaResponseContent = await askNexus(
                    data.content,
                    "Tu es Nexus, l'assistant IA du cabinet d'expertise comptable Cabinet 360, répondant sur WhatsApp à un client. Sois concis et professionnel."
                );
            } catch (llmError) {
                console.error("[Nexus WhatsApp] Erreur DeepSeek:", llmError);
                iaResponseContent = "Désolé, une erreur est survenue lors de la génération de la réponse IA. Réessayez dans un instant.";
            }
        } else {
            iaResponseContent = "Nexus IA n'est pas encore connecté à un moteur d'intelligence artificielle (clé DEEPSEEK_API_KEY absente ou compte sans crédit). Configurez l'intégration pour activer les réponses automatiques.";
        }

        const iaMsg = await prisma.communication.create({
            data: {
                type: 'whatsapp',
                sender: 'Nexus IA',
                content: iaResponseContent,
                date: new Date(),
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
