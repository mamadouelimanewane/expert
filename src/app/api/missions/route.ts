import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { AuditService } from '@/lib/audit';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const clientId = searchParams.get('clientId');

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;

        const missions = await prisma.mission.findMany({
            where,
            include: {
                client: {
                    select: { id: true, companyName: true, firstName: true, lastName: true, type: true }
                },
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
            },
            orderBy: { deadline: 'asc' },
        });

        const stats = {
            total: missions.length,
            draft: missions.filter(m => m.status === 'DRAFT').length,
            inProgress: missions.filter(m => m.status === 'IN_PROGRESS').length,
            pendingReview: missions.filter(m => m.status === 'PENDING_REVIEW').length,
            completed: missions.filter(m => m.status === 'COMPLETED').length,
        };

        return NextResponse.json({ missions, stats });
    } catch (error) {
        console.error('❌ Error fetching missions:', error);
        return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { title, clientId, type, deadline, budget, description } = body;

        if (!title || !clientId) {
            return NextResponse.json({ error: 'Titre et client requis' }, { status: 400 });
        }

        const mission = await prisma.mission.create({
            data: {
                title,
                clientId,
                type: type || 'COMPTABILITE',
                deadline: deadline ? new Date(deadline) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                budget: budget ? parseFloat(budget) : null,
                description: description || null,
                status: 'DRAFT',
            },
            include: {
                client: { select: { id: true, companyName: true } },
            },
        });

        await AuditService.log({
            action: 'CREATE',
            entity: 'MISSION',
            entityId: mission.id,
            newValue: { title, clientId, type, status: 'DRAFT' },
        });

        return NextResponse.json({ mission }, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating mission:', error);
        return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
    }
}
