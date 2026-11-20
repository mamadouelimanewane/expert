import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererRapportDuPontCashflow,
  type InputDuPont,
} from "@/lib/ohada/dupont-cash-waterfall";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale: string;
      inputDuPont: InputDuPont;
      ebe_XOF: number;
      variationBFR_XOF: number;
      investissements_XOF: number;
      remboursementsEmprunts_XOF: number;
      impots_XOF: number;
      tresorerieActuelle_XOF: number;
      burnMensuel_XOF: number;
    };
    if (!body || !body.societeRaisonSociale || !body.inputDuPont) {
      return NextResponse.json(
        { error: "Raison sociale et données DuPont requises" },
        { status: 400 }
      );
    }
    const rapport = genererRapportDuPontCashflow(
      body.societeRaisonSociale,
      body.inputDuPont,
      body.ebe_XOF ?? 0,
      body.variationBFR_XOF ?? 0,
      body.investissements_XOF ?? 0,
      body.remboursementsEmprunts_XOF ?? 0,
      body.impots_XOF ?? 0,
      body.tresorerieActuelle_XOF ?? 0,
      body.burnMensuel_XOF ?? 0
    );
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
