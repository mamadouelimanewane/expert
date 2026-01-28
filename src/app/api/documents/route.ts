import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
import { processUploadedInvoice } from '@/lib/ocr-engine';
import { AuthService } from '@/lib/auth';

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

        console.log('✅ File saved:', filePath);

        // Créer l'entrée dans la base de données
        const document = await prisma.document.create({
            data: {
                fileName,
                originalName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                fileUrl: `/uploads/${fileName}`,
                type: documentType as any,
                status: 'PROCESSING',
                clientId: clientId || null,
                uploadedById: session.id,
            },
        });

        console.log('✅ Document created in DB:', document.id);

        // Traiter le document avec OCR si c'est une facture
        let ocrResult = null;
        if (documentType === 'FACTURE' && file.type.startsWith('image/')) {
            try {
                console.log('🔍 Starting OCR processing...');
                ocrResult = await processUploadedInvoice(filePath);

                // Mettre à jour le document avec les données OCR
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        status: ocrResult.success ? 'PROCESSED' : 'ERROR',
                        ocrData: ocrResult as any,
                        ocrProcessedAt: new Date(),
                    },
                });

                console.log('✅ OCR processing completed');
            } catch (ocrError) {
                console.error('❌ OCR Error:', ocrError);
                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        status: 'ERROR',
                    },
                });
            }
        } else {
            // Marquer comme traité si pas de OCR nécessaire
            await prisma.document.update({
                where: { id: document.id },
                data: {
                    status: 'PROCESSED',
                },
            });
        }

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                fileName: document.fileName,
                fileUrl: document.fileUrl,
                type: document.type,
                status: document.status,
            },
            ocrResult,
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        const type = searchParams.get('type');

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
