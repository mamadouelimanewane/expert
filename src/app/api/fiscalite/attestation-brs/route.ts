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
    const { denied, session } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    // Lire les attestations stockées en tant que documents liés au client
    const attestations = await prisma.document.findMany({
        where: { clientId, cabinetId: session.cabinetId, type: "AUTRE", fileName: { startsWith: "BRS-" } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, fileName: true, createdAt: true, ocrData: true, fileUrl: true },
    });

    return NextResponse.json({
        attestations: attestations.map((a) => {
            const certificat = a.ocrData && typeof a.ocrData === "object" ? a.ocrData as Record<string, unknown> : {};
            const beneficiaire = certificat.beneficiaire && typeof certificat.beneficiaire === "object"
                ? (certificat.beneficiaire as Record<string, unknown>).raisonSociale
                : undefined;
            return {
                id: a.id,
                numeroCertificat: a.fileName.replace(/\.json$/i, ""),
                dateEmission: a.createdAt,
                fileUrl: a.fileUrl,
                metadata: {
                    typeRetenue: certificat.typeRetenue,
                    totalRetenu: certificat.totalRetenu,
                    totalBrutHT: certificat.totalBrutHT,
                    beneficiaire,
                    cleControle: certificat.cleControle,
                },
            };
        }),
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
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, pays, typeRetenue, beneficiaire, factures, signataireNom, signataireQualite } = body;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId manquant ou invalide." }, { status: 400 });
    }
    if (typeof pays !== "string" || !["sn", "ci", "cm", "bj"].includes(pays.toLowerCase())) {
        return NextResponse.json({ error: "Pays non pris en charge." }, { status: 400 });
    }
    if (typeof typeRetenue !== "string" || !TAUX_RETENUE_DEFAUT[pays.toLowerCase() as PaysFiscal]?.[typeRetenue as TypeRetenueSource]) {
        return NextResponse.json({ error: "Type de retenue invalide ou non pris en charge pour ce pays." }, { status: 400 });
    }
    const informationsBeneficiaire = beneficiaire ? [beneficiaire.raisonSociale, beneficiaire.identifiantFiscal, beneficiaire.adresse, beneficiaire.ville, beneficiaire.pays] : [];
    if (informationsBeneficiaire.length !== 5 || informationsBeneficiaire.some((value) => typeof value !== "string" || !value.trim())) {
        return NextResponse.json({ error: "Les informations d'identité et d'adresse du bénéficiaire sont obligatoires." }, { status: 400 });
    }
    if (!factures || !Array.isArray(factures) || factures.length === 0) {
        return NextResponse.json({ error: "Au moins une facture est requise." }, { status: 400 });
    }
    if (typeof signataireNom !== "string" || !signataireNom.trim() || typeof signataireQualite !== "string" || !signataireQualite.trim()) {
        return NextResponse.json({ error: "Nom et qualité du signataire requis." }, { status: 400 });
    }
    if (factures.some((facture) => !facture || typeof facture.numeroFacture !== "string" || !facture.numeroFacture.trim()
        || typeof facture.description !== "string" || !facture.description.trim()
        || typeof facture.dateFacture !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(facture.dateFacture) || !Number.isFinite(Date.parse(facture.dateFacture))
        || !Number.isFinite(facture.montantBrutHT) || facture.montantBrutHT <= 0
        || (facture.tauxRetenue !== undefined && (!Number.isFinite(facture.tauxRetenue) || facture.tauxRetenue < 0 || facture.tauxRetenue > 100)))) {
        return NextResponse.json({ error: "Chaque facture doit comporter une date, une référence, une description et un montant valides." }, { status: 400 });
    }

    // Charger le cabinet collecteur
    const client = await prisma.client.findFirst({
        where: { id: clientId, cabinetId: session.cabinetId },
        select: { companyName: true, country: true, ninea: true, ifu: true, nif: true, address: true, city: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const identifiantCollecteur = client.ninea || client.ifu || client.nif;
    if (!client.companyName?.trim() || !identifiantCollecteur?.trim() || !client.address?.trim() || !client.city?.trim() || !client.country?.trim()) {
        return NextResponse.json({ error: "Complétez la raison sociale, l'identifiant fiscal, l'adresse, la ville et le pays du collecteur dans la fiche client avant d'émettre une attestation." }, { status: 422 });
    }
    if (client.country.toLowerCase() !== pays.toLowerCase()) {
        return NextResponse.json({ error: "Le pays de l'attestation doit correspondre au pays fiscal renseigné dans la fiche client." }, { status: 400 });
    }

    const collecteur: EntitePartieFiscale = {
        raisonSociale: client.companyName,
        identifiantFiscal: identifiantCollecteur!,
        adresse: client.address,
        ville: client.city,
        pays: client.country,
    };

    const cert = creerCertificatRetenueSource({
        pays: pays.toLowerCase() as PaysFiscal,
        typeRetenue: typeRetenue as TypeRetenueSource,
        collecteur,
        beneficiaire: beneficiaire!,
        factures,
        signataireNom,
        signataireQualite,
        quittanceVersement: body.quittanceVersement,
    });

    // Persister comme document lié au client
    const document = await prisma.document.create({
        data: {
            cabinetId: session.cabinetId,
            clientId,
            fileName: `${cert.numeroCertificat}.json`,
            originalName: `${cert.numeroCertificat}.json`,
            fileSize: Buffer.byteLength(JSON.stringify(cert)),
            mimeType: "application/json",
            fileUrl: "",
            type: "AUTRE",
            status: "PROCESSED",
            ocrData: JSON.parse(JSON.stringify(cert)) as object,
            uploadedById: session.id,
        },
    });
    await prisma.document.update({ where: { id: document.id }, data: { fileUrl: `/api/documents/${document.id}/fichier` } });

    await AuditService.log({
        action: "CREATION_ATTESTATION_BRS",
        entity: "Client",
        entityId: clientId,
        details: JSON.stringify({ numeroCertificat: cert.numeroCertificat, totalRetenu: cert.totalRetenu }),
    });

    return NextResponse.json({ succes: true, certificat: cert, documentUrl: `/api/documents/${document.id}/fichier` }, { status: 201 });
}
