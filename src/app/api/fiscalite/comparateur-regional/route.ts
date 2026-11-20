import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  comparerFiscaliteRegionale,
  type InputComparateurFiscal,
} from "@/lib/ohada/comparateur-fiscal-uemoa";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as InputComparateurFiscal;
    if (!body || body.chiffreAffaires_XOF === undefined || body.resultatFiscal_XOF === undefined) {
      return NextResponse.json(
        { error: "Chiffre d'affaires et résultat fiscal requis" },
        { status: 400 }
      );
    }
    const resultat = comparerFiscaliteRegionale(body);
    return NextResponse.json(resultat);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
