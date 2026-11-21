import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererRapportRisqueChange,
  type PositionDevise,
} from "@/lib/ohada/simulateur-risque-change";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale?: string;
      exercice?: number;
      positions?: PositionDevise[];
    };
    if (!body || !body.positions) {
      return NextResponse.json(
        { error: "Positions en devises requises" },
        { status: 400 }
      );
    }
    const societe = body.societeRaisonSociale || "ENTREPRISE UEMOA SA";
    const exercice = body.exercice || new Date().getFullYear();
    const rapport = genererRapportRisqueChange(societe, exercice, body.positions);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
