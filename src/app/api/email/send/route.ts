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
    // La raison réelle est renvoyée à l'appelant : cet endpoint exige déjà une
    // session staff, et un message générique rend l'échec indiagnosticable —
    // impossible de distinguer un mot de passe refusé (EAUTH) d'un port
    // bloqué (ETIMEDOUT) ou d'un serveur injoignable (ECONNREFUSED) sans
    // accès aux journaux du serveur. Les erreurs SMTP ne contiennent jamais
    // le mot de passe, seulement un code et le message du serveur distant.
    const reason = error instanceof Error ? error.message : "Erreur inconnue";
    const code = (error as { code?: string })?.code;
    return NextResponse.json(
      {
        error: "Échec de l'envoi de l'e-mail.",
        reason,
        code: code ?? null,
      },
      { status: 500 }
    );
  }
}
