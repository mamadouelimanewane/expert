import prisma from "./prisma";
import { AccountingEngine } from "./accounting-engine";
import { isWhatsAppConfigured, sendWhatsAppMessage } from "./whatsapp";

export type WhatsAppMessageType = "text" | "image";

/**
 * Traite un message WhatsApp entrant réel (texte ou image) : identifie le
 * client par téléphone, génère l'écriture comptable via AccountingEngine,
 * la persiste dans TpeJournal, et répond réellement au client si
 * l'intégration d'envoi est configurée. Utilisé à la fois par le webhook réel
 * (Meta Cloud API) et par la route de simulation pour les tests internes.
 *
 * `simulate: true` marque explicitement l'écriture créée comme un test
 * (source="WHATSAPP_TEST", libellé préfixé "[SIMULATION]") et n'envoie JAMAIS
 * de vrai message WhatsApp au client, même si l'intégration d'envoi est
 * configurée — une simulation ne doit jamais produire d'effet de bord réel
 * vers l'extérieur ni être confondue avec une véritable écriture comptable.
 */
export async function processIncomingWhatsAppMessage(params: {
  senderPhone: string;
  messageType: WhatsAppMessageType;
  textBody?: string;
  simulate?: boolean;
}) {
  const { senderPhone, messageType, textBody, simulate = false } = params;

  const client = await prisma.client.findFirst({ where: { phone: senderPhone } });
  if (!client) {
    return { status: "unknown_client" as const };
  }

  let libelle = "Opération via WhatsApp";
  let montant = 0;
  let isRecette = false;

  if (messageType === "text") {
    const text = textBody || "";
    const amountMatch = text.match(/(\d[\d\s,]*)/);
    if (amountMatch) {
      montant = parseFloat(amountMatch[1].replace(/\s/g, "").replace(",", "."));
    }
    isRecette = /vente|encaissement|reçu|client|recette|payé par/i.test(text);
    libelle = text.trim();
  }

  if (messageType === "image") {
    // En production : télécharger l'image, envoyer à l'OCR Engine.
    libelle = "Facture via WhatsApp (OCR à traiter)";
    montant = 0;
  }

  if (simulate) {
    libelle = `[SIMULATION TEST] ${libelle}`;
  }

  const accountingResult = await AccountingEngine.processEntry(
    libelle,
    isRecette ? montant : 0,
    isRecette ? 0 : montant,
    client.id
  );

  await prisma.tpeJournal.create({
    data: {
      periode: new Date().toISOString().substring(0, 7),
      businessName: client.companyName || `${client.firstName} ${client.lastName}`,
      date: new Date().toISOString().substring(0, 10),
      libelle,
      entree: isRecette ? montant : 0,
      sortie: isRecette ? 0 : montant,
      source: simulate ? "WHATSAPP_TEST" : "WHATSAPP",
      debitCompte: accountingResult.lignes[0]?.compte || "",
      debitIntitule: accountingResult.lignes[0]?.intitule || "",
      creditCompte: accountingResult.lignes[accountingResult.lignes.length - 1]?.compte || "",
      creditIntitule: accountingResult.lignes[accountingResult.lignes.length - 1]?.intitule || "",
      montant,
      clientId: client.id,
      status: "PENDING",
    },
  });

  // Une simulation ne doit jamais déclencher un vrai envoi WhatsApp au client.
  const shouldReply = !simulate && isWhatsAppConfigured();
  if (shouldReply) {
    try {
      const montantLabel = montant > 0 ? `${montant.toLocaleString("fr-FR")} FCFA` : "montant à préciser";
      await sendWhatsAppMessage(
        senderPhone,
        `✅ Écriture enregistrée : "${libelle}" (${montantLabel}). Confiance IA : ${Math.round((accountingResult.confidence ?? 0) * 100)}%.`
      );
    } catch (sendError) {
      console.error("[WhatsApp] Échec de l'envoi de la confirmation:", sendError);
    }
  }

  return {
    status: "processed" as const,
    clientId: client.id,
    clientName: client.companyName || `${client.firstName} ${client.lastName}`,
    libelle,
    montant,
    confidence: accountingResult.confidence,
    replySent: shouldReply,
    simulated: simulate,
  };
}
