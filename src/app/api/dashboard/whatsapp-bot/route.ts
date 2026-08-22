import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
// Lit les communications WhatsApp réellement enregistrées (Communication.type === "whatsapp").
// Aucune intégration WhatsApp Business API n'est câblée : ce endpoint expose uniquement les
// messages déjà stockés en base (le cas échéant), il n'en génère jamais de faux.
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

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
