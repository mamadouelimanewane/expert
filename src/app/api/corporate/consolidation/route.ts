import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Retourne le premier groupe de consolidation (crée un groupe par défaut si aucun n'existe).
export async function GET() {
  try {
    let group = await prisma.consolidationGroup.findFirst({
      include: {
        entities: true,
        eliminations: { include: { buyerEntity: true, sellerEntity: true } },
      },
    });

    if (!group) {
      group = await prisma.consolidationGroup.create({
        data: { name: "Groupe Consolidé" },
        include: { entities: true, eliminations: { include: { buyerEntity: true, sellerEntity: true } } },
      });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Erreur GET consolidation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Ajoute une entité au groupe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, name, rccm, country, clientId } = body;

    if (!groupId || !name) {
      return NextResponse.json({ error: "groupId et name requis" }, { status: 400 });
    }

    const entity = await prisma.consolidationEntity.create({
      data: { groupId, name, rccm, country, clientId: clientId || undefined },
    });

    return NextResponse.json({ entity }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST consolidation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
