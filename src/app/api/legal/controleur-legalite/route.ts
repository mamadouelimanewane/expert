import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  verifierConformiteStatutsOHADA,
  type StatutsSocieteInput,
} from "@/lib/ohada/controleur-legalite-ohada";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { statuts?: StatutsSocieteInput };
    if (!body || !body.statuts) {
      return NextResponse.json(
        { error: "Données statutaires requises" },
        { status: 400 }
      );
    }
    const rapport = verifierConformiteStatutsOHADA(body.statuts);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
