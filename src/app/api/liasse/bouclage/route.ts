import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  verifierBouclageLiasse,
  type BilanOHADA,
  type CompteResultatOHADA,
  type TftOHADA,
  type PointControleCloture,
} from "@/lib/ohada/bouclage-liasse-syscohada";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, bilan, compteResultat, tft, isFiscal, pointsSpecifiques } = body;

    if (action === "VERIFIER_BOUCLAGE" && bilan && compteResultat && tft) {
      const rapport = verifierBouclageLiasse(
        bilan as BilanOHADA,
        compteResultat as CompteResultatOHADA,
        tft as TftOHADA,
        Number(isFiscal || 0),
        pointsSpecifiques as Partial<PointControleCloture>[]
      );
      return NextResponse.json({ rapport });
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
