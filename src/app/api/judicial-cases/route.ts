import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { estIntrouvable, requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET(request: NextRequest) {
    try {
        const { session, denied } = await requireStaff();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const where: Record<string, unknown> = { cabinetId: session.cabinetId };
        if (status) where.status = status;
        if (category) where.category = category;

        const cases = await prisma.judicialCase.findMany({
            where,
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                expert: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ cases });
    } catch (error) {
        console.error("Erreur GET judicial-cases:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { caseNumber, court, judge, parties, natureOfDispute, category, deadline, clientId, notes } = body;

        if (!caseNumber || !court || !parties) {
            return NextResponse.json({ error: "Champs requis manquants (numéro, tribunal, parties)" }, { status: 400 });
        }

        // Le connecteur MongoDB de Prisma n'applique pas d'integrite
        // referentielle a l'ecriture : un clientId au format ObjectId valide
        // mais inexistant (client supprime, onglet reste ouvert) etait ecrit tel
        // quel. L'enregistrement devenait orphelin — invisible dans toutes les
        // vues filtrees par client, mais compte dans les totaux globaux.
        if (clientId) {
            if (!isObjectId(clientId)) return NextResponse.json({ error: "Identifiant client invalide." }, { status: 400 });
            const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
            if (!client) {
                return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
            }
        }

        const judicialCase = await prisma.judicialCase.create({
            data: {
                cabinetId: session.cabinetId,
                caseNumber,
                court,
                judge: judge || null,
                parties,
                natureOfDispute: natureOfDispute || null,
                category: category || null,
                deadline: deadline ? new Date(deadline) : null,
                notes: notes || null,
                clientId: clientId || null,
                status: "EN_COURS",
                expertId: session.id,
            },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                expert: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "JUDICIAL_CASE",
            entityId: judicialCase.id,
            details: `Affaire judiciaire enregistrée : ${caseNumber} — ${court}`,
        });

        return NextResponse.json({ case: judicialCase }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST judicial-cases:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { id, status, notes } = body;

        if (!isObjectId(id)) {
            return NextResponse.json({ error: "id requis" }, { status: 400 });
        }

        const current = await prisma.judicialCase.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
        if (!current) return NextResponse.json({ error: "Affaire introuvable dans ce cabinet." }, { status: 404 });
        const updated = await prisma.judicialCase.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });
        if (!updated.count) return NextResponse.json({ error: "Affaire introuvable dans ce cabinet." }, { status: 404 });
        const judicialCase = await prisma.judicialCase.findFirst({ where: { id, cabinetId: session.cabinetId }, include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                expert: { select: { id: true, firstName: true, lastName: true } },
            } });
        if (!judicialCase) return NextResponse.json({ error: "Affaire introuvable dans ce cabinet." }, { status: 404 });

        await AuditService.log({
            action: "UPDATE",
            entity: "JUDICIAL_CASE",
            entityId: judicialCase.id,
            details: `Affaire judiciaire mise à jour : ${judicialCase.caseNumber}${status ? ` — statut ${status}` : ""}`,
        });

        return NextResponse.json({ case: judicialCase });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Affaire introuvable." }, { status: 404 });
        }
        console.error("Erreur PATCH judicial-cases:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
