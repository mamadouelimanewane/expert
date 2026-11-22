import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { countryName, getRegionalCapabilities } from "@/lib/regional-capabilities";

export const dynamic = "force-dynamic";

/** Agrégats du cabinet courant, utilisés par le cockpit de synchronisation. */
export async function GET() {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  try {
    const now = new Date();
    const overdueInvoices = {
      OR: [
        { status: "OVERDUE" as const },
        { status: "SENT" as const, dueDate: { lt: now } },
      ],
    };

    const [cabinet, clients, activeMissions, overdueTasks, pendingInvoices, overdueAmount, pendingBankTransactions, openYearEndCloses, pendingCloseItems] = await Promise.all([
      prisma.cabinet.findUnique({ where: { id: session.cabinetId! }, select: { nom: true, pays: true } }),
      prisma.client.count({ where: { cabinetId: session.cabinetId!, isActive: true } }),
      prisma.mission.count({ where: { cabinetId: session.cabinetId!, status: { in: ["DRAFT", "IN_PROGRESS", "PENDING_REVIEW"] } } }),
      prisma.task.count({ where: { cabinetId: session.cabinetId!, dueDate: { lt: now }, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      prisma.invoice.count({ where: { cabinetId: session.cabinetId!, status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.invoice.aggregate({ where: { cabinetId: session.cabinetId!, ...overdueInvoices }, _sum: { total: true } }),
      prisma.bankTransaction.count({ where: { cabinetId: session.cabinetId!, status: "PENDING" } }),
      prisma.yearEndClose.count({ where: { cabinetId: session.cabinetId!, status: "OPEN" } }),
      prisma.yearEndCloseItem.count({ where: { cabinetId: session.cabinetId!, status: "PENDING" } }),
    ]);

    const countryCode = cabinet?.pays ?? "SN";
    return NextResponse.json({
      asOf: now.toISOString(),
      cabinet: { name: cabinet?.nom ?? "Cabinet", countryCode, countryName: countryName(countryCode) },
      metrics: {
        activeClients: clients,
        activeMissions,
        overdueTasks,
        pendingInvoices,
        overdueAmount: overdueAmount._sum.total ?? 0,
        pendingBankTransactions,
        openYearEndCloses,
        pendingCloseItems,
      },
      capabilities: getRegionalCapabilities(countryCode),
    });
  } catch (error) {
    console.error("Erreur cockpit régional:", error);
    return NextResponse.json({ error: "Le cockpit n'a pas pu charger les indicateurs du cabinet." }, { status: 500 });
  }
}
