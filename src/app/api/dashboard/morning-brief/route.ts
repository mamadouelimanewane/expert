
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const news = await prisma.newsBrief.findMany({
            orderBy: { date: 'desc' },
            take: 10
        });

        // Mapping to match the Morning Brief UI
        const formattedBriefs = news.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            content: n.content,
            summary: n.summary,
            source: n.source,
            relevance: n.relevance,
            date: n.date.toISOString(),
            isRead: n.isRead
        }));

        return NextResponse.json(formattedBriefs);
    } catch (error) {
        console.error("[API Morning Brief] Error:", error);
        return NextResponse.json({ error: "Failed to fetch briefing data" }, { status: 500 });
    }
}
