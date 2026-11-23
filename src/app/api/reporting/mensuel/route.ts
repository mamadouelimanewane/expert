import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

const STATUTS_CA = ["SENT", "OVERDUE", "PAID"] as const;

export async function GET(request: Request) {
  const { denied } = await requireStaff();
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const year = Number(params.get("year") ?? new Date().getFullYear());
  const month = Number(params.get("month") ?? new Date().getMonth() + 1);
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Période invalide." }, { status: 400 });
  }
  const start = new Date(year, month - 1, 1), end = new Date(year, month, 1);
  try {
    const [invoices, paidInvoices, missions, hours] = await Promise.all([
      prisma.invoice.findMany({ where: { issueDate: { gte: start, lt: end }, status: { in: [...STATUTS_CA] } }, include: { client: { select: { companyName: true, firstName: true, lastName: true } } }, orderBy: { issueDate: "desc" } }),
      prisma.invoice.findMany({ where: { status: "PAID", paidDate: { gte: start, lt: end } }, select: { total: true } }),
      prisma.mission.findMany({ where: { status: { in: ["IN_PROGRESS", "PENDING_REVIEW", "COMPLETED"] } }, include: { client: { select: { companyName: true, firstName: true, lastName: true } }, timeEntries: { select: { duration: true } } }, orderBy: { deadline: "asc" } }),
      prisma.timeEntry.aggregate({ _sum: { duration: true }, where: { date: { gte: start, lt: end } } }),
    ]);
    const collected = paidInvoices.reduce((sum, i) => sum + i.total, 0);
    const recognized = invoices.reduce((sum, i) => sum + i.total, 0);
    const receivable = invoices.filter(i => i.status !== "PAID").reduce((sum, i) => sum + i.total, 0);
    const missionRows = missions.map(m => {
      const consumed = m.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const pct = m.estimatedHours && m.estimatedHours > 0 ? Math.round(consumed / m.estimatedHours * 100) : null;
      return { id: m.id, title: m.title, client: m.client.companyName || `${m.client.firstName ?? ""} ${m.client.lastName ?? ""}`.trim() || "Client", status: m.status, deadline: m.deadline, estimatedHours: m.estimatedHours, consumedHours: Math.round(consumed * 10) / 10, budgetUsePercent: pct, fixedPrice: m.fixedPrice };
    });
    const alerts = missionRows.filter(m => m.budgetUsePercent !== null && m.budgetUsePercent! >= 80 && m.status !== "COMPLETED").map(m => `${m.title} : ${m.budgetUsePercent}% du budget horaire consommé.`);
    return NextResponse.json({
      period: { year, month, label: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(start) },
      provenance: "Factures émises sur le mois (TTC), tous les règlements datés du mois même si la facture est antérieure, temps saisis sur le mois et missions actives. Les factures constituent un indicateur de facturation, pas une reconnaissance comptable du chiffre d’affaires.",
      kpis: { revenue: recognized, collected, receivable, invoiceCount: invoices.length, hours: Math.round((hours._sum.duration ?? 0) * 10) / 10, activeMissions: missionRows.filter(m => m.status !== "COMPLETED").length },
      invoices: invoices.map(i => ({ id: i.id, number: i.invoiceNumber, date: i.issueDate, status: i.status, total: i.total, client: i.client.companyName || `${i.client.firstName ?? ""} ${i.client.lastName ?? ""}`.trim() || "Client" })),
      missions: missionRows,
      alerts,
    });
  } catch (error) {
    console.error("Monthly reporting GET:", error);
    return NextResponse.json({ error: "Impossible de générer le rapport pour cette période." }, { status: 500 });
  }
}
