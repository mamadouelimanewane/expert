import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";
import { estIntrouvable } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    try {
        const { session, denied } = await requireStaff();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: Record<string, unknown> = { cabinetId: session.cabinetId };
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
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { purpose, destination, startDate, endDate, estimatedCost, missionId } = body;

        if (!purpose || !startDate || !endDate) {
            return NextResponse.json({ error: "Champs requis manquants (objet, dates)" }, { status: 400 });
        }
        if (missionId && (!isObjectId(missionId) || !await prisma.mission.findFirst({ where: { id: missionId, cabinetId: session.cabinetId }, select: { id: true } }))) return NextResponse.json({ error: "Mission introuvable dans ce cabinet." }, { status: 404 });

        const coutEstime = analyserMontantOptionnel(estimatedCost, { min: 0 });
        if (!coutEstime.ok) {
            return NextResponse.json({ error: coutEstime.raison }, { status: 400 });
        }

        const year = new Date().getFullYear();
        // La reference etait derivee d'un count() : deux creations simultanees
        // obtenaient la meme (et une suppression la reattribuait a un second
        // document). Elle est desormais derivee du plus grand numero deja
        // attribue : une suppression ne peut plus faire reattribuer une
        // reference deja utilisee. Le champ ne portant pas de contrainte
        // @unique au schema, deux creations vraiment concomitantes restent
        // possibles — a verrouiller par un index unique lors d'une prochaine
        // migration.
        const derniere = await prisma.missionOrder.findFirst({
            where: { cabinetId: session.cabinetId, reference: { startsWith: `OM-${year}-` } },
            orderBy: { reference: "desc" },
            select: { reference: true },
        });
        const dernierNumero = derniere ? Number(derniere.reference.split("-").pop()) : 0;
        const reference = `OM-${year}-${String((Number.isFinite(dernierNumero) ? dernierNumero : 0) + 1).padStart(3, "0")}`;

        const missionOrder = await prisma.missionOrder.create({
            data: {
                cabinetId: session.cabinetId,
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
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "id et status requis" }, { status: 400 });
        }
        if (typeof id !== "string" || !isObjectId(id)) return NextResponse.json({ error: "id invalide." }, { status: 400 });

        const existing = await prisma.missionOrder.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
        if (!existing) return NextResponse.json({ error: "Ordre de mission introuvable." }, { status: 404 });
        await prisma.missionOrder.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: { status },
        });
        const missionOrder = await prisma.missionOrder.findFirst({
            where: { id, cabinetId: session.cabinetId },
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        return NextResponse.json({ missionOrder });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Ordre de mission introuvable." }, { status: 404 });
        }
        console.error("Erreur PATCH mission-orders:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
