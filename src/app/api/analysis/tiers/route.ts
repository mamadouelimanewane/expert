import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

function clientName(client: { companyName: string | null; firstName: string | null; lastName: string | null }): string {
  return client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client sans nom";
}

function round(n: number, decimals = 0): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

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
        invoices: { select: { total: true, status: true, issueDate: true, dueDate: true, paidDate: true } },
      },
    });

    const now = new Date();

    const rows = clients
      .filter((c) => c.invoices.length > 0)
      .map((c) => {
        const outstanding = c.invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE");
        const overdue = c.invoices.filter((i) => i.status === "OVERDUE");

        const balance = outstanding.reduce((s, i) => s + i.total, 0);
        const overdueAmount = overdue.reduce((s, i) => s + i.total, 0);

        const lastIssue = c.invoices.reduce((max, i) => (i.issueDate > max ? i.issueDate : max), c.invoices[0].issueDate);

        const overdueRatio = balance > 0 ? overdueAmount / balance : 0;
        const riskScore: "Faible" | "Modéré" | "Élevé" = overdueRatio >= 0.5 ? "Élevé" : overdueRatio >= 0.15 ? "Modéré" : "Faible";
        const status: "En Retard" | "Actif" | "Soldé" = overdueAmount > 0 ? "En Retard" : balance > 0 ? "Actif" : "Soldé";

        return {
          id: c.id,
          name: clientName(c),
          type: "Client" as const,
          balance: round(balance),
          overdue: round(overdueAmount),
          lastActivity: lastIssue.toLocaleDateString("fr-FR"),
          riskScore,
          status,
          invoiceCount: c.invoices.length,
        };
      })
      .sort((a, b) => b.balance - a.balance);

    const totalOutstanding = rows.reduce((s, r) => s + r.balance, 0);
    const totalOverdue = rows.reduce((s, r) => s + r.overdue, 0);
    const highRiskCount = rows.filter((r) => r.riskScore === "Élevé").length;

    // DSO réel : moyenne pondérée (par montant) du nombre de jours entre émission et règlement (ou aujourd'hui si impayée)
    const billedInvoices = clients.flatMap((c) => c.invoices).filter((i) => i.status !== "DRAFT" && i.status !== "CANCELLED");
    let dso: number | null = null;
    if (billedInvoices.length > 0) {
      let weightedDaysSum = 0;
      let totalAmount = 0;
      for (const inv of billedInvoices) {
        const endDate = inv.status === "PAID" && inv.paidDate ? inv.paidDate : now;
        const days = Math.max(0, (endDate.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24));
        weightedDaysSum += days * inv.total;
        totalAmount += inv.total;
      }
      dso = totalAmount > 0 ? round(weightedDaysSum / totalAmount) : null;
    }

    const topRisk = rows.filter((r) => r.riskScore === "Élevé").slice(0, 3);
    const concentrationLeader = rows[0] ?? null;
    const concentrationPct = concentrationLeader && totalOutstanding > 0 ? round((concentrationLeader.balance / totalOutstanding) * 100, 1) : null;

    const summaryParts: string[] = [];
    summaryParts.push("SYNTHÈSE DES COMPTES CLIENTS (données réelles)");
    summaryParts.push("");
    summaryParts.push(`Encours clients global : ${totalOutstanding.toLocaleString("fr-FR")} FCFA, dont ${totalOverdue.toLocaleString("fr-FR")} FCFA en retard (${totalOutstanding > 0 ? round((totalOverdue / totalOutstanding) * 100, 1) : 0}%).`);
    if (dso !== null) {
      summaryParts.push(`Délai moyen de paiement (DSO) calculé sur les factures émises : ${dso} jours.`);
    }
    if (concentrationLeader && concentrationPct !== null) {
      summaryParts.push(`Le client "${concentrationLeader.name}" concentre ${concentrationPct}% de l'encours global.`);
    }
    if (topRisk.length > 0) {
      summaryParts.push(`Comptes à risque élevé (>50% de l'encours en retard) : ${topRisk.map((r) => r.name).join(", ")}.`);
    } else {
      summaryParts.push("Aucun compte client ne présente un risque élevé de retard à ce jour.");
    }
    summaryParts.push("");
    summaryParts.push("Note : le module ne dispose pas encore d'un grand livre fournisseurs — cette analyse se limite au poste clients (factures émises).");

    return NextResponse.json({
      tiers: rows,
      kpis: { totalOutstanding: round(totalOutstanding), totalOverdue: round(totalOverdue), dso, highRiskCount },
      summary: summaryParts.join("\n"),
    });
  } catch (error) {
    console.error("Erreur GET analysis/tiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
