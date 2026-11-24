import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { executerAuditFiscalAvance, DonneesAuditFiscal } from "@/lib/ohada/audit-fiscal-avance";
import { AuditService } from "@/lib/audit";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;

  return NextResponse.json({ ok: false, error: "Aucune donnée réelle de dossier n'est reliée à cette matrice. Fournissez les comptes et justificatifs validés via POST." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const body = (await req.json()) as DonneesAuditFiscal;
    const montants = [body.chiffreAffairesHT, body.beneficeAvantFraisSiege, body.capitalSocialTotal, body.capitalSocialLibere, body.comptesCourants?.soldeMoyenAnnuel, body.comptesCourants?.tauxInteretApplique, body.comptesCourants?.tauxBCEAOMax, body.fraisDeSiegeComptabilises, body.donsComptabilises];
    if (!montants.every((value) => typeof value === "number" && Number.isFinite(value)) || !Number.isInteger(body.exercice) || body.exercice < 2000 || body.exercice > 2100 || !["sn", "ci", "cm", "bj"].includes(String(body.pays).toLowerCase())) {
      return NextResponse.json({ ok: false, error: "Exercice, juridiction ou données comptables invalides/incomplètes." }, { status: 400 });
    }
    if (body.chiffreAffairesHT < 0 || body.capitalSocialTotal < 0 || body.capitalSocialLibere < 0 || body.fraisDeSiegeComptabilises < 0 || body.donsComptabilises < 0 || !Array.isArray(body.vehiculesTourisme)) {
      return NextResponse.json({ ok: false, error: "Les montants et véhicules doivent être renseignés sans valeur fictive ni montant négatif." }, { status: 400 });
    }
    if (body.capitalSocialLibere > body.capitalSocialTotal
      || body.comptesCourants.tauxInteretApplique < 0 || body.comptesCourants.tauxInteretApplique > 100
      || body.comptesCourants.tauxBCEAOMax < 0 || body.comptesCourants.tauxBCEAOMax > 100
      || body.vehiculesTourisme.some((vehicle) => !vehicle.immatriculation.trim()
        || ![vehicle.prixAcquisitionTTC, vehicle.tauxAmortissementAnnuel, vehicle.dotationComptabilisee].every((value) => Number.isFinite(value) && value >= 0))) {
      return NextResponse.json({ ok: false, error: "Capital libéré, taux ou données des véhicules incohérents." }, { status: 400 });
    }
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
