import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ============================================================
// GET /api/admin/cabinets
//
// Renvoie la liste paginée de tous les cabinets SaaS avec
// leur statut d'abonnement, nombre d'utilisateurs et dossiers.
// Réservé aux ADMIN.
// ============================================================

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const url = new URL(req.url);
  const page  = Math.max(1, parseInt(url.searchParams.get("page")  || "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
  const skip  = (page - 1) * limit;

  const [total, cabinets] = await Promise.all([
    prisma.cabinet.count(),
    prisma.cabinet.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true } },
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    cabinets: cabinets.map((c) => ({
      id:              c.id,
      slug:            c.slug,
      nom:             c.nom,
      plan:            c.plan,
      statut:          c.statut,
      pays:            c.pays,
      trialExpiresAt:  c.trialExpiresAt,
      lastPaidAt:      c.lastPaidAt,
      lastPaidMonths:  c.lastPaidMonths,
      maxDossiers:     c.maxDossiers,
      maxCollaborateurs: c.maxCollaborateurs,
      utilisateurs:    c._count.users,
      createdAt:       c.createdAt,
    })),
  });
}
