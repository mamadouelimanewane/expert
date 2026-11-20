import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import {
  executerCadragePaieCompta,
  LigneLivrePaieCumul,
  SoldesComptablesPaie,
} from "@/lib/payroll/cadrage-paie-compta";
import { AuditService } from "@/lib/audit";
import type { PaysFiscal } from "@/lib/tax-simulator";

export async function GET(req: NextRequest) {
  const { session, denied } = await requireStaff();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const pays = (searchParams.get("pays") ?? "SN") as PaysFiscal;
  const exercice = parseInt(searchParams.get("exercice") ?? String(new Date().getFullYear()));
  const periode = searchParams.get("periode") ?? "Exercice complet";

  // Données de démonstration réalistes
  const demoPaie: LigneLivrePaieCumul = {
    brutImposable: 120_000_000,
    chargesPatronalesSociales: 21_600_000,
    chargesSalarialesSociales: 8_400_000,
    impotsRetenusSource: 14_400_000,
    netAPayer: 97_200_000,
    avancesEtAcomptes: 2_000_000,
  };

  const demoCompta: SoldesComptablesPaie = {
    solde661_Remunerations: 120_000_000,
    solde664_ChargesSocialesPatronales: 21_600_000,
    solde422_PersonnelRemunerationsDues: 97_200_000,
    solde43_OrganismesSociaux: 30_000_000,
    solde447_RetenuesFiscalesSalaires: 14_400_000,
    solde421_AvancesAcomptes: 2_000_000,
  };

  const rapport = executerCadragePaieCompta(pays, exercice, periode, demoPaie, demoCompta);

  return NextResponse.json({ ok: true, paie: demoPaie, compta: demoCompta, rapport });
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

    const rapport = executerCadragePaieCompta(
      body.pays ?? "SN",
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
