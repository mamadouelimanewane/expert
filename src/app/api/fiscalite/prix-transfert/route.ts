import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
  evaluerFluxIntragroupe,
  genererDossierPrixTransfert,
  type FluxIntragroupe,
} from "@/lib/ohada/prix-de-transfert";

export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, flux, fluxList, chiffreAffairesBeneficiaire, resultatExploitationBeneficiaire } = body;

    const ca = Number(chiffreAffairesBeneficiaire || 1_000_000_000);
    const rex = Number(resultatExploitationBeneficiaire || 100_000_000);

    if (action === "EVALUER_FLUX" && flux) {
      const analyse = evaluerFluxIntragroupe(flux as FluxIntragroupe, ca, rex);
      return NextResponse.json({ analyse });
    }

    if (action === "GENERER_DOSSIER" && Array.isArray(fluxList)) {
      const dossier = genererDossierPrixTransfert(fluxList as FluxIntragroupe[], ca, rex);
      return NextResponse.json({ dossier });
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
