import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

function clientName(client: { companyName: string | null; firstName: string | null; lastName: string | null }): string {
  return client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client sans nom";
}

function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

type Status = "Rentable" | "À Surveiller" | "Sous-facturé" | "Données Insuffisantes";

export async function GET() {
  try {
    await AuthService.requireAuth();

    const clients = await prisma.client.findMany({
      where: { isActive: true },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        timeEntries: { select: { duration: true, mission: { select: { hourlyRate: true } } } },
        invoices: { select: { total: true, status: true } },
      },
    });

    const rows = clients.map((c) => {
      const hoursSpent = c.timeEntries.reduce((s, te) => s + te.duration, 0);
      const hoursWithRate = c.timeEntries.filter((te) => te.mission?.hourlyRate).reduce((s, te) => s + te.duration, 0);
      const valorizedAmount = c.timeEntries.reduce((s, te) => s + te.duration * (te.mission?.hourlyRate ?? 0), 0);
      const standardRate = hoursWithRate > 0 ? valorizedAmount / hoursWithRate : null;

      const invoicedRevenue = c.invoices.filter((i) => i.status !== "DRAFT" && i.status !== "CANCELLED").reduce((s, i) => s + i.total, 0);
      const effectiveHourlyRate = hoursSpent > 0 ? invoicedRevenue / hoursSpent : null;

      const rateGapPct = (standardRate !== null && effectiveHourlyRate !== null && standardRate > 0)
        ? round(((effectiveHourlyRate - standardRate) / standardRate) * 100, 1)
        : null;

      let status: Status = "Données Insuffisantes";
      if (rateGapPct !== null) {
        status = rateGapPct >= 10 ? "Rentable" : rateGapPct <= -10 ? "Sous-facturé" : "À Surveiller";
      }

      return {
        id: c.id,
        company: clientName(c),
        invoicedRevenue: round(invoicedRevenue, 0),
        hoursSpent: round(hoursSpent, 1),
        standardRate: standardRate !== null ? round(standardRate, 0) : null,
        effectiveHourlyRate: effectiveHourlyRate !== null ? round(effectiveHourlyRate, 0) : null,
        rateGapPct,
        status,
      };
    }).filter((r) => r.hoursSpent > 0 || r.invoicedRevenue > 0)
      .sort((a, b) => b.invoicedRevenue - a.invoicedRevenue);

    const totalInvoiced = rows.reduce((s, r) => s + r.invoicedRevenue, 0);
    const totalHours = rows.reduce((s, r) => s + r.hoursSpent, 0);
    const totalValorized = clients.reduce((s, c) => s + c.timeEntries.reduce((ss, te) => ss + te.duration * (te.mission?.hourlyRate ?? 0), 0), 0);
    const avgEffectiveRate = totalHours > 0 ? round(totalInvoiced / totalHours, 0) : null;
    const billingRealizationPct = totalValorized > 0 ? round((totalInvoiced / totalValorized) * 100, 1) : null;
    const underbilledCount = rows.filter((r) => r.status === "Sous-facturé").length;

    // Répartition réelle par collaborateur (via TimeEntry.userId)
    const timeEntries = await prisma.timeEntry.findMany({
      select: {
        duration: true,
        userId: true,
        user: { select: { firstName: true, lastName: true, role: true } },
        mission: { select: { hourlyRate: true } },
      },
    });

    const byUser = new Map<string, { name: string; role: string; hours: number; valorized: number; hoursWithRate: number }>();
    for (const te of timeEntries) {
      const key = te.userId;
      const entry = byUser.get(key) ?? { name: `${te.user.firstName} ${te.user.lastName}`, role: te.user.role, hours: 0, valorized: 0, hoursWithRate: 0 };
      entry.hours += te.duration;
      if (te.mission?.hourlyRate) {
        entry.valorized += te.duration * te.mission.hourlyRate;
        entry.hoursWithRate += te.duration;
      }
      byUser.set(key, entry);
    }

    const collaborators = Array.from(byUser.values())
      .map((u) => ({
        name: u.name,
        role: u.role,
        hours: round(u.hours, 1),
        avgValuePerHour: u.hoursWithRate > 0 ? round(u.valorized / u.hoursWithRate, 0) : null,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 6);

    // Constat réel : client le plus sous-facturé (le plus grand écart négatif)
    const mostUnderbilled = rows
      .filter((r) => r.rateGapPct !== null && r.rateGapPct < 0)
      .sort((a, b) => (a.rateGapPct ?? 0) - (b.rateGapPct ?? 0))[0] ?? null;

    return NextResponse.json({
      clients: rows,
      kpis: {
        avgEffectiveRate,
        billingRealizationPct,
        underbilledCount,
        totalHours: round(totalHours, 0),
      },
      collaborators,
      insight: mostUnderbilled
        ? `Le dossier "${mostUnderbilled.company}" présente l'écart tarifaire le plus marqué : taux effectif ${mostUnderbilled.effectiveHourlyRate?.toLocaleString("fr-FR")} FCFA/h contre ${mostUnderbilled.standardRate?.toLocaleString("fr-FR")} FCFA/h au tarif standard des missions (${mostUnderbilled.rateGapPct}%).`
        : null,
    });
  } catch (error) {
    console.error("Erreur GET analysis/profitability:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
