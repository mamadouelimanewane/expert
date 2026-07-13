import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET() {
  try {
    const prospects = await prisma.prospect.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ prospects });
  } catch (error) {
    console.error("Erreur GET prospects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entreprise, contact, email, telephone, secteur, source, valeurEstimee, prochainRdv } = body;

    if (!entreprise) {
      return NextResponse.json({ error: "Le nom de l'entreprise est requis" }, { status: 400 });
    }

    const session = await AuthService.getSession();

    const prospect = await prisma.prospect.create({
      data: {
        entreprise,
        contact,
        email,
        telephone,
        secteur,
        source,
        valeurEstimee: valeurEstimee ? parseFloat(valeurEstimee) : 0,
        prochainRdv: prochainRdv ? new Date(prochainRdv) : null,
        score: 20,
        createdById: session?.id && /^[0-9a-fA-F]{24}$/.test(session.id) ? session.id : null,
      },
    });

    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST prospects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, etape, score } = body;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const prospect = await prisma.prospect.update({
      where: { id },
      data: {
        ...(etape && { etape }),
        ...(score !== undefined && { score }),
      },
    });

    return NextResponse.json({ prospect });
  } catch (error) {
    console.error("Erreur PATCH prospects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
