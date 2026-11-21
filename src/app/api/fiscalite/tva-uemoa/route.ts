import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  calculerCadrageTVA,
  comparerTVAUEMOA,
  REFERENTIEL_TVA_UEMOA,
} from "@/lib/ohada/tva-uemoa-multi-pays";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action?: "cadrage" | "comparer" | "referentiel";
      pays?: string;
      caHT_XOF?: number;
      tvaCollectee_XOF?: number;
      tvaDeductible_XOF?: number;
    };

    if (body.action === "comparer") {
      const caHT = Number(body.caHT_XOF) || 0;
      const comparaison = comparerTVAUEMOA(caHT);
      return NextResponse.json({ comparaison });
    }

    if (body.action === "referentiel") {
      return NextResponse.json({ referentiel: REFERENTIEL_TVA_UEMOA });
    }

    // Default action: cadrage
    const pays = body.pays || "SN";
    const caHT = Number(body.caHT_XOF) || 0;
    const tvaCollectee = Number(body.tvaCollectee_XOF) || 0;
    const tvaDeductible = Number(body.tvaDeductible_XOF) || 0;

    const cadrage = calculerCadrageTVA(pays, caHT, tvaCollectee, tvaDeductible);
    return NextResponse.json(cadrage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
