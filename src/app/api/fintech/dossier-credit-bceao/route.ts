import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  evaluerDossierCreditBceao,
  type DemandeCredit,
  type DonneesFinancieresBancaires,
} from "@/lib/ohada/credit-notation-bceao";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      financier: DonneesFinancieresBancaires;
      demande: DemandeCredit;
    };
    if (!body || !body.financier || !body.demande) {
      return NextResponse.json(
        { error: "Données financières et demande de crédit requises" },
        { status: 400 }
      );
    }
    const dossier = evaluerDossierCreditBceao(body.financier, body.demande);
    return NextResponse.json(dossier);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
