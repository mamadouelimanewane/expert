import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

type Params = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { denied, session } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const { id: missionId, taskId } = await params;
    if (!isObjectId(missionId) || !isObjectId(taskId)) return NextResponse.json({ error: "Identifiant de mission ou tâche invalide." }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ error: "L'état terminé est requis." }, { status: 400 });
    }
    const task = await prisma.task.findFirst({ where: { id: taskId, missionId, cabinetId: session.cabinetId }, select: { id: true, title: true, status: true, mission: { select: { status: true, cabinetId: true } } } });
    if (!task) return NextResponse.json({ error: "Tâche introuvable dans cette mission." }, { status: 404 });
    if (task.mission.cabinetId !== session.cabinetId) return NextResponse.json({ error: "Tâche introuvable dans cette mission." }, { status: 404 });
    if (task.mission.status === "COMPLETED" || task.mission.status === "CANCELLED") {
      return NextResponse.json({ error: "Rouvrez la mission avant de modifier ses tâches." }, { status: 409 });
    }

    const nextStatus = body.completed ? "COMPLETED" : "IN_PROGRESS";
    if (task.status === nextStatus) return NextResponse.json({ task, unchanged: true });

    const result = await prisma.task.updateMany({
      where: { id: taskId, missionId, cabinetId: session.cabinetId, status: task.status },
      data: { status: nextStatus, completedAt: body.completed ? new Date() : null },
    });
    if (result.count !== 1) return NextResponse.json({ error: "La tâche a changé entre-temps. Actualisez la mission." }, { status: 409 });

    const updated = await prisma.task.findFirst({ where: { id: taskId, missionId, cabinetId: session.cabinetId } });
    if (!updated) return NextResponse.json({ error: "Tâche introuvable après modification." }, { status: 404 });
    await AuditService.log({
      action: "UPDATE",
      entity: "MISSION_TASK",
      entityId: taskId,
      oldValue: { status: task.status },
      newValue: { status: updated.status },
      details: `Tâche « ${task.title} » ${body.completed ? "terminée" : "réouverte"} par ${session.name}.`,
    });
    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Erreur PATCH missions/[id]/tasks/[taskId]:", error);
    return NextResponse.json({ error: "Impossible de mettre à jour la tâche." }, { status: 500 });
  }
}
