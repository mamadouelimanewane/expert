import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import { genererRapportESG, type InputESG } from "@/lib/ohada/reporting-esg";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as InputESG;
    if (!body || !body.raisonSociale) {
      return NextResponse.json({ error: "Raison sociale requise" }, { status: 400 });
    }
    const rapport = genererRapportESG(body);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
