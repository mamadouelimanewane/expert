import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPortalClient } from "@/lib/portal-auth";
import { lirePiece } from "@/lib/stockage-pieces";
import { lireContenuDocumentGenere } from "@/lib/generated-document";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token requis" }, { status: 401 });

  try {
    const { id } = await params;
    if (!/^[0-9a-f]{24}$/i.test(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const response = await withPortalClient(token, async () => {
      const document = await prisma.document.findUnique({
        where: { id },
        select: { fileName: true, originalName: true, mimeType: true, storageKey: true, ocrData: true },
      });
      if (!document) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });
      const contenuGenere = !document.storageKey ? lireContenuDocumentGenere(document.ocrData) : null;
      const piece = document.storageKey ? await lirePiece(document.storageKey, "gridfs") : contenuGenere ? null : await lirePiece(document.fileName, "disque");
      const bytes = contenuGenere ?? piece?.contenu;
      if (!bytes) return NextResponse.json({ error: "Le fichier n'est plus disponible." }, { status: 410 });
      const name = encodeURIComponent(document.originalName || document.fileName);
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": document.mimeType || piece?.mimeType || "application/octet-stream",
          "Content-Length": String(bytes.length),
          "Content-Disposition": `inline; filename*=UTF-8''${name}`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur GET portal/documents/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
