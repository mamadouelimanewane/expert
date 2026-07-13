import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function relativeDateFr(date: Date | null): string {
  if (!date) return "Aucune interaction";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `${days} jours`;
  const months = Math.floor(days / 30);
  return `${months} mois`;
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      include: {
        invoices: { select: { status: true, dueDate: true } },
        meetings: { orderBy: { startTime: "desc" }, take: 1, select: { startTime: true, title: true } },
        timeEntries: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
        missions: { where: { status: { in: ["DRAFT", "IN_PROGRESS", "PENDING_REVIEW"] } }, orderBy: { deadline: "asc" }, take: 1, select: { title: true, deadline: true } },
      },
    });

    const clientHealth = clients.map((c) => {
      const overdueCount = c.invoices.filter((i) => i.status === "OVERDUE").length;
      const billingHealth = c.invoices.length > 0
        ? Math.round(100 * (c.invoices.length - overdueCount) / c.invoices.length)
        : null;

      const lastMeeting = c.meetings[0]?.startTime ?? null;
      const lastEntry = c.timeEntries[0]?.date ?? null;
      const lastInteractionDate = [lastMeeting, lastEntry].filter(Boolean).sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as Date | undefined;

      const score = c.healthScore ?? null;
      const riskLevel = score === null ? "unknown" : score >= 75 ? "low" : score >= 50 ? "medium" : "high";

      return {
        id: c.id,
        name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
        score,
        rating: c.rating,
        riskLevel,
        lastInteraction: relativeDateFr(lastInteractionDate ?? null),
        nextAction: c.missions[0] ? `${c.missions[0].title}${c.missions[0].deadline ? " — " + c.missions[0].deadline.toLocaleDateString("fr-FR") : ""}` : "Aucune action programmée",
        billingHealth,
        overdueInvoices: overdueCount,
      };
    });

    const scored = clientHealth.filter((c) => c.score !== null);
    const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.score as number), 0) / scored.length) : null;
    const highRiskCount = clientHealth.filter((c) => c.riskLevel === "high").length;

    const [qualifiedProspects, activeMissions] = await Promise.all([
      prisma.prospect.count({ where: { etape: "QUALIFIE" } }),
      prisma.mission.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    const highRiskClients = clientHealth
      .filter((c) => c.riskLevel === "high")
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 5)
      .map((c) => ({
        client: c.name,
        reason: c.overdueInvoices > 0
          ? `${c.overdueInvoices} facture(s) en retard, score de santé ${c.score}/100`
          : `Score de santé faible (${c.score}/100), dernière interaction: ${c.lastInteraction}`,
        risk: "High" as const,
      }));

    return NextResponse.json({
      clients: clientHealth,
      kpis: { avgScore, highRiskCount, qualifiedProspects, activeMissions },
      highRiskClients,
    });
  } catch (error) {
    console.error("Erreur GET analysis/clients-radar:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
