import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

function clientName(client: { companyName: string | null; firstName: string | null; lastName: string | null } | null): string {
  if (!client) return "Client inconnu";
  return client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client sans nom";
}

function riskCategory(score: number): "excellent" | "good" | "fair" | "high_risk" {
  if (score >= 750) return "excellent";
  if (score >= 600) return "good";
  if (score >= 400) return "fair";
  return "high_risk";
}

function factorLabel(key: string): string {
  const labels: Record<string, string> = {
    paymentHistory: "Historique de Paiement",
    revenueGrowth: "Croissance du Chiffre d'Affaires",
    debtRatio: "Ratio d'Endettement",
    clientDiversification: "Diversification des Canaux",
  };
  return labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export async function GET() {
  try {
    await AuthService.requireAuth();

    const scores = await prisma.creditScore.findMany({
      orderBy: { evaluatedAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true, firstName: true, lastName: true, type: true } },
      },
      take: 50,
    });

    // Regrouper par client pour calculer la tendance (comparaison des 2 derniers scores du même client)
    const byClient = new Map<string, typeof scores>();
    for (const s of scores) {
      const arr = byClient.get(s.clientId) ?? [];
      arr.push(s);
      byClient.set(s.clientId, arr);
    }

    const results = scores.map((s) => {
      const history = (byClient.get(s.clientId) ?? []).sort((a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime());
      const idx = history.findIndex((h) => h.id === s.id);
      const prev = history[idx + 1];
      const trend: "up" | "down" | "stable" = prev ? (s.score > prev.score ? "up" : s.score < prev.score ? "down" : "stable") : "stable";

      const factorsObj = (s.factors && typeof s.factors === "object" && !Array.isArray(s.factors)) ? (s.factors as Record<string, unknown>) : {};
      const factors = Object.entries(factorsObj)
        .filter(([, v]) => typeof v === "number")
        .map(([key, value]) => ({
          label: factorLabel(key),
          impact: (value as number) >= 50 ? ("positive" as const) : ("negative" as const),
          description: `${key === "debtRatio" ? "Ratio d'endettement estimé" : "Indicateur"} : ${value}/100`,
        }));

      return {
        id: s.id,
        clientId: s.clientId,
        entityName: clientName(s.client),
        type: s.client?.type === "PARTICULIER" ? ("individual" as const) : ("business" as const),
        score: s.score,
        trend,
        riskCategory: riskCategory(s.score),
        isEligible: s.isEligible,
        evaluatedAt: s.evaluatedAt,
        factors,
      };
    });

    const eligibleCount = results.filter((r) => r.isEligible).length;
    const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : null;

    return NextResponse.json({
      scores: results,
      kpis: {
        totalScored: results.length,
        avgScore,
        eligibleCount,
        highRiskCount: results.filter((r) => r.riskCategory === "high_risk").length,
      },
    });
  } catch (error) {
    console.error("Erreur GET analysis/credit-insights:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
