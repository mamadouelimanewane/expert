import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  calculerZScoreOHADA,
  simulerConcordatApurement,
  type DonneesFinancieresEntreprise,
  type ParametresConcordat,
} from "@/lib/ohada/prevention-difficultes-aupcap";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, donneesFinancieres, parametresConcordat } = body;

    if (action === "CALCULER_ZSCORE" && donneesFinancieres) {
      const analyse = calculerZScoreOHADA(donneesFinancieres as DonneesFinancieresEntreprise);
      return NextResponse.json({ analyse });
    }

    if (action === "SIMULER_CONCORDAT" && donneesFinancieres && parametresConcordat) {
      const concordat = simulerConcordatApurement(
        donneesFinancieres as DonneesFinancieresEntreprise,
        parametresConcordat as ParametresConcordat
      );
      return NextResponse.json({ concordat });
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
