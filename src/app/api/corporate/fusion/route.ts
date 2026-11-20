import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import { calculerResultatFusion, type DossierFusion } from "@/lib/ohada/fusions-restructurations";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as DossierFusion;
    if (!body || !body.absorbante || !body.absorbee) {
      return NextResponse.json(
        { error: "Données de la société absorbante et absorbée requises" },
        { status: 400 }
      );
    }
    const resultat = calculerResultatFusion(body);
    return NextResponse.json(resultat);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
