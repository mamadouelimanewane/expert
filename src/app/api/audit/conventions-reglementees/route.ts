import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererRapportSpecialCAC,
  type ConventionSaisie,
} from "@/lib/ohada/conventions-reglementees-penal";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale: string;
      exercice: number;
      conventions: ConventionSaisie[];
    };
    if (!body || !body.societeRaisonSociale || !body.conventions) {
      return NextResponse.json(
        { error: "Raison sociale et liste des conventions requises" },
        { status: 400 }
      );
    }
    const rapport = genererRapportSpecialCAC(
      body.societeRaisonSociale,
      body.exercice || new Date().getFullYear(),
      body.conventions
    );
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
