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

        const letters = await prisma.engagementLetter.findMany({
            where,
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                mission: { select: { id: true, title: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ letters });
    } catch (error) {
        console.error("Erreur GET engagement-letters:", error);
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
        const { scope, fees, clientId, missionId, signatoryName } = body;

        if (!scope || !clientId) {
            return NextResponse.json({ error: "Champs requis manquants (objet de mission, client)" }, { status: 400 });
        }

        const honoraires = analyserMontantOptionnel(fees, { min: 0 });
        if (!honoraires.ok) {
            return NextResponse.json({ error: honoraires.raison }, { status: 400 });
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
        const derniere = await prisma.engagementLetter.findFirst({
            where: { reference: { startsWith: `LM-${year}-` } },
            orderBy: { reference: "desc" },
            select: { reference: true },
        });
        const dernierNumero = derniere ? Number(derniere.reference.split("-").pop()) : 0;
        const reference = `LM-${year}-${String((Number.isFinite(dernierNumero) ? dernierNumero : 0) + 1).padStart(3, "0")}`;

        const letter = await prisma.engagementLetter.create({
            data: {
                reference,
                scope,
                fees: honoraires.valeur,
                clientId,
                missionId: missionId || null,
                signatoryName: signatoryName || null,
                status: "BROUILLON",
                createdById: session.id,
            },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                mission: { select: { id: true, title: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "ENGAGEMENT_LETTER",
            entityId: letter.id,
            details: `Lettre de mission créée : ${reference}`,
        });

        return NextResponse.json({ letter }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST engagement-letters:", error);
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
        const { id, status, signedAt, signatoryName } = body;

        if (!id) {
            return NextResponse.json({ error: "id requis" }, { status: 400 });
        }

        const letter = await prisma.engagementLetter.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(status === "SIGNEE" ? { signedAt: signedAt ? new Date(signedAt) : new Date() } : {}),
                ...(signatoryName !== undefined && { signatoryName }),
            },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                mission: { select: { id: true, title: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "UPDATE",
            entity: "ENGAGEMENT_LETTER",
            entityId: letter.id,
            details: `Lettre de mission ${letter.reference} — statut ${status || "mis à jour"}`,
        });

        return NextResponse.json({ letter });
    } catch (error) {
        console.error("Erreur PATCH engagement-letters:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
