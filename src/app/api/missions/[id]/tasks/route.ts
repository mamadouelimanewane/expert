import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireWriteAccess } from "@/lib/api-auth";
import { getMissionTaskTemplate } from "@/lib/mission-task-templates";
import { isObjectId } from "@/lib/tenant-security";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { denied, session } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const { id: missionId } = await params;
    if (!isObjectId(missionId)) return NextResponse.json({ error: "Identifiant de mission invalide." }, { status: 400 });
    const body = await request.json().catch(() => ({}));
    if (body.action !== "APPLY_TEMPLATE") {
      return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
    }
    const mission = await prisma.mission.findFirst({ where: { id: missionId, cabinetId: session.cabinetId }, select: { id: true, type: true, status: true } });
    if (!mission) return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });
    if (mission.status === "COMPLETED" || mission.status === "CANCELLED") {
      return NextResponse.json({ error: "Rouvrez la mission avant de modifier sa liste de tâches." }, { status: 409 });
    }

    const existingTasks = await prisma.task.count({ where: { missionId } });
    if (existingTasks > 0) {
      return NextResponse.json({ error: "Cette mission contient déjà des tâches. Le modèle n'a pas été ajouté." }, { status: 409 });
    }

    const template = getMissionTaskTemplate(mission.type);
    const created = await prisma.task.createMany({
      data: template.map((task) => ({ ...task, missionId, cabinetId: session.cabinetId, status: "DRAFT" })),
    });
    await AuditService.log({
      action: "CREATE",
      entity: "MISSION_TASK_TEMPLATE",
      entityId: missionId,
      newValue: { missionType: mission.type, created: created.count },
      details: `${created.count} tâches du modèle ${mission.type} ajoutées à la mission par ${session.name}.`,
    });
    return NextResponse.json({ created: created.count }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST missions/[id]/tasks:", error);
    return NextResponse.json({ error: "Impossible d'ajouter le modèle de tâches." }, { status: 500 });
  }
}
