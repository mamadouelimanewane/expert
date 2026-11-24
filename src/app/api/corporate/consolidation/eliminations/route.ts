import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireWriteAccess } from "@/lib/api-auth";
import { analyserMontant } from "@/lib/validation";
import { isObjectId } from "@/lib/tenant-security";
export async function POST(req: NextRequest) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    const body = await req.json();
    const { groupId, type, buyerEntityId, sellerEntityId, debitAccount, creditAccount, amount } = body;

    if (!isObjectId(groupId) || !debitAccount || !creditAccount || amount === undefined || amount === null) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    const group = await prisma.consolidationGroup.findFirst({ where: { id: groupId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!group) return NextResponse.json({ error: "Groupe de consolidation introuvable dans ce cabinet." }, { status: 404 });
    for (const entityId of [body.buyerEntityId, body.sellerEntityId].filter(Boolean)) {
      if (!isObjectId(entityId) || !await prisma.consolidationEntity.findFirst({ where: { id: entityId, groupId, cabinetId: session.cabinetId }, select: { id: true } })) return NextResponse.json({ error: "Entité introuvable dans ce groupe." }, { status: 404 });
    }

    const montant = analyserMontant(amount);
    if (!montant.ok) {
      return NextResponse.json({ error: montant.raison }, { status: 400 });
    }

    const elimination = await prisma.consolidationElimination.create({
      data: {
        cabinetId: session.cabinetId,
        groupId,
        type: type || "Ventes/Achats",
        buyerEntityId: buyerEntityId || undefined,
        sellerEntityId: sellerEntityId || undefined,
        debitAccount,
        creditAccount,
        amount: montant.valeur,
      },
    });

    return NextResponse.json({ elimination }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST elimination:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !isObjectId(id)) return NextResponse.json({ error: "id invalide" }, { status: 400 });

    const result = await prisma.consolidationElimination.deleteMany({ where: { id, cabinetId: session.cabinetId } });
    if (!result.count) return NextResponse.json({ error: "Élimination introuvable dans ce cabinet." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE elimination:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
