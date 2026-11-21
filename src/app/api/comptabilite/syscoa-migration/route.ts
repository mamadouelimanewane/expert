import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { migrerBalanceSYSCOA, CompteSYSCOA } from "@/lib/ohada/syscoa-migration-engine";

/**
 * POST /api/comptabilite/syscoa-migration
 * Corps attendu : { comptes: CompteSYSCOA[] }
 * Retourne un RapportMigration complet.
 */
export async function POST(req: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  let body: { comptes?: CompteSYSCOA[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu." },
      { status: 400 }
    );
  }

  const { comptes } = body;

  if (!Array.isArray(comptes) || comptes.length === 0) {
    return NextResponse.json(
      { error: "Le champ 'comptes' doit être un tableau non vide de CompteSYSCOA." },
      { status: 400 }
    );
  }

  // Validation légère de chaque ligne
  for (const c of comptes) {
    if (!c.numero || typeof c.numero !== "string") {
      return NextResponse.json(
        { error: `Compte invalide : champ 'numero' manquant ou incorrect (${JSON.stringify(c)}).` },
        { status: 400 }
      );
    }
    if (typeof c.solde_XOF !== "number") {
      return NextResponse.json(
        { error: `Compte ${c.numero} : champ 'solde_XOF' doit être un nombre.` },
        { status: 400 }
      );
    }
  }

  try {
    const rapport = migrerBalanceSYSCOA(comptes);
    return NextResponse.json(rapport, { status: 200 });
  } catch (err) {
    console.error("[syscoa-migration] Erreur moteur :", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la migration SYSCOA → SYSCOHADA." },
      { status: 500 }
    );
  }
}
