import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
// Retourne le groupe de consolidation du cabinet sans créer de données en lecture.
export async function GET() {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const group = await prisma.consolidationGroup.findFirst({
      where: { cabinetId: session.cabinetId },
      include: {
        entities: { where: { cabinetId: session.cabinetId }, include: { balanceLines: { where: { cabinetId: session.cabinetId } } } },
        eliminations: { where: { cabinetId: session.cabinetId }, include: { buyerEntity: true, sellerEntity: true } },
      },
    });
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Erreur GET consolidation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Ajoute une entité au groupe
export async function POST(req: NextRequest) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    const body = await req.json();
    const { groupId, name, rccm, country, clientId } = body;

    if (!isObjectId(groupId) || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "groupId valide et nom requis" }, { status: 400 });
    }
    const group = await prisma.consolidationGroup.findFirst({ where: { id: groupId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!group) return NextResponse.json({ error: "Groupe de consolidation introuvable dans ce cabinet." }, { status: 404 });
    if (clientId) {
      if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
      const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
      if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    }

    const entity = await prisma.consolidationEntity.create({
      data: { cabinetId: session.cabinetId, groupId, name: name.trim(), rccm, country, clientId: clientId || undefined },
    });

    return NextResponse.json({ entity }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST consolidation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
