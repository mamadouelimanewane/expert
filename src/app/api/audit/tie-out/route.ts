import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererRapportTieOut,
  type SectionValidee,
  type LigneCloture,
} from "@/lib/ohada/tie-out-integrite-cloture";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale: string;
      exercice: number;
      sectionsValidees: SectionValidee[];
      grandLivreActuel: Record<string, LigneCloture[]>;
    };
    if (!body || !body.societeRaisonSociale || !body.sectionsValidees) {
      return NextResponse.json(
        { error: "Raison sociale et sections validées requises" },
        { status: 400 }
      );
    }
    const grandLivreMap = new Map<string, LigneCloture[]>(
      Object.entries(body.grandLivreActuel ?? {})
    );
    const rapport = genererRapportTieOut(
      body.societeRaisonSociale,
      body.exercice || new Date().getFullYear(),
      body.sectionsValidees,
      grandLivreMap
    );
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
