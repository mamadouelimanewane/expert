import { NextRequest, NextResponse } from 'next/server';
import type { DocumentType } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { processUploadedInvoice } from '@/lib/ocr-engine';
import { dossierUploads } from '@/lib/uploads';
import { stockerPiece, supprimerPiece } from '@/lib/stockage-pieces';
import { unlink } from 'fs/promises';

// L'OCR d'une facture prend 5 à 30 s : au-delà des 10 s par défaut de Vercel
// la fonction était coupée avant d'écrire le statut final du document.
export const maxDuration = 60;
import { AuditService } from '@/lib/audit';
import { requireStaff, requireWriteAccess } from '@/lib/api-auth';

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

/** Valeurs de l'enum Prisma DocumentType. */
const TYPES_DOCUMENT = [
    'FACTURE', 'RELEVE_BANCAIRE', 'CONTRAT', 'RAPPORT', 'DECLARATION', 'PIECE_IDENTITE', 'AUTRE',
];
const TAILLE_MAX_FICHIER = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
    let stockagePartiel: Awaited<ReturnType<typeof stockerPiece>> | null = null;
    let fichierTemporaire: string | null = null;
    let documentPartielId: string | null = null;
    let televersementPersiste = false;
    try {
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const tailleAnnoncee = Number(request.headers.get('content-length'));
        if (Number.isFinite(tailleAnnoncee) && tailleAnnoncee > TAILLE_MAX_FICHIER + 1024 * 1024) {
            return NextResponse.json({ error: 'Requête trop volumineuse. Limite fichier : 10 Mo.' }, { status: 413 });
        }

        const formData = await request.formData();
        const fichierFormulaire = formData.get('file');
        const file = fichierFormulaire instanceof File ? fichierFormulaire : null;
        const clientId = formData.get('clientId') as string;
        const documentType = formData.get('type') as string || 'FACTURE';
        // Sens comptable de la piece : sans lui, l'export presumait un achat et
        // imputait une facture de vente en charges avec TVA recuperable.
        const sensBrut = formData.get('sens');
        const sens = sensBrut === 'achat' || sensBrut === 'vente' ? sensBrut : null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // `isValidObjectId` etait declare mais jamais appele, et `documentType`
        // partait en base sans liste blanche : une valeur hors enum ou un
        // clientId mal forme faisait echouer le create APRES l'ecriture du
        // fichier sur disque, laissant un fichier orphelin dans uploads/ et un
        // 500 generique. Une chaine vide, elle, produisait un document sans
        // client, enregistre avec success: true et invisible dans le dossier.
        if (!TYPES_DOCUMENT.includes(documentType)) {
            return NextResponse.json(
                { error: `Type de document inconnu : ${documentType}.` },
                { status: 400 }
            );
        }
        if (clientId && !isValidObjectId(clientId)) {
            return NextResponse.json({ error: 'clientId invalide.' }, { status: 400 });
        }
        if (clientId) {
            const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
            if (!client) return NextResponse.json({ error: 'Client introuvable dans ce cabinet.' }, { status: 404 });
        }
        if (documentType === 'FACTURE' && !sens) {
            return NextResponse.json(
                { error: "Précisez le sens de la facture : achat (fournisseur) ou vente (client)." },
                { status: 400 }
            );
        }

        // Validation du type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images and PDFs are allowed.' },
                { status: 400 }
            );
        }

        // Validation de la taille (10MB max)
        if (file.size === 0 || file.size > TAILLE_MAX_FICHIER) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }
        if (!file.name.trim() || file.name.length > 255) {
            return NextResponse.json({ error: 'Le nom du fichier doit contenir entre 1 et 255 caractères.' }, { status: 400 });
        }

        // Le Content-Type fourni par le navigateur est contrôlable par le
        // client. Vérifier la signature réelle des formats autorisés avant de
        // persister la pièce ou de la servir avec un type MIME de confiance.
        const signature = Buffer.from(await file.slice(0, 12).arrayBuffer());
        const signatureValide = file.type === 'application/pdf'
            ? signature.subarray(0, 5).toString('ascii') === '%PDF-'
            : file.type === 'image/png'
                ? signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
                : file.type === 'image/webp'
                    ? signature.subarray(0, 4).toString('ascii') === 'RIFF' && signature.subarray(8, 12).toString('ascii') === 'WEBP'
                    : signature.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
        if (!signatureValide) {
            return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas à son format déclaré.' }, { status: 400 });
        }

        // Nom de fichier unique (identifiant de la pièce dans les journaux)
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Stockage durable (GridFS sur MongoDB Atlas). Le disque du serveur est
        // en lecture seule sur Vercel et /tmp y est éphémère : une pièce y
        // déposée n'était plus rouvrable quelques minutes plus tard.
        const stockage = await stockerPiece(buffer, fileName, file.type, {
            originalName: file.name,
            clientId: clientId || null,
            cabinetId: session.cabinetId,
            uploadedById: session.id,
            type: documentType,
        });
        stockagePartiel = stockage;

        // L'OCR travaille sur un fichier : copie temporaire, supprimée ensuite.
        const filePath = join(dossierUploads(), fileName);
        fichierTemporaire = filePath;
        await writeFile(filePath, buffer);

        // Créer l'entrée dans la base de données
        const document = await prisma.document.create({
            data: {
                cabinetId: session.cabinetId,
                fileName,
                originalName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                storageKey: stockage.support === 'gridfs' ? stockage.cle : null,
                fileUrl: '',  // renseignée ci-dessous avec l'identifiant
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: documentType as any,
                status: 'PROCESSING',
                clientId: clientId || null,
                uploadedById: session.id,
            },
        });
        documentPartielId = document.id;

        // Le fichier est servi par une route authentifiée (Next.js ne sert pas
        // /uploads/ : le lien « Voir » de la GED ouvrait une 404).
        await prisma.document.updateMany({ where: { id: document.id, cabinetId: session.cabinetId }, data: { fileUrl: `/api/documents/${document.id}/fichier` } });
        document.fileUrl = `/api/documents/${document.id}/fichier`;

        // Log action
        await AuditService.log({
            action: 'UPLOAD',
            entity: 'DOCUMENT',
            entityId: document.id,
            details: `Document uploadé : ${file.name} (${documentType})`,
            newValue: { id: document.id, fileName: document.fileName, type: document.type }
        });

        // Traiter le document avec OCR si c'est une facture
        let ocrResult = null;
        // `document` est l'objet cree plus haut, avec status 'PROCESSING' : les
        // mises a jour qui suivent ne le rechargeaient pas, si bien que la
        // reponse annoncait toujours PROCESSING — et, sur echec de l'OCR,
        // success: true avec ocrResult: null, impossible a distinguer d'un OCR
        // reussi. Le statut final est desormais suivi explicitement.
        let statutFinal: 'PROCESSING' | 'PROCESSED' | 'ERROR' = 'PROCESSING';
        let erreurOcr: string | null = null;
        if (documentType === 'FACTURE' && file.type.startsWith('image/')) {
            try {
                ocrResult = await processUploadedInvoice(filePath);
                statutFinal = ocrResult.success ? 'PROCESSED' : 'ERROR';
                if (!ocrResult.success) {
                    erreurOcr = "L'extraction OCR n'a pas abouti sur ce document.";
                }

                // Mettre à jour le document avec les données OCR
                await prisma.document.updateMany({
                    where: { id: document.id, cabinetId: session.cabinetId },
                    data: {
                        status: ocrResult.success ? 'PROCESSED' : 'ERROR',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ocrData: { ...ocrResult, sens } as any,
                        ocrProcessedAt: new Date(),
                    },
                });

                // Log OCR processing
                await AuditService.log({
                    action: 'PROCESS',
                    entity: 'DOCUMENT',
                    entityId: document.id,
                    details: ocrResult.success ? `Traitement OCR réussi pour : ${file.name}` : `Échec traitement OCR pour : ${file.name}`,
                    newValue: { status: ocrResult.success ? 'PROCESSED' : 'ERROR' }
                });
            } catch (ocrError) {
                console.error('❌ OCR Error:', ocrError);
                statutFinal = 'ERROR';
                erreurOcr = ocrError instanceof Error ? ocrError.message : 'Erreur OCR inconnue.';
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        status: 'ERROR',
                    },
                });
            }
        } else {
            // Marquer comme traité si pas de OCR nécessaire
            statutFinal = 'PROCESSED';
            await prisma.document.updateMany({
                where: { id: document.id, cabinetId: session.cabinetId },
                data: {
                    status: 'PROCESSED',
                },
            });
        }

        // La copie temporaire n'est utile qu'à l'OCR ; la pièce durable est en
        // GridFS. Sans stockage durable (pas de DATABASE_URL), on la garde.
        if (stockage.support === 'gridfs') await unlink(filePath).catch(() => {});

        televersementPersiste = true;
        return NextResponse.json({
            success: statutFinal !== 'ERROR',
            document: {
                id: document.id,
                fileName: document.fileName,
                fileUrl: document.fileUrl,
                type: document.type,
                status: statutFinal,
            },
            ocrResult,
            ...(erreurOcr ? { error: erreurOcr } : {}),
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        if (!televersementPersiste) {
            if (documentPartielId) await prisma.document.delete({ where: { id: documentPartielId } }).catch(() => {});
            if (stockagePartiel) await supprimerPiece(stockagePartiel.cle).catch(() => {});
            if (fichierTemporaire) await unlink(fichierTemporaire).catch(() => {});
        }
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
        const { session, denied } = await requireStaff();
        if (denied) return denied;
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const type = searchParams.get('type');

        if (clientId && !isValidObjectId(clientId)) {
            return NextResponse.json({ error: 'clientId invalide.' }, { status: 400 });
        }
        if (type && !TYPES_DOCUMENT.includes(type)) {
            return NextResponse.json({ error: 'Type de document invalide.' }, { status: 400 });
        }
        const where = { cabinetId: session.cabinetId, ...(clientId ? { clientId } : {}), ...(type ? { type: type as DocumentType } : {}) };

        const documents = await prisma.document.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                client: {
                    select: {
                        id: true,
                        companyName: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Les pièces antérieures portent encore /uploads/<nom> (jamais servi) :
        // toutes passent par la route authentifiée, qui répond 410 si le
        // fichier n'existe plus.
        return NextResponse.json({ documents: documents.map((d) => ({ ...d, fileUrl: `/api/documents/${d.id}/fichier` })) });
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}




