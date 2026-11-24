import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    genererLiasseAGOA,
    type DonneesSocieteAG,
    type DonneesFinancieresAG,
    type ConventionReglementee,
} from "@/lib/ohada/secretariat-juridique";
import { AuditService } from "@/lib/audit";

/**
 * API Secrétariat Juridique & Assemblées Générales d'Approbation des Comptes
 * GET  /api/legal/ag-generator?clientId=&exercice=
 * POST /api/legal/ag-generator (Génération et scellement du PV d'AGOA et résolutions)
 */
export async function GET(request: NextRequest) {
    const { denied, session } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice")) || new Date().getFullYear();

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
        where: { id: clientId, cabinetId: session.cabinetId },
        select: {
            id: true,
            companyName: true,
            ninea: true,
            ifu: true,
            country: true,
            city: true,
            address: true,
        },
    });

    if (!client) {
        return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    return NextResponse.json({
        client: {
            id: client.id,
            raisonSociale: client.companyName,
            identifiantFiscal: client.ninea || client.ifu,
            pays: client.country,
            ville: client.city,
            siegeSocial: client.address,
        },
        exercice,
        donneesManquantes: ["forme juridique", "capital et nombre de titres", "RCCM", "dirigeants", "résultat approuvé", "report à nouveau", "réserve légale", "date de l'AG", "conventions réglementées"],
        message: "Les informations comptables et juridiques doivent provenir des pièces validées du dossier ou être saisies et vérifiées avant de générer la liasse.",
    });
}

export async function POST(request: NextRequest) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;

    let body: {
        clientId: string;
        societe: DonneesSocieteAG;
        financier: DonneesFinancieresAG;
        conventions?: ConventionReglementee[];
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, societe, financier, conventions = [] } = body;

    if (!clientId || !isObjectId(clientId) || !societe || !financier) {
        return NextResponse.json({ error: "Paramètres de génération d'AG incomplets." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
    const informationsRequises = [societe.raisonSociale, societe.rccm, societe.identifiantFiscal, societe.siegeSocial, societe.ville, societe.pays, societe.dirigeantNom, societe.dirigeantQualite, financier.dateAssemblee];
    if (informationsRequises.some((value) => typeof value !== "string" || !value.trim())) {
        return NextResponse.json({ error: "Les informations juridiques et la date de l'assemblée sont obligatoires." }, { status: 400 });
    }
    if (!Number.isInteger(financier.exercice) || financier.exercice < 2000 || financier.exercice > 2100
        || !Number.isFinite(financier.resultatNetExercice) || !Number.isFinite(financier.reportANouveauExistant)
        || !Number.isFinite(financier.reserveLegaleExistante) || typeof financier.dividendeProposeParTitre !== "number" || !Number.isFinite(financier.dividendeProposeParTitre)
        || financier.reserveLegaleExistante < 0 || financier.dividendeProposeParTitre < 0
        || !Number.isFinite(societe.capitalSocial) || societe.capitalSocial <= 0
        || !Number.isFinite(societe.nombreTitres) || societe.nombreTitres <= 0) {
        return NextResponse.json({ error: "Les données financières, le capital, les titres et l'exercice doivent être valides." }, { status: 400 });
    }

    const liasse = genererLiasseAGOA(societe, financier, conventions);

    // Archiver le PV dans la GED du dossier client
    await prisma.document.create({
        data: {
            cabinetId: session.cabinetId,
            clientId,
            fileName: `PV-AGOA-${societe.formeJuridique}-${financier.exercice}.txt`,
            originalName: `PV-AGOA-${societe.formeJuridique}-${financier.exercice}.txt`,
            fileSize: Buffer.byteLength(liasse.pvCompletAssemblee),
            mimeType: "text/plain; charset=utf-8",
            fileUrl: "",
            type: "RAPPORT",
            status: "PROCESSED",
            uploadedById: session.id,
            ocrData: {
                contenu: liasse.pvCompletAssemblee,
                exercice: financier.exercice,
                formeJuridique: societe.formeJuridique,
                resultatNet: financier.resultatNetExercice,
                dividendeBrut: liasse.affectation.dividendeTotalBrut,
                delaiDepotGreffe: liasse.formalitesDepotGreffe.dateLimiteDepot,
            },
        },
    });

    await AuditService.log({
        action: "GENERATION_AGOA_OHADA",
        entity: "Client",
        entityId: clientId,
        details: JSON.stringify({
            exercice: financier.exercice,
            formeJuridique: societe.formeJuridique,
            resultatNet: financier.resultatNetExercice,
            dividendeTotalBrut: liasse.affectation.dividendeTotalBrut,
        }),
    });

    return NextResponse.json({ succes: true, liasse });
}
