import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuditService } from '@/lib/audit';
import { randomBytes } from 'crypto';

import { requireStaff } from "@/lib/api-auth";
import { parsePagination, reponsePaginee } from '@/lib/pagination';
import { clientCreateSchema, parseBody } from '@/lib/validation';

export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const country = searchParams.get('country');
        const fiscalRegime = searchParams.get('fiscalRegime');
        const isActive = searchParams.get('isActive');
        const pagination = parsePagination(searchParams);

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

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: pagination.skip,
                take: pagination.take,
                // `portalToken` vaut authentification au portail client : il n'a
                // rien à faire dans une liste consultée en interface.
                omit: { portalToken: true },
                include: {
                    _count: {
                        select: {
                            missions: true,
                            invoices: true,
                            declarations: true,
                        },
                    },
                },
            }),
            prisma.client.count({ where }),
        ]);

        return NextResponse.json({
            clients,
            pagination: reponsePaginee(clients, total, pagination),
        });
    } catch (error) {
        console.error('❌ Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { data: body, invalid } = await parseBody(request, clientCreateSchema);
    if (invalid) return invalid;

    try {
        // Générer un token unique pour le portail PMI
        const portalToken = randomBytes(32).toString('hex');

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

        // Le journal d'audit est consultable par tout le staff : il ne doit
        // contenir ni le token du portail, ni l'objet client complet.
        const { portalToken: _token, ...clientSansToken } = client;

        await AuditService.log({
            action: 'CREATE',
            entity: 'CLIENT',
            details: `Nouveau client créé : ${client.companyName || [client.firstName, client.lastName].filter(Boolean).join(' ')} — portail activé`,
            entityId: client.id,
            newValue: clientSansToken
        });

        // Construire l'URL du portail
        const baseUrl = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
        const portalUrl = `${baseUrl}/portal/${portalToken}`;

        // Le token n'est renvoyé qu'ici, à la création, pour que le cabinet
        // puisse transmettre le lien au client. Il n'apparaît dans aucune
        // lecture ultérieure.
        return NextResponse.json({
            client: clientSansToken,
            portalUrl,
            portalToken,
        }, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating client:', error);
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        );
    }
}


