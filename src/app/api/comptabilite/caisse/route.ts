import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    analyserBrouillardCaisse,
    etablirProcesVerbalCaisse,
    type LigneCaisse,
    type BilletageCaisse,
} from "@/lib/ohada/caisse-rapprochement";
import { AuditService } from "@/lib/audit";

/**
 * API Brouillard & Contrôle de Caisse (Compte 571)
 * GET  /api/comptabilite/caisse?clientId=&soldeInitial=
 * POST /api/comptabilite/caisse (Établissement du PV de caisse physique)
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const soldeInitial = Number(searchParams.get("soldeInitial") || 0);

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    if (!Number.isFinite(soldeInitial) || soldeInitial < 0) {
        return NextResponse.json({ error: "soldeInitial doit être un nombre positif ou nul." }, { status: 400 });
    }

    // Récupérer les seules écritures dont un compte de trésorerie SYSCOHADA
    // (classe 57) est réellement renseigné.
    const dbJournals = await prisma.tpeJournal.findMany({
        where: {
            clientId,
            OR: [{ debitCompte: { startsWith: "57" } }, { creditCompte: { startsWith: "57" } }],
        },
        orderBy: { date: "asc" },
        take: 100,
    });

    const lignes: LigneCaisse[] = dbJournals.flatMap((j) => {
        const date = new Date(j.date);
        if (Number.isNaN(date.getTime())) return [];
        return [{
            id: j.id,
            date: date.toISOString().slice(0, 10),
            pieceJustificative: `TPE-${j.id.slice(-6)}`,
            libelle: j.libelle,
            entree: j.entree,
            sortie: j.sortie,
            valide: j.status === "APPROVED" || j.status === "EXPORTED",
        }];
    });

    const synthese = analyserBrouillardCaisse(soldeInitial, lignes);

    return NextResponse.json({
        ...synthese,
        sourceDonnees: "JOURNAL_TPE",
        avertissement: lignes.length === 0 ? "Aucune écriture de trésorerie réelle n’est disponible pour ce client." : null,
    });
}

export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    let body: {
        clientId: string;
        dateArrete: string;
        caissierNom: string;
        controleurNom: string;
        soldeTheoriqueComptable: number;
        billetage: BilletageCaisse;
        observations?: string;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, dateArrete, caissierNom, controleurNom, soldeTheoriqueComptable, billetage } = body;
    const parsedDateArrete = typeof dateArrete === "string" ? new Date(`${dateArrete}T00:00:00.000Z`) : null;
    const dateArreteValide = Boolean(parsedDateArrete && !Number.isNaN(parsedDateArrete.getTime()) && parsedDateArrete.toISOString().slice(0, 10) === dateArrete);
    const clesBilletage: (keyof BilletageCaisse)[] = ["billets10000", "billets5000", "billets2000", "billets1000", "billets500", "pieces500", "pieces250", "pieces200", "pieces100", "pieces50", "pieces25", "pieces10", "pieces5"];

    if (!isObjectId(clientId) || !dateArreteValide
        || typeof caissierNom !== "string" || !caissierNom.trim() || typeof controleurNom !== "string" || !controleurNom.trim()
        || !Number.isFinite(soldeTheoriqueComptable) || soldeTheoriqueComptable < 0
        || !billetage || typeof billetage !== "object" || Array.isArray(billetage)
        || clesBilletage.some((key) => !Number.isInteger(billetage[key]) || billetage[key] < 0)) {
        return NextResponse.json({ error: "Champs requis manquants pour le PV de caisse." }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const pv = etablirProcesVerbalCaisse({
        dateArrete,
        caissierNom,
        controleurNom,
        soldeTheoriqueComptable,
        billetage,
        observations: body.observations,
    });

    await AuditService.log({
        action: "PROCES_VERBAL_CAISSE",
        entity: "CLIENT",
        entityId: clientId,
        details: JSON.stringify({
            dateArrete,
            soldeTheorique: soldeTheoriqueComptable,
            soldePhysique: pv.soldePhysiqueConstate,
            ecartCaisse: pv.ecartCaisse,
            estConforme: pv.estConforme,
        }),
    });

    return NextResponse.json({ succes: true, pv });
}
