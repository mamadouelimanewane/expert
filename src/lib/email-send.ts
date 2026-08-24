import nodemailer from "nodemailer";

export function isEmailSendConfigured() {
  return !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASSWORD;
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });
  }
  return cachedTransporter;
}

/**
 * Envoie un e-mail réel via SMTP. Lève une erreur explicite si l'intégration
 * n'est pas configurée — jamais de faux succès simulé.
 */
export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }): Promise<{ messageId: string }> {
  if (!isEmailSendConfigured()) {
    throw new Error(
      "Envoi d'e-mail non configuré. Ajoutez SMTP_HOST, SMTP_USER et SMTP_PASSWORD (et éventuellement SMTP_PORT / SMTP_SECURE) dans les variables d'environnement."
    );
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });

  return { messageId: info.messageId };
}
