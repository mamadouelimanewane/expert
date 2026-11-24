import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { estIntrouvable, requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { clientUpdateSchema, parseBody } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { id } = await params;
        // `portalToken` vaut authentification au portail client : quiconque le
        // detient ouvre le dossier complet sans session ni mot de passe, et la
        // revocation d un compte staff ne l invalide pas. La route liste voisine
        // l excluait deja ; cette route detail renvoyait l objet brut, donc le
        // jeton — y compris vers les trois pages d impression d etats financiers
        // qui n appellent cet endpoint que pour lire une raison sociale, faisant
        // transiter le secret dans le navigateur de chaque collaborateur.
        // Le lien portail s'obtient explicitement via /api/clients/[id]/portal-link.
        const client = await prisma.client.findFirst({
            where: { id, cabinetId: session.cabinetId },
            omit: { portalToken: true },
        });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        return NextResponse.json({ client });
    } catch (error) {
        console.error("Erreur GET clients/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * Modification partielle d'une fiche client.
 *
 * Il n'existait aucun moyen de corriger un dossier après sa création : une
 * faute dans un NINEA ou un changement d'adresse imposait de recréer le
 * client et de perdre ses missions, factures et écritures.
 */
export async function PATCH(request: Request, { params }: Params) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const { data, invalid } = await parseBody(request, clientUpdateSchema);
    if (invalid) return invalid;

    try {
        const { id } = await params;
        const avant = await prisma.client.findFirst({ where: { id, cabinetId: session.cabinetId }, omit: { portalToken: true } });
        if (!avant) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        const result = await prisma.client.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data,
        });
        if (!result.count) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        const client = await prisma.client.findFirst({ where: { id, cabinetId: session.cabinetId }, omit: { portalToken: true } });
        const champs = Object.keys(data) as (keyof typeof data)[];
        await AuditService.log({
            action: "UPDATE",
            entity: "CLIENT",
            entityId: id,
            oldValue: Object.fromEntries(champs.map((c) => [c, (avant as Record<string, unknown>)[c]])),
            newValue: data,
            details: `Fiche client modifiée : ${champs.join(", ")}`,
        });
        return NextResponse.json({ client });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        console.error("Erreur PATCH clients/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * Désactivation (archivage) d'un client — jamais de suppression physique :
 * un dossier porte des écritures, des factures numérotées et des lettres de
 * mission signées qui doivent rester consultables. Le portail est coupé.
 */
export async function DELETE(request: Request, { params }: Params) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const { id } = await params;
        const result = await prisma.client.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: { isActive: false, portalEnabled: false },
        });
        if (!result.count) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        const client = await prisma.client.findFirst({
            where: { id, cabinetId: session.cabinetId },
            select: { id: true, companyName: true, isActive: true, portalEnabled: true },
        });
        if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        await AuditService.log({
            action: "DELETE",
            entity: "CLIENT",
            entityId: id,
            details: `Client archivé : ${client.companyName ?? id} (portail désactivé)`,
        });
        return NextResponse.json({ client, message: "Client archivé. Ses données restent consultables." });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        console.error("Erreur DELETE clients/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
