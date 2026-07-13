import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [invoicesThisMonth, invoicesPrevMonth, allInvoices, missions, upcomingDeclarations, staff] = await Promise.all([
      prisma.invoice.findMany({ where: { issueDate: { gte: startOfMonth } } }),
      prisma.invoice.findMany({ where: { issueDate: { gte: startOfPrevMonth, lt: startOfMonth } } }),
      prisma.invoice.findMany(),
      prisma.mission.findMany({
        include: { client: { select: { companyName: true, firstName: true, lastName: true } }, timeEntries: { select: { duration: true } } },
      }),
      prisma.taxDeclaration.findMany({
        where: { status: "PENDING", dueDate: { lte: in3Days } },
        include: { client: { select: { companyName: true } } },
        take: 5,
      }),
      prisma.user.findMany({ where: { role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] }, isActive: true } }),
    ]);

    const caMois = invoicesThisMonth.reduce((s, i) => s + i.total, 0);
    const caPrevMois = invoicesPrevMonth.reduce((s, i) => s + i.total, 0);
    const croissance = caPrevMois > 0 ? Math.round(((caMois - caPrevMois) / caPrevMois) * 100) : 0;

    const paidCount = allInvoices.filter(i => i.status === "PAID").length;
    const relevantCount = allInvoices.filter(i => ["PAID", "OVERDUE", "SENT"].includes(i.status)).length;
    const recouvrement = relevantCount > 0 ? Math.round((paidCount / relevantCount) * 100) : 0;

    const missionsActives = missions.filter(m => m.status === "IN_PROGRESS").length;

    const overdueInvoices = allInvoices.filter(i => i.status === "OVERDUE");
    const overBudgetMissions = missions.filter(m => {
      if (!m.estimatedHours) return false;
      const consumed = m.timeEntries.reduce((s, t) => s + t.duration, 0);
      return consumed > m.estimatedHours;
    });

    const alertes = [
      ...upcomingDeclarations.map((d, i) => ({
        id: `decl-${d.id}`,
        text: `Déclaration ${d.type} — ${d.client.companyName || "Client"} — échéance ${new Date(d.dueDate).toLocaleDateString("fr-FR")}`,
        type: "urgent",
      })),
      ...overdueInvoices.slice(0, 5).map(inv => ({
        id: `inv-${inv.id}`,
        text: `Facture ${inv.invoiceNumber} impayée depuis échéance du ${new Date(inv.dueDate).toLocaleDateString("fr-FR")}`,
        type: "warning",
      })),
      ...overBudgetMissions.slice(0, 5).map(m => ({
        id: `mis-${m.id}`,
        text: `Mission "${m.title}" — ${m.client.companyName || "Client"} — dépassement de budget horaire`,
        type: "critical",
      })),
    ];

    const collaborateurs = staff.map(u => {
      const assignedMissions = missions.filter(m => m.assignedToId === u.id);
      const hours = assignedMissions.reduce((s, m) => s + m.timeEntries.reduce((s2, t) => s2 + t.duration, 0), 0);
      const totalEntries = assignedMissions.flatMap(m => m.timeEntries);
      const billable = totalEntries.length > 0 ? 100 : 0; // TimeEntry n'a pas de flag facturable dédié ici
      const ca = assignedMissions.reduce((s, m) => s + (m.fixedPrice || (m.hourlyRate ? m.hourlyRate * (m.estimatedHours || 0) : 0)), 0);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        hours: Math.round(hours),
        billable,
        ca,
      };
    });

    const pipeline = {
      prospects: missions.filter(m => m.status === "DRAFT").length,
      enCours: missions.filter(m => m.status === "IN_PROGRESS").length,
      revision: missions.filter(m => m.status === "PENDING_REVIEW").length,
      cloture: missions.filter(m => m.status === "COMPLETED").length,
    };

    return NextResponse.json({
      kpis: {
        recouvrement,
        caMois,
        croissance,
        missionsActives,
        alertes: alertes.length,
      },
      alertes,
      collaborateurs,
      pipeline,
    });
  } catch (error) {
    console.error("Erreur GET dashboard/executive:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
