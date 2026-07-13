import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

function stageFor(daysOverdue: number) {
  if (daysOverdue >= 90) return 4;
  if (daysOverdue >= 60) return 3;
  if (daysOverdue >= 45) return 2;
  return 1;
}

export async function GET() {
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

// Marque une relance comme envoyée et l'enregistre dans le journal d'audit.
// L'envoi effectif (email/WhatsApp/courrier) nécessite une intégration tierce
// non configurée : ce endpoint trace l'action, il ne l'exécute pas.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
      include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const clientName = invoice.client.companyName || `${invoice.client.firstName ?? ""} ${invoice.client.lastName ?? ""}`.trim();
    await AuditService.log({
      action: "REMINDER_SENT",
      entity: "INVOICE",
      entityId: invoice.id,
      details: `Relance marquée comme envoyée pour la facture ${invoice.invoiceNumber} (${clientName}, ${invoice.total.toLocaleString("fr-FR")} FCFA)`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur POST invoices/relances:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
