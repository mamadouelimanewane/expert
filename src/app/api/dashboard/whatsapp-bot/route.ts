import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Lit les communications WhatsApp réellement enregistrées (Communication.type === "whatsapp").
// Aucune intégration WhatsApp Business API n'est câblée : ce endpoint expose uniquement les
// messages déjà stockés en base (le cas échéant), il n'en génère jamais de faux.
export async function GET() {
  try {
    const messages = await prisma.communication.findMany({
      where: { type: "whatsapp" },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json({
      messages,
      isConfigured: !!process.env.WHATSAPP_VERIFY_TOKEN,
      canSimulate: process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    console.error("[API whatsapp-bot] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
