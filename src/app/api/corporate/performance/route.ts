import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export async function GET(request: NextRequest) {
  try {
    await AuthService.requireAuth();

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    const group = groupId
      ? await prisma.consolidationGroup.findUnique({ where: { id: groupId }, include: { entities: true } })
      : await prisma.consolidationGroup.findFirst({ include: { entities: true } });

    const entityClientIds = (group?.entities ?? []).map((e) => e.clientId).filter((id): id is string => !!id);

    // Périmètre réel : les clients rattachés aux entités du groupe de consolidation.
    // À défaut d'entités rattachées, on retombe sur l'ensemble des clients actifs (portefeuille cabinet).
    const scopeClientIds = entityClientIds.length > 0
      ? entityClientIds
      : (await prisma.client.findMany({ where: { isActive: true }, select: { id: true } })).map((c) => c.id);

    const usingFallbackScope = entityClientIds.length === 0;

    // ── Agrégats financiers réels (dernier exercice connu par client) ──
    const financialRows = await prisma.financialData.findMany({
      where: { clientId: { in: scopeClientIds } },
      orderBy: { year: "desc" },
      include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
    });

    const latestByClient = new Map<string, typeof financialRows[number]>();
    const previousByClient = new Map<string, typeof financialRows[number]>();
    for (const row of financialRows) {
      if (!latestByClient.has(row.clientId)) {
        latestByClient.set(row.clientId, row);
      } else if (!previousByClient.has(row.clientId) && latestByClient.get(row.clientId)!.year !== row.year) {
        previousByClient.set(row.clientId, row);
      }
    }

    const latest = Array.from(latestByClient.values());

    // Les totaux N et N-1 etaient sommes sur deux populations differentes :
    // `latest` contient un exercice pour CHAQUE entite du perimetre, `previous`
    // seulement pour celles qui en ont au moins deux. Sur un groupe de trois
    // entites a 200 M chacune dont une seule dispose d'un exercice N-1, le KPI
    // « CA Consolide (Groupe) » affichait +200 % de croissance alors que la
    // seule entite comparable etait stable. La variation est desormais calculee
    // sur le seul perimetre comparable — les entites presentes des deux cotes —
    // et ce perimetre est renvoye pour que l'interface puisse l'indiquer.
    const idsComparables = Array.from(previousByClient.keys());
    const latestComparable = idsComparables.map(id => latestByClient.get(id)!);
    const previous = idsComparables.map(id => previousByClient.get(id)!);

    const sum = (arr: typeof latest, key: "ca" | "netResult" | "equity" | "totalBilan" | "netCash") => arr.reduce((s, r) => s + r[key], 0);

    const caLatest = sum(latest, "ca");
    const netResultLatest = sum(latest, "netResult");
    const equityLatest = sum(latest, "equity");
    const totalBilanLatest = sum(latest, "totalBilan");
    const netCashLatest = sum(latest, "netCash");

    const caPrev = sum(previous, "ca");
    const netResultPrev = sum(previous, "netResult");
    const equityPrev = sum(previous, "equity");
    const totalBilanPrev = sum(previous, "totalBilan");
    const netCashPrev = sum(previous, "netCash");

    // Cote N du perimetre comparable, seul terme opposable a caPrev & co.
    const caComparable = sum(latestComparable, "ca");
    const netResultComparable = sum(latestComparable, "netResult");
    const equityComparable = sum(latestComparable, "equity");
    const totalBilanComparable = sum(latestComparable, "totalBilan");
    const netCashComparable = sum(latestComparable, "netCash");

    const netMarginComparable = caComparable !== 0 ? (netResultComparable / caComparable) * 100 : null;
    const financialAutonomyComparable =
      totalBilanComparable !== 0 ? (equityComparable / totalBilanComparable) * 100 : null;

    const netMargin = caLatest !== 0 ? round((netResultLatest / caLatest) * 100) : null;
    const netMarginPrev = caPrev !== 0 ? (netResultPrev / caPrev) * 100 : null;
    const financialAutonomy = totalBilanLatest !== 0 ? round((equityLatest / totalBilanLatest) * 100) : null;
    const financialAutonomyPrev = totalBilanPrev !== 0 ? (equityPrev / totalBilanPrev) * 100 : null;

    const kpis = [
      {
        label: "CA Consolidé (Groupe)",
        value: `${round(caLatest / 1000000, 1)}M FCFA`,
        changePct: caPrev !== 0 ? round(((caComparable - caPrev) / caPrev) * 100, 1) : null,
      },
      {
        label: "Marge Nette (Groupe)",
        value: netMargin !== null ? `${netMargin}%` : "—",
        changePct: (netMarginComparable !== null && netMarginPrev !== null) ? round(netMarginComparable - netMarginPrev, 1) : null,
        isPointsDelta: true,
      },
      {
        label: "Autonomie Financière (Groupe)",
        value: financialAutonomy !== null ? `${financialAutonomy}%` : "—",
        changePct: (financialAutonomyComparable !== null && financialAutonomyPrev !== null) ? round(financialAutonomyComparable - financialAutonomyPrev, 1) : null,
        isPointsDelta: true,
      },
      {
        label: "Trésorerie Nette (Groupe)",
        value: `${round(netCashLatest / 1000000, 1)}M FCFA`,
        changePct: netCashPrev !== 0 ? round(((netCashComparable - netCashPrev) / netCashPrev) * 100, 1) : null,
      },
    ];

    // ── Série mensuelle réelle du CA facturé sur 12 mois (périmètre du groupe) ──
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
      where: { clientId: { in: scopeClientIds }, status: { notIn: ["DRAFT", "CANCELLED"] }, issueDate: { gte: twelveMonthsAgo } },
      select: { total: true, issueDate: true },
    });

    const monthlySeries: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTotal = invoices
        .filter((inv) => inv.issueDate.getFullYear() === d.getFullYear() && inv.issueDate.getMonth() === d.getMonth())
        .reduce((s, inv) => s + inv.total, 0);
      monthlySeries.push({ label: MONTHS_FR[d.getMonth()], value: round(monthTotal / 1000000, 2) });
    }

    // ── Insights réels calculés à partir des entités du groupe ──
    const insights: { title: string; detail: string }[] = [];
    if (latest.length > 0) {
      const worstMargin = latest
        .map((r) => ({ name: r.client.companyName || `${r.client.firstName ?? ""} ${r.client.lastName ?? ""}`.trim(), margin: r.ca !== 0 ? (r.netResult / r.ca) * 100 : null }))
        .filter((r) => r.margin !== null)
        .sort((a, b) => (a.margin ?? 0) - (b.margin ?? 0))[0];
      if (worstMargin) {
        insights.push({
          title: "Rentabilité la plus faible du périmètre",
          detail: `${worstMargin.name} affiche la marge nette la plus faible du périmètre (${round(worstMargin.margin ?? 0, 1)}%).`,
        });
      }
      const mostIndebted = latest
        .map((r) => ({ name: r.client.companyName || `${r.client.firstName ?? ""} ${r.client.lastName ?? ""}`.trim(), debtRatio: r.totalBilan !== 0 ? 1 - r.equity / r.totalBilan : null }))
        .filter((r) => r.debtRatio !== null)
        .sort((a, b) => (b.debtRatio ?? 0) - (a.debtRatio ?? 0))[0];
      if (mostIndebted) {
        insights.push({
          title: "Endettement le plus élevé du périmètre",
          detail: `${mostIndebted.name} présente le ratio d'endettement le plus élevé (${round((mostIndebted.debtRatio ?? 0) * 100, 1)}% du bilan hors capitaux propres).`,
        });
      }
    }

    // ── Rapports statutaires réels (modèle Document) ──
    const documents = await prisma.document.findMany({
      where: { clientId: scopeClientIds.length > 0 ? { in: scopeClientIds } : undefined, type: { in: ["RAPPORT", "DECLARATION"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, originalName: true, fileUrl: true, createdAt: true, type: true },
    });

    return NextResponse.json({
      groupName: group?.name ?? null,
      entityCount: group?.entities.length ?? 0,
      usingFallbackScope,
      kpis,
      // Perimetre reellement comparable d'une periode a l'autre : les
      // variations ci-dessus ne portent que sur ces entites.
      perimetreComparaison: { entitesComparees: idsComparables.length, entitesTotal: latestByClient.size },
      monthlySeries,
      insights,
      documents: documents.map((d) => ({
        id: d.id,
        name: d.originalName,
        url: d.fileUrl,
        date: d.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erreur GET corporate/performance:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
