import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
import { processUploadedInvoice } from '@/lib/ocr-engine';
import { AuthService } from '@/lib/auth';
import { AuditService } from '@/lib/audit';

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

/** Valeurs de l'enum Prisma DocumentType. */
const TYPES_DOCUMENT = [
    'FACTURE', 'RELEVE_BANCAIRE', 'CONTRAT', 'RAPPORT', 'DECLARATION', 'PIECE_IDENTITE', 'AUTRE',
];

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const clientId = formData.get('clientId') as string;
        const documentType = formData.get('type') as string || 'FACTURE';

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

        // Validation du type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images and PDFs are allowed.' },
                { status: 400 }
            );
        }

        // Validation de la taille (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }

        // Créer le dossier uploads s'il n'existe pas
        const uploadsDir = join(process.cwd(), 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadsDir, fileName);

        // Sauvegarder le fichier
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Créer l'entrée dans la base de données
        const document = await prisma.document.create({
            data: {
                fileName,
                originalName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                fileUrl: `/uploads/${fileName}`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: documentType as any,
                status: 'PROCESSING',
                clientId: clientId || null,
                uploadedById: session.id,
            },
        });

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
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        status: ocrResult.success ? 'PROCESSED' : 'ERROR',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ocrData: ocrResult as any,
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
            await prisma.document.update({
                where: { id: document.id },
                data: {
                    status: 'PROCESSED',
                },
            });
        }

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
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const type = searchParams.get('type');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (clientId) where.clientId = clientId;
        if (type) where.type = type;

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

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('❌ Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}




