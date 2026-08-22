import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
const STATUS_MAP: Record<string, string> = {
  DRAFT: "planning",
  IN_PROGRESS: "fieldwork",
  PENDING_REVIEW: "review",
  COMPLETED: "finalized",
  CANCELLED: "finalized",
};

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const missions = await prisma.mission.findMany({
      where: { type: "AUDIT" },
      include: {
        client: { select: { companyName: true, firstName: true, lastName: true, sector: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
        auditSections: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const audits = missions.map((m) => {
      const totalItems = m.auditSections.reduce((s, sec) => s + sec.items.length, 0);
      const doneItems = m.auditSections.reduce((s, sec) => s + sec.items.filter((i) => i.status === "TERMINE").length, 0);
      const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

      const critical = m.auditSections.filter((s) => s.conclusion === "NON_CONFORME").length;
      const medium = m.auditSections.filter((s) => s.conclusion === "RESERVE").length;

      const riskLevel = critical > 0 ? "high" : medium > 0 ? "medium" : "low";

      return {
        id: m.id,
        title: m.title,
        client: m.client.companyName || `${m.client.firstName ?? ""} ${m.client.lastName ?? ""}`.trim() || "Client sans nom",
        sector: m.client.sector || "Non renseigné",
        status: STATUS_MAP[m.status] || "planning",
        riskLevel,
        progress,
        leadAuditor: m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}` : "Non assigné",
        dueDate: m.deadline ? m.deadline.toLocaleDateString("fr-FR") : "—",
        findings: { critical, medium },
      };
    });

    const activeMissions = audits.filter((a) => a.status === "fieldwork" || a.status === "planning" || a.status === "review").length;
    const criticalFindings = audits.reduce((s, a) => s + a.findings.critical, 0);

    const totalItemsAll = missions.reduce((s, m) => s + m.auditSections.reduce((s2, sec) => s2 + sec.items.length, 0), 0);
    const doneItemsAll = missions.reduce(
      (s, m) => s + m.auditSections.reduce((s2, sec) => s2 + sec.items.filter((i) => i.status === "TERMINE").length, 0),
      0
    );
    const closureRate = totalItemsAll > 0 ? Math.round((doneItemsAll / totalItemsAll) * 100) : null;

    const auditDaysAgg = await prisma.timeEntry.aggregate({
      _sum: { duration: true },
      where: { category: "AUDIT" },
    });
    const auditDays = auditDaysAgg._sum.duration ? Math.round(auditDaysAgg._sum.duration / 8) : 0;

    return NextResponse.json({
      audits,
      kpis: { activeMissions, criticalFindings, auditDays, closureRate },
    });
  } catch (error) {
    console.error("Erreur GET corporate/audit-assurance:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
