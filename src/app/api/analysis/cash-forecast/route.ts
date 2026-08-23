import { NextResponse } from "next/server";
import { generateForecast, detectCriticalPoints } from "@/lib/forecast-engine";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Cette route renvoyait une trésorerie de départ fixe (18,4 M FCFA) et huit
// événements entièrement inventés, dont plusieurs nommaient des entreprises
// réelles (« Paiement Facture Sonatel », « Acompte Client Eiffage ») avec des
// montants sans rapport avec la base. Le moteur de projection
// (generateForecast) reste un modèle simplifié à hypothèses fixes — il est
// conservé tel quel pour les trois scénarios — mais son point de départ et
// les échéances affichées proviennent désormais de données réelles : le solde
// bancaire courant (BankTransaction) et les factures du cabinet non encore
// encaissées (Invoice, statut SENT/OVERDUE, échéance dans les 90 jours).
// Aucune charge récurrente (loyer, salaires, TVA) n'est suivie par
// l'application : elles ne sont donc plus fabriquées, et l'absence est
// signalée au client de l'API plutôt que comblée par un chiffre inventé.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const soldeBancaire = await prisma.bankTransaction.aggregate({
        _sum: { amount: true },
        where: { status: { not: "IGNORED" } },
    });
    const baseCash = soldeBancaire._sum.amount ?? 0;

    const dans90Jours = new Date();
    dans90Jours.setDate(dans90Jours.getDate() + 90);

    const facturesAttendues = await prisma.invoice.findMany({
        where: {
            status: { in: ["SENT", "OVERDUE"] },
            dueDate: { lte: dans90Jours },
        },
        orderBy: { dueDate: "asc" },
        take: 50,
        include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
    });

    const enRetard = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: "OVERDUE" },
    });

    let soldeCourant = baseCash;
    const events = facturesAttendues.map((f) => {
        soldeCourant += f.total;
        const nomClient = f.client.companyName || [f.client.firstName, f.client.lastName].filter(Boolean).join(" ") || "Client";
        return {
            id: f.id,
            date: f.dueDate.toISOString().split("T")[0],
            libelle: `Facture ${f.invoiceNumber} — ${nomClient}`,
            encaissement: f.total,
            decaissement: 0,
            solde: soldeCourant,
        };
    });

    const optimiste = generateForecast(baseCash, "optimiste");
    const realiste = generateForecast(baseCash, "realiste");
    const pessimiste = generateForecast(baseCash, "pessimiste");

    return NextResponse.json({
        baseCash,
        scenarios: { optimiste, realiste, pessimiste },
        criticals: detectCriticalPoints(pessimiste),
        events,
        creancesEnRetard: enRetard._sum.total ?? 0,
        // Aucune charge récurrente (loyer, salaires, TVA…) n'est suivie par
        // l'application : les événements ci-dessus ne couvrent que les
        // encaissements attendus (factures clients à échoir).
        decaissementsNonSuivis: true,
    });
}
