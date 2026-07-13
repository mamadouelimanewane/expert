import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Valide une période de paie et enregistre les fiches de paie calculées.
// Ne déclenche AUCUN virement réel : l'intégration Mobile Money (Wave/Orange/MTN)
// n'est pas configurée. Le statut reste VALIDATED (pas PAID) tant qu'un vrai
// paiement n'a pas été confirmé.
export async function POST(req: Request) {
  try {
    const { clientId, periodName, variables } = await req.json();

    if (!clientId || !periodName || !Array.isArray(variables) || variables.length === 0) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        periodName,
        status: "VALIDATED",
        clientId,
      },
    });

    const payslips = await Promise.all(
      variables.map((v: any) =>
        prisma.payslip.create({
          data: {
            absencesDays: v.absencesDays || 0,
            overtimeHours: v.overtimeHours || 0,
            bonuses: v.bonuses || 0,
            grossSalary: v.grossSalary || v.baseSalary || 0,
            netSalary: v.netSalary || 0,
            taxableIncome: v.taxableIncome || 0,
            taxes: v.taxes || 0,
            employeeSocials: v.socialSecurity || 0,
            employerSocials: v.employerContributions || 0,
            status: "VALIDATED",
            employeeId: v.employeeId,
            periodId: period.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true, period, payslips, paymentDisbursed: false });
  } catch (error) {
    console.error("[Payroll Validate] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
