import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// Health check public (sonde Vercel, supervision externe).
//
// La réponse anonyme se limite volontairement à l'état de service : le nombre
// de comptes, l'état de la base et la présence des variables d'environnement
// renseignent un attaquant sur la cible sans rien apporter à une sonde. Ces
// détails ne sont servis qu'à un ADMIN authentifié.

export async function GET() {
    const { session } = await requireAdmin();
    const detaille = Boolean(session);

    try {
        // Une requête minimale suffit à valider que la base répond.
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            ...(detaille
                ? {
                      version: "2.0.1",
                      db_status: "connected",
                      user_count: userCount,
                      env_check: {
                          has_db_url: !!process.env.DATABASE_URL,
                          has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
                      },
                  }
                : {}),
        });
    } catch (error) {
        console.error("Health check error:", error);
        return NextResponse.json(
            {
                status: "error",
                timestamp: new Date().toISOString(),
                ...(detaille ? { version: "2.0.1", db_status: "disconnected" } : {}),
            },
            { status: 503 }
        );
    }
}
