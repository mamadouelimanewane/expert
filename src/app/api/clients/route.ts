import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuditService } from '@/lib/audit';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const country = searchParams.get('country');
        const fiscalRegime = searchParams.get('fiscalRegime');
        const isActive = searchParams.get('isActive');

        const where: any = {};

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (country) where.country = country;
        if (fiscalRegime) where.fiscalRegime = fiscalRegime;
        if (isActive !== null) where.isActive = isActive === 'true';

        const clients = await prisma.client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        missions: true,
                        invoices: true,
                        declarations: true,
                    },
                },
            },
        });

        return NextResponse.json({ clients });
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Générer un token unique pour le portail PMI
        const portalToken = randomUUID().replace(/-/g, '').slice(0, 16);

        const client = await prisma.client.create({
            data: {
                type: body.type || 'ENTREPRISE',
                companyName: body.companyName,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                rccm: body.rccm,
                ninea: body.ninea,
                ifu: body.ifu,
                nif: body.nif,
                fiscalRegime: body.fiscalRegime || 'REEL_NORMAL',
                sector: body.sector,
                country: body.country || 'CI',
                address: body.address,
                city: body.city,
                postalCode: body.postalCode,
                subjectToTva: body.subjectToTva || false,
                isActive: body.isActive !== undefined ? body.isActive : true,
                // Portail PMI auto-généré
                portalToken,
                portalEnabled: true,
                portalCreatedAt: new Date(),
            },
        });

        // Log action
        await AuditService.log({
            action: 'CREATE',
            entity: 'CLIENT',
            details: `Nouveau client créé : ${client.companyName || (client.firstName + ' ' + client.lastName)} — Portail activé (${portalToken})`,
            entityId: client.id,
            newValue: client
        });

        // Construire l'URL du portail
        const baseUrl = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
        const portalUrl = `${baseUrl}/portal/${portalToken}`;

        return NextResponse.json({ 
            client, 
            portalUrl,
            portalToken,
        }, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}


