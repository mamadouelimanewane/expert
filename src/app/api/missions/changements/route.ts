import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { AuditService } from "@/lib/audit";
import { isObjectId } from "@/lib/tenant-security";

const clean = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";

export async function GET(request: Request) {
  const { denied } = await requireWriteAccess();
  if (denied) return denied;
  const missionId = new URL(request.url).searchParams.get("missionId");
  if (missionId && !isObjectId(missionId)) return NextResponse.json({ error: "Mission invalide." }, { status: 400 });
  const changes = await prisma.missionChangeRequest.findMany({ where: missionId ? { missionId } : {}, orderBy: { createdAt: "desc" }, take: 200 });
  const missions = await prisma.mission.findMany({ where: { id: { in: [...new Set(changes.map(c => c.missionId))] } }, include: { client: { select: { companyName: true, firstName: true, lastName: true } } } });
  const index = new Map(missions.map(m => [m.id, m]));
  return NextResponse.json({ changes: changes.map(change => ({ ...change, mission: index.get(change.missionId) ? {
    id: index.get(change.missionId)!.id, title: index.get(change.missionId)!.title,
    client: index.get(change.missionId)!.client.companyName || `${index.get(change.missionId)!.client.firstName ?? ""} ${index.get(change.missionId)!.client.lastName ?? ""}`.trim(),
  } : null })) });
}

export async function POST(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const missionId = clean(body.missionId, 30), title = clean(body.title, 180), reason = clean(body.reason, 2000), requestedScope = clean(body.requestedScope, 5000);
  const feeDelta = Number(body.feeDelta), hoursDelta = Number(body.hoursDelta);
  if (!isObjectId(missionId) || title.length < 4 || reason.length < 8 || requestedScope.length < 8 || !Number.isFinite(feeDelta) || !Number.isFinite(hoursDelta) || feeDelta < 0 || hoursDelta < 0) {
    return NextResponse.json({ error: "Complétez le périmètre, le motif et les montants avec des valeurs valides." }, { status: 400 });
  }
  const mission = await prisma.mission.findFirst({ where: { id: missionId }, select: { id: true, title: true } });
  if (!mission) return NextResponse.json({ error: "Mission introuvable dans ce cabinet." }, { status: 404 });
  const change = await prisma.missionChangeRequest.create({ data: { missionId, title, reason, requestedScope, feeDelta, hoursDelta, requestedById: session.id } });
  await AuditService.log({ action: "CREATE", entity: "MISSION_CHANGE_REQUEST", entityId: change.id, newValue: { missionId, title, feeDelta, hoursDelta } });
  return NextResponse.json({ change }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  if (!["ADMIN", "EXPERT"].includes(session.role)) return NextResponse.json({ error: "La validation d’un avenant est réservée à un expert ou administrateur." }, { status: 403 });
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const body = input as Record<string, unknown>, id = clean(body.id, 30), decision = clean(body.decision, 20);
  if (!isObjectId(id) || !["APPROVED", "REJECTED"].includes(decision)) return NextResponse.json({ error: "Décision ou demande invalide." }, { status: 400 });
  const previous = await prisma.missionChangeRequest.findFirst({ where: { id } });
  if (!previous) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  if (previous.status !== "PENDING") return NextResponse.json({ error: "Cette demande a déjà été traitée." }, { status: 409 });
  const comment = clean(body.comment, 1000) || null;
  if (decision === "REJECTED" && !comment) return NextResponse.json({ error: "Le motif du refus est obligatoire." }, { status: 400 });
  // Claim the pending request conditionally so concurrent reviewers cannot
  // register competing decisions for the same amendment.
  const claim = await prisma.missionChangeRequest.updateMany({ where: { id, status: "PENDING" }, data: { status: decision, reviewedById: session.id, reviewedAt: new Date(), reviewComment: comment } });
  if (claim.count !== 1) return NextResponse.json({ error: "Cette demande vient d’être traitée par un autre réviseur." }, { status: 409 });
  const change = await prisma.missionChangeRequest.findFirst({ where: { id } });
  await AuditService.log({ action: "UPDATE", entity: "MISSION_CHANGE_REQUEST", entityId: id, oldValue: { status: previous.status }, newValue: { status: decision, feeDelta: previous.feeDelta, hoursDelta: previous.hoursDelta, comment } });
  return NextResponse.json({ change });
}
