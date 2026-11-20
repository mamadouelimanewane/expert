import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

type InboxItem = { id: string; category: string; kind: string; title: string; detail: string; href: string; createdAt: Date; priority: number };
const nom = (client: { companyName: string | null; firstName: string | null; lastName: string | null } | null) => client?.companyName || [client?.firstName, client?.lastName].filter(Boolean).join(" ") || "Client sans nom";

export async function GET() {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  try {
    const missionsAssociees = await prisma.mission.findMany({
      where: { OR: [{ assignedToId: session.id }, { createdById: session.id }], status: { notIn: ["COMPLETED", "CANCELLED"] } },
      take: 100, select: { id: true, title: true, status: true, client: { select: { id: true, companyName: true, firstName: true, lastName: true } } },
    });
    const missionIds = missionsAssociees.map((mission) => mission.id);
    const [notifications, tasks, pendingReviewMissions, reviewComments, auditSamples, journals, documents, clientRequests, overdueInvoices] = await Promise.all([
      prisma.notification.findMany({ where: { userId: session.id, isRead: false }, orderBy: { createdAt: "desc" }, take: 20 }),
      missionIds.length
        ? prisma.task.findMany({
            where: { missionId: { in: missionIds }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
            orderBy: [{ dueDate: "asc" }, { priority: "desc" }], take: 30,
            include: { mission: { select: { id: true, title: true, client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } } },
          })
        : Promise.resolve([]),
      prisma.mission.findMany({ where: { status: "PENDING_REVIEW", ...(session.role === "EXPERT" || session.role === "ADMIN" ? {} : { OR: [{ assignedToId: session.id }, { createdById: session.id }] }) }, orderBy: { updatedAt: "desc" }, take: 20, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
      prisma.auditReviewComment.findMany({ where: { status: "OPEN", ...(session.role === "EXPERT" || session.role === "ADMIN" ? { OR: [{ assignedToId: session.id }, { assignedToId: null }] } : { assignedToId: session.id }) }, orderBy: { createdAt: "desc" }, take: 20, include: { mission: { select: { id: true, title: true } } } }),
      prisma.auditSample.findMany({ where: { status: "DRAFT" }, orderBy: { updatedAt: "desc" }, take: 20, include: { mission: { select: { id: true, title: true } } } }),
      prisma.tpeJournal.findMany({ where: { status: "PENDING", source: { not: "WHATSAPP_TEST" } }, orderBy: { createdAt: "desc" }, take: 20, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
      prisma.document.findMany({ where: { type: "FACTURE", status: "PROCESSED" }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, originalName: true, ocrData: true, clientId: true, client: { select: { companyName: true, firstName: true, lastName: true } }, updatedAt: true } }),
      prisma.clientRequest.findMany({ where: { statut: { in: ["A_ENVOYER", "ENVOYEE", "REPONSE_RECUE"] } }, orderBy: { updatedAt: "desc" }, take: 20, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
      prisma.invoice.findMany({ where: { status: "OVERDUE" }, orderBy: { dueDate: "asc" }, take: 20, include: { client: { select: { id: true, companyName: true, firstName: true, lastName: true } } } }),
    ]);

    const items: InboxItem[] = [
      ...notifications.map((item) => ({ id: item.id, category: "NOTIFICATION", kind: item.type, title: item.title, detail: item.message, href: "/inbox", createdAt: item.createdAt, priority: item.type === "ERROR" ? 5 : 2 })),
      ...tasks.map((item) => ({ id: item.id, category: "TASK", kind: item.status, title: item.title, detail: `${item.mission.title} · ${nom(item.mission.client)}${item.dueDate ? ` · échéance ${item.dueDate.toLocaleDateString("fr-FR")}` : ""}`, href: `/missions/${item.mission.id}`, createdAt: item.dueDate ?? item.updatedAt, priority: item.priority })),
      ...pendingReviewMissions.map((item) => ({ id: item.id, category: "MISSION_REVIEW", kind: item.status, title: `Mission à réviser : ${item.title}`, detail: nom(item.client), href: `/missions/${item.id}`, createdAt: item.updatedAt, priority: 4 })),
      ...reviewComments.map((item) => ({ id: item.id, category: "AUDIT_REVIEW", kind: "OPEN", title: item.title, detail: `${item.mission.title} · point de revue d’audit`, href: "/audit/missions", createdAt: item.createdAt, priority: 4 })),
      ...auditSamples.map((item) => ({ id: item.id, category: "AUDIT_SAMPLE", kind: "DRAFT", title: `Test à revoir : ${item.procedureReference}`, detail: item.mission.title, href: "/audit/missions", createdAt: item.updatedAt, priority: 3 })),
      ...journals.map((item) => ({ id: item.id, category: "ACCOUNTING_VALIDATION", kind: item.status, title: `Écriture TPE à valider · ${item.periode}`, detail: `${nom(item.client)} · ${item.libelle} · ${item.montant.toLocaleString("fr-FR")} FCFA`, href: "/comptabilite/tpe-processing", createdAt: item.createdAt, priority: 4 })),
      ...documents.filter((item) => (item.ocrData as { manualReview?: { status?: string } } | null)?.manualReview?.status !== "VALIDATED").slice(0, 20).map((item) => ({ id: item.id, category: "DOCUMENT_REVIEW", kind: "PENDING", title: `Extraction à vérifier : ${item.originalName}`, detail: nom(item.client), href: "/documents", createdAt: item.updatedAt, priority: 3 })),
      ...clientRequests.map((item) => ({ id: item.id, category: "CLIENT_REQUEST", kind: item.statut, title: item.type, detail: `${nom(item.client)} · ${item.details}`, href: `/clients/${item.client.id}`, createdAt: item.updatedAt, priority: item.priorite === "Haute" ? 4 : 2 })),
      ...overdueInvoices.map((item) => ({ id: item.id, category: "OVERDUE_INVOICE", kind: item.status, title: `Facture en retard : ${item.invoiceNumber}`, detail: `${nom(item.client)} · ${item.total.toLocaleString("fr-FR")} FCFA · échue le ${item.dueDate.toLocaleDateString("fr-FR")}`, href: `/billing/${item.id}`, createdAt: item.dueDate, priority: 4 })),
    ].sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());

    return NextResponse.json({ items: items.slice(0, 100), total: items.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Erreur boîte de réception:", error);
    return NextResponse.json({ error: "Impossible de charger la boîte de réception." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const notificationId = (body as Record<string, unknown>).notificationId;
  if (typeof notificationId !== "string" || !isObjectId(notificationId)) return NextResponse.json({ error: "notificationId invalide." }, { status: 400 });
  const notification = await prisma.notification.findFirst({ where: { id: notificationId, userId: session.id } });
  if (!notification) return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
  await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true, readAt: new Date() } });
  return NextResponse.json({ success: true });
}
