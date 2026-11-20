import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { executerAuditFiscalAvance, DonneesAuditFiscal } from "@/lib/ohada/audit-fiscal-avance";
import { AuditService } from "@/lib/audit";
import type { PaysFiscal } from "@/lib/tax-simulator";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const pays = (searchParams.get("pays") ?? "SN") as PaysFiscal;
  const exercice = parseInt(searchParams.get("exercice") ?? String(new Date().getFullYear() - 1));

  // Données de démonstration
  const demo: DonneesAuditFiscal = {
    pays,
    exercice,
    chiffreAffairesHT: 500_000_000,
    beneficeAvantFraisSiege: 45_000_000,
    capitalSocialTotal: 100_000_000,
    capitalSocialLibere: 100_000_000,
    comptesCourants: { soldeMoyenAnnuel: 20_000_000, tauxInteretApplique: 7.5, tauxBCEAOMax: 5.5 },
    fraisDeSiegeComptabilises: 6_000_000,
    vehiculesTourisme: [
      { immatriculation: "DK-1234-AB", prixAcquisitionTTC: 25_000_000, tauxAmortissementAnnuel: 20, dotationComptabilisee: 5_000_000 },
    ],
    donsComptabilises: 3_500_000,
  };

  const resultat = executerAuditFiscalAvance(demo);

  await AuditService.log(session.id, "AUDIT_FISCAL_AVANCE", "matrice-risques", { pays, exercice });

  return NextResponse.json({ ok: true, donnees: demo, synthese: resultat });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const body = (await req.json()) as DonneesAuditFiscal;
    const resultat = executerAuditFiscalAvance(body);

    await AuditService.log(session.id, "AUDIT_FISCAL_AVANCE_CUSTOM", "matrice-risques", {
      pays: body.pays,
      exercice: body.exercice,
    });

    return NextResponse.json({ ok: true, synthese: resultat });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de traitement" },
      { status: 400 }
    );
  }
}
