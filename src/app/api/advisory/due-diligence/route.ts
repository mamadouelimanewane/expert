import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  calculerDueDiligence,
  type DossierDueDiligence,
} from "@/lib/ohada/due-diligence-m-and-a";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, dossier } = body;

    if (action === "CALCULER_DUE_DILIGENCE" && dossier) {
      const resultat = calculerDueDiligence(dossier as DossierDueDiligence);
      return NextResponse.json({ resultat });
    }

    return NextResponse.json(
      { error: "Action non reconnue ou paramètres manquants" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Erreur interne" },
      { status: 500 }
    );
  }
}
