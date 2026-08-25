import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { id } = await params;
        const client = await prisma.client.findUnique({ where: { id } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        return NextResponse.json({ client });
    } catch (error) {
        console.error("Erreur GET clients/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
