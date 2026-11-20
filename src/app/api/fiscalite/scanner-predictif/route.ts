import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  scannerRisquesFiscaux,
  type DonneeControleFiscal,
} from "@/lib/ohada/scanner-fiscal-predictif";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as DonneeControleFiscal;
    if (!body || body.chiffreAffairesComptable_XOF === undefined) {
      return NextResponse.json(
        { error: "Données comptables et fiscales requises" },
        { status: 400 }
      );
    }
    const rapport = scannerRisquesFiscaux(body);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
