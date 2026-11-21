import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererStorytellingFinancier,
  type InputFinancierCFO,
} from "@/lib/ohada/agent-cfo-storytelling";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { input?: InputFinancierCFO };
    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données financières manquantes" },
        { status: 400 }
      );
    }

    const rapport = genererStorytellingFinancier(body.input);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
