import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";
import { normaliserPeriode } from "@/lib/validation";
import { requireAdmin, requireStaff } from "@/lib/api-auth";
import { peutVerrouillerPeriode } from "@/lib/accounting-period-lock-rules";

async function lireParametres(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const clientId = typeof input.clientId === "string" ? input.clientId : "";
  const periode = normaliserPeriode(input.periode);
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (!isObjectId(clientId) || !periode) return null;
  return { clientId, periode, reason };
}

export async function GET(request: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") ?? "";
  const periode = normaliserPeriode(searchParams.get("periode"));
  if (!isObjectId(clientId) || !periode) {
    return NextResponse.json({ error: "clientId et période AAAA-MM requis." }, { status: 400 });
  }
  const lock = await prisma.accountingPeriodLock.findUnique({
    where: { clientId_periode: { clientId, periode } },
    select: { periode: true, lockedAt: true, lockedById: true, reason: true },
  });
  return NextResponse.json({ verrouillee: Boolean(lock), lock });
}

export async function POST(request: Request) {
  const { session, denied } = await requireAdmin();
  if (denied) return denied;
  const params = await lireParametres(request);
  if (!params || params.reason.length < 10 || params.reason.length > 500) {
    return NextResponse.json({ error: "clientId, période et motif de clôture (10 à 500 caractères) requis." }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: params.clientId }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
  const existingLock = await prisma.accountingPeriodLock.findUnique({
    where: { clientId_periode: { clientId: params.clientId, periode: params.periode } },
    select: { id: true },
  });
  if (existingLock) return NextResponse.json({ error: "Cette période est déjà verrouillée." }, { status: 409 });

  const operationsEnAttente = await prisma.tpeJournal.count({
    where: { clientId: params.clientId, periode: params.periode, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (!peutVerrouillerPeriode(operationsEnAttente)) {
    return NextResponse.json({
      error: "Clôture impossible : examinez ou comptabilisez toutes les écritures en attente de cette période.",
      ecrituresEnAttente: operationsEnAttente,
    }, { status: 409 });
  }

  let lock;
  try {
    lock = await prisma.accountingPeriodLock.create({
      data: { clientId: params.clientId, periode: params.periode, lockedById: session.id, reason: params.reason },
      select: { id: true, periode: true, lockedAt: true, lockedById: true, reason: true },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Cette période vient d'être verrouillée par un autre administrateur." }, { status: 409 });
    }
    throw error;
  }
  await AuditService.log({
    action: "LOCK",
    entity: "ACCOUNTING_PERIOD",
    entityId: lock.id,
    details: `Période ${params.periode} verrouillée pour le dossier ${params.clientId}. Motif : ${params.reason}`,
    newValue: { clientId: params.clientId, periode: params.periode, reason: params.reason },
  });
  return NextResponse.json({ verrouillee: true, lock });
}

export async function DELETE(request: Request) {
  const { session, denied } = await requireAdmin();
  if (denied) return denied;
  const params = await lireParametres(request);
  if (!params || params.reason.length < 10 || params.reason.length > 500) {
    return NextResponse.json({ error: "clientId, période et motif de réouverture (10 à 500 caractères) requis." }, { status: 400 });
  }
  const lock = await prisma.accountingPeriodLock.findUnique({
    where: { clientId_periode: { clientId: params.clientId, periode: params.periode } },
    select: { id: true, reason: true },
  });
  if (!lock) return NextResponse.json({ error: "Cette période n'est pas verrouillée." }, { status: 404 });
  await prisma.accountingPeriodLock.delete({ where: { id: lock.id } });
  await AuditService.log({
    action: "UNLOCK",
    entity: "ACCOUNTING_PERIOD",
    entityId: lock.id,
    details: `Période ${params.periode} rouverte pour le dossier ${params.clientId}. Par ${session.id}. Motif : ${params.reason}`,
    oldValue: { clientId: params.clientId, periode: params.periode, reason: lock.reason },
    newValue: { unlockedById: session.id, reason: params.reason },
  });
  return NextResponse.json({ verrouillee: false });
}
