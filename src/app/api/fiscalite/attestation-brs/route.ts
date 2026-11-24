import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { creerCertificatRetenueSource, TAUX_RETENUE_DEFAUT } from "@/lib/ohada/attestation-brs";
import type { TypeRetenueSource, EntitePartieFiscale } from "@/lib/ohada/attestation-brs";
import type { PaysFiscal } from "@/lib/tax-simulator";
import { AuditService } from "@/lib/audit";

/**
 * Génère et persiste une attestation de retenue à la source (BRS / BNC).
 * GET  /api/fiscalite/attestation-brs?clientId= → liste les attestations
 * POST /api/fiscalite/attestation-brs            → génère une nouvelle attestation
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    // Lire les attestations stockées en tant que documents liés au client
    const attestations = await prisma.document.findMany({
        where: { clientId, type: "AUTRE", fileName: { startsWith: "BRS-" } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, fileName: true, createdAt: true, ocrData: true },
    });

    return NextResponse.json({
        attestations: attestations.map((a) => ({
            id: a.id,
            numeroCertificat: a.fileName,
            dateEmission: a.createdAt,
            certificat: a.ocrData,
        })),
    });
}

export async function POST(request: NextRequest) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;

    let body: {
        clientId?: string;
        pays?: string;
        typeRetenue?: string;
        beneficiaire?: EntitePartieFiscale;
        factures?: Array<{
            numeroFacture: string;
            dateFacture: string;
            description: string;
            montantBrutHT: number;
            tauxRetenue?: number;
        }>;
        signataireNom?: string;
        signataireQualite?: string;
        quittanceVersement?: {
            numeroQuittance: string;
            dateVersement: string;
            centreImpots: string;
            montantRecepisse: number;
        };
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, pays, typeRetenue, beneficiaire, factures, signataireNom } = body;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId manquant ou invalide." }, { status: 400 });
    }
    if (!pays || !["sn", "ci", "cm", "bj"].includes(pays.toLowerCase())) {
        return NextResponse.json({ error: "Pays non pris en charge." }, { status: 400 });
    }
    if (!typeRetenue || !TAUX_RETENUE_DEFAUT[pays.toLowerCase() as PaysFiscal]?.[typeRetenue as TypeRetenueSource]) {
        return NextResponse.json({ error: "Type de retenue invalide ou non pris en charge pour ce pays." }, { status: 400 });
    }
    if (!beneficiaire?.raisonSociale || !beneficiaire?.identifiantFiscal) {
        return NextResponse.json({ error: "Informations bénéficiaire incomplètes (raisonSociale, identifiantFiscal requis)." }, { status: 400 });
    }
    if (!factures || !Array.isArray(factures) || factures.length === 0) {
        return NextResponse.json({ error: "Au moins une facture est requise." }, { status: 400 });
    }
    if (!signataireNom) {
        return NextResponse.json({ error: "Nom du signataire requis." }, { status: 400 });
    }

    // Charger le cabinet collecteur
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { companyName: true, country: true, ninea: true, ifu: true, nif: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const collecteur: EntitePartieFiscale = {
        raisonSociale: client.companyName || "Cabinet",
        identifiantFiscal: client.ninea || client.ifu || client.nif || "N/A",
        adresse: "",
        ville: "",
        pays: client.country || pays.toUpperCase(),
    };

    const cert = creerCertificatRetenueSource({
        pays: pays.toLowerCase() as PaysFiscal,
        typeRetenue: typeRetenue as TypeRetenueSource,
        collecteur,
        beneficiaire,
        factures,
        signataireNom,
        signataireQualite: body.signataireQualite,
        quittanceVersement: body.quittanceVersement,
    });

    // Persister comme document lié au client
    await prisma.document.create({
        data: {
            clientId,
            fileName: cert.numeroCertificat,
            originalName: cert.numeroCertificat,
            fileSize: Buffer.byteLength(JSON.stringify(cert)),
            mimeType: "application/json",
            fileUrl: "",
            type: "AUTRE",
            status: "PROCESSED",
            ocrData: JSON.parse(JSON.stringify(cert)) as object,
            uploadedById: session.id,
        },
    });

    await AuditService.log({
        action: "CREATION_ATTESTATION_BRS",
        entity: "Client",
        entityId: clientId,
        details: JSON.stringify({ numeroCertificat: cert.numeroCertificat, totalRetenu: cert.totalRetenu }),
    });

    return NextResponse.json({ succes: true, certificat: cert }, { status: 201 });
}
