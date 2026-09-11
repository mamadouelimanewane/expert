import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { requireWriteAccess, requireStaff } from "@/lib/api-auth";
import { lireFactureParVision, ocrDataDepuisFacture, visionConfiguree, MODELE_VISION } from "@/lib/ocr-vision";
import { cheminPiece } from "@/lib/uploads";

// Une pièce manuscrite prend 15 à 40 s de lecture.
export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };
const TAILLE_MAX = 20 * 1024 * 1024;

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;
    return NextResponse.json({ disponible: visionConfiguree(), modele: MODELE_VISION });
}

/**
 * POST multipart { file? } → relit la pièce avec le modèle de vision et
 * remplace `ocrData` (même forme que l'OCR local, origine IA_VISION).
 *
 * Le navigateur renvoie le fichier qu'il vient de déposer : sur Vercel le
 * disque du serveur est éphémère et la pièce enregistrée par /api/documents
 * peut ne plus y être. Sans fichier dans la requête, on tente le disque.
 * Voie explicite « Lire avec l'IA » : le document est transmis à Anthropic.
 */
export async function POST(request: Request, { params }: Params) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;
    if (!visionConfiguree()) {
        return NextResponse.json({ error: "Lecture par IA non configurée sur ce serveur (ANTHROPIC_API_KEY absente).", nonConfigure: true }, { status: 503 });
    }
    try {
        const { id } = await params;
        if (id.length !== 24) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
        const document = await prisma.document.findUnique({ where: { id }, select: { id: true, fileName: true, originalName: true, mimeType: true, fileUrl: true, type: true, ocrData: true, clientId: true } });
        if (!document) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });

        let fichier: Buffer | null = null;
        let mimeType = document.mimeType;
        let nom = document.originalName || document.fileName;
        const form = await request.formData().catch(() => null);
        const envoye = form?.get("file");
        if (envoye instanceof File && envoye.size > 0) {
            if (envoye.size > TAILLE_MAX) return NextResponse.json({ error: "Fichier supérieur à 20 Mo." }, { status: 400 });
            fichier = Buffer.from(await envoye.arrayBuffer());
            mimeType = envoye.type || mimeType;
            nom = envoye.name || nom;
        } else if (existsSync(cheminPiece(document.fileName))) {
            fichier = await readFile(cheminPiece(document.fileName));
        }
        if (!fichier) {
            return NextResponse.json({ error: "Le fichier de la pièce n'est plus disponible sur le serveur : déposez-le à nouveau pour la lecture par IA." }, { status: 410 });
        }

        const sensPrecedent = (document.ocrData as { sens?: string } | null)?.sens;
        const sensForm = form?.get("sens");
        const sens = sensForm === "achat" || sensForm === "vente" ? sensForm : sensPrecedent === "achat" || sensPrecedent === "vente" ? sensPrecedent : null;

        const debut = Date.now();
        const r = await lireFactureParVision(fichier, mimeType, nom);
        if (!r.ok) {
            const status = r.raison === "non_configure" ? 503 : r.raison === "refus" || r.raison === "illisible" ? 422 : 502;
            return NextResponse.json({ error: r.message, raison: r.raison }, { status });
        }
        const ocrData = ocrDataDepuisFacture(r.lecture, sens);
        const majDocument = await prisma.document.update({
            where: { id },
            data: { status: "PROCESSED", ocrData: ocrData as object, ocrProcessedAt: new Date() },
            select: { id: true, status: true, ocrData: true },
        });
        await AuditService.log({
            action: "PROCESS",
            entity: "DOCUMENT",
            entityId: id,
            details: `Pièce relue par IA (${r.modele}) par ${session?.name ?? "?"} : ${nom} — ${r.lecture.document}${r.lecture.manuscrite ? ", manuscrite" : ""}, TTC ${r.lecture.totalTTC || "?"}${r.lecture.champsIllisibles.length ? `, illisible : ${r.lecture.champsIllisibles.join(", ")}` : ""}`,
            newValue: { origine: "IA_VISION", modele: r.modele, coutEstimeUSD: r.usage.coutEstimeUSD },
        });
        return NextResponse.json({
            document: majDocument,
            ocrResult: ocrData,
            lecture: r.lecture,
            modele: r.modele,
            usage: r.usage,
            dureeMs: Date.now() - debut,
        });
    } catch (error) {
        console.error("Erreur POST documents/[id]/relire-ia:", error);
        return NextResponse.json({ error: "Lecture par IA impossible." }, { status: 500 });
    }
}
