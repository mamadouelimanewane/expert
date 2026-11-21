import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  executerAuditSentinelCloture,
  type CompteBalanceCloture,
} from "@/lib/ohada/agent-sentinel-cloture";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      clientNom?: string;
      exercice?: number;
      comptes?: CompteBalanceCloture[];
    };

    if (!body || !body.comptes || body.comptes.length === 0) {
      return NextResponse.json(
        { error: "Comptes de balance manquants pour l'audit" },
        { status: 400 }
      );
    }

    const rapport = executerAuditSentinelCloture(
      body.clientNom || "ENTREPRISE DÉMO SA",
      body.exercice || new Date().getFullYear(),
      body.comptes
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
