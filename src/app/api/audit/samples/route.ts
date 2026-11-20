import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { canManageReviewResolution } from "@/lib/audit-review-policy";
import { validateAuditSample } from "@/lib/audit-sampling-policy";
import { AuditService } from "@/lib/audit";

export async function GET(request: Request) {
  const { denied } = await requireWriteAccess();
  if (denied) return denied;
  const missionId = new URL(request.url).searchParams.get("missionId") ?? "";
  if (!isObjectId(missionId)) return NextResponse.json({ error: "missionId invalide." }, { status: 400 });
  const mission = await prisma.mission.findFirst({ where: { id: missionId, type: "AUDIT" }, select: { id: true } });
  if (!mission) return NextResponse.json({ error: "Mission d’audit introuvable." }, { status: 404 });
  const samples = await prisma.auditSample.findMany({ where: { missionId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ samples });
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const missionId = typeof input.missionId === "string" ? input.missionId : "";
  if (!isObjectId(missionId)) return NextResponse.json({ error: "missionId invalide." }, { status: 400 });
  const validated = validateAuditSample(input);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
  const mission = await prisma.mission.findFirst({ where: { id: missionId, type: "AUDIT" }, select: { id: true } });
  if (!mission) return NextResponse.json({ error: "Mission d’audit introuvable." }, { status: 404 });
  const sample = await prisma.auditSample.create({ data: { missionId, createdById: session.id, ...validated.value } });
  await AuditService.log({ action: "CREATE", entity: "AUDIT_SAMPLE", entityId: sample.id, newValue: { ...validated.value, missionId }, details: `Échantillonnage créé par ${session.name}.` });
  return NextResponse.json({ sample }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const sampleId = typeof input.sampleId === "string" ? input.sampleId : "";
  if (!isObjectId(sampleId)) return NextResponse.json({ error: "sampleId invalide." }, { status: 400 });
  const previous = await prisma.auditSample.findFirst({ where: { id: sampleId } });
  if (!previous) return NextResponse.json({ error: "Échantillonnage introuvable." }, { status: 404 });

  if (input.action === "REVIEW") {
    if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "La revue d’un échantillonnage est réservée à un expert ou administrateur." }, { status: 403 });
    if (previous.status !== "DRAFT") return NextResponse.json({ error: "Cet échantillonnage a déjà été revu." }, { status: 409 });
    const sample = await prisma.auditSample.update({ where: { id: sampleId }, data: { status: "REVIEWED", reviewedById: session.id, reviewedAt: new Date() } });
    await AuditService.log({ action: "REVIEW", entity: "AUDIT_SAMPLE", entityId: sample.id, oldValue: { status: previous.status }, newValue: { status: sample.status, reviewedById: session.id, conclusion: sample.conclusion }, details: `Échantillonnage revu par ${session.name}.` });
    return NextResponse.json({ sample });
  }

  if (input.action !== "UPDATE" || previous.status !== "DRAFT") return NextResponse.json({ error: "Action invalide ou échantillonnage déjà revu." }, { status: 409 });
  const validated = validateAuditSample(input);
  if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
  const sample = await prisma.auditSample.update({ where: { id: sampleId }, data: validated.value });
  await AuditService.log({ action: "UPDATE", entity: "AUDIT_SAMPLE", entityId: sample.id, oldValue: previous, newValue: validated.value, details: `Échantillonnage modifié par ${session.name}.` });
  return NextResponse.json({ sample });
}
