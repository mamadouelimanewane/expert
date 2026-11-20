import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  evaluerEntreprise,
  calculerCoutCapitalWACC,
  type ParametresEvaluationDCF,
  type ParametresMultiples,
  type ParametresANR,
} from "@/lib/ohada/evaluation-entreprise";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, nom, secteur, pays, dcfParams, multiplesParams, anrParams, waccParams } = body;

    if (action === "CALCULER_WACC" && waccParams) {
      const waccResult = calculerCoutCapitalWACC(waccParams);
      return NextResponse.json({ waccResult });
    }

    if (action === "EVALUER_ENTREPRISE" && dcfParams && multiplesParams && anrParams) {
      const evaluation = evaluerEntreprise(
        nom || "Société Cible",
        secteur || "Général",
        pays || "Sénégal",
        dcfParams as ParametresEvaluationDCF,
        multiplesParams as ParametresMultiples,
        anrParams as ParametresANR
      );
      return NextResponse.json({ evaluation });
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
