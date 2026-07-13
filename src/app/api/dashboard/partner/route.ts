import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

const MISSION_TYPE_LABELS: Record<string, string> = {
  AUDIT: "Audit",
  CONSEIL: "Conseil & Stratégie",
  TENUE_COMPTABLE: "Comptabilité",
  DECLARATION_FISCALE: "Déclarations Fiscales",
  PAIE: "Paie & Social",
  EXPERTISE_JUDICIAIRE: "Expertise Judiciaire",
  AUTRE: "Autre",
};

export async function GET() {
  try {
    await AuthService.requireAuth();

    const now = new Date();
    const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const d180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // ── Collaborateurs (équipe) ──
    const users = await prisma.user.findMany({
      where: { isActive: true, role: { not: "CLIENT" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        timeEntries: { select: { duration: true, mission: { select: { hourlyRate: true } } } },
        assignedMissions: { select: { status: true, tasks: { select: { status: true } } } },
      },
    });

    const team = users
      .map((u) => {
        const hours = u.timeEntries.reduce((s, te) => s + te.duration, 0);
        const valorized = u.timeEntries.reduce((s, te) => s + te.duration * (te.mission?.hourlyRate ?? 0), 0);
        const assignedCount = u.assignedMissions.length;
        const completedCount = u.assignedMissions.filter((m) => m.status === "COMPLETED").length;
        const completionRate = assignedCount > 0 ? round((completedCount / assignedCount) * 100) : null;
        const tasksCompleted = u.assignedMissions.flatMap((m) => m.tasks).filter((t) => t.status === "COMPLETED").length;

        let status: "Top" | "Moyen" | "Alerte" | "Données Insuffisantes" = "Données Insuffisantes";
        if (completionRate !== null) {
          status = completionRate >= 90 ? "Top" : completionRate >= 60 ? "Moyen" : "Alerte";
        }

        return {
          id: u.id,
          collaborator: `${u.firstName} ${u.lastName}`,
          role: u.role,
          hours: round(hours, 1),
          valorizedAmount: round(valorized),
          assignedMissions: assignedCount,
          completedMissions: completedCount,
          completionRate,
          tasksCompleted,
          status,
        };
      })
      .filter((u) => u.hours > 0 || u.assignedMissions > 0)
      .sort((a, b) => b.hours - a.hours);

    // ── CA facturé (90 derniers jours) vs période précédente ──
    const [currentInvoices, previousInvoices] = await Promise.all([
      prisma.invoice.findMany({ where: { status: { notIn: ["DRAFT", "CANCELLED"] }, issueDate: { gte: d90 } }, select: { total: true } }),
      prisma.invoice.findMany({ where: { status: { notIn: ["DRAFT", "CANCELLED"] }, issueDate: { gte: d180, lt: d90 } }, select: { total: true } }),
    ]);
    const caCurrent = currentInvoices.reduce((s, i) => s + i.total, 0);
    const caPrevious = previousInvoices.reduce((s, i) => s + i.total, 0);
    const caTrendPct = caPrevious > 0 ? round(((caCurrent - caPrevious) / caPrevious) * 100, 1) : null;

    // ── Dossiers en retard ──
    const overdueMissions = await prisma.mission.count({
      where: { deadline: { lt: now }, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    });

    // ── Heures enregistrées (90j) ──
    const hoursLogged90 = await prisma.timeEntry.aggregate({
      where: { date: { gte: d90 } },
      _sum: { duration: true },
    });

    // ── Nouveaux clients (90j) vs période précédente ──
    const [newClients90, newClientsPrev90] = await Promise.all([
      prisma.client.count({ where: { createdAt: { gte: d90 } } }),
      prisma.client.count({ where: { createdAt: { gte: d180, lt: d90 } } }),
    ]);

    // ── Répartition de la valeur facturable par type de mission (proxy du mix de revenus) ──
    const allTimeEntries = await prisma.timeEntry.findMany({
      select: { duration: true, mission: { select: { hourlyRate: true, type: true } } },
    });
    const byType = new Map<string, number>();
    for (const te of allTimeEntries) {
      if (!te.mission?.hourlyRate || !te.mission.type) continue;
      const amount = te.duration * te.mission.hourlyRate;
      byType.set(te.mission.type, (byType.get(te.mission.type) ?? 0) + amount);
    }
    const totalValorized = Array.from(byType.values()).reduce((s, v) => s + v, 0);
    const revenueMix = Array.from(byType.entries())
      .map(([type, amount]) => ({
        label: MISSION_TYPE_LABELS[type] ?? type,
        amount: round(amount),
        percentage: totalValorized > 0 ? round((amount / totalValorized) * 100, 1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ── Missions actives (résumé) ──
    const activeMissions = await prisma.mission.count({ where: { status: "IN_PROGRESS" } });

    return NextResponse.json({
      cabinet: {
        caCurrent: round(caCurrent),
        caTrendPct,
        overdueMissions,
        hoursLogged90: round(hoursLogged90._sum.duration ?? 0, 1),
        newClients90,
        newClientsTrend: newClients90 - newClientsPrev90,
        activeMissions,
      },
      team,
      revenueMix,
    });
  } catch (error) {
    console.error("Erreur GET dashboard/partner:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
