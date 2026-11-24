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
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Données de la liasse requises" },
        { status: 400 }
      );
    }
    const liasse = (body as Record<string, unknown>).liasse;
    if (!liasse || typeof liasse !== "object" || Array.isArray(liasse)) {
      return NextResponse.json({ error: "Données de la liasse requises." }, { status: 400 });
    }
    const input = liasse as Partial<InputValidationLiasse>;
    const bilan = input.bilan;
    const compteResultat = input.compteResultat;
    const valeurs = [
      ...(bilan ? Object.values(bilan) : []),
      ...(compteResultat ? Object.values(compteResultat) : []),
    ];
    if (typeof input.societeRaisonSociale !== "string" || !input.societeRaisonSociale.trim()
      || typeof input.exercice !== "number" || !Number.isInteger(input.exercice) || input.exercice < 1900
      || !bilan || !compteResultat || valeurs.length !== 17
      || valeurs.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      return NextResponse.json({ error: "La raison sociale, l’exercice et les 17 montants numériques de la liasse sont obligatoires." }, { status: 400 });
    }
    const rapport = validerCoherenceLiasseSYSCOHADA(input as InputValidationLiasse);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
