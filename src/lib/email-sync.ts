import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import prisma from "./prisma";

export function isEmailSyncConfigured() {
  return !!process.env.IMAP_HOST && !!process.env.IMAP_USER && !!process.env.IMAP_PASSWORD;
}

/**
 * Se connecte à la boîte mail réelle par IMAP et synchronise les derniers
 * messages du dossier INBOX dans Communication (type="email"). Lève une
 * erreur explicite si l'intégration n'est pas configurée — jamais de
 * simulation d'emails.
 */
export async function syncInbox(limit = 20): Promise<{ synced: number; skipped: number }> {
  if (!isEmailSyncConfigured()) {
    throw new Error(
      "Synchronisation email non configurée. Ajoutez IMAP_HOST, IMAP_USER et IMAP_PASSWORD (mot de passe d'application) dans les variables d'environnement."
    );
  }

  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASSWORD!,
    },
    logger: false,
  });

  let synced = 0;
  let skipped = 0;

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const status = await client.status("INBOX", { messages: true });
      const total = status.messages || 0;
      if (total === 0) return { synced: 0, skipped: 0 };

      const startSeq = Math.max(1, total - limit + 1);

      for await (const message of client.fetch(`${startSeq}:${total}`, { envelope: true, source: true, uid: true })) {
        const existing = await prisma.communication.findFirst({
          where: { type: "email", tags: { has: `imap-uid-${message.uid}` } },
        });
        if (existing) {
          skipped++;
          continue;
        }

        const parsed = message.source ? await simpleParser(message.source) : null;
        const fromAddress = message.envelope?.from?.[0];
        const senderLabel = fromAddress ? (fromAddress.name || fromAddress.address || "Expéditeur inconnu") : "Expéditeur inconnu";
        const bodyText = parsed?.text || parsed?.html?.toString() || "";

        await prisma.communication.create({
          data: {
            type: "email",
            sender: senderLabel,
            subject: message.envelope?.subject || "(Sans objet)",
            preview: bodyText.slice(0, 200),
            content: bodyText.slice(0, 5000),
            date: message.envelope?.date || new Date(),
            read: false,
            tags: [`imap-uid-${message.uid}`],
          },
        });
        synced++;
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return { synced, skipped };
}
