import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

function clientName(client: { companyName: string | null; firstName: string | null; lastName: string | null } | null): string {
  if (!client) return "Client inconnu";
  return client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client sans nom";
}

function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export async function GET(request: NextRequest) {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    let clientId = searchParams.get("clientId");

    // Liste des clients disposant de données financières réelles (pour le sélecteur)
    const clientsWithData = await prisma.client.findMany({
      where: { cabinetId: session.cabinetId, financialData: { some: { cabinetId: session.cabinetId } } },
      select: { id: true, companyName: true, firstName: true, lastName: true },
      orderBy: { companyName: "asc" },
    });

    if (!clientId) {
      clientId = clientsWithData[0]?.id ?? null;
    }

    if (!clientId) {
      return NextResponse.json({
        clients: clientsWithData.map((c) => ({ id: c.id, name: clientName(c) })),
        selectedClientId: null,
        client: null,
        ratios: null,
        dupont: null,
        altman: null,
        cashflow: null,
        narrative: "Aucune donnée financière (modèle FinancialData) n'a encore été saisie pour vos clients. Importez un bilan pour activer l'analyse.",
      });
    }
    if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide." }, { status: 400 });

    const client = await prisma.client.findFirst({
      where: { id: clientId, cabinetId: session.cabinetId },
      select: { id: true, companyName: true, firstName: true, lastName: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const rows = await prisma.financialData.findMany({
      where: { clientId, cabinetId: session.cabinetId },
      orderBy: { year: "desc" },
    });

    if (rows.length === 0) {
      return NextResponse.json({
        clients: clientsWithData.map((c) => ({ id: c.id, name: clientName(c) })),
        selectedClientId: clientId,
        client: client ? { id: client.id, name: clientName(client) } : null,
        ratios: null,
        dupont: null,
        altman: null,
        cashflow: null,
        narrative: `Aucune donnée financière enregistrée pour ${client ? clientName(client) : "ce client"}. Ajoutez un exercice (FinancialData) pour générer l'analyse.`,
      });
    }

    const current = rows[0];
    const previous = rows[1]; // exercice précédent, si disponible

    // ── Ratios réels calculés à partir des données existantes ──
    const netMargin = current.ca !== 0 ? current.netResult / current.ca : null; // Rentabilité nette
    const ebitdaMargin = current.ca !== 0 ? current.ebitda / current.ca : null; // Marge EBITDA
    const roe = current.equity !== 0 ? current.netResult / current.equity : null; // Return on Equity
    const financialAutonomy = current.totalBilan !== 0 ? current.equity / current.totalBilan : null; // Autonomie financière
    const assetTurnover = current.totalBilan !== 0 ? current.ca / current.totalBilan : null; // Rotation de l'actif
    const equityMultiplier = current.equity !== 0 ? current.totalBilan / current.equity : null; // Levier financier
    const debt = current.totalBilan - current.equity;
    const bfrDays = current.ca !== 0 ? (current.bfr / current.ca) * 365 : null; // BFR exprimé en jours de CA
    const cashToAssets = current.totalBilan !== 0 ? current.netCash / current.totalBilan : null;

    const prevRoe = previous && previous.equity !== 0 ? previous.netResult / previous.equity : null;
    const roeTrend = roe !== null && prevRoe !== null ? (roe > prevRoe ? "up" : roe < prevRoe ? "down" : "stable") : "stable";

    const ratios = {
      year: current.year,
      isProjected: current.isProjected,
      ca: current.ca,
      ebitda: current.ebitda,
      netResult: current.netResult,
      totalBilan: current.totalBilan,
      equity: current.equity,
      debt,
      netCash: current.netCash,
      bfr: current.bfr,
      netMargin: netMargin !== null ? round(netMargin * 100, 1) : null,
      ebitdaMargin: ebitdaMargin !== null ? round(ebitdaMargin * 100, 1) : null,
      roe: roe !== null ? round(roe * 100, 1) : null,
      roeTrend,
      financialAutonomy: financialAutonomy !== null ? round(financialAutonomy * 100, 1) : null,
      assetTurnover: assetTurnover !== null ? round(assetTurnover, 2) : null,
      equityMultiplier: equityMultiplier !== null ? round(equityMultiplier, 2) : null,
      bfrDays: bfrDays !== null ? round(bfrDays, 0) : null,
      cashToAssets: cashToAssets !== null ? round(cashToAssets * 100, 1) : null,
    };

    // ── Décomposition DuPont : ROE = Marge Nette × Rotation Actif × Levier Financier ──
    const dupont = (netMargin !== null && assetTurnover !== null && equityMultiplier !== null) ? {
      netMargin: round(netMargin * 100, 1),
      assetTurnover: round(assetTurnover, 2),
      equityMultiplier: round(equityMultiplier, 2),
      roe: round(netMargin * assetTurnover * equityMultiplier * 100, 1),
    } : null;

    // ── Altman Z-Score approché (OHADA) ──
    // Faute de détail actif circulant/dettes CT/résultats reportés/valeur de marché dans le modèle FinancialData,
    // les composantes suivantes sont des PROXYS assumés et documentés :
    //   X1 = (Trésorerie Nette + BFR) / Total Bilan   [proxy du Fonds de Roulement Net Global / Total Actif]
    //   X2 = Résultat Net / Total Bilan                [proxy des réserves, faute d'historique des résultats reportés]
    //   X3 = EBITDA / Total Bilan                      [proxy de l'EBIT, faute de détail des dotations]
    //   X4 = Capitaux Propres / Dettes                 [proxy de la valeur de marché des capitaux propres]
    //   X5 = CA / Total Bilan
    let altman = null;
    if (current.totalBilan !== 0) {
      const x1 = (current.netCash + current.bfr) / current.totalBilan;
      const x2 = current.netResult / current.totalBilan;
      const x3 = current.ebitda / current.totalBilan;
      const x4 = debt !== 0 ? current.equity / debt : current.equity > 0 ? 10 : 0;
      const x5 = current.ca / current.totalBilan;
      const z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
      const zone = z < 1.8 ? "danger" : z < 3 ? "grey" : "safe";
      altman = { value: round(z, 2), zone, isApproximation: true };
    }

    // ── Pont de trésorerie (uniquement si un exercice précédent existe) ──
    let cashflow = null;
    if (previous) {
      const netCashChange = current.netCash - previous.netCash;
      const bfrChange = previous.bfr - current.bfr; // une baisse du BFR libère de la trésorerie
      const residual = round(netCashChange - current.ebitda - bfrChange, 1);
      cashflow = {
        openingCash: previous.netCash,
        ebitda: current.ebitda,
        bfrChange: round(bfrChange, 1),
        residual, // flux d'investissement/financement non détaillés dans le modèle, présentés en résiduel honnête
        closingCash: current.netCash,
        netChange: round(netCashChange, 1),
        previousYear: previous.year,
      };
    }

    // ── Narratif généré à partir des chiffres réels (pas d'IA, pas de délai fictif) ──
    const clientLabel = client ? clientName(client) : "ce client";
    const narrativeParts: string[] = [];
    narrativeParts.push(`ANALYSE FINANCIÈRE — ${clientLabel.toUpperCase()} (Exercice ${current.year}${current.isProjected ? ", projeté" : ""})`);
    narrativeParts.push("");
    if (ratios.roe !== null) {
      narrativeParts.push(`Le ROE s'établit à ${ratios.roe}%, calculé sur les données réelles du client (résultat net ${current.netResult.toLocaleString("fr-FR")} FCFA / capitaux propres ${current.equity.toLocaleString("fr-FR")} FCFA).`);
    }
    if (ratios.financialAutonomy !== null) {
      narrativeParts.push(`L'autonomie financière (capitaux propres / total bilan) est de ${ratios.financialAutonomy}%.`);
    }
    if (ratios.netMargin !== null) {
      narrativeParts.push(`La rentabilité nette (résultat net / CA) atteint ${ratios.netMargin}%, pour un chiffre d'affaires de ${current.ca.toLocaleString("fr-FR")} FCFA.`);
    }
    if (ratios.bfrDays !== null) {
      narrativeParts.push(`Le BFR représente ${ratios.bfrDays} jours de chiffre d'affaires.`);
    }
    if (altman) {
      const zoneLabel = altman.zone === "safe" ? "zone sûre" : altman.zone === "grey" ? "zone grise" : "zone de danger";
      narrativeParts.push(`Le Z-Score approché (méthode Altman adaptée aux données disponibles) est de ${altman.value}, plaçant l'entreprise en ${zoneLabel}. Ce score est une approximation : le modèle de données ne distingue pas actif circulant/dettes court terme ni résultats reportés historiques.`);
    }
    if (previous) {
      narrativeParts.push(`Comparé à l'exercice ${previous.year}, le ROE est ${roeTrend === "up" ? "en hausse" : roeTrend === "down" ? "en baisse" : "stable"}.`);
    } else {
      narrativeParts.push("Un seul exercice est disponible pour ce client : ajoutez les données de l'exercice précédent pour obtenir une analyse de tendance.");
    }

    return NextResponse.json({
      clients: clientsWithData.map((c) => ({ id: c.id, name: clientName(c) })),
      selectedClientId: clientId,
      client: client ? { id: client.id, name: clientName(client) } : null,
      ratios,
      dupont,
      altman,
      cashflow,
      narrative: narrativeParts.join("\n"),
    });
  } catch (error) {
    console.error("Erreur GET analysis/financial-ratios:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
