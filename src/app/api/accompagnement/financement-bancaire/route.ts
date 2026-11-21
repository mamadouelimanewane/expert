import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  evaluerDossierFinancementBancaire,
  type InputDossierFinancement,
} from "@/lib/ohada/dossier-financement-bancaire";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { input?: InputDossierFinancement };
    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données du dossier de financement manquantes" },
        { status: 400 }
      );
    }

    const rapport = evaluerDossierFinancementBancaire(body.input);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
