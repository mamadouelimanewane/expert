import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { archiveDocument } from "@/lib/blockchain-archiver";
import { AuthService } from "@/lib/auth";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { action: "DOCUMENT_ARCHIVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const archives = logs.map((l) => {
      const meta = (l.newValue as any) || {};
      return {
        id: l.id,
        docName: meta.documentName || "—",
        author: l.user ? `${l.user.firstName} ${l.user.lastName}` : meta.author || "—",
        date: l.createdAt.toLocaleDateString("fr-FR"),
        hash: meta.documentHash || "—",
        sig: meta.signature || "—",
      };
    });

    return NextResponse.json({ archives });
  } catch (error) {
    console.error("[Legal Archive GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const TAILLE_MAX_OCTETS = 25 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    // Le fichier est entierement charge en memoire pour le calcul d'empreinte :
    // sans plafond, un depot volumineux suffit a faire tomber la fonction.
    if (file.size > TAILLE_MAX_OCTETS) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (maximum ${TAILLE_MAX_OCTETS / (1024 * 1024)} Mo).` },
        { status: 413 }
      );
    }

    const session = await AuthService.getSession();
    const authorName = session?.name || "Utilisateur";

    const bytes = Buffer.from(await file.arrayBuffer());
    const record = archiveDocument(file.name, bytes, authorName);

    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ARCHIVED",
        entity: "DOCUMENT",
        details: `Empreinte d'intégrité générée pour ${file.name} par ${authorName}`,
        newValue: record as any,
        userId: session?.id && /^[0-9a-fA-F]{24}$/.test(session.id) ? session.id : null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("[Legal Archive POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
