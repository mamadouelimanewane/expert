import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
// Valide une période de paie et enregistre les fiches de paie calculées.
// Ne déclenche AUCUN virement réel : l'intégration Mobile Money (Wave/Orange/MTN)
// n'est pas configurée. Le statut reste VALIDATED (pas PAID) tant qu'un vrai
// paiement n'a pas été confirmé.
export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { clientId, periodName, variables } = await req.json();

    if (!clientId || !periodName || !Array.isArray(variables) || variables.length === 0) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    // Chaque bulletin doit être rattaché à un salarié existant du dossier :
    // un employeId absent faisait échouer Prisma en 500 après avoir déjà créé
    // la période de paie, laissant une période « VALIDATED » vide en base.
    const ids = variables.map((v: { employeeId?: unknown }) => v.employeeId);
    if (ids.some((id) => typeof id !== "string" || id.length !== 24)) {
      return NextResponse.json({ error: "Chaque variable de paie doit référencer un employeeId valide." }, { status: 400 });
    }
    const salaries = await prisma.employee.count({ where: { id: { in: ids as string[] }, clientId } });
    if (salaries !== new Set(ids).size) {
      return NextResponse.json({ error: "Un ou plusieurs salariés sont introuvables pour ce client." }, { status: 404 });
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
