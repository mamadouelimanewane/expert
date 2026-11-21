import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  evaluerDossierCreditPME,
  type DossierCreditPME,
} from "@/lib/ohada/scoring-pme-banque";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { dossier?: DossierCreditPME };
    if (!body || !body.dossier) {
      return NextResponse.json(
        { error: "Dossier PME manquant ou incomplet" },
        { status: 400 }
      );
    }

    const evaluation = evaluerDossierCreditPME(body.dossier);
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
