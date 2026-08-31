import { NextResponse } from "next/server";
import {
    projeterTresorerie,
    detectCriticalPoints,
    retardMoyenReglement,
    type EncaissementAttendu,
} from "@/lib/forecast-engine";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Cette route renvoyait une trésorerie de départ fixe (18,4 M FCFA) et huit
// événements entièrement inventés, dont plusieurs nommaient des entreprises
// réelles (« Paiement Facture Sonatel », « Acompte Client Eiffage ») avec des
// montants sans rapport avec la base. Le point de départ et les échéances ont
// été rebranchés sur des données réelles dans un correctif antérieur.
//
// Les trois courbes de scénario restaient en revanche fabriquées : une
// variation hebdomadaire fixe de 250 000 FCFA multipliée par un coefficient,
// plus une « volatilité » calculée par Math.sin(). La date de rupture de
// trésorerie affichée provenait donc d'une sinusoïde. La projection est
// désormais construite à partir des seules factures non soldées, positionnées
// à leur échéance, sous trois hypothèses de recouvrement explicites :
//
//   optimiste  — chaque client règle à l'échéance ;
//   réaliste   — chaque client règle avec le retard moyen constaté sur les
//                factures déjà payées du cabinet ;
//   pessimiste — même retard, et les créances déjà échues ne rentrent pas.
//
// Aucune charge récurrente (loyer, salaires, TVA) n'est suivie par
// l'application : aucun décaissement n'est inventé, et `decaissementsNonSuivis`
// le signale explicitement à l'appelant.
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

    // Retard de règlement réellement constaté, mesuré sur les factures soldées.
    const facturesPayees = await prisma.invoice.findMany({
        where: { status: "PAID", paidDate: { not: null } },
        select: { dueDate: true, paidDate: true },
        take: 200,
        orderBy: { paidDate: "desc" },
    });
    const retardMoyenJours = retardMoyenReglement(facturesPayees);

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

    const maintenant = new Date();
    const encaissements: EncaissementAttendu[] = facturesAttendues.map((f) => ({
        echeance: f.dueDate,
        montant: f.total,
        enRetard: f.status === "OVERDUE" || f.dueDate.getTime() < maintenant.getTime(),
    }));

    const hypotheses = { retardMoyenJours };
    const optimiste = projeterTresorerie(baseCash, encaissements, "optimiste", hypotheses, maintenant);
    const realiste = projeterTresorerie(baseCash, encaissements, "realiste", hypotheses, maintenant);
    const pessimiste = projeterTresorerie(baseCash, encaissements, "pessimiste", hypotheses, maintenant);

    return NextResponse.json({
        baseCash,
        scenarios: { optimiste, realiste, pessimiste },
        criticals: detectCriticalPoints(pessimiste),
        events,
        creancesEnRetard: enRetard._sum.total ?? 0,
        hypotheses: {
            retardMoyenJours,
            // Sans facture payée, le retard n'est pas mesurable : le scénario
            // réaliste se confond alors avec l'optimiste et il faut le dire.
            retardMesurable: retardMoyenJours !== null,
            facturesMesurees: facturesPayees.length,
        },
        // Aucune charge récurrente (loyer, salaires, TVA…) n'est suivie par
        // l'application : la projection ne couvre que les encaissements
        // attendus (factures clients à échoir).
        decaissementsNonSuivis: true,
    });
}
