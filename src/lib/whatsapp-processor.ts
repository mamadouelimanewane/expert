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

  // Une écriture avec TVA comporte trois lignes. `TpeJournal` n'en stocke que
  // deux par enregistrement : on la décompose en couples débit/crédit
  // équilibrés, sans quoi la ligne de TVA serait perdue et la charge
  // enregistrée pour son montant TTC.
  const couples = AccountingEngine.toPairedEntries(accountingResult.lignes);
  const periode = new Date().toISOString().substring(0, 7);
  const dateJour = new Date().toISOString().substring(0, 10);

  await prisma.tpeJournal.createMany({
    data: couples.map((couple, index) => ({
      periode,
      businessName: client.companyName || `${client.firstName} ${client.lastName}`,
      date: dateJour,
      // Le libellé porte le rang de la ligne quand l'écriture en compte
      // plusieurs, pour que le rapprochement reste lisible en révision.
      libelle: couples.length > 1 ? `${libelle} (${index + 1}/${couples.length})` : libelle,
      // Les colonnes entree/sortie ne portent le flux de trésorerie que sur la
      // première ligne, afin de ne pas compter l'encaissement plusieurs fois.
      entree: index === 0 && isRecette ? montant : 0,
      sortie: index === 0 && !isRecette ? montant : 0,
      source: simulate ? "WHATSAPP_TEST" : "WHATSAPP",
      debitCompte: couple.debitCompte,
      debitIntitule: couple.debitIntitule,
      creditCompte: couple.creditCompte,
      creditIntitule: couple.creditIntitule,
      montant: couple.montant,
      clientId: client.id,
      status: "PENDING",
    })),
  });

  // Une simulation ne doit jamais déclencher un vrai envoi WhatsApp au client.
  const shouldReply = !simulate && isWhatsAppConfigured();
  if (shouldReply) {
    try {
      const montantLabel = montant > 0 ? `${montant.toLocaleString("fr-FR")} FCFA` : "montant à préciser";
      // Ne pas afficher « confiance 0 % » : quand l'imputation n'a pas pu être
      // déterminée, on annonce une revue par le cabinet plutôt qu'un score.
      const suffixe = accountingResult.requiresReview
        ? "Imputation à confirmer par votre comptable."
        : `Confiance : ${Math.round((accountingResult.confidence ?? 0) * 100)}%.`;
      await sendWhatsAppMessage(
        senderPhone,
        `✅ Écriture enregistrée : "${libelle}" (${montantLabel}). ${suffixe}`
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
    requiresReview: accountingResult.requiresReview,
    reviewReason: accountingResult.reviewReason,
    lignesJournal: couples.length,
    replySent: shouldReply,
    simulated: simulate,
  };
}
