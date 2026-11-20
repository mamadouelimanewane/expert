import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  mapperBalanceVersLiasse,
  type LigneBalanceSYSCOHADA,
} from "@/lib/ohada/mapping-balance-liasse";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, lignesBalance } = body;

    if (action === "MAPPER_BALANCE" && Array.isArray(lignesBalance)) {
      const liasse = mapperBalanceVersLiasse(lignesBalance as LigneBalanceSYSCOHADA[]);
      return NextResponse.json({ liasse });
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
