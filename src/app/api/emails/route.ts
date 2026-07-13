import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isEmailSyncConfigured } from "@/lib/email-sync";

// Lit les emails réellement synchronisés (Communication.type === "email") via IMAP
// (voir /api/emails/sync). Ce endpoint expose uniquement les messages déjà stockés
// en base, il n'en génère et n'en résume jamais de faux.
export async function GET() {
  try {
    const emails = await prisma.communication.findMany({
      where: { type: "email" },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json({
      emails,
      isConfigured: isEmailSyncConfigured(),
    });
  } catch (error) {
    console.error("[API emails] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
