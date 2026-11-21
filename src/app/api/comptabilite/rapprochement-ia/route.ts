import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  executerRapprochementIA,
  type TransactionFlux,
  type FactureOuverte,
} from "@/lib/ohada/rapprochement-ia-banque-mobile";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      transactions?: TransactionFlux[];
      factures?: FactureOuverte[];
    };
    if (!body || !body.transactions || !body.factures) {
      return NextResponse.json(
        { error: "Transactions et factures requises pour le rapprochement" },
        { status: 400 }
      );
    }
    const rapport = executerRapprochementIA(body.transactions, body.factures);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
