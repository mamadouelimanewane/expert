import { NextResponse } from "next/server";

/**
 * Public tenant registration stays closed until every business-data route is
 * scoped to the authenticated cabinet. Creating a Cabinet record alone does
 * not provide isolation: the legacy Prisma queries still address shared data.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "La création automatique des espaces est temporairement suspendue pendant la sécurisation du cloisonnement des cabinets. Contactez l'équipe pour un accès accompagné.",
    },
    { status: 503 }
  );
}
