import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireWriteAccess } from "@/lib/api-auth";
import { buildTpeJournalReversal } from "@/lib/accounting-journal";
import { isObjectId } from "@/lib/tenant-security";
import { ensureAccountingPeriodOpen } from "@/lib/accounting-period-lock";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  const { id } = await context.params;
  if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant d'écriture invalide." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }
  const reason = typeof body === "object" && body !== null && "reason" in body
    ? (body as { reason?: unknown }).reason
    : null;
  if (typeof reason !== "string" || reason.trim().length < 10 || reason.trim().length > 500) {
    return NextResponse.json({ error: "Un motif de 10 à 500 caractères est requis." }, { status: 400 });
  }

  try {
    const original = await prisma.tpeJournal.findUnique({ where: { id } });
    if (!original) return NextResponse.json({ error: "Écriture introuvable." }, { status: 404 });
    if (original.status !== "EXPORTED") {
      return NextResponse.json({ error: "Seule une écriture comptabilisée peut être contrepassée." }, { status: 409 });
    }

    const existing = await prisma.tpeJournal.findFirst({
      where: { reversedFromId: original.id },
      select: { id: true, status: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Une contrepassation existe déjà pour cette écriture.", reversalId: existing.id }, { status: 409 });
    }

    const reversalData = buildTpeJournalReversal(original, reason, new Date());
    const periodState = await ensureAccountingPeriodOpen(original.clientId, reversalData.periode);
    if (!periodState.open) return NextResponse.json({ error: `La période de contrepassation ${reversalData.periode} est verrouillée.` }, { status: 409 });
    const reversal = await prisma.tpeJournal.create({ data: reversalData });
    await AuditService.log({
      action: "CREATE",
      entity: "TPE_JOURNAL_REVERSAL",
      entityId: reversal.id,
      details: `Contrepassation de ${original.id} créée par ${session.id}; motif : ${reason.trim()}`,
      oldValue: { originalStatus: original.status },
      newValue: { reversalStatus: reversal.status, originalId: original.id },
    });
    return NextResponse.json({ reversal, message: "Contrepassation créée en brouillon. Elle doit être approuvée avant comptabilisation." }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Une contrepassation existe déjà pour cette écriture." }, { status: 409 });
    }
    console.error("Erreur création contrepassation TPE:", error);
    return NextResponse.json({ error: "Impossible de créer la contrepassation." }, { status: 500 });
  }
}
