import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  convertirSyscohadaVersIFRS,
  type DonneesComptablesSyscohada,
} from "@/lib/ohada/passerelle-syscohada-ifrs";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as DonneesComptablesSyscohada;
    if (!body || !body.raisonSociale || body.ebitdaSyscohada_XOF === undefined) {
      return NextResponse.json(
        { error: "Données comptables SYSCOHADA requises" },
        { status: 400 }
      );
    }
    const resultat = convertirSyscohadaVersIFRS(body);
    return NextResponse.json(resultat);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
