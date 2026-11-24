import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    calculerRapprochementBancaire,
    type OperationSuspenseBancaire,
} from "@/lib/ohada/caisse-rapprochement";
import { AuditService } from "@/lib/audit";

/**
 * API État de Rapprochement Bancaire Officiel (SYSCOHADA)
 * GET  /api/comptabilite/rapprochement-bancaire?clientId=&soldeCompta=&soldeReleve=&banque=&numeroCompte=
 * POST /api/comptabilite/rapprochement-bancaire (Clôture et scellement du rapprochement)
 */
export async function GET(request: NextRequest) {
    const { denied, session } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const nomBanque = searchParams.get("banque")?.trim() || "";
    const numeroCompteBancaire = searchParams.get("numeroCompte")?.trim() || "";
    const soldeComptaParam = searchParams.get("soldeCompta");
    const soldeReleveParam = searchParams.get("soldeReleve");
    const soldeCompta = soldeComptaParam === null ? Number.NaN : Number(soldeComptaParam);
    const soldeReleve = soldeReleveParam === null ? Number.NaN : Number(soldeReleveParam);
    const dateRapprochement = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    if (!nomBanque || !numeroCompteBancaire || !Number.isFinite(soldeCompta) || !Number.isFinite(soldeReleve) || !/^\d{4}-\d{2}-\d{2}$/.test(dateRapprochement)) {
        return NextResponse.json({ error: "La banque, le numéro de compte, les soldes réels et une date valide sont obligatoires." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    // Récupérer les transactions bancaires en attente de lettrage
    const bankTxs = await prisma.bankTransaction.findMany({
        where: { status: "PENDING", cabinetId: session.cabinetId, invoice: { clientId } },
        take: 50,
    });

    let operationsSuspense: OperationSuspenseBancaire[] = [];

    if (bankTxs.length > 0) {
        operationsSuspense = bankTxs.map((tx) => ({
            id: tx.id,
            date: tx.date.toISOString().slice(0, 10),
            libelle: tx.description,
            montant: Math.abs(tx.amount),
            sens: tx.type === "CREDIT" ? "CREDIT" : "DEBIT",
            origine: "NON_EN_COMPTABILITE",
            nature: tx.description.toLowerCase().includes("frais") || tx.description.toLowerCase().includes("agios")
                ? "AGIOS_FRAIS"
                : "VIREMENT_INCONNU",
        }));
    }

    const resultat = calculerRapprochementBancaire({
        dateRapprochement,
        nomBanque,
        numeroCompteBancaire,
        compteTresorerie: "5211",
        soldeComptableAvant: soldeCompta,
        soldeReleveBancaire: soldeReleve,
        operationsSuspense,
    });

    return NextResponse.json(resultat);
}

export async function POST(request: NextRequest) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, dateRapprochement, nomBanque, soldeComptableRectifie, soldeBancaireRectifie, ecartRapprochement } = body;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    if (![soldeComptableRectifie, soldeBancaireRectifie, ecartRapprochement].every((value) => typeof value === "number" && Number.isFinite(value))) {
        return NextResponse.json({ error: "Les soldes rectifiés et l'écart doivent être numériques." }, { status: 400 });
    }
    if (ecartRapprochement !== 0) return NextResponse.json({ error: "Le rapprochement doit être équilibré avant son approbation." }, { status: 409 });

    await AuditService.log({
        action: "VALIDATION_RAPPROCHEMENT_BANCAIRE",
        entity: "Client",
        entityId: clientId,
        details: JSON.stringify({
            dateRapprochement,
            nomBanque,
            soldeRectifie: soldeComptableRectifie,
            ecart: ecartRapprochement,
        }),
    });

    return NextResponse.json({ succes: true, message: "Approbation du rapprochement enregistrée dans la piste d'audit." });
}
