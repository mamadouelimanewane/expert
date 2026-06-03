import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AccountingEngine } from '@/lib/accounting-engine';

/**
 * Webhook WhatsApp (Mock).
 * En production, ce endpoint est configuré dans la Meta API / Twilio.
 * Il reçoit les messages des clients PMI (texte, image de facture, audio).
 */
export async function GET(req: Request) {
  // Vérification du webhook (handshake Meta)
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "cabinet360_secret";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
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

    // Trouver le client par son numéro de téléphone
    const client = await prisma.client.findFirst({
      where: { phone: senderPhone }
    });

    if (!client) {
      console.log(`[WhatsApp] Numéro inconnu: ${senderPhone}. Ignoré.`);
      return NextResponse.json({ status: "unknown_client" });
    }

    let libelle = "Opération via WhatsApp";
    let montant = 0;
    let isRecette = false;

    // --- Traitement selon le type de message ---
    if (messageType === "text") {
      const text = message.text?.body || "";

      // Extraction simple du montant depuis le texte
      const amountMatch = text.match(/(\d[\d\s,]*)/);
      if (amountMatch) {
        montant = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
      }

      // Détection recette vs dépense
      isRecette = /vente|encaissement|reçu|client|recette|payé par/i.test(text);
      libelle = text.trim();
    }

    if (messageType === "image") {
      // En production : télécharger l'image, envoyer à l'OCR Engine
      // Pour le mock : on génère une opération générique
      libelle = "Facture via WhatsApp (OCR à traiter)";
      montant = 0; // Sera rempli par l'OCR
    }

    // --- Traitement comptable via le moteur IA ---
    const accountingResult = await AccountingEngine.processEntry(
      libelle,
      isRecette ? montant : 0,
      isRecette ? 0 : montant,
      client.id
    );

    // --- Sauvegarde dans TpeJournal ---
    await prisma.tpeJournal.create({
      data: {
        periode: new Date().toISOString().substring(0, 7),
        businessName: client.companyName || `${client.firstName} ${client.lastName}`,
        date: new Date().toISOString().substring(0, 10),
        libelle,
        entree: isRecette ? montant : 0,
        sortie: isRecette ? 0 : montant,
        debitCompte: accountingResult.lignes[0]?.compte || "",
        debitIntitule: accountingResult.lignes[0]?.intitule || "",
        creditCompte: accountingResult.lignes[accountingResult.lignes.length - 1]?.compte || "",
        creditIntitule: accountingResult.lignes[accountingResult.lignes.length - 1]?.intitule || "",
        montant,
        clientId: client.id,
        status: "PENDING",
      }
    });

    console.log(`[WhatsApp] ✅ Écriture créée pour ${client.companyName} (${senderPhone}) - "${libelle}"`);

    return NextResponse.json({ status: "processed", clientId: client.id, libelle, confidence: accountingResult.confidence });

  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
