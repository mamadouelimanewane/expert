import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { lirePiece } from "@/lib/stockage-pieces";

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
    const { denied } = await requireStaff();
    if (denied) return denied;
    try {
        const { id } = await params;
        if (id.length !== 24) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const doc = await prisma.document.findUnique({ where: { id }, select: { fileName: true, originalName: true, mimeType: true, storageKey: true } });
        if (!doc) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });
        const piece = await lirePiece(doc.storageKey ?? doc.fileName, doc.storageKey ? "gridfs" : "disque");
        if (!piece) return NextResponse.json({ error: "Le fichier de cette pièce n'est plus disponible." }, { status: 410 });
        const telecharger = new URL(request.url).searchParams.get("download") === "1";
        const nom = encodeURIComponent(doc.originalName || doc.fileName);
        return new Response(new Uint8Array(piece.contenu), {
            headers: {
                "Content-Type": doc.mimeType || piece.mimeType,
                "Content-Length": String(piece.contenu.length),
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
