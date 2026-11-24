import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
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
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const body = await req.json().catch(() => ({}));
    const { clientId, message } = body as { clientId?: string; message?: string };

    if (clientId && !isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    const client = clientId
      ? await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId } })
      : await prisma.client.findFirst({ where: { cabinetId: session.cabinetId, phone: { not: "" } }, orderBy: { createdAt: "desc" } });

    if (!client) {
      return NextResponse.json({ error: "Aucun client avec un numéro de téléphone trouvé pour la simulation" }, { status: 404 });
    }

    const result = await processIncomingWhatsAppMessage({
      senderPhone: client.phone,
      messageType: "text",
      textBody: message || "Vente au comptant 25000 FCFA, paiement reçu par le client ce jour",
      simulate: true,
      cabinetId: session.cabinetId,
      clientId: client.id,
    });

    return NextResponse.json({ simulated: true, client: { id: client.id, phone: client.phone, name: client.companyName || `${client.firstName} ${client.lastName}` }, result });
  } catch (error: unknown) {
    console.error("[WhatsApp Simulate] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
