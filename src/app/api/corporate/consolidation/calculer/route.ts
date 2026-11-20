import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  consoliderComptesSYSCOHADA,
  type DossierConsolidation,
} from "@/lib/ohada/consolidation-syscohada";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, dossier } = body;

    if (action === "CONSOLIDER_GROUPE" && dossier) {
      const rapport = consoliderComptesSYSCOHADA(dossier as DossierConsolidation);
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
