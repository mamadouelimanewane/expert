import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  calculerSizingMission,
  evaluerSentinelleBoniMali,
  MetriquesDossierSizing,
  DonneesSuiviMission,
} from "@/lib/ohada/mission-budget-sentinel";
import { AuditService } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  const demoMetriques: MetriquesDossierSizing = {
    chiffreAffairesAnnuel: 350_000_000,
    nombreEcrituresAnnuelles: 4_500,
    nombreComptesTiersActifs: 65,
    nombreLignesImmobilisations: 30,
    nombreSalariesMensuel: 14,
    complexiteFiscale: "INTERMEDIAIRE",
    typeMission: "TENUE_COMPTABLE",
  };

  const sizing = calculerSizingMission(demoMetriques);

  const demoSuivi: DonneesSuiviMission = {
    heuresBudgetees: sizing.heuresTotalesRecommandees,
    heuresPasseesADate: Math.round(sizing.heuresTotalesRecommandees * 0.7),
    avancementTravauxPourcentage: 50, // alerte dérive
    honorairesSignesHT: sizing.honorairesRecommandesHT,
    tauxHoraireMoyenCabinet: 28_000,
  };

  const sentinelle = evaluerSentinelleBoniMali(demoSuivi);

  return NextResponse.json({ ok: true, sizing, sentinelle, params: { demoMetriques, demoSuivi } });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      mode: "SIZING" | "SENTINELLE";
      metriques?: MetriquesDossierSizing;
      suivi?: DonneesSuiviMission;
    };

    if (body.mode === "SIZING" && body.metriques) {
      const sizing = calculerSizingMission(body.metriques);
      await AuditService.log(session.id, "MISSION_SIZING_CALCUL", "missions", {
        heures: sizing.heuresTotalesRecommandees,
        honoraires: sizing.honorairesRecommandesHT,
      });
      return NextResponse.json({ ok: true, sizing });
    }

    if (body.mode === "SENTINELLE" && body.suivi) {
      const sentinelle = evaluerSentinelleBoniMali(body.suivi);
      await AuditService.log(session.id, "MISSION_SENTINELLE_EVAL", "missions", {
        statut: sentinelle.statutAlerte,
        ecart: sentinelle.ecartHeuresFinal,
      });
      return NextResponse.json({ ok: true, sentinelle });
    }

    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de traitement" },
      { status: 400 }
    );
  }
}
