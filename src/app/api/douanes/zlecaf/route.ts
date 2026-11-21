import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  simulerArbitrageZLECAf,
  type InputArbitrageZLECAf,
} from "@/lib/ohada/zlecaf-arbitrage-douanier";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { input?: InputArbitrageZLECAf };
    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données de simulation ZLECAf manquantes" },
        { status: 400 }
      );
    }

    const rapport = simulerArbitrageZLECAf(body.input);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
