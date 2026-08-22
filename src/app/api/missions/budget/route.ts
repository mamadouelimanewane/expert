import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
const ACTIVE_STATUSES: Array<"DRAFT" | "IN_PROGRESS" | "PENDING_REVIEW"> = [
  "DRAFT",
  "IN_PROGRESS",
  "PENDING_REVIEW",
];

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    // 1. Missions budgétées (avec estimatedHours) — analyse de rentabilité
    const budgetedMissions = await prisma.mission.findMany({
      where: { estimatedHours: { not: null } },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        timeEntries: { select: { duration: true, category: true } },
      },
      orderBy: { deadline: "asc" },
    });

    const missions = budgetedMissions.map((m) => {
      const consumedHours = m.timeEntries.reduce((s, t) => s + t.duration, 0);
      const estimatedHours = m.estimatedHours || 0;
      const pct = estimatedHours > 0 ? (consumedHours / estimatedHours) * 100 : 0;
      const status = pct > 100 ? "DÉPASSEMENT" : pct >= 80 ? "ATTENTION" : "SAIN";
      const budget = m.fixedPrice || (m.hourlyRate ? m.hourlyRate * estimatedHours : 0);

      const breakdown: Record<string, number> = {};
      for (const t of m.timeEntries) {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.duration;
      }

      return {
        id: m.id,
        name: m.title,
        client: m.client.companyName || `${m.client.firstName ?? ""} ${m.client.lastName ?? ""}`.trim(),
        expert: m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}`.trim() : "Non assigné",
        estimatedHours,
        consumedHours,
        budget,
        status,
        breakdown,
      };
    });

    const stats = {
      sain: missions.filter((m) => m.status === "SAIN").length,
      alertes: missions.filter((m) => m.status !== "SAIN").length,
      totalBudget: missions.reduce((s, m) => s + m.budget, 0),
    };

    // 2. Missions actives (tous statuts en cours, avec ou sans budget) — pilotage production
    const activeMissionsRaw = await prisma.mission.findMany({
      where: { status: { in: ACTIVE_STATUSES } },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        timeEntries: { select: { duration: true } },
      },
      orderBy: { deadline: "asc" },
    });

    const now = Date.now();
    const activeMissions = activeMissionsRaw.map((m) => {
      const consumedHours = m.timeEntries.reduce((s, t) => s + t.duration, 0);
      const estimatedHours = m.estimatedHours || 0;
      const overdue = !!m.deadline && m.deadline.getTime() < now;
      const pct = estimatedHours > 0 ? consumedHours / estimatedHours : null;

      let status: "on-track" | "at-risk" | "critical";
      if (overdue || (pct !== null && pct >= 1)) status = "critical";
      else if (pct !== null && pct >= 0.85) status = "at-risk";
      else status = "on-track";

      return {
        id: m.id,
        client: m.client.companyName || `${m.client.firstName ?? ""} ${m.client.lastName ?? ""}`.trim(),
        type: m.type,
        title: m.title,
        estimatedHours,
        consumedHours,
        deadline: m.deadline,
        status,
        assignedTo: m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}`.trim() : "Non assigné",
        assignedToId: m.assignedToId,
      };
    });

    // 3. Équipe — agrégation réelle par collaborateur
    const users = await prisma.user.findMany({
      where: { isActive: true, role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] } },
      include: {
        assignedMissions: {
          where: { status: { in: ACTIVE_STATUSES } },
          select: {
            id: true,
            estimatedHours: true,
            deadline: true,
            timeEntries: { select: { duration: true } },
          },
        },
      },
    });

    const team = users
      .map((u) => {
        const missionsActives = u.assignedMissions.length;
        let totalConsumed = 0;
        let totalEstimated = 0;
        let dossiersBloques = 0;
        for (const m of u.assignedMissions) {
          totalConsumed += m.timeEntries.reduce((s, t) => s + t.duration, 0);
          totalEstimated += m.estimatedHours || 0;
          if (m.deadline && m.deadline.getTime() < now) dossiersBloques++;
        }
        const avancement = totalEstimated > 0 ? Math.round((totalConsumed / totalEstimated) * 100) : null;

        return {
          id: u.id,
          expert: `${u.firstName} ${u.lastName}`.trim(),
          missionsActives,
          heuresSaisies: Math.round(totalConsumed * 10) / 10,
          avancement,
          dossiersBloques,
        };
      })
      .filter((t) => t.missionsActives > 0)
      .sort((a, b) => b.missionsActives - a.missionsActives);

    return NextResponse.json({ stats, missions, activeMissions, team });
  } catch (error) {
    console.error("Erreur GET missions/budget:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
