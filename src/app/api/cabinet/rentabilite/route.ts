import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  calculerRentabilite,
  calculerKpiCabinet,
  type DossierMission,
} from "@/lib/ohada/rentabilite-missions";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, dossier, dossiers, capaciteHeuresMois } = body;

    if (action === "CALCULER_RENTABILITE" && dossier) {
      const analyse = calculerRentabilite(dossier as DossierMission);
      return NextResponse.json({ analyse });
    }

    if (action === "CALCULER_KPIS" && Array.isArray(dossiers)) {
      const kpis = calculerKpiCabinet(
        dossiers as DossierMission[],
        capaciteHeuresMois || 1200
      );
      const analyses = dossiers.map((d: DossierMission) => calculerRentabilite(d));
      return NextResponse.json({ kpis, analyses });
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
