import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Calcule les ratios financiers RÉELS d'un client à partir de FinancialData.
// Aucune donnée sectorielle de comparaison (moyennes de marché) n'est disponible :
// ce endpoint ne renvoie donc jamais de "sectorAvg" — le front doit afficher un état
// honnête "non configuré" pour cette partie.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }

    const latest = await prisma.financialData.findFirst({
      where: { clientId },
      orderBy: [{ year: "desc" }],
    });

    if (!latest) {
      return NextResponse.json({ ratios: null, hasData: false });
    }

    const ebitdaMargin = latest.ca !== 0 ? (latest.ebitda / latest.ca) * 100 : null;
    const netMargin = latest.ca !== 0 ? (latest.netResult / latest.ca) * 100 : null;
    const debtRatio = latest.totalBilan !== 0 ? ((latest.totalBilan - latest.equity) / latest.totalBilan) * 100 : null;
    const roe = latest.equity !== 0 ? (latest.netResult / latest.equity) * 100 : null;

    return NextResponse.json({
      hasData: true,
      year: latest.year,
      ratios: {
        ca: latest.ca,
        ebitdaMargin,
        netMargin,
        debtRatio,
        roe,
      },
    });
  } catch (error) {
    console.error("[API benchmarking] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
