import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  calculerIndemnitesRupture,
  DonneesRuptureContrat,
} from "@/lib/payroll/indemnites-rupture";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  // Exemple de calcul de départ
  const demo: DonneesRuptureContrat = {
    pays: "SN",
    nomSalarie: "Amadou Diallo",
    statut: "CADRE_DIRIGEANT",
    dateEmbauche: "2019-01-01",
    dateFinContrat: "2025-01-01",
    motif: "LICENCIEMENT_MOTIF_PERSONNEL",
    salaireMoyen12DerniersMois: 1_200_000,
    dernierSalaireBrut: 1_200_000,
    joursCongesRestants: 18,
    preavisEffectue: false,
  };

  const resultat = calculerIndemnitesRupture(demo);
  return NextResponse.json({ ok: true, params: demo, resultat });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const donnees = (await req.json()) as DonneesRuptureContrat;
    const resultat = calculerIndemnitesRupture(donnees);

    await AuditService.log(session.id, "CALCUL_INDEMNITES_RUPTURE", "payroll", {
      nomSalarie: donnees.nomSalarie,
      motif: donnees.motif,
      totalNet: resultat.netAPayerSolde,
    });

    return NextResponse.json({ ok: true, resultat });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de calcul" },
      { status: 400 }
    );
  }
}
