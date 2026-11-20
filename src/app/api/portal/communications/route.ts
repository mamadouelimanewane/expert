import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { portalTokenFromRequest, withPortalClient } from "@/lib/portal-auth";

export async function GET(req: Request) {
  try {
    const response = await withPortalClient(portalTokenFromRequest(req), async (client) => {
      const messages = await prisma.communication.findMany({
        where: { clientId: client.id, type: "portal" }, orderBy: { date: "asc" }, take: 100,
      });
      return NextResponse.json({ messages: messages.map((m) => ({
        id: m.id, sender: m.sender === "client" ? "client" : "accountant", text: m.content,
        time: m.date.toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      })) });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur GET portail communications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = portalTokenFromRequest(req);
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ error: "Message vide" }, { status: 400 });
    if (text.length > 4000) return NextResponse.json({ error: "Message trop long" }, { status: 400 });

    const response = await withPortalClient(token, async (client) => {
      const message = await prisma.communication.create({
        data: { type: "portal", sender: "client", content: text, preview: text.slice(0, 120), clientId: client.id, read: false },
      });
      return NextResponse.json({ message: {
        id: message.id, sender: "client", text: message.content,
        time: message.date.toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      } });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur POST portail communications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
