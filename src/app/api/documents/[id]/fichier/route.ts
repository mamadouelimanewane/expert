import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { lirePiece } from "@/lib/stockage-pieces";
import { AuditService } from "@/lib/audit";
import { lireContenuDocumentGenere } from "@/lib/generated-document";

type Params = { params: Promise<{ id: string }> };

/**
 * Sert le fichier d'une pièce au personnel authentifié.
 *
 * Les pièces étaient référencées par `/uploads/<nom>`, un chemin que Next.js
 * ne sert pas (seul `public/` l'est) : le bouton « Voir » de la GED ouvrait
 * une 404. Le fichier est lu depuis le stockage durable (GridFS), ou depuis
 * le disque pour les pièces antérieures.
 */
export async function GET(request: Request, { params }: Params) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    try {
        const { id } = await params;
        if (id.length !== 24) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const doc = await prisma.document.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { fileName: true, originalName: true, mimeType: true, storageKey: true, ocrData: true } });
        if (!doc) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });
        const contenuGenere = !doc.storageKey ? lireContenuDocumentGenere(doc.ocrData) : null;
        const piece = doc.storageKey ? await lirePiece(doc.storageKey, "gridfs") : contenuGenere ? null : await lirePiece(doc.fileName, "disque");
        const bytes = contenuGenere ?? piece?.contenu;
        if (!bytes) return NextResponse.json({ error: "Le fichier de cette pièce n'est plus disponible." }, { status: 410 });
        const telecharger = new URL(request.url).searchParams.get("download") === "1";
        const nom = encodeURIComponent(doc.originalName || doc.fileName);
        await AuditService.log({
            action: "DOWNLOAD",
            entity: "DOCUMENT",
            entityId: id,
            details: telecharger ? "Pièce justificative téléchargée par un membre du cabinet." : "Pièce justificative consultée par un membre du cabinet.",
            newValue: { mode: telecharger ? "download" : "inline" },
            ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
            userAgent: request.headers.get("user-agent") ?? undefined,
        });
        return new Response(new Uint8Array(bytes), {
            headers: {
                "Content-Type": doc.mimeType || piece?.mimeType || "application/octet-stream",
                "Content-Length": String(bytes.length),
                "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename*=UTF-8''${nom}`,
                "Cache-Control": "private, max-age=300",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("Erreur GET documents/[id]/fichier:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
