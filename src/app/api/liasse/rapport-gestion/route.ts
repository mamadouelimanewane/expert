import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import { genererRapportGestion, type InputRapportGestion } from "@/lib/ohada/rapport-de-gestion";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as InputRapportGestion;
    if (!body || !body.entite || !body.soldesN) {
      return NextResponse.json(
        { error: "Données de l'entité et des soldes de gestion requises" },
        { status: 400 }
      );
    }
    const rapport = genererRapportGestion(body);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
