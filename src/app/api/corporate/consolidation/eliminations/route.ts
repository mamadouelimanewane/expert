import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
import { analyserMontant } from "@/lib/validation";
export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const body = await req.json();
    const { groupId, type, buyerEntityId, sellerEntityId, debitAccount, creditAccount, amount } = body;

    if (!groupId || !debitAccount || !creditAccount || !amount) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const montant = analyserMontant(amount);
    if (!montant.ok) {
      return NextResponse.json({ error: montant.raison }, { status: 400 });
    }

    const elimination = await prisma.consolidationElimination.create({
      data: {
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
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await prisma.consolidationElimination.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE elimination:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
