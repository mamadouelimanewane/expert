import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  calculerScoringESGBRVM,
  type InputScoringESGBRVM,
} from "@/lib/ohada/scoring-esg-brvm";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { input?: InputScoringESGBRVM };
    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données d'évaluation ESG manquantes" },
        { status: 400 }
      );
    }
    const rapport = calculerScoringESGBRVM(body.input);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
