import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const missionOrders = await prisma.missionOrder.findMany({
            where,
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ missionOrders });
    } catch (error) {
        console.error("Erreur GET mission-orders:", error);
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
        const { purpose, destination, startDate, endDate, estimatedCost, missionId } = body;

        if (!purpose || !startDate || !endDate) {
            return NextResponse.json({ error: "Champs requis manquants (objet, dates)" }, { status: 400 });
        }

        const coutEstime = analyserMontantOptionnel(estimatedCost, { min: 0 });
        if (!coutEstime.ok) {
            return NextResponse.json({ error: coutEstime.raison }, { status: 400 });
        }

        const year = new Date().getFullYear();
        const countThisYear = await prisma.missionOrder.count({
            where: { reference: { startsWith: `OM-${year}-` } },
        });
        const reference = `OM-${year}-${String(countThisYear + 1).padStart(3, "0")}`;

        const missionOrder = await prisma.missionOrder.create({
            data: {
                reference,
                purpose,
                destination: destination || null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                estimatedCost: coutEstime.valeur,
                missionId: missionId || null,
                status: "BROUILLON",
                userId: session.id,
            },
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "MISSION_ORDER",
            entityId: missionOrder.id,
            details: `Ordre de mission créé : ${reference} — ${purpose}`,
        });

        return NextResponse.json({ missionOrder }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST mission-orders:", error);
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
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "id et status requis" }, { status: 400 });
        }

        const missionOrder = await prisma.missionOrder.update({
            where: { id },
            data: { status },
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        return NextResponse.json({ missionOrder });
    } catch (error) {
        console.error("Erreur PATCH mission-orders:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
