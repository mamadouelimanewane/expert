import { NextResponse } from 'next/server';
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp-processor';

/**
 * Webhook WhatsApp — reçoit les messages réels via l'API Meta Cloud (configuré
 * dans Meta Business Suite). Traite le texte/image et confirme par une réponse
 * réelle au client si WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID sont
 * configurés (sinon le traitement continue sans réponse, sans rien simuler).
 */
export async function GET(req: Request) {
  // Vérification du webhook (handshake Meta)
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (VERIFY_TOKEN && mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extraction du message WhatsApp (format Meta API)
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "no_messages" });
    }

    const message = messages[0];
    const senderPhone = message.from; // numéro du client
    const messageType = message.type; // text, image, audio

    const result = await processIncomingWhatsAppMessage({
      senderPhone,
      messageType: messageType === "image" ? "image" : "text",
      textBody: message.text?.body,
    });

    if (result.status === "unknown_client") {
      console.log(`[WhatsApp] Numéro inconnu: ${senderPhone}. Ignoré.`);
      return NextResponse.json(result);
    }

    console.log(`[WhatsApp] ✅ Écriture créée pour ${result.clientName} (${senderPhone}) - "${result.libelle}"`);

    return NextResponse.json(result);

  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
