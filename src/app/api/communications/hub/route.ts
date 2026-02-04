
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const messages = await prisma.communication.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });

        // Mapping to match the Communication Page UI
        const formattedMessages = messages.map(m => ({
            id: m.id,
            sender: m.sender,
            avatar: m.avatar || m.sender.charAt(0),
            subject: m.subject || "Sans Objet",
            preview: m.preview || m.content.substring(0, 50) + "...",
            date: m.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            type: m.type,
            read: m.read,
            tags: m.tags
        }));

        return NextResponse.json(formattedMessages);
    } catch (error) {
        console.error("[API Communications] Error:", error);
        return NextResponse.json({ error: "Failed to fetch communications data" }, { status: 500 });
    }
}
