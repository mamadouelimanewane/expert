import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
// Renvoie un client réel avec ses dernières données financières et son dernier score
// de crédit (calculés par /api/fintech/scoring), pour alimenter le dossier crédit.
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const client = await prisma.client.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!client) {
      return NextResponse.json({ client: null });
    }

    const [financialData, creditScore] = await Promise.all([
      prisma.financialData.findFirst({ where: { clientId: client.id }, orderBy: { year: "desc" } }),
      prisma.creditScore.findFirst({ where: { clientId: client.id }, orderBy: { evaluatedAt: "desc" } }),
    ]);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim(),
        sector: client.sector,
        country: client.country,
        rccm: client.rccm,
        ifu: client.ifu,
      },
      financialData: financialData ? {
        ca: financialData.ca,
        ebitda: financialData.ebitda,
        netResult: financialData.netResult,
        equity: financialData.equity,
        netCash: financialData.netCash,
        year: financialData.year,
      } : null,
      creditScore: creditScore ? {
        score: creditScore.score,
        isEligible: creditScore.isEligible,
        factors: creditScore.factors,
        evaluatedAt: creditScore.evaluatedAt,
      } : null,
    });
  } catch (error) {
    console.error("[API fintech/credit] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
