import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { ensureProcedureSeed } from "@/lib/procedure-seed";

export async function GET() {
  try {
    const session = await AuthService.getSession();
    const count = await prisma.procedure.count();
    if (count === 0 && session) {
      await ensureProcedureSeed(session.id);
    }

    const procedures = await prisma.procedure.findMany({
      include: { createdBy: { select: { firstName: true, lastName: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ procedures });
  } catch (error) {
    console.error("Erreur GET procedures:", error);
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
    const { title, category, content, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    const procedure = await prisma.procedure.create({
      data: {
        title,
        category: category || "Général",
        content,
        status: status || "BROUILLON",
        version: 1,
        createdById: session.id,
      },
    });

    return NextResponse.json({ procedure }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST procedures:", error);
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
    const { id, title, category, content, status } = body;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const existing = await prisma.procedure.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Procédure introuvable" }, { status: 404 });
    }

    const contentChanged = content !== undefined && content !== existing.content;

    const procedure = await prisma.procedure.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        ...(contentChanged && { version: existing.version + 1 }),
      },
    });

    return NextResponse.json({ procedure });
  } catch (error) {
    console.error("Erreur PATCH procedures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
