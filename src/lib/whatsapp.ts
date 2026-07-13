export function isWhatsAppConfigured() {
  return !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
}

/**
 * Envoie un message texte réel via l'API Meta WhatsApp Business Cloud.
 * Lève une erreur explicite si l'intégration n'est pas configurée — jamais
 * de simulation d'envoi réussi.
 */
export async function sendWhatsAppMessage(toPhoneNumber: string, text: string): Promise<{ messageId: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      "Intégration WhatsApp Business non configurée. Ajoutez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID dans les variables d'environnement."
    );
  }

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhoneNumber.replace(/\D/g, ""),
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec de l'envoi WhatsApp (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return { messageId: data.messages?.[0]?.id || "" };
}
