import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/api-auth";
import { calculatePayroll, estPaysSupporte, PAYS_SUPPORTES, obtenirReglesPaie } from "@/lib/payroll/engines";
import { AuditService } from "@/lib/audit";

/**
 * Valide une période de paie et enregistre les bulletins.
 *
 * Le calcul est REFAIT côté serveur à partir des fiches salariés en base et
 * des seules variables du mois (absences, heures, primes) : la version
 * précédente enregistrait tels quels les montants envoyés par le navigateur,
 * qu'un client modifié pouvait fixer librement. Chaque bulletin fige aussi
 * les éléments d'entrée et le détail des rubriques, pour rester imprimable
 * à l'identique après une modification de la fiche du salarié.
 *
 * Ne déclenche AUCUN virement réel : l'intégration Mobile Money n'est pas
 * configurée. Le statut reste VALIDATED (pas PAID) tant qu'un vrai paiement
 * n'a pas été confirmé.
 */
interface VariableMois {
    employeeId?: unknown;
    absencesDays?: unknown;
    overtimeHours?: unknown;
    bonuses?: unknown;
}

const nombre = (v: unknown, defaut = 0) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || defaut);

export async function POST(req: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const { clientId, periodName, variables } = await req.json();

        if (!clientId || !periodName || !Array.isArray(variables) || variables.length === 0) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }
        const ids = (variables as VariableMois[]).map((v) => v.employeeId);
        if (ids.some((id) => typeof id !== "string" || id.length !== 24)) {
            return NextResponse.json({ error: "Chaque variable de paie doit référencer un employeeId valide." }, { status: 400 });
        }

        const client = await prisma.client.findFirst({
            where: { id: clientId, cabinetId: session.cabinetId },
            include: { employees: { where: { id: { in: ids as string[] } } } },
        });
        if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        if (client.employees.length !== new Set(ids).size) {
            return NextResponse.json({ error: "Un ou plusieurs salariés sont introuvables pour ce client." }, { status: 404 });
        }
        if (!estPaysSupporte(client.country)) {
            return NextResponse.json(
                { error: `Aucun barème de paie pour « ${client.country} » (disponibles : ${PAYS_SUPPORTES.join(", ")}).` },
                { status: 422 }
            );
        }

        // Une même période ne se valide qu'une fois par dossier.
        const existante = await prisma.payrollPeriod.findFirst({ where: { clientId, cabinetId: session.cabinetId, periodName } });
        if (existante) {
            return NextResponse.json(
                { error: `La période « ${periodName} » est déjà validée pour ce dossier (${existante.id}).`, periodId: existante.id },
                { status: 409 }
            );
        }

        const bulletins = client.employees.map((emp) => {
            const v = (variables as VariableMois[]).find((x) => x.employeeId === emp.id) ?? {};
            const absencesDays = Math.max(0, Math.min(30, Math.round(nombre(v.absencesDays))));
            const overtimeHours = Math.max(0, nombre(v.overtimeHours));
            const bonuses = Math.max(0, nombre(v.bonuses));
            const r = calculatePayroll(client.country, {
                baseSalary: emp.baseSalary || 0,
                absencesDays,
                overtimeHours,
                bonuses,
                transportAllowance: emp.transportAllowance || 0,
                maritalStatus: emp.maritalStatus || "CELIBATAIRE",
                childrenCount: emp.childrenCount || 0,
                isCadre: emp.isCadre || false,
                conjointsSansRevenu: emp.conjointsSansRevenu || 0,
                sexe: emp.sexe === "F" ? "F" : "M",
                benefitsInKind: emp.avantagesNature || 0,
                ...(client.paieAccidentRate != null ? { accidentRate: client.paieAccidentRate } : {}),
                ...(client.paieIpmSalarial != null ? { ipmRateSalarial: client.paieIpmSalarial } : {}),
                ...(client.paieIpmPatronal != null ? { ipmRatePatronal: client.paieIpmPatronal } : {}),
            });
            return { emp, absencesDays, overtimeHours, bonuses, r };
        });

        const reglesPaie = obtenirReglesPaie(client.country);
        const period = await prisma.payrollPeriod.create({
            data: { cabinetId: session.cabinetId, periodName, status: "VALIDATED", clientId, ruleVersion: reglesPaie?.version ?? null, ruleInfo: reglesPaie ?? undefined },
        });

        const payslips = await Promise.all(
            bulletins.map(({ emp, absencesDays, overtimeHours, bonuses, r }) =>
                prisma.payslip.create({
                    data: {
                        absencesDays,
                        overtimeHours,
                        bonuses,
                        baseSalary: emp.baseSalary || 0,
                        transportAllowance: emp.transportAllowance || 0,
                        avantagesNature: emp.avantagesNature || 0,
                        country: client.country,
                        detail: r.detail as object,
                        grossSalary: r.grossSalary,
                        netSalary: r.netSalary,
                        taxableIncome: r.taxableIncome,
                        taxes: r.taxes,
                        employeeSocials: r.socialSecurity,
                        employerSocials: r.employerContributions,
                        status: "VALIDATED",
                        employeeId: emp.id,
                        periodId: period.id,
                    },
                })
            )
        );

        await AuditService.log({
            action: "CREATE",
            entity: "PAYROLL_PERIOD",
            entityId: period.id,
            newValue: { periodName, bulletins: payslips.length, netTotal: payslips.reduce((a, p) => a + p.netSalary, 0) },
            details: `Paie validée : ${periodName} (${payslips.length} bulletins)`,
        });

        return NextResponse.json({ success: true, period, payslips, paymentDisbursed: false, reglesPaie });
    } catch (error) {
        console.error("[Payroll Validate] Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
