import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  analyserDossierControleFiscal,
  calculerDelaiReponse,
  type DossierControleFiscal,
} from "@/lib/ohada/controle-fiscal-defense";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, dossier, dateReference } = body;
    const refDate = dateReference ? new Date(dateReference) : new Date();

    if (action === "ANALYSER_DOSSIER" && dossier) {
      const analyse = analyserDossierControleFiscal(dossier as DossierControleFiscal, refDate);
      return NextResponse.json({ analyse });
    }

    if (action === "CALCULER_DELAI" && dossier?.dateReceptionNotification) {
      const delai = calculerDelaiReponse(dossier.dateReceptionNotification, refDate);
      return NextResponse.json({ delai });
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
