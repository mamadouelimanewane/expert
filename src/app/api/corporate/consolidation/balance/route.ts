import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

// Import de balance comptable (CSV) pour une entite du perimetre de
// consolidation. Un import remplace l'integralite des lignes precedentes de
// l'entite : la balance importee fait foi, on n'essaie pas de fusionner
// ligne a ligne avec un import precedent.
export async function POST(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { entityId, lines } = body as {
      entityId?: string;
      lines?: { compte: string; libelle: string; debit: number; credit: number }[];
    };

    if (!entityId || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "entityId et lines (non vide) requis" }, { status: 400 });
    }

    const lignesValides = lines
      .map((l) => ({
        compte: String(l.compte ?? "").trim(),
        libelle: String(l.libelle ?? "").trim(),
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      }))
      .filter((l) => l.compte);

    if (lignesValides.length === 0) {
      return NextResponse.json({ error: "Aucune ligne valide (compte manquant)" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.consolidationBalanceLine.deleteMany({ where: { entityId } }),
      prisma.consolidationBalanceLine.createMany({
        data: lignesValides.map((l) => ({ ...l, entityId })),
      }),
    ]);

    return NextResponse.json({ imported: lignesValides.length });
  } catch (error) {
    console.error("Erreur POST consolidation/balance:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
