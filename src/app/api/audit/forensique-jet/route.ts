import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  executerAuditForensiqueISA240,
  type EcritureGrandLivreJET,
} from "@/lib/ohada/audit-forensique-jet";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      societeRaisonSociale: string;
      exercice: number;
      ecritures: EcritureGrandLivreJET[];
    };
    if (!body || !body.societeRaisonSociale || !body.ecritures) {
      return NextResponse.json(
        { error: "Raison sociale et liste des écritures grand livre requises" },
        { status: 400 }
      );
    }
    const rapport = executerAuditForensiqueISA240(
      body.societeRaisonSociale,
      body.exercice || new Date().getFullYear(),
      body.ecritures
    );
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
