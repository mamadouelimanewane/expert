import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { analyserTexteQuittance } from "@/lib/ohada/quittance-parser";

/**
 * Ingestion intelligente des quittances fiscales par OCR / parsing textuel.
 * POST /api/fiscalite/quittance-ocr
 * Body: { declarationId, texteExtrait, montantBrutHT? }
 * → Extrait automatiquement le n° de quittance, date, montant et valide la déclaration.
 */
export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    let body: {
        declarationId?: string;
        texteExtrait?: string;
        validerAutomatiquement?: boolean;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { declarationId, texteExtrait, validerAutomatiquement = false } = body;

    if (!declarationId || !isObjectId(declarationId)) {
        return NextResponse.json({ error: "declarationId invalide." }, { status: 400 });
    }
    if (!texteExtrait || typeof texteExtrait !== "string" || texteExtrait.trim().length < 10) {
        return NextResponse.json({ error: "texteExtrait trop court ou manquant." }, { status: 400 });
    }

    const declaration = await prisma.taxDeclaration.findUnique({
        where: { id: declarationId },
        select: { id: true, type: true, period: true, status: true, amount: true, clientId: true },
    });
    if (!declaration) {
        return NextResponse.json({ error: "Déclaration introuvable." }, { status: 404 });
    }

    const extraction = analyserTexteQuittance(texteExtrait);

    // Si confiance suffisante et validation automatique demandée
    let declarationMiseAJour = null;
    if (validerAutomatiquement && extraction.succes && extraction.confianceGlobale >= 70) {
        declarationMiseAJour = await prisma.taxDeclaration.update({
            where: { id: declarationId },
            data: {
                status: "VALIDATED",
                filingReceipt: extraction.numeroQuittance || undefined,
                paymentReference: extraction.referenceTransaction || undefined,
                paidAt: extraction.datePaiement ? new Date(extraction.datePaiement) : new Date(),
                amount: extraction.montantPaye ?? declaration.amount,
                ruleVersion: `OCR-QUITTANCE-v1-confiance${extraction.confianceGlobale}%`,
            },
            select: { id: true, status: true, filingReceipt: true, paidAt: true, amount: true },
        });
    }

    return NextResponse.json({
        extraction,
        declarationId,
        declarationMiseAJour,
        message:
            declarationMiseAJour
                ? `Déclaration validée automatiquement. Quittance ${extraction.numeroQuittance} enregistrée.`
                : extraction.succes
                ? `Extraction réussie (confiance ${extraction.confianceGlobale}%). Vérifiez et validez manuellement.`
                : "Extraction partielle. Vérification manuelle obligatoire avant validation.",
    });
}
