import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { sendEmail, isEmailSendConfigured } from "@/lib/email-send";
import { AuditService } from "@/lib/audit";

export async function POST(req: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  const body = await req.json();
  const { to, subject, text, html, context } = body;

  if (!to || !subject || !text) {
    return NextResponse.json({ error: "Champs requis manquants (to, subject, text)" }, { status: 400 });
  }

  if (!isEmailSendConfigured()) {
    return NextResponse.json(
      { error: "Envoi d'e-mail non configuré (SMTP_HOST / SMTP_USER / SMTP_PASSWORD manquants)." },
      { status: 503 }
    );
  }

  try {
    const result = await sendEmail({ to, subject, text, html });

    await AuditService.log({
      action: "EMAIL_SENT",
      entity: context?.entity || "EMAIL",
      entityId: context?.entityId || result.messageId,
      details: `E-mail envoyé à ${to} : "${subject}"`,
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("[API Email Send] Error:", error);
    return NextResponse.json({ error: "Échec de l'envoi de l'e-mail." }, { status: 500 });
  }
}
