import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

/** Une période de paie avec ses bulletins complets (impression, export). */
export async function GET(_req: Request, { params }: Params) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { id } = await params;
    if (!/^[0-9a-f]{24}$/.test(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const periode = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: {
            client: {
                select: { id: true, companyName: true, firstName: true, lastName: true, address: true, city: true, country: true, ninea: true, rccm: true, ifu: true },
            },
            payslips: {
                include: { employee: { select: { id: true, firstName: true, lastName: true, position: true, maritalStatus: true, childrenCount: true, isCadre: true, sexe: true } } },
                orderBy: { employee: { lastName: "asc" } },
            },
        },
    });
    if (!periode) return NextResponse.json({ error: "Période introuvable" }, { status: 404 });
    return NextResponse.json({ periode });
}
