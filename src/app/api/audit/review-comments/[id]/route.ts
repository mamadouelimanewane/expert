import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { canManageReviewResolution, validReviewCommentText } from "@/lib/audit-review-policy";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;
  const { id } = await params;
  if (!isObjectId(id)) return NextResponse.json({ error: "Identifiant de commentaire invalide." }, { status: 400 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const action = input.action;
  const comment = await prisma.auditReviewComment.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true, status: true, assignedToId: true, cabinetId: true } });
  if (!comment) return NextResponse.json({ error: "Commentaire de revue introuvable." }, { status: 404 });

  if (action === "reply") {
    if (comment.status !== "OPEN") return NextResponse.json({ error: "Ce point est résolu. Rouvrez-le avant d'ajouter une réponse." }, { status: 409 });
    if (!validReviewCommentText(input.message)) return NextResponse.json({ error: "La réponse doit contenir entre 5 et 5 000 caractères." }, { status: 400 });
    const event = await prisma.auditReviewCommentEvent.create({ data: { cabinetId: session.cabinetId, commentId: id, userId: session.id, eventType: "COMMENT", content: input.message.trim() } });
    return NextResponse.json({ event }, { status: 201 });
  }

  if (action === "assign") {
    const assignedToId = input.assignedToId === null || input.assignedToId === "" ? null : input.assignedToId;
    if (assignedToId !== null && !isObjectId(assignedToId)) return NextResponse.json({ error: "Collaborateur assigné invalide." }, { status: 400 });
    if (assignedToId) {
      const assignee = await prisma.user.findFirst({ where: { id: assignedToId, cabinetId: session.cabinetId }, select: { id: true, role: true, isActive: true } });
      if (!assignee || !assignee.isActive || assignee.role === "CLIENT") return NextResponse.json({ error: "Le collaborateur assigné n'est pas actif dans ce cabinet." }, { status: 400 });
    }
    if (comment.assignedToId === assignedToId) return NextResponse.json({ error: "Aucun changement d'assignation." }, { status: 409 });
    const updated = await prisma.auditReviewComment.update({
      where: { id },
      data: {
        assignedToId,
        events: { create: { cabinetId: session.cabinetId, userId: session.id, eventType: "ASSIGN", content: validReviewCommentText(input.message, 0, 500) ? input.message.trim() : null, oldValue: { assignedToId: comment.assignedToId }, newValue: { assignedToId } } },
      },
      select: { id: true, assignedToId: true, updatedAt: true },
    });
    return NextResponse.json({ comment: updated });
  }

  if (action === "resolve" || action === "reopen") {
    if (!canManageReviewResolution(session.role)) return NextResponse.json({ error: "Seul un expert ou administrateur peut résoudre ou rouvrir un point de revue." }, { status: 403 });
    const expected = action === "resolve" ? "OPEN" : "RESOLVED";
    const next = action === "resolve" ? "RESOLVED" : "OPEN";
    if (comment.status !== expected) return NextResponse.json({ error: action === "resolve" ? "Ce point est déjà résolu." : "Ce point n'est pas résolu." }, { status: 409 });
    if (!validReviewCommentText(input.message)) return NextResponse.json({ error: "Un motif de 5 à 5 000 caractères est requis." }, { status: 400 });
    const updated = await prisma.auditReviewComment.update({
      where: { id },
      data: {
        status: next,
        resolvedAt: action === "resolve" ? new Date() : null,
        resolvedById: action === "resolve" ? session.id : null,
        events: { create: { cabinetId: session.cabinetId, userId: session.id, eventType: action === "resolve" ? "RESOLVE" : "REOPEN", content: input.message.trim(), oldValue: { status: comment.status }, newValue: { status: next } } },
      },
      select: { id: true, status: true, resolvedAt: true, resolvedById: true, updatedAt: true },
    });
    return NextResponse.json({ comment: updated });
  }

  return NextResponse.json({ error: "Action requise : reply, assign, resolve ou reopen." }, { status: 400 });
}
