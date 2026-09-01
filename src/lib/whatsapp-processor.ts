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
/**
 * Montant porté par un message libre.
 *
 * L'expression précédente — `text.match(/(\d[\d\s,]*)/)` — retenait la
 * PREMIÈRE suite de chiffres du message : « Vente 3 sacs de riz 45000 » était
 * comptabilisée pour 3 FCFA, et « Le 15/03 vente 50000 » pour 15. Le
 * `.replace(",", ".")` ne remplaçait par ailleurs que la première virgule.
 *
 * On retient désormais le plus grand nombre du message, qui est le montant
 * dans la formulation usuelle (« achat 2 sacs ciment 12000 »), et `null`
 * quand aucun nombre n'apparaît.
 */
export function extraireMontant(texte: string): number | null {
  if (!texte) return null;

  // Nombres avec séparateurs de milliers (espace, espace insécable, point) et
  // décimale française ou anglaise.
  const candidats = texte.match(/\d[\d\s\u00a0\u202f.,]*/g);
  if (!candidats) return null;

  let meilleur: number | null = null;

  for (const brut of candidats) {
    const nettoye = brut.replace(/[\s\u00a0\u202f]/g, "").replace(/[.,]$/, "");
    if (nettoye === "") continue;

    // Dernier séparateur suivi de 1 ou 2 chiffres = décimale ; sinon milliers.
    const decimale = /[.,]\d{1,2}$/.test(nettoye);
    let normalise: string;
    if (decimale) {
      const position = Math.max(nettoye.lastIndexOf("."), nettoye.lastIndexOf(","));
      normalise = nettoye.slice(0, position).replace(/[.,]/g, "") + "." + nettoye.slice(position + 1);
    } else {
      normalise = nettoye.replace(/[.,]/g, "");
    }

    const valeur = Number(normalise);
    if (!Number.isFinite(valeur) || valeur <= 0) continue;
    if (meilleur === null || valeur > meilleur) meilleur = valeur;
  }

  return meilleur;
}

/** Envoie une réponse au client, sauf en simulation et si l'envoi est configuré. */
async function repondreAuClient(telephone: string, simulate: boolean, message: string): Promise<boolean> {
  if (simulate || !isWhatsAppConfigured()) return false;
  try {
    await sendWhatsAppMessage(telephone, message);
    return true;
  } catch (sendError) {
    console.error("[WhatsApp] Échec de l'envoi de la confirmation:", sendError);
    return false;
  }
}

/**
 * Chiffres significatifs d'un numéro de téléphone.
 *
 * Meta transmet l'expéditeur au format international sans signe ni séparateur
 * (« 221771234567 »), alors que les fiches clients portent le numéro tel qu'il
 * a été saisi : « +221 77 123 45 67 », « +225 07 08 09 10 11 »… La recherche
 * étant une comparaison de chaîne exacte, AUCUN client n'était reconnu et tout
 * message entrant tombait en `unknown_client` : la réception WhatsApp était
 * inopérante dès le premier vrai client.
 */
export function chiffresTelephone(brut: string | null | undefined): string {
  return (brut ?? "").replace(/\D/g, "");
}

/**
 * Retrouve le client propriétaire d'un numéro, quel que soit le format de
 * saisie.
 *
 * Deux niveaux de comparaison :
 *   1. tous les chiffres — « +221 77 123 45 67 » == « 221771234567 » ;
 *   2. à défaut, les 9 derniers chiffres, pour les fiches saisies sans
 *      indicatif pays (« 77 123 45 67 ») ; ce repli n'est retenu que s'il
 *      désigne UN SEUL client, faute de quoi l'imputation serait un pari.
 */
export async function trouverClientParTelephone(telephone: string) {
  const cible = chiffresTelephone(telephone);
  if (cible.length < 8) return null;

  const clients = await prisma.client.findMany({
    where: { phone: { not: "" } },
    select: { id: true, phone: true, companyName: true, firstName: true, lastName: true },
  });

  const exact = clients.filter((c) => chiffresTelephone(c.phone) === cible);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) {
    console.warn(`[WhatsApp] ${exact.length} clients partagent le numéro ${cible} : message ignoré.`);
    return null;
  }

  const suffixe = cible.slice(-9);
  const partiels = clients.filter((c) => {
    const chiffres = chiffresTelephone(c.phone);
    return chiffres.length >= 9 && chiffres.slice(-9) === suffixe;
  });

  if (partiels.length === 1) return partiels[0];
  if (partiels.length > 1) {
    console.warn(`[WhatsApp] ${partiels.length} clients correspondent au numéro ${suffixe} : message ignoré.`);
  }
  return null;
}

export async function processIncomingWhatsAppMessage(params: {
  senderPhone: string;
  messageType: WhatsAppMessageType;
  textBody?: string;
  simulate?: boolean;
}) {
  const { senderPhone, messageType, textBody, simulate = false } = params;

  const client = await trouverClientParTelephone(senderPhone);
  if (!client) {
    return { status: "unknown_client" as const };
  }

  // Une image n'est pas traitée : aucun OCR n'est branché sur les pièces jointes
  // WhatsApp. L'implémentation précédente créait malgré tout une écriture
  // comptable à 0 FCFA dans le dossier du client, puis lui répondait
  // « ✅ Écriture enregistrée ».
  if (messageType === "image") {
    await repondreAuClient(
      senderPhone,
      simulate,
      "📎 Photo bien reçue. Elle sera traitée manuellement par votre cabinet : "
        + "aucune écriture n'a été enregistrée automatiquement."
    );
    return { status: "image_non_traitee" as const, clientId: client.id };
  }

  const text = (textBody || "").trim();
  const montant = extraireMontant(text);

  // Sans montant identifiable, aucune écriture n'est créée : l'ancien code
  // laissait `montant` à 0 et enregistrait une écriture nulle, confirmée au
  // client comme une opération comptabilisée.
  if (montant === null) {
    await repondreAuClient(
      senderPhone,
      simulate,
      "❓ Aucun montant n'a pu être identifié dans ce message. "
        + "Renvoyez-le en précisant le montant, par exemple : « Vente 45000 »."
    );
    return { status: "montant_absent" as const, clientId: client.id };
  }

  const isRecette = /vente|encaissement|reçu|client|recette|payé par/i.test(text);
  let libelle = text;

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
  // Ne pas afficher « confiance 0 % » : quand l'imputation n'a pas pu être
  // déterminée, on annonce une revue par le cabinet plutôt qu'un score.
  const suffixe = accountingResult.requiresReview
    ? "Imputation à confirmer par votre comptable."
    : `Confiance : ${Math.round((accountingResult.confidence ?? 0) * 100)}%.`;
  const shouldReply = await repondreAuClient(
    senderPhone,
    simulate,
    `✅ Écriture enregistrée : "${libelle}" (${montant.toLocaleString("fr-FR")} FCFA). ${suffixe}`
  );

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
