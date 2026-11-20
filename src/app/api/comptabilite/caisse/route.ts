import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    analyserBrouillardCaisse,
    etablirProcesVerbalCaisse,
    calculerTotalBilletage,
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
    const soldeInitial = Number(searchParams.get("soldeInitial")) || 500_000;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    // Récupérer les flux de caisse (tpeJournal avec compte de trésorerie 571 ou informel)
    const dbJournals = await prisma.tpeJournal.findMany({
        where: {
            clientId,
            compteTresorerie: { startsWith: "57" },
        },
        orderBy: { date: "asc" },
        take: 100,
    });

    let lignes: LigneCaisse[] = [];

    if (dbJournals.length > 0) {
        lignes = dbJournals.map((j) => ({
            id: j.id,
            date: j.date.toISOString().slice(0, 10),
            pieceJustificative: j.pieceRef || "PC",
            libelle: j.libelle,
            entree: j.sens === "RECETTE" ? j.montant : 0,
            sortie: j.sens === "DEPENSE" ? j.montant : 0,
            valide: true,
        }));
    } else {
        // Jeu de démonstration
        const auj = new Date();
        const d = (jours: number) =>
            new Date(auj.getTime() - jours * 86400000).toISOString().slice(0, 10);

        lignes = [
            { id: "c1", date: d(10), pieceJustificative: "PC-01", libelle: "Alimentation caisse par retrait banque", entree: 1_000_000, sortie: 0, valide: true },
            { id: "c2", date: d(8), pieceJustificative: "PC-02", libelle: "Achat fournitures de bureau et ramettes", entree: 0, sortie: 85_000, valide: true },
            { id: "c3", date: d(6), pieceJustificative: "PC-03", libelle: "Paiement coursier & transports urbains", entree: 0, sortie: 25_000, valide: true },
            { id: "c4", date: d(4), pieceJustificative: "PC-04", libelle: "Encaissement vente comptoir magasin", entree: 450_000, sortie: 0, valide: true },
            { id: "c5", date: d(2), pieceJustificative: "PC-05", libelle: "Acompte sur salaire employé", entree: 0, sortie: 150_000, valide: true },
            { id: "c6", date: d(1), pieceJustificative: "PC-06", libelle: "Frais carburant véhicule livraison", entree: 0, sortie: 40_000, valide: true },
        ];
    }

    const synthese = analyserBrouillardCaisse(soldeInitial, lignes);

    return NextResponse.json(synthese);
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

    const { clientId, dateArrete, caissierNom, controleurNom, soldeTheoriqueComptable, billetage } = body;

    if (!clientId || !dateArrete || !caissierNom || !controleurNom || !billetage) {
        return NextResponse.json({ error: "Champs requis manquants pour le PV de caisse." }, { status: 400 });
    }

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
        entityType: "Client",
        entityId: clientId,
        details: {
            dateArrete,
            soldeTheorique: soldeTheoriqueComptable,
            soldePhysique: pv.soldePhysiqueConstate,
            ecartCaisse: pv.ecartCaisse,
            estConforme: pv.estConforme,
        },
    });

    return NextResponse.json({ succes: true, pv });
}
