import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  executerAuditFiscalDefender,
  type LigneRisqueFiscal,
} from "@/lib/ohada/agent-fiscal-defender";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      clientNom?: string;
      pays?: string;
      exercice?: number;
      lignes?: LigneRisqueFiscal[];
    };

    if (!body || !body.lignes) {
      return NextResponse.json(
        { error: "Lignes de risque fiscal manquantes" },
        { status: 400 }
      );
    }

    const rapport = executerAuditFiscalDefender(
      body.clientNom || "ENTREPRISE DÉMO SA",
      body.pays || "Sénégal",
      body.exercice || new Date().getFullYear(),
      body.lignes
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
