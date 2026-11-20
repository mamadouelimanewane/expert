import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererDossierLocalFilePT,
  type EntiteDeclarantePT,
} from "@/lib/ohada/local-file-prix-transfert";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as EntiteDeclarantePT;
    if (!body || !body.raisonSociale || !body.transactions) {
      return NextResponse.json(
        { error: "Raison sociale et transactions intra-groupe requises" },
        { status: 400 }
      );
    }
    const dossier = genererDossierLocalFilePT(body);
    return NextResponse.json(dossier);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
