import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

import { requireStaff } from "@/lib/api-auth";
export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { documentId, userName } = await request.json();

        if (!documentId) {
            return NextResponse.json({ error: "ID du document requis" }, { status: 400 });
        }

        const document = documentId.length === 24
            ? await prisma.document.findUnique({ where: { id: documentId } })
            : null;

        if (!document) {
            return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
        }

        const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || "inconnue";
        const signedAt = new Date();
        const signerName = userName || "Expert Principal";

        // Empreinte d'intégrité calculée sur les données réelles du document (pas une valeur fixe).
        // Ceci ne constitue PAS une signature électronique qualifiée au sens eIDAS/AUSCGIE : aucun
        // prestataire de confiance (autorité d'horodatage, PKI qualifiée) n'est connecté à ce jour.
        const hash = crypto
            .createHash("sha256")
            .update(`${document.id}|${document.fileUrl}|${signerName}|${signedAt.toISOString()}`)
            .digest("hex");

        const signatureCertificate = {
            signedAt,
            signerName,
            ipAddress,
            hash: `sha256-${hash}`,
            legalNotice: "Cachet d'intégrité interne (hash + horodatage), pas une signature électronique qualifiée eIDAS/AUSCGIE.",
        };

        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: "PROCESSED",
                ocrData: signatureCertificate as any,
            },
        });

        await AuditService.log({
            action: "SIGNATURE_ESTABLISHED",
            entity: "DOCUMENT",
            entityId: documentId,
            details: `Empreinte de signature appliquée sur [${document.originalName}] par ${signerName}. Hash sha256-${hash.slice(0, 16)}...`,
        });

        return NextResponse.json({
            success: true,
            certificate: signatureCertificate,
            message: "Document signé (empreinte d'intégrité enregistrée).",
        });

    } catch (error) {
        console.error("[Signature API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du processus de signature" }, { status: 500 });
    }
}
