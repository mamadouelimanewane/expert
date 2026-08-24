import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { sendEmail, isEmailSendConfigured } from "@/lib/email-send";

import { requireStaff } from "@/lib/api-auth";
function stageFor(daysOverdue: number) {
  if (daysOverdue >= 90) return 4;
  if (daysOverdue >= 60) return 3;
  if (daysOverdue >= 45) return 2;
  return 1;
}

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const now = new Date();
    const overdue = await prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "OVERDUE"] },
        dueDate: { lt: now },
      },
      include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
      orderBy: { dueDate: "asc" },
    });

    const invoices = overdue.map((inv) => {
      const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        client: inv.client.companyName || `${inv.client.firstName ?? ""} ${inv.client.lastName ?? ""}`.trim(),
        amount: inv.total,
        daysOverdue,
        stage: stageFor(daysOverdue),
      };
    });

    const stats = {
      count: invoices.length,
      amount: invoices.reduce((s, i) => s + i.amount, 0),
    };

    const logs = await prisma.auditLog.findMany({
      where: { entity: "INVOICE", action: "REMINDER_SENT" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const history = logs.map((l) => ({
      id: l.id,
      date: l.createdAt.toLocaleDateString("fr-FR"),
      details: l.details || "",
    }));

    return NextResponse.json({ stats, invoices, history });
  } catch (error) {
    console.error("Erreur GET invoices/relances:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Envoie reellement la relance par e-mail (SMTP) quand l'integration est
// configuree, et trace l'action dans le journal d'audit dans tous les cas.
// Avant ce correctif, l'endpoint ne faisait que journaliser un log
// "REMINDER_SENT" sans jamais envoyer quoi que ce soit — la relance
// affichee comme "envoyee" ne partait nulle part.
export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await req.json();
    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
      include: { client: { select: { companyName: true, firstName: true, lastName: true, email: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const clientName = invoice.client.companyName || `${invoice.client.firstName ?? ""} ${invoice.client.lastName ?? ""}`.trim();
    const daysOverdue = Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    const stage = stageFor(daysOverdue);

    let emailSent = false;
    let emailError: string | null = null;

    if (isEmailSendConfigured() && invoice.client.email) {
      try {
        await sendEmail({
          to: invoice.client.email,
          subject: `Relance — Facture ${invoice.invoiceNumber} en attente de règlement`,
          text: `Bonjour,\n\nSauf erreur de notre part, la facture ${invoice.invoiceNumber} d'un montant de ${invoice.total.toLocaleString("fr-FR")} FCFA, échue depuis ${daysOverdue} jour(s), reste impayée à ce jour.\n\nNous vous remercions de bien vouloir procéder à son règlement dans les meilleurs délais.\n\nCordialement,\nCabinet 360`,
        });
        emailSent = true;
      } catch (e) {
        console.error("Erreur envoi relance email:", e);
        emailError = e instanceof Error ? e.message : "Erreur d'envoi";
      }
    }

    await AuditService.log({
      action: "REMINDER_SENT",
      entity: "INVOICE",
      entityId: invoice.id,
      details: emailSent
        ? `Relance (niveau ${stage}) envoyée par e-mail à ${invoice.client.email} pour la facture ${invoice.invoiceNumber} (${clientName}, ${invoice.total.toLocaleString("fr-FR")} FCFA)`
        : `Relance marquée manuellement pour la facture ${invoice.invoiceNumber} (${clientName}, ${invoice.total.toLocaleString("fr-FR")} FCFA) — aucun e-mail envoyé (${emailError || "intégration SMTP non configurée"})`,
    });

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (error) {
    console.error("Erreur POST invoices/relances:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
