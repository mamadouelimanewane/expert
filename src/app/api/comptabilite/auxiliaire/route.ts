import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    calculerBalanceAgee,
    lettrerEcritures,
    detecterReclassements416,
    type EcritureTiers,
} from "@/lib/ohada/comptabilite-auxiliaire";
import { AuditService } from "@/lib/audit";

/**
 * API Comptabilité Auxiliaire (Balance Âgée, Lettrage & Risques Tiers)
 * GET  /api/comptabilite/auxiliaire?clientId=&typeTiers=&dateArrete=
 * POST /api/comptabilite/auxiliaire (Action de lettrage)
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const typeTiers = (searchParams.get("typeTiers") || "CLIENT") as "CLIENT" | "FOURNISSEUR";
    const dateArrete = searchParams.get("dateArrete") || new Date().toISOString().slice(0, 10);

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    // Récupérer les factures réelles du client
    const invoices = await prisma.invoice.findMany({
        where: {
            clientId,
            type: typeTiers === "CLIENT" ? "SALE" : "PURCHASE",
        },
        orderBy: { date: "desc" },
        take: 100,
    });

    let ecritures: EcritureTiers[] = [];

    if (invoices.length > 0) {
        ecritures = invoices.map((inv) => ({
            id: inv.id,
            date: inv.date.toISOString().slice(0, 10),
            echeance: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : undefined,
            numeroPiece: inv.number,
            libelle: `Facture ${inv.number}`,
            compteGeneral: typeTiers === "CLIENT" ? "4111" : "4011",
            compteAuxiliaire: inv.clientName ? inv.clientName.slice(0, 8).toUpperCase() : "TIERS-01",
            nomTiers: inv.clientName || "Tiers Partenaire",
            sens: typeTiers === "CLIENT" ? "DEBIT" : "CREDIT",
            montant: inv.amount,
            montantLettre: inv.status === "PAID" ? inv.amount : 0,
        }));
    } else {
        // Jeu de démonstration représentatif pour PME
        const aujourdhui = new Date();
        const d1 = new Date(aujourdhui.getTime() - 10 * 86400000).toISOString().slice(0, 10);
        const d2 = new Date(aujourdhui.getTime() - 45 * 86400000).toISOString().slice(0, 10);
        const d3 = new Date(aujourdhui.getTime() - 80 * 86400000).toISOString().slice(0, 10);
        const d4 = new Date(aujourdhui.getTime() - 120 * 86400000).toISOString().slice(0, 10);

        ecritures = [
            {
                id: "demo-1",
                date: d1,
                numeroPiece: "FAC-2026-081",
                libelle: "Vente quincaillerie & outillage",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-TOTAL",
                nomTiers: "TotalEnergies Station",
                sens: "DEBIT",
                montant: 3_250_000,
            },
            {
                id: "demo-2",
                date: d2,
                numeroPiece: "FAC-2026-054",
                libelle: "Fournitures de bureau et consommables",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-BTP",
                nomTiers: "Consortium BTP Sahel",
                sens: "DEBIT",
                montant: 1_850_000,
            },
            {
                id: "demo-3",
                date: d3,
                numeroPiece: "FAC-2026-032",
                libelle: "Prestation de maintenance climatisation",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-HOTEL",
                nomTiers: "Hôtel Résidence Almadies",
                sens: "DEBIT",
                montant: 2_400_000,
            },
            {
                id: "demo-4",
                date: d4,
                numeroPiece: "FAC-2025-119",
                libelle: "Livraison matériaux gros œuvre",
                compteGeneral: "4111",
                compteAuxiliaire: "CLI-IMMO",
                nomTiers: "Dakar Promoteurs Immobiliers",
                sens: "DEBIT",
                montant: 4_720_000,
            },
        ];
    }

    const balanceAgee = calculerBalanceAgee(ecritures, dateArrete, typeTiers);
    const reclassements416 = detecterReclassements416(balanceAgee);

    return NextResponse.json({
        balanceAgee,
        reclassements416,
        ecrituresDisponibles: ecritures,
    });
}

export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    let body: {
        factures: EcritureTiers[];
        reglements: EcritureTiers[];
        codeLettrage: string;
        clientId: string;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { factures, reglements, codeLettrage, clientId } = body;

    if (!factures || !reglements || !codeLettrage || !clientId) {
        return NextResponse.json({ error: "Paramètres de lettrage manquants." }, { status: 400 });
    }

    const resultatLettrage = lettrerEcritures(factures, reglements, codeLettrage);

    await AuditService.log({
        action: "LETTRAGE_AUXILIAIRE",
        entityType: "Client",
        entityId: clientId,
        details: {
            codeLettrage,
            facturesComptees: factures.length,
            reglementsComptees: reglements.length,
            soldeNonLettre: resultatLettrage.soldeNonLettre,
        },
    });

    return NextResponse.json({
        succes: true,
        ...resultatLettrage,
    });
}
