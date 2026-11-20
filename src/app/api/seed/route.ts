import { NextResponse } from "next/server";

/**
 * Publicly reachable demo seeding has been retired. Sample datasets belong in
 * an explicitly scoped development seed, never in a request handler.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Le chargement des données de démonstration est désactivé." },
    { status: 503 },
  );
}
