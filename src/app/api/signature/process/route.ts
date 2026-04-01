import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

export async function POST(request: Request) {
    try {
        const { documentId, userName } = await request.json();

        if (!documentId) {
            return NextResponse.json({ error: "ID du document requis" }, { status: 400 });
        }

        // 1. Récupérer le document (Vérification format ObjectID pour MongoDB)
        let document = null;
        if (documentId.length === 24) {
            document = await prisma.document.findUnique({
                where: { id: documentId }
            });
        }

        // if (!document) {
        //     return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
        // }

        // Pour la démo, si non trouvé, on simule l'ID
        const docName = document?.originalName || "Lettre de Mission.pdf";

        // 2. Simuler la signature probante (Audit Trail)
        const signatureCertificate = {
            signedAt: new Date(),
            signerName: userName || "Expert Principal",
            ipAddress: "192.168.1.45",
            hash: "sha256-8a7e177b8445cf8ccebb0da85899a1...",
            validity: "VALIDE (OHADA / SYSCOHADA L.12)"
        };

        // 3. Mettre à jour le statut dans la DB
        if (document) {
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    status: "PROCESSED",
                    ocrData: signatureCertificate as any
                }
            });
        }

        // 4. Logger l'action probante dans le journal d'audit
        await AuditService.log({
            action: "SIGNATURE_ESTABLISHED",
            entity: "DOCUMENT",
            entityId: documentId,
            details: `Signature électronique probante appliquée sur [${docName}] par ${signatureCertificate.signerName}. Certificat #SIG-${Date.now().toString().slice(-4)}`
        });

        return NextResponse.json({
            success: true,
            certificate: signatureCertificate,
            message: "Document signé avec succès avec valeur probante."
        });

    } catch (error) {
        console.error("[Signature API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du processus de signature" }, { status: 500 });
    }
}
