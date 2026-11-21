import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  etablirRegistreBeneficiairesEffectifs,
  type ActionnaireEntite,
} from "@/lib/ohada/registre-beneficiaires-effectifs";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeNom?: string;
      formeJuridique?: string;
      rccm?: string;
      paysSiege?: string;
      actionnairesDirects?: ActionnaireEntite[];
    };

    if (!body || !body.actionnairesDirects) {
      return NextResponse.json(
        { error: "Liste des actionnaires manquante" },
        { status: 400 }
      );
    }

    const rapport = etablirRegistreBeneficiairesEffectifs(
      body.societeNom || "SOCIÉTÉ DÉMO SAS",
      body.formeJuridique || "SAS",
      body.rccm || "SN.DKR.2024.B.0001",
      body.paysSiege || "Sénégal",
      body.actionnairesDirects
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
