import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processIncomingWhatsAppMessage } from "@/lib/whatsapp-processor";

/**
 * Endpoint de TEST INTERNE : simule la réception d'un message WhatsApp réel
 * (texte) pour un client existant, en exerçant exactement le même code de
 * traitement que le vrai webhook Meta (voir /api/webhooks/whatsapp). Sert à
 * valider le pipeline (reconnaissance client → écriture comptable → réponse)
 * sans attendre la configuration de l'intégration Meta Cloud API.
 * Désactivé en production et réservé aux utilisateurs authentifiés.
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Simulation désactivée en production" }, { status: 403 });
    }
    await AuthService.requireAuth();

    const body = await req.json().catch(() => ({}));
    const { clientId, message } = body as { clientId?: string; message?: string };

    const client = clientId
      ? await prisma.client.findUnique({ where: { id: clientId } })
      : await prisma.client.findFirst({ where: { phone: { not: "" } }, orderBy: { createdAt: "desc" } });

    if (!client) {
      return NextResponse.json({ error: "Aucun client avec un numéro de téléphone trouvé pour la simulation" }, { status: 404 });
    }

    const result = await processIncomingWhatsAppMessage({
      senderPhone: client.phone,
      messageType: "text",
      textBody: message || "Vente au comptant 25000 FCFA, paiement reçu par le client ce jour",
      simulate: true,
    });

    return NextResponse.json({ simulated: true, client: { id: client.id, phone: client.phone, name: client.companyName || `${client.firstName} ${client.lastName}` }, result });
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[WhatsApp Simulate] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
