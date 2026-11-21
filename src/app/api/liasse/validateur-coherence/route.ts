import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  validerCoherenceLiasseSYSCOHADA,
  type InputValidationLiasse,
} from "@/lib/ohada/validateur-coherence-liasse";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { liasse?: InputValidationLiasse };
    if (!body || !body.liasse) {
      return NextResponse.json(
        { error: "Données de la liasse requises" },
        { status: 400 }
      );
    }
    const rapport = validerCoherenceLiasseSYSCOHADA(body.liasse);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
