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
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const typeTiersBrut = searchParams.get("typeTiers") || "CLIENT";
    if (typeTiersBrut !== "CLIENT" && typeTiersBrut !== "FOURNISSEUR") {
        return NextResponse.json({ error: "typeTiers doit valoir CLIENT ou FOURNISSEUR." }, { status: 400 });
    }
    const typeTiers = typeTiersBrut;
    const dateArrete = searchParams.get("dateArrete") || new Date().toISOString().slice(0, 10);

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    // Le modèle Invoice stocke des factures de vente ; il ne porte pas de type
    // achat/vente ni de factures fournisseurs. Ne jamais mélanger les deux
    // cycles ou afficher un jeu de démonstration comme s'il était réel.
    const invoices = typeTiers === "CLIENT"
        ? await prisma.invoice.findMany({
            where: { clientId, cabinetId: session.cabinetId },
            orderBy: { issueDate: "desc" },
            take: 100,
            include: { client: { select: { companyName: true, firstName: true, lastName: true } } },
        })
        : [];

    const nomTiers = (client: { companyName: string | null; firstName: string | null; lastName: string | null }) =>
        client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client";
    const ecritures: EcritureTiers[] = invoices.map((inv) => {
        const tiers = nomTiers(inv.client);
        return {
            id: inv.id,
            date: inv.issueDate.toISOString().slice(0, 10),
            echeance: inv.dueDate.toISOString().slice(0, 10),
            numeroPiece: inv.invoiceNumber,
            libelle: `Facture ${inv.invoiceNumber}`,
            compteGeneral: "4111",
            compteAuxiliaire: tiers.slice(0, 8).toUpperCase(),
            nomTiers: tiers,
            sens: "DEBIT",
            montant: inv.total,
            montantLettre: inv.status === "PAID" ? inv.total : 0,
        };
    });

    const balanceAgee = calculerBalanceAgee(ecritures, dateArrete, typeTiers);
    const reclassements416 = detecterReclassements416(balanceAgee);

    return NextResponse.json({
        balanceAgee,
        reclassements416,
        ecrituresDisponibles: ecritures,
    });
}

export async function POST(request: NextRequest) {
    const { session, denied } = await requireWriteAccess();
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { factures, reglements, codeLettrage, clientId } = body;

    if (!Array.isArray(factures) || !Array.isArray(reglements) || typeof codeLettrage !== "string" || !codeLettrage.trim() || !isObjectId(clientId)) {
        return NextResponse.json({ error: "Paramètres de lettrage manquants." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const lignesValides = (rows: EcritureTiers[]) => rows.every((row) =>
        row && typeof row.id === "string" && typeof row.date === "string" && typeof row.numeroPiece === "string"
        && typeof row.compteAuxiliaire === "string" && (row.sens === "DEBIT" || row.sens === "CREDIT")
        && Number.isFinite(row.montant) && row.montant >= 0
        && (row.montantLettre === undefined || (Number.isFinite(row.montantLettre) && row.montantLettre >= 0 && row.montantLettre <= row.montant))
    );
    if (!lignesValides(factures) || !lignesValides(reglements)) {
        return NextResponse.json({ error: "Une écriture comporte des données ou montants invalides." }, { status: 400 });
    }

    const resultatLettrage = lettrerEcritures(factures, reglements, codeLettrage);

    await AuditService.log({
        action: "LETTRAGE_AUXILIAIRE",
        entity: "CLIENT",
        entityId: clientId,
        details: JSON.stringify({
            codeLettrage,
            facturesComptees: factures.length,
            reglementsComptees: reglements.length,
            soldeNonLettre: resultatLettrage.soldeNonLettre,
        }),
    });

    return NextResponse.json({
        succes: true,
        ...resultatLettrage,
    });
}
