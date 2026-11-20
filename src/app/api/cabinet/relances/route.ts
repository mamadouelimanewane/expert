import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  calculerPlanRelance,
  analyserPortefeuilleCreances,
  type FactureCreance,
} from "@/lib/ohada/relances-honoraires";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, facture, factures, dateReference } = body;
    const refDate = dateReference ? new Date(dateReference) : new Date();

    if (action === "CALCULER_PLAN_RELANCE" && facture) {
      const plan = calculerPlanRelance(facture as FactureCreance, refDate);
      return NextResponse.json({ plan });
    }

    if (action === "ANALYSER_PORTEFEUILLE" && Array.isArray(factures)) {
      const bilan = analyserPortefeuilleCreances(factures as FactureCreance[], refDate);
      const plans = factures.map((f: FactureCreance) => calculerPlanRelance(f, refDate));
      return NextResponse.json({ bilan, plans });
    }

    return NextResponse.json(
      { error: "Action non reconnue ou paramètres manquants" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Erreur interne" },
      { status: 500 }
    );
  }
}
