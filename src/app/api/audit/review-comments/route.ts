import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { AUDIT_REVIEW_REFERENCE_TYPES, evidenceVersionMatches, tpeJournalReviewVersion, validReviewCommentText, type AuditReviewReferenceType } from "@/lib/audit-review-policy";

async function verifierPreuve(type: AuditReviewReferenceType, referenceId: string, missionId: string, clientId: string): Promise<{ id: string; version: string } | { id: string; versionAt: Date } | null> {
  if (type === "DOCUMENT") {
    const doc = await prisma.document.findFirst({ where: { id: referenceId, missionId }, select: { id: true, updatedAt: true } });
    return doc ? { id: doc.id, versionAt: doc.updatedAt } : null;
  }
  if (type === "WORK_PAPER") {
    const workPaper = await prisma.workPaper.findFirst({ where: { id: referenceId, clientId }, select: { id: true, updatedAt: true } });
    return workPaper ? { id: workPaper.id, versionAt: workPaper.updatedAt } : null;
  }
  const entry = await prisma.tpeJournal.findFirst({
    where: { id: referenceId, clientId },
    select: { id: true, createdAt: true, periode: true, date: true, libelle: true, entree: true, sortie: true, debitCompte: true, debitIntitule: true, creditCompte: true, creditIntitule: true, montant: true, status: true, exportedAt: true },
  });
  return entry ? { id: entry.id, version: tpeJournalReviewVersion(entry) } : null;
}

export async function GET(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get("missionId") ?? "";
  if (!isObjectId(missionId)) return NextResponse.json({ error: "missionId invalide." }, { status: 400 });

  const comments = await prisma.auditReviewComment.findMany({
    where: { missionId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      resolvedBy: { select: { id: true, firstName: true, lastName: true } },
      events: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
  });
  return NextResponse.json({ comments, currentRole: session.role });
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const missionId = typeof input.missionId === "string" ? input.missionId : "";
  const referenceId = typeof input.referenceId === "string" ? input.referenceId : "";
  const referenceType = input.referenceType;
  const referenceVersion = typeof input.referenceVersion === "string" ? input.referenceVersion : "";
  const title = input.title;
  const initialComment = input.comment;
  const assignedToId = input.assignedToId === null || input.assignedToId === "" ? null : input.assignedToId;

  if (!isObjectId(missionId) || !isObjectId(referenceId) || !AUDIT_REVIEW_REFERENCE_TYPES.includes(referenceType as AuditReviewReferenceType)) {
    return NextResponse.json({ error: "Mission ou référence de preuve invalide." }, { status: 400 });
  }
  if (!validReviewCommentText(title, 3, 200) || !validReviewCommentText(initialComment)) {
    return NextResponse.json({ error: "Un titre (3 à 200 caractères) et un commentaire (5 à 5 000 caractères) sont requis." }, { status: 400 });
  }
  if (assignedToId !== null && !isObjectId(assignedToId)) return NextResponse.json({ error: "Collaborateur assigné invalide." }, { status: 400 });

  const mission = await prisma.mission.findUnique({ where: { id: missionId }, select: { id: true, clientId: true } });
  if (!mission) return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });
  const preuve = await verifierPreuve(referenceType as AuditReviewReferenceType, referenceId, mission.id, mission.clientId);
  if (!preuve) return NextResponse.json({ error: "La preuve ne correspond pas à cette mission ou à son dossier client." }, { status: 404 });
  const currentVersion = "version" in preuve ? preuve.version : preuve.versionAt.toISOString();
  const versionMatches = "version" in preuve
    ? currentVersion === referenceVersion
    : evidenceVersionMatches(preuve.versionAt, referenceVersion);
  if (!versionMatches) {
    return NextResponse.json({ error: "La preuve a changé depuis son affichage. Rechargez-la et rattachez le commentaire à sa version actuelle.", currentVersion }, { status: 409 });
  }

  if (assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedToId }, select: { id: true, role: true, isActive: true } });
    if (!assignee || !assignee.isActive || assignee.role === "CLIENT") return NextResponse.json({ error: "Le collaborateur assigné n'est pas actif dans ce cabinet." }, { status: 400 });
  }

  const comment = await prisma.auditReviewComment.create({
    data: {
      missionId,
      referenceType: referenceType as string,
      referenceId,
      referenceVersion: currentVersion,
      title: title.trim(),
      initialComment: initialComment.trim(),
      createdById: session.id,
      ...(assignedToId ? { assignedToId } : {}),
      events: { create: { userId: session.id, eventType: "COMMENT", content: initialComment.trim(), newValue: { referenceType: referenceType as string, referenceId, referenceVersion: currentVersion } } },
    },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } }, events: true },
  });
  return NextResponse.json({ comment }, { status: 201 });
}
