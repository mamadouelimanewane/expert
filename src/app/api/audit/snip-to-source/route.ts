import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererDossierPAF,
  type LiaisonEcritureSource,
} from "@/lib/ohada/snip-to-source-paf";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale: string;
      exercice: number;
      lignes: LiaisonEcritureSource[];
    };
    if (!body || !body.societeRaisonSociale || !body.lignes) {
      return NextResponse.json(
        { error: "Raison sociale et lignes d'écritures requises" },
        { status: 400 }
      );
    }
    const dossier = genererDossierPAF(
      body.societeRaisonSociale,
      body.exercice || new Date().getFullYear(),
      body.lignes
    );
    return NextResponse.json(dossier);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
