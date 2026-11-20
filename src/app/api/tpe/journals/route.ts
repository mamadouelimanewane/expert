import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { isTpeJournalTransitionAllowed } from "@/lib/accounting-journal";
import { ensureAccountingPeriodOpen } from "@/lib/accounting-period-lock";
export async function GET(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const where = clientId
      ? { clientId, source: { not: "WHATSAPP_TEST" } }
      : { source: { not: "WHATSAPP_TEST" } };
    const journals = await prisma.tpeJournal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ journals });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Objet JSON requis." }, { status: 400 });
    }
    const { id, status, reason } = body as { id?: unknown; status?: unknown; reason?: unknown };
    if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ error: "Identifiant d'écriture invalide." }, { status: 400 });
    }
    if ((status !== "APPROVED" && status !== "REJECTED") || !isTpeJournalTransitionAllowed("PENDING", status)) {
      return NextResponse.json({ error: "Transition autorisée : PENDING vers APPROVED ou REJECTED." }, { status: 400 });
    }
    if (status === "REJECTED" && (typeof reason !== "string" || reason.trim().length < 5 || reason.trim().length > 500)) {
      return NextResponse.json({ error: "Un motif de rejet de 5 à 500 caractères est requis." }, { status: 400 });
    }
    const rejectionReason = typeof reason === "string" ? reason.trim() : undefined;

    const current = await prisma.tpeJournal.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Écriture introuvable." }, { status: 404 });
    if (current.status !== "PENDING") {
      return NextResponse.json({ error: "Cette écriture a déjà été examinée; son statut ne peut pas être remplacé." }, { status: 409 });
    }
    const periodState = await ensureAccountingPeriodOpen(current.clientId, current.periode);
    if (!periodState.open) return NextResponse.json({ error: "Cette période est verrouillée : la revue du brouillon est interdite." }, { status: 409 });

    const updatedCount = await prisma.tpeJournal.updateMany({
      where: { id, status: "PENDING" },
      data: status === "APPROVED"
        ? { status, approvedAt: new Date(), approvedById: session.id, exportedAt: null }
        : { status, rejectedAt: new Date(), rejectedById: session.id, rejectionReason: rejectionReason!, exportedAt: null },
    });
    if (updatedCount.count !== 1) {
      return NextResponse.json({ error: "L'écriture a été modifiée par un autre utilisateur; rechargez la revue." }, { status: 409 });
    }
    const updated = await prisma.tpeJournal.findUnique({ where: { id } });
    await AuditService.log({
      action: status === "APPROVED" ? "APPROVE" : "REJECT",
      entity: "TPE_JOURNAL",
      entityId: id,
      details: status === "REJECTED" ? rejectionReason! : "Écriture validée par un collaborateur.",
      oldValue: { status: current.status },
      newValue: { status, reviewerId: session.id },
    });
    return NextResponse.json({ success: true, entry: updated });
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
