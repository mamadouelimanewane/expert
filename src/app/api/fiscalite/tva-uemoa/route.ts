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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    if (body.action === "comparer") {
      const caHT = body.caHT_XOF;
      if (typeof caHT !== "number" || !Number.isFinite(caHT) || caHT <= 0) {
        return NextResponse.json({ error: "Le chiffre d’affaires HT doit être un montant réel supérieur à zéro." }, { status: 400 });
      }
      const comparaison = comparerTVAUEMOA(caHT);
      return NextResponse.json({ comparaison });
    }

    if (body.action === "referentiel") {
      return NextResponse.json({ referentiel: REFERENTIEL_TVA_UEMOA });
    }

    // Default action: cadrage
    if (body.action !== "cadrage") {
      return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    }
    const pays = body.pays;
    const caHT = body.caHT_XOF;
    const tvaCollectee = body.tvaCollectee_XOF;
    const tvaDeductible = body.tvaDeductible_XOF;
    if (typeof pays !== "string" || !REFERENTIEL_TVA_UEMOA[pays.toUpperCase()]) {
      return NextResponse.json({ error: "Pays UEMOA invalide ou non référencé." }, { status: 400 });
    }
    if (typeof caHT !== "number" || !Number.isFinite(caHT) || caHT <= 0
      || typeof tvaCollectee !== "number" || !Number.isFinite(tvaCollectee) || tvaCollectee < 0
      || typeof tvaDeductible !== "number" || !Number.isFinite(tvaDeductible) || tvaDeductible < 0) {
      return NextResponse.json({ error: "Saisissez un chiffre d’affaires positif et des montants de TVA valides, égaux ou supérieurs à zéro." }, { status: 400 });
    }

    const cadrage = calculerCadrageTVA(pays.toUpperCase(), caHT, tvaCollectee, tvaDeductible);
    return NextResponse.json(cadrage);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
