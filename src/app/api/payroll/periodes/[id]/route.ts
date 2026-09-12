import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { parseBody, periodePaiementSchema } from "@/lib/validation";
import { AuditService } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

const idValide = (id: string) => /^[0-9a-f]{24}$/.test(id);

/** Une période de paie avec ses bulletins complets (impression, export). */
export async function GET(_req: Request, { params }: Params) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { id } = await params;
    if (!idValide(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const periode = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: {
            client: {
                select: { id: true, companyName: true, firstName: true, lastName: true, address: true, city: true, country: true, ninea: true, rccm: true, ifu: true },
            },
            payslips: {
                include: {
                    employee: {
                        select: { id: true, firstName: true, lastName: true, position: true, maritalStatus: true, childrenCount: true, isCadre: true, sexe: true, modePaiement: true, banque: true, iban: true, numeroMobileMoney: true },
                    },
                },
                orderBy: { employee: { lastName: "asc" } },
            },
        },
    });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });
    return NextResponse.json({ periode });
}

/**
 * Constate le paiement d'une période (VALIDATED → PAID) ou l'annule
 * (PAID → VALIDATED). Saisie manuelle : l'application n'émet aucun virement,
 * le paiement réel se fait par la banque ou l'opérateur Mobile Money à partir
 * de l'ordre de paiement exporté.
 */
export async function PATCH(req: Request, { params }: Params) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    const { id } = await params;
    if (!idValide(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const { data, invalid } = await parseBody(req, periodePaiementSchema);
    if (invalid) return invalid;

    const periode = await prisma.payrollPeriod.findUnique({ where: { id }, select: { id: true, status: true, periodName: true, paidAt: true, paymentMode: true, paymentRef: true } });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });

    if (data.status === "PAID") {
        if (periode.status === "PAID") return NextResponse.json({ error: "Cette période est déjà marquée payée." }, { status: 409 });
        if (!data.paymentMode) return NextResponse.json({ error: "Le mode de paiement est requis." }, { status: 400 });
    } else if (periode.status !== "PAID") {
        return NextResponse.json({ error: "Cette période n'est pas marquée payée." }, { status: 409 });
    }

    const paiement =
        data.status === "PAID"
            ? { status: "PAID", paidAt: data.paidAt ?? new Date(), paymentMode: data.paymentMode!, paymentRef: data.paymentRef ?? null }
            : { status: "VALIDATED", paidAt: null, paymentMode: null, paymentRef: null };

    const [maj] = await prisma.$transaction([
        prisma.payrollPeriod.update({ where: { id }, data: paiement }),
        prisma.payslip.updateMany({ where: { periodId: id }, data: { status: paiement.status } }),
    ]);

    await AuditService.log({
        action: "UPDATE",
        entity: "PAYROLL_PERIOD",
        entityId: id,
        oldValue: { status: periode.status, paidAt: periode.paidAt, paymentMode: periode.paymentMode, paymentRef: periode.paymentRef },
        newValue: paiement,
        details:
            data.status === "PAID"
                ? `Paie ${periode.periodName} marquée payée (${paiement.paymentMode}${paiement.paymentRef ? ", réf. " + paiement.paymentRef : ""})`
                : `Paiement de la paie ${periode.periodName} annulé`,
    });

    return NextResponse.json({ periode: maj });
}

/**
 * Annule une période validée (et ses bulletins) pour permettre une nouvelle
 * validation après correction. Une période payée ne s'annule pas : il faut
 * d'abord annuler le constat de paiement.
 */
export async function DELETE(_req: Request, { params }: Params) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    const { id } = await params;
    if (!idValide(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const periode = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: { payslips: { select: { netSalary: true } } },
    });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });
    if (periode.status === "PAID") {
        return NextResponse.json({ error: "Période payée : annulez d'abord le constat de paiement." }, { status: 409 });
    }

    await prisma.$transaction([
        prisma.payslip.deleteMany({ where: { periodId: id } }),
        prisma.payrollPeriod.delete({ where: { id } }),
    ]);

    await AuditService.log({
        action: "DELETE",
        entity: "PAYROLL_PERIOD",
        entityId: id,
        oldValue: { periodName: periode.periodName, clientId: periode.clientId, bulletins: periode.payslips.length, netTotal: periode.payslips.reduce((a, p) => a + p.netSalary, 0) },
        details: `Paie ${periode.periodName} annulée (${periode.payslips.length} bulletins supprimés)`,
    });

    return NextResponse.json({ success: true });
}
