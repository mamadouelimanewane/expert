import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  evaluerPerformanceAssocie,
  analyserCollegeAssocies,
  type AssocieCabinet,
  type DossierAssocie,
  type OpportuniteCommerciale,
} from "@/lib/ohada/partner-dashboard";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, associe, associes, dossiers, opportunites } = body;

    const dossiersList = Array.isArray(dossiers) ? dossiers : [];
    const oppsList = Array.isArray(opportunites) ? opportunites : [];

    if (action === "EVALUER_ASSOCIE" && associe) {
      const performance = evaluerPerformanceAssocie(
        associe as AssocieCabinet,
        dossiersList as DossierAssocie[],
        oppsList as OpportuniteCommerciale[]
      );
      return NextResponse.json({ performance });
    }

    if (action === "ANALYSER_COLLEGE" && Array.isArray(associes)) {
      const synthese = analyserCollegeAssocies(
        associes as AssocieCabinet[],
        dossiersList as DossierAssocie[],
        oppsList as OpportuniteCommerciale[]
      );
      return NextResponse.json({ synthese });
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
