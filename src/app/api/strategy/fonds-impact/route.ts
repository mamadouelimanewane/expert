import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererModeleFinancierImpact,
  type InputModelisationImpact,
} from "@/lib/ohada/modelisation-fonds-impact";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { input?: InputModelisationImpact };
    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données de modélisation financière manquantes" },
        { status: 400 }
      );
    }

    const rapport = genererModeleFinancierImpact(body.input);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
