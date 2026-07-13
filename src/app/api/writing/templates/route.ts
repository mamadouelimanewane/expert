import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureWritingTemplatesSeed } from "@/lib/writing-seed";

export async function GET() {
  try {
    await ensureWritingTemplatesSeed();

    const templates = await prisma.writingTemplate.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Erreur GET writing templates:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    const template = await prisma.writingTemplate.create({
      data: {
        title,
        category: category || "Personnalisé",
        content,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST writing templates:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
