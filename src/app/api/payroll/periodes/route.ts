import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

/** Périodes de paie validées d'un dossier, avec leurs totaux. */
export async function GET(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const clientId = new URL(req.url).searchParams.get("clientId");
    if (!isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    const periodes = await prisma.payrollPeriod.findMany({
        where: { clientId, cabinetId: session.cabinetId },
        orderBy: { createdAt: "desc" },
        include: { payslips: { select: { netSalary: true, grossSalary: true, taxes: true, employeeSocials: true, employerSocials: true } } },
    });
    return NextResponse.json({
        periodes: periodes.map((p) => ({
            id: p.id,
            periodName: p.periodName,
            status: p.status,
            ruleVersion: p.ruleVersion,
            ruleInfo: p.ruleInfo,
            createdAt: p.createdAt,
            paidAt: p.paidAt,
            paymentMode: p.paymentMode,
            paymentRef: p.paymentRef,
            bulletins: p.payslips.length,
            totalBrut: p.payslips.reduce((a, b) => a + b.grossSalary, 0),
            totalNet: p.payslips.reduce((a, b) => a + b.netSalary, 0),
            totalImpots: p.payslips.reduce((a, b) => a + b.taxes, 0),
            totalCotisations: p.payslips.reduce((a, b) => a + b.employeeSocials + b.employerSocials, 0),
        })),
    });
}
