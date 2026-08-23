import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const where: Record<string, unknown> = {};
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
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { caseNumber, court, judge, parties, natureOfDispute, category, deadline, clientId, notes } = body;

        if (!caseNumber || !court || !parties) {
            return NextResponse.json({ error: "Champs requis manquants (numéro, tribunal, parties)" }, { status: 400 });
        }

        const judicialCase = await prisma.judicialCase.create({
            data: {
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
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: "id requis" }, { status: 400 });
        }

        const judicialCase = await prisma.judicialCase.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                expert: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "UPDATE",
            entity: "JUDICIAL_CASE",
            entityId: judicialCase.id,
            details: `Affaire judiciaire mise à jour : ${judicialCase.caseNumber}${status ? ` — statut ${status}` : ""}`,
        });

        return NextResponse.json({ case: judicialCase });
    } catch (error) {
        console.error("Erreur PATCH judicial-cases:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
