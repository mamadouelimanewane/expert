import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Les brouillons et les factures annulees entraient dans le CA du mois et
    // dans la croissance affichee au comite de direction.
    const CA_STATUTS = ["SENT", "OVERDUE", "PAID"] as const;

    const [invoicesThisMonth, invoicesPrevMonth, allInvoices, missions, upcomingDeclarations, staff, totalClients, saisiesTemps] = await Promise.all([
      prisma.invoice.findMany({ where: { issueDate: { gte: startOfMonth }, status: { in: [...CA_STATUTS] } } }),
      prisma.invoice.findMany({ where: { issueDate: { gte: startOfPrevMonth, lt: startOfMonth }, status: { in: [...CA_STATUTS] } } }),
      prisma.invoice.findMany(),
      prisma.mission.findMany({
        include: { client: { select: { companyName: true, firstName: true, lastName: true } }, timeEntries: { select: { duration: true, invoiceId: true } } },
      }),
      prisma.taxDeclaration.findMany({
        where: { status: "PENDING", dueDate: { lte: in3Days } },
        include: { client: { select: { companyName: true } } },
        take: 5,
      }),
      prisma.user.findMany({ where: { role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] }, isActive: true } }),
      prisma.client.count({ where: { isActive: true } }),
      // Les heures etaient lues sur les missions ASSIGNEES au collaborateur, et
      // non sur ses propres saisies : sur une mission assignee a A, les 40 h
      // saisies par B etaient portees au compte de A, qui affichait 50 h quand
      // B affichait 0. Le taux de facturation et le CA par collaborateur
      // heritaient de la meme erreur. /api/dashboard/partner faisait deja le
      // calcul correctement, d'ou deux tableaux de bord discordants.
      prisma.timeEntry.findMany({ select: { userId: true, duration: true, invoiceId: true } }),
    ]);

    const tempsParCollaborateur = new Map<string, { heures: number; facturees: number }>();
    for (const t of saisiesTemps) {
      const cumul = tempsParCollaborateur.get(t.userId) || { heures: 0, facturees: 0 };
      cumul.heures += t.duration;
      if (t.invoiceId) cumul.facturees += t.duration;
      tempsParCollaborateur.set(t.userId, cumul);
    }

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
      const cumul = tempsParCollaborateur.get(u.id) || { heures: 0, facturees: 0 };
      const hours = cumul.heures;
      // Taux facturable réel : part des heures effectivement rattachées à une facture
      // (TimeEntry.invoiceId). Remplace l'ancien binaire 100%/0% ("TimeEntry n'a pas de
      // flag facturable dédié" — inexact : invoiceId est ce flag).
      const billable = hours > 0 ? Math.round((cumul.facturees / hours) * 100) : 0;
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
        totalClients,
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
