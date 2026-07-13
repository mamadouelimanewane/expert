import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Colonnes du pipeline, dans l'ordre du cycle de vie d'une mission (MissionStatus)
const COLUMNS: Array<{ status: string; title: string }> = [
  { status: "DRAFT", title: "Saisie / Brouillon" },
  { status: "IN_PROGRESS", title: "En Cours" },
  { status: "PENDING_REVIEW", title: "Révision" },
  { status: "COMPLETED", title: "Clôture / Terminé" },
];

export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    const mapped = missions.map((m) => {
      const daysActive = Math.max(0, Math.floor((now - m.createdAt.getTime()) / dayMs));
      const overdue = !!m.deadline && m.deadline.getTime() < now && m.status !== "COMPLETED" && m.status !== "CANCELLED";

      let uiStatus: "Normal" | "Urgent" | "En retard" | "Terminé" | "Annulé";
      if (m.status === "COMPLETED") uiStatus = "Terminé";
      else if (m.status === "CANCELLED") uiStatus = "Annulé";
      else if (overdue) uiStatus = "En retard";
      else if (m.deadline && m.deadline.getTime() - now < 3 * dayMs) uiStatus = "Urgent";
      else uiStatus = "Normal";

      return {
        id: m.id,
        client: m.client.companyName || `${m.client.firstName ?? ""} ${m.client.lastName ?? ""}`.trim(),
        mission: m.title,
        status: m.status,
        uiStatus,
        collaborator: m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}`.trim() : "Non assigné",
        daysActive,
        deadline: m.deadline,
      };
    });

    const columns = COLUMNS.map((c) => ({
      status: c.status,
      title: c.title,
      missions: mapped.filter((m) => m.status === c.status),
    }));

    const cancelledCount = mapped.filter((m) => m.status === "CANCELLED").length;

    return NextResponse.json({
      columns,
      cancelledCount,
      total: missions.length,
    });
  } catch (error) {
    console.error("Erreur GET workflows:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
