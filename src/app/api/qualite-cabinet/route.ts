import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";
import { canManageReviewResolution } from "@/lib/audit-review-policy";

const KINDS = ["RISK", "FINDING", "REVIEW"] as const;
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED"] as const;
const text = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;
  try {
    const [controls, reviewers] = await Promise.all([
      prisma.qualityControl.findMany({ orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] }),
      prisma.user.findMany({ where: { isActive: true, role: { in: ["ADMIN", "EXPERT", "COLLABORATOR", "ASSISTANT"] } }, select: { id: true, firstName: true, lastName: true, role: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
    ]);
    const now = new Date();
    return NextResponse.json({ controls, reviewers, stats: {
      total: controls.length,
      open: controls.filter(x => x.status === "OPEN" || x.status === "IN_PROGRESS").length,
      overdue: controls.filter(x => x.dueDate && x.dueDate < now && x.status !== "RESOLVED" && x.status !== "ACCEPTED").length,
      critical: controls.filter(x => x.severity === "CRITICAL" && x.status !== "RESOLVED").length,
    } });
  } catch (error) {
    console.error("Quality controls GET:", error);
    return NextResponse.json({ error: "Impossible de charger les contrôles qualité." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const kind = text(body.kind, 20), severity = text(body.severity, 20);
  const title = text(body.title, 180), description = text(body.description, 4000);
  if (!KINDS.includes(kind as typeof KINDS[number]) || !SEVERITIES.includes(severity as typeof SEVERITIES[number]) || title.length < 4) {
    return NextResponse.json({ error: "Type, gravité ou intitulé invalide." }, { status: 400 });
  }
  const missionId = text(body.missionId, 30) || null;
  if (missionId && !isObjectId(missionId)) return NextResponse.json({ error: "Mission invalide." }, { status: 400 });
  if (missionId && !await prisma.mission.findFirst({ where: { id: missionId }, select: { id: true } })) return NextResponse.json({ error: "Mission introuvable dans ce cabinet." }, { status: 404 });
  const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) return NextResponse.json({ error: "Échéance invalide." }, { status: 400 });
  const ownerId = text(body.ownerId, 30) || null;
  if (ownerId && !isObjectId(ownerId)) return NextResponse.json({ error: "Responsable invalide." }, { status: 400 });
  if (ownerId && !await prisma.user.findFirst({ where: { id: ownerId, isActive: true }, select: { id: true } })) return NextResponse.json({ error: "Responsable introuvable dans ce cabinet." }, { status: 404 });
  const reviewFrequencyDays = body.reviewFrequencyDays === "" || body.reviewFrequencyDays === undefined ? null : Number(body.reviewFrequencyDays);
  if (reviewFrequencyDays !== null && (!Number.isInteger(reviewFrequencyDays) || reviewFrequencyDays < 1 || reviewFrequencyDays > 365)) return NextResponse.json({ error: "La fréquence de revue doit être comprise entre 1 et 365 jours." }, { status: 400 });
  const control = await prisma.qualityControl.create({ data: {
    kind, severity, title, description: description || null, missionId, dueDate, ownerId, reviewFrequencyDays,
    createdById: session.id,
  } });
  await AuditService.log({ action: "CREATE", entity: "QUALITY_CONTROL", entityId: control.id, newValue: { kind, severity, title, missionId } });
  return NextResponse.json({ control }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const id = text(body.id, 30), status = text(body.status, 30);
  if (!isObjectId(id) || !STATUSES.includes(status as typeof STATUSES[number])) return NextResponse.json({ error: "Contrôle ou statut invalide." }, { status: 400 });
  const previous = await prisma.qualityControl.findFirst({ where: { id } });
  if (!previous) return NextResponse.json({ error: "Contrôle qualité introuvable." }, { status: 404 });
  if (body.action === "REVIEW") {
    if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La revue d’efficacité est réservée à un expert ou administrateur." }, { status: 403 });
    const result = text(body.effectivenessResult, 20), evidence = text(body.effectivenessEvidence, 3000);
    if (!["EFFECTIVE", "INEFFECTIVE"].includes(result) || evidence.length < 20) return NextResponse.json({ error: "Indiquez le résultat et une preuve de revue d’au moins 20 caractères." }, { status: 400 });
    const control = await prisma.qualityControl.update({ where: { id }, data: {
      effectivenessResult: result, effectivenessEvidence: evidence, lastReviewedAt: new Date(),
      reviewedById: session.id, reviewedAt: new Date(),
      ...(result === "INEFFECTIVE" ? { status: "IN_PROGRESS" } : {}),
    } });
    await AuditService.log({ action: "QUALITY_EFFECTIVENESS_REVIEW", entity: "QUALITY_CONTROL", entityId: id, oldValue: { effectivenessResult: previous.effectivenessResult }, newValue: { effectivenessResult: result, effectivenessEvidence: evidence, status: control.status } });
    return NextResponse.json({ control });
  }
  if (body.action === "ASSIGN") {
    const ownerId = text(body.ownerId, 30) || null;
    if (ownerId && (!isObjectId(ownerId) || !await prisma.user.findFirst({ where: { id: ownerId, isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Responsable introuvable dans ce cabinet." }, { status: 404 });
    const control = await prisma.qualityControl.update({ where: { id }, data: { ownerId } });
    await AuditService.log({ action: "ASSIGN", entity: "QUALITY_CONTROL", entityId: id, oldValue: { ownerId: previous.ownerId }, newValue: { ownerId } });
    return NextResponse.json({ control });
  }
  if (status === "ACCEPTED" && !["ADMIN", "EXPERT"].includes(session.role)) return NextResponse.json({ error: "Seul un expert ou administrateur peut accepter un risque." }, { status: 403 });
  if (status === "ACCEPTED" && previous.kind !== "RISK") return NextResponse.json({ error: "Seul un risque qualité peut être formellement accepté." }, { status: 409 });
  const rootCause = body.rootCause === undefined ? previous.rootCause : text(body.rootCause, 3000) || null;
  const correctiveAction = body.correctiveAction === undefined ? previous.correctiveAction : text(body.correctiveAction, 3000) || null;
  if (status === "RESOLVED" && (!rootCause || !correctiveAction)) return NextResponse.json({ error: "Documentez la cause et l’action corrective avant clôture." }, { status: 400 });
  if (status === "ACCEPTED" && !rootCause) return NextResponse.json({ error: "Documentez la justification de l’acceptation dans le champ cause / justification." }, { status: 400 });
  const control = await prisma.qualityControl.update({ where: { id }, data: {
    status, rootCause, correctiveAction,
    resolvedAt: status === "RESOLVED" ? new Date() : null,
    ...(status === "ACCEPTED" ? { reviewedById: session.id, reviewedAt: new Date() } : {}),
  } });
  await AuditService.log({ action: "UPDATE", entity: "QUALITY_CONTROL", entityId: id, oldValue: { status: previous.status }, newValue: { status, rootCause, correctiveAction } });
  return NextResponse.json({ control });
}
