import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { session, denied } = await requireStaff();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");

        const where: Record<string, unknown> = { cabinetId: session.cabinetId };
        if (status) where.status = status;
        if (clientId) {
            if (!/^[0-9a-fA-F]{24}$/.test(clientId)) return NextResponse.json({ error: "clientId invalide" }, { status: 400 });
            if (!await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } })) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
            where.clientId = clientId;
        }

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

/**
 * Crée la lettre de mission en lui attribuant sa référence séquentielle.
 *
 * La référence était auparavant dérivée d'un `count()` : deux créations
 * simultanées obtenaient la même, et une suppression la réattribuait à un
 * second document — deux contrats distincts portaient alors LM-2026-004.
 *
 * Elle est désormais dérivée du plus grand numéro déjà attribué (une
 * suppression ne peut plus faire réattribuer une référence utilisée) et
 * `EngagementLetter.reference` porte une contrainte `@unique`, doublée d'un
 * index unique en base. La course résiduelle — deux créations concomitantes —
 * est rattrapée par un nouvel essai, comme pour les numéros de facture, plutôt
 * que par une erreur 500 renvoyée à l'utilisateur.
 */
async function creerLettreAvecReference(
    data: Omit<Prisma.EngagementLetterUncheckedCreateInput, "reference">,
    cabinetId: string
) {
    const year = new Date().getFullYear();

    const derniere = await prisma.engagementLetter.findFirst({
        where: { cabinetId, reference: { startsWith: `LM-${year}-` } },
        orderBy: { reference: "desc" },
        select: { reference: true },
    });
    const dernierNumero = derniere ? Number(derniere.reference.split("-").pop()) : 0;
    const base = Number.isFinite(dernierNumero) ? dernierNumero : 0;

    for (let tentative = 0; tentative < 5; tentative++) {
        const reference = `LM-${year}-${String(base + 1 + tentative).padStart(3, "0")}`;
        try {
            return await prisma.engagementLetter.create({
                data: { ...data, reference },
                include: {
                    client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                    mission: { select: { id: true, title: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
        } catch (error) {
            // P2002 = violation de contrainte d'unicité
            if ((error as { code?: string })?.code !== "P2002") throw error;
        }
    }

    throw new Error("Impossible d'attribuer une référence de lettre de mission unique après 5 tentatives");
}

export async function POST(request: NextRequest) {
    try {
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { scope, fees, clientId, missionId, signatoryName } = body;

        if (!scope || !clientId) {
            return NextResponse.json({ error: "Champs requis manquants (objet de mission, client)" }, { status: 400 });
        }

        const honoraires = analyserMontantOptionnel(fees, { min: 0 });
        if (!honoraires.ok) {
            return NextResponse.json({ error: honoraires.raison }, { status: 400 });
        }
        if (typeof clientId !== "string" || !isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
        const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
        if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
        if (missionId && !await prisma.mission.findFirst({ where: { id: missionId, cabinetId: session.cabinetId, clientId }, select: { id: true } })) return NextResponse.json({ error: "Mission introuvable dans ce dossier." }, { status: 404 });

        const letter = await creerLettreAvecReference({
            cabinetId: session.cabinetId,
            scope,
            fees: honoraires.valeur,
            clientId,
            missionId: missionId || null,
            signatoryName: signatoryName || null,
            status: "BROUILLON",
            createdById: session.id,
        }, session.cabinetId!);

        await AuditService.log({
            action: "CREATE",
            entity: "ENGAGEMENT_LETTER",
            entityId: letter.id,
            details: `Lettre de mission créée : ${letter.reference}`,
        });

        return NextResponse.json({ letter }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST engagement-letters:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { id, status, signedAt, signatoryName, signatureHash } = body;

        if (!id) {
            return NextResponse.json({ error: "id requis" }, { status: 400 });
        }
        if (typeof id !== "string" || !isObjectId(id)) return NextResponse.json({ error: "id invalide." }, { status: 400 });

        const avant = await prisma.engagementLetter.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
        if (!avant) return NextResponse.json({ error: "Lettre de mission introuvable." }, { status: 404 });
        await prisma.engagementLetter.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: {
                ...(status && { status }),
                ...(status === "SIGNEE" ? { signedAt: signedAt ? new Date(signedAt) : new Date() } : {}),
                ...(typeof signatureHash === "string" && /^[a-f0-9]{64}$/i.test(signatureHash) ? { signatureHash } : {}),
                ...(signatoryName !== undefined && { signatoryName }),
            },
        });
        const letter = await prisma.engagementLetter.findFirst({ where: { id, cabinetId: session.cabinetId }, include: {
            client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
            mission: { select: { id: true, title: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
        } });
        if (!letter) return NextResponse.json({ error: "Lettre de mission introuvable." }, { status: 404 });

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
