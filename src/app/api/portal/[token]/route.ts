import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/portal/[token] — Récupérer les données client par portalToken
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await context.params;

        const client = await prisma.client.findUnique({
            where: { portalToken: token },
            include: {
                tpeJournals: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                missions: {
                    where: { status: { not: 'COMPLETED' } },
                    orderBy: { deadline: 'asc' },
                    take: 5,
                },
                declarations: {
                    orderBy: { dueDate: 'desc' },
                    take: 5,
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        tpeJournals: true,
                        missions: true,
                        invoices: true,
                    }
                }
            }
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Portail introuvable. Vérifiez votre lien d\'accès.' },
                { status: 404 }
            );
        }

        if (!client.portalEnabled) {
            return NextResponse.json(
                { error: 'Ce portail a été désactivé par votre cabinet comptable.' },
                { status: 403 }
            );
        }

        // Ne pas exposer les champs sensibles
        const { portalToken: _t, ...safeClient } = client;

        return NextResponse.json({ client: safeClient });
    } catch (error) {
        console.error('❌ Portal API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
