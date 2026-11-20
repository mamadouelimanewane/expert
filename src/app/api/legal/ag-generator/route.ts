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
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice")) || new Date().getFullYear();

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
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

    const pays = (client.country?.toLowerCase() || "sn") as any;

    const societe: DonneesSocieteAG = {
        raisonSociale: client.companyName || "Entreprise SARL",
        formeJuridique: "SARL",
        capitalSocial: 10_000_000,
        valeurNominaleTitre: 10_000,
        nombreTitres: 1_000,
        rccm: `SN-${client.city?.toUpperCase() || "DKR"}-2022-B-98412`,
        identifiantFiscal: client.ninea || client.ifu || "00984512 2V2",
        siegeSocial: client.address || "Zone Industrielle",
        ville: client.city || "Dakar",
        pays,
        dirigeantNom: "Amadou Moustapha SOW",
        dirigeantQualite: "Gérant",
    };

    const financier: DonneesFinancieresAG = {
        exercice,
        dateAssemblee: `${exercice}-06-15`,
        resultatNetExercice: 14_500_000,
        reportANouveauExistant: 1_200_000,
        reserveLegaleExistante: 1_200_000,
        dividendeProposeParTitre: 8_000,
    };

    const conventions: ConventionReglementee[] = [
        {
            id: "c-1",
            personneConcernee: "Amadou Moustapha SOW",
            qualite: "Gérant & Associé Majoritaire",
            natureConvention: "Bail commercial portant sur l'immeuble d'exploitation",
            montantOuEngagement: 14_400_000,
            interetPourSociete: "Sécurisation de l'outil de production à des conditions de marché",
        },
    ];

    const liasse = genererLiasseAGOA(societe, financier, conventions);

    return NextResponse.json(liasse);
}

export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
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

    if (!clientId || !societe || !financier) {
        return NextResponse.json({ error: "Paramètres de génération d'AG incomplets." }, { status: 400 });
    }

    const liasse = genererLiasseAGOA(societe, financier, conventions);

    // Archiver le PV dans la GED du dossier client
    await prisma.document.create({
        data: {
            clientId,
            nom: `PV-AGOA-${societe.formeJuridique}-${financier.exercice}.pdf`,
            type: "JURIDIQUE",
            contenu: liasse.pvCompletAssemblee,
            metadata: {
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
        entityType: "Client",
        entityId: clientId,
        details: {
            exercice: financier.exercice,
            formeJuridique: societe.formeJuridique,
            resultatNet: financier.resultatNetExercice,
            dividendeTotalBrut: liasse.affectation.dividendeTotalBrut,
        },
    });

    return NextResponse.json({ succes: true, liasse });
}
