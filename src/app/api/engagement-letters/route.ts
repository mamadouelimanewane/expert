import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { analyserMontantOptionnel } from "@/lib/validation";
import { Prisma } from "@prisma/client";

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
    data: Omit<Prisma.EngagementLetterUncheckedCreateInput, "reference">
) {
    const year = new Date().getFullYear();

    const derniere = await prisma.engagementLetter.findFirst({
        where: { reference: { startsWith: `LM-${year}-` } },
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

        const letter = await creerLettreAvecReference({
            scope,
            fees: honoraires.valeur,
            clientId,
            missionId: missionId || null,
            signatoryName: signatoryName || null,
            status: "BROUILLON",
            createdById: session.id,
        });

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
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, signedAt, signatoryName, signatureHash } = body;

        if (!id) {
            return NextResponse.json({ error: "id requis" }, { status: 400 });
        }

        const letter = await prisma.engagementLetter.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(status === "SIGNEE" ? { signedAt: signedAt ? new Date(signedAt) : new Date() } : {}),
                ...(typeof signatureHash === "string" && /^[a-f0-9]{64}$/i.test(signatureHash) ? { signatureHash } : {}),
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
