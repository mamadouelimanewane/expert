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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide — JSON attendu." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }
  const comptes = (body as Record<string, unknown>).comptes;

  if (!Array.isArray(comptes) || comptes.length === 0 || comptes.length > 5_000) {
    return NextResponse.json(
      { error: "Le champ 'comptes' doit contenir entre 1 et 5 000 lignes." },
      { status: 400 }
    );
  }

  const numeros = new Set<string>();
  const comptesValides: CompteSYSCOA[] = [];
  for (const value of comptes as unknown[]) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return NextResponse.json(
        { error: "Une ligne de balance n’est pas un compte valide." },
        { status: 400 }
      );
    }
    const compte = value as Record<string, unknown>;
    if (typeof compte.numero !== "string" || !/^\d{1,10}$/.test(compte.numero.trim())
      || typeof compte.libelle !== "string" || !compte.libelle.trim() || compte.libelle.trim().length > 255
      || typeof compte.solde_XOF !== "number" || !Number.isFinite(compte.solde_XOF)) {
      return NextResponse.json(
        { error: "Chaque compte doit avoir un numéro, un intitulé et un solde numérique valide." },
        { status: 400 }
      );
    }
    const numero = compte.numero.trim();
    if (numeros.has(numero)) {
      return NextResponse.json({ error: `Le compte ${numero} apparaît plusieurs fois dans la balance.` }, { status: 400 });
    }
    numeros.add(numero);
    comptesValides.push({ numero, libelle: compte.libelle.trim(), solde_XOF: compte.solde_XOF });
  }

  try {
    const rapport = migrerBalanceSYSCOA(comptesValides);
    return NextResponse.json(rapport, { status: 200 });
  } catch (err) {
    console.error("[syscoa-migration] Erreur moteur :", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la migration SYSCOA → SYSCOHADA." },
      { status: 500 }
    );
  }
}
