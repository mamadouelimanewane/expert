import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { estIntrouvable, requireWriteAccess } from "@/lib/api-auth";
import { employeeUpdateSchema, parseBody } from "@/lib/validation";
import { AuditService } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const { data, invalid } = await parseBody(req, employeeUpdateSchema);
    if (invalid) return invalid;

    try {
        const { id } = await params;
        const avant = await prisma.employee.findFirst({ where: { id, cabinetId: session.cabinetId } });
        if (!avant) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        const updated = await prisma.employee.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: { ...data, ...(data.email !== undefined ? { email: data.email || null } : {}) },
        });
        if (!updated.count) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        const employee = await prisma.employee.findFirst({ where: { id, cabinetId: session.cabinetId } });
        if (!employee) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        const champs = Object.keys(data) as (keyof typeof data)[];
        await AuditService.log({
            action: "UPDATE",
            entity: "EMPLOYEE",
            entityId: id,
            oldValue: Object.fromEntries(champs.map((c) => [c, (avant as Record<string, unknown>)[c]])),
            newValue: data,
            details: `Salarié modifié : ${champs.join(", ")}`,
        });
        return NextResponse.json({ employee });
    } catch (error) {
        if (estIntrouvable(error)) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        console.error("Erreur PATCH payroll/employes/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;
    try {
        const { id } = await params;
        const existing = await prisma.employee.findFirst({ where: { id, cabinetId: session.cabinetId } });
        if (!existing) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        // Un salarié ayant déjà des bulletins validés ne se supprime pas :
        // les bulletins doivent rester rattachés à une personne.
        const bulletins = await prisma.payslip.count({ where: { employeeId: id, cabinetId: session.cabinetId } });
        if (bulletins > 0) {
            return NextResponse.json(
                { error: `Ce salarié a ${bulletins} bulletin(s) de paie : suppression refusée.` },
                { status: 409 }
            );
        }
        const result = await prisma.employee.deleteMany({ where: { id, cabinetId: session.cabinetId } });
        if (!result.count) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        const employee = existing;
        await AuditService.log({
            action: "DELETE",
            entity: "EMPLOYEE",
            entityId: id,
            oldValue: { firstName: employee.firstName, lastName: employee.lastName },
            details: `Salarié supprimé : ${employee.firstName} ${employee.lastName}`,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        if (estIntrouvable(error)) return NextResponse.json({ error: "Salarié introuvable" }, { status: 404 });
        console.error("Erreur DELETE payroll/employes/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
