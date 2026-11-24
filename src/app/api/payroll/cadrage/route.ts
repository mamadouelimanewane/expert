import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  executerCadragePaieCompta,
  LigneLivrePaieCumul,
  SoldesComptablesPaie,
} from "@/lib/payroll/cadrage-paie-compta";
import { AuditService } from "@/lib/audit";
import type { PaysFiscal } from "@/lib/tax-simulator";

export async function GET() {
  const { denied } = await requireStaff();
  if (denied) return denied;

  return NextResponse.json({ ok: false, error: "Aucun livre de paie ni grand livre lié à cette période n'est disponible. Transmettez les montants réels au moteur de cadrage." }, { status: 409 });
}

export async function POST(req: NextRequest) {
  const { session, denied } = await requireWriteAccess();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      pays: PaysFiscal;
      exercice: number;
      periodeOuMois: string;
      paie: LigneLivrePaieCumul;
      compta: SoldesComptablesPaie;
    };

    if (!body.paie || !body.compta || !Number.isInteger(body.exercice) || body.exercice < 2000 || body.exercice > 2100 || !body.periodeOuMois?.trim()) {
      return NextResponse.json({ ok: false, error: "Période et données réelles du livre de paie et du grand livre obligatoires." }, { status: 400 });
    }
    const montants = [
      body.paie.brutImposable, body.paie.chargesPatronalesSociales, body.paie.chargesSalarialesSociales,
      body.paie.impotsRetenusSource, body.paie.netAPayer, body.paie.avancesEtAcomptes,
      body.compta.solde661_Remunerations, body.compta.solde664_ChargesSocialesPatronales,
      body.compta.solde422_PersonnelRemunerationsDues, body.compta.solde43_OrganismesSociaux,
      body.compta.solde447_RetenuesFiscalesSalaires, body.compta.solde421_AvancesAcomptes,
    ];
    if (!montants.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0)) {
      return NextResponse.json({ ok: false, error: "Tous les montants doivent être numériques, finis et positifs ou nuls." }, { status: 400 });
    }
    if (!["sn", "ci", "cm", "bj"].includes(String(body.pays).toLowerCase())) {
      return NextResponse.json({ ok: false, error: "Pays fiscal non pris en charge." }, { status: 400 });
    }
    const rapport = executerCadragePaieCompta(
      (body.pays ?? "sn").toLowerCase() as PaysFiscal,
      body.exercice ?? new Date().getFullYear(),
      body.periodeOuMois ?? "Période courante",
      body.paie,
      body.compta
    );

    await AuditService.log(session.id, "CADRAGE_PAIE_COMPTA", "payroll", {
      pays: body.pays,
      exercice: body.exercice,
      conformite: rapport.tauxConformiteGlobal,
    });

    return NextResponse.json({ ok: true, rapport });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur de cadrage" },
      { status: 400 }
    );
  }
}
