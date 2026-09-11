import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { estIntrouvable, requireWriteAccess } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

/**
 * Lien du portail client.
 *
 * Le jeton est volontairement absent des réponses de /api/clients : il vaut
 * authentification. Cette route est le seul point où un collaborateur habilité
 * peut l'obtenir, et chaque consultation est journalisée — on sait qui a
 * transmis le lien, et quand. Sans elle, le bouton « copier le lien portail »
 * de la liste des clients ne s'affichait jamais et le portail était
 * inaccessible depuis l'interface.
 */
function urlPortail(request: Request, token: string): string {
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return `${base.replace(/\/$/, "")}/portal/${token}`;
}

export async function GET(request: Request, { params }: Params) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const { id } = await params;
        const client = await prisma.client.findUnique({
            where: { id },
            select: { id: true, companyName: true, portalToken: true, portalEnabled: true, portalCreatedAt: true },
        });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        if (!client.portalEnabled || !client.portalToken) {
            return NextResponse.json({ enabled: false, url: null, createdAt: client.portalCreatedAt });
        }
        await AuditService.log({
            action: "READ",
            entity: "CLIENT",
            entityId: id,
            details: `Lien portail consulté pour ${client.companyName ?? id}`,
        });
        return NextResponse.json({ enabled: true, url: urlPortail(request, client.portalToken), createdAt: client.portalCreatedAt });
    } catch (error) {
        console.error("Erreur GET portal-link:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * POST { action: "regenerate" | "revoke" }
 * - regenerate : nouveau jeton, l'ancien lien cesse de fonctionner immédiatement.
 * - revoke     : portail coupé, aucun lien valide jusqu'à régénération.
 */
export async function POST(request: Request, { params }: Params) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const action = body?.action;
        if (action !== "regenerate" && action !== "revoke") {
            return NextResponse.json({ error: "action requise : regenerate ou revoke" }, { status: 400 });
        }

        if (action === "revoke") {
            const client = await prisma.client.update({
                where: { id },
                data: { portalEnabled: false, portalToken: null },
                select: { id: true, companyName: true },
            });
            await AuditService.log({
                action: "UPDATE",
                entity: "CLIENT",
                entityId: id,
                details: `Accès portail révoqué pour ${client.companyName ?? id}`,
            });
            return NextResponse.json({ enabled: false, url: null });
        }

        const token = randomBytes(32).toString("hex");
        const client = await prisma.client.update({
            where: { id },
            data: { portalEnabled: true, portalToken: token, portalCreatedAt: new Date() },
            select: { id: true, companyName: true, portalCreatedAt: true },
        });
        await AuditService.log({
            action: "UPDATE",
            entity: "CLIENT",
            entityId: id,
            details: `Lien portail régénéré pour ${client.companyName ?? id}`,
        });
        return NextResponse.json({ enabled: true, url: urlPortail(request, token), createdAt: client.portalCreatedAt });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }
        console.error("Erreur POST portal-link:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
