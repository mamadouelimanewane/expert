import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { employeeSchema, parseBody } from "@/lib/validation";
import { AuditService } from "@/lib/audit";

/**
 * Salariés d'un dossier client (module paie).
 *
 * Il n'existait aucun écran ni aucune route pour créer ou corriger un
 * salarié : les paramètres de paie (situation familiale, enfants, statut
 * cadre, transport, avantages en nature, conjoint sans revenu) ne pouvaient
 * venir que d'un jeu de données de démonstration. Le moteur de paie les
 * exploite pourtant tous.
 */
export async function GET(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const clientId = new URL(req.url).searchParams.get("clientId");
    if (!clientId || !/^[0-9a-f]{24}$/.test(clientId)) {
        return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }
    const [client, employees] = await Promise.all([
        prisma.client.findUnique({
            where: { id: clientId },
            select: { id: true, country: true, paieAccidentRate: true, paieIpmSalarial: true, paieIpmPatronal: true },
        }),
        prisma.employee.findMany({ where: { clientId }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    ]);
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    return NextResponse.json({ client, employees });
}

export async function POST(req: Request) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    const { data, invalid } = await parseBody(req, employeeSchema);
    if (invalid) return invalid;

    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

    const employee = await prisma.employee.create({
        data: { ...data, email: data.email || null },
    });
    await AuditService.log({
        action: "CREATE",
        entity: "EMPLOYEE",
        entityId: employee.id,
        newValue: data,
        details: `Salarié créé : ${data.firstName} ${data.lastName}`,
    });
    return NextResponse.json({ employee }, { status: 201 });
}
