import { NextResponse } from "next/server";

// ============================================================
// Le checkout reste fermé tant que les dossiers ne sont pas cloisonnés par
// cabinet. Réactiver une facturation avant cette migration pourrait faire
// payer des cabinets pour un service dont les données ne sont pas isolées.
// ============================================================

export async function POST() {
  return NextResponse.json(
    {
      error:
        "La souscription en libre-service est temporairement suspendue pendant la sécurisation du cloisonnement des cabinets. Aucun paiement ne sera initié.",
    },
    { status: 503 }
  );
}
