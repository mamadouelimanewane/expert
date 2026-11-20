import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { canManageReviewResolution, validReviewCommentText } from "@/lib/audit-review-policy";
import { AuditService } from "@/lib/audit";

export async function GET(request: Request) {
  const { denied } = await requireWriteAccess();
  if (denied) return denied;
  const missionId = new URL(request.url).searchParams.get("missionId") ?? "";
  if (!isObjectId(missionId)) return NextResponse.json({ error: "missionId invalide." }, { status: 400 });
  const mission = await prisma.mission.findFirst({ where: { id: missionId, type: "AUDIT" }, select: { id: true } });
  if (!mission) return NextResponse.json({ error: "Mission d’audit introuvable." }, { status: 404 });
  const assessment = await prisma.auditEngagementAssessment.findFirst({ where: { missionId }, include: { assessedBy: { select: { firstName: true, lastName: true } } } });
  return NextResponse.json({ assessment });
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "Cette évaluation est réservée à un expert ou administrateur." }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const missionId = typeof input.missionId === "string" ? input.missionId : "";
  const check = input.check;
  const status = input.status;
  const rationale = input.rationale;
  if (!isObjectId(missionId) || !["acceptance", "independence"].includes(String(check))) return NextResponse.json({ error: "Mission ou contrôle invalide." }, { status: 400 });
  const permitted = check === "acceptance" ? ["ACCEPTED", "DECLINED"] : ["CLEAR", "CONFLICT"];
  if (!permitted.includes(String(status)) || !validReviewCommentText(rationale, 10, 3000)) return NextResponse.json({ error: "Un statut valide et un motif de 10 à 3 000 caractères sont requis." }, { status: 400 });
  const mission = await prisma.mission.findFirst({ where: { id: missionId, type: "AUDIT" }, select: { id: true } });
  if (!mission) return NextResponse.json({ error: "Mission d’audit introuvable." }, { status: 404 });
  const previous = await prisma.auditEngagementAssessment.findFirst({ where: { missionId } });
  const values = check === "acceptance"
    ? { acceptanceStatus: String(status), acceptanceRationale: String(rationale).trim() }
    : { independenceStatus: String(status), independenceRationale: String(rationale).trim() };
  const assessment = previous
    ? await prisma.auditEngagementAssessment.update({ where: { id: previous.id }, data: { ...values, assessedById: session.id } })
    : await prisma.auditEngagementAssessment.create({ data: { missionId, ...values, assessedById: session.id } });
  await AuditService.log({
    action: "UPDATE", entity: "AUDIT_ENGAGEMENT_ASSESSMENT", entityId: assessment.id,
    oldValue: previous ? { acceptanceStatus: previous.acceptanceStatus, independenceStatus: previous.independenceStatus } : null,
    newValue: { ...values, missionId }, details: `Évaluation ${check} de la mission d’audit mise à jour par ${session.name}.`,
  });
  return NextResponse.json({ assessment });
}
