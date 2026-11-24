import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStaff, requireWriteAccess } from '@/lib/api-auth';
import { isObjectId } from '@/lib/tenant-security';
import { AuditService } from '@/lib/audit';
import { analyserMontantOptionnel } from "@/lib/validation";

export async function GET(request: NextRequest) {
    try {
        const { session, denied } = await requireStaff();
        if (denied) return denied;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const clientId = searchParams.get('clientId');
        // Filtre par nature de mission (AUDIT, TENUE_COMPTABLE, CONSEIL...),
        // necessaire pour n'ouvrir que les dossiers d'audit legal.
        const type = searchParams.get('type');

        const where: Record<string, unknown> = { cabinetId: session.cabinetId };
        if (status) where.status = status;
        if (clientId) {
            if (!isObjectId(clientId)) return NextResponse.json({ error: 'clientId invalide.' }, { status: 400 });
            where.clientId = clientId;
        }
        if (type) where.type = type;

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
        const { session, denied } = await requireWriteAccess();
        if (denied) return denied;

        const body = await request.json();
        const { title, clientId, type, deadline, budget, description } = body;

        if (!title || !clientId) {
            return NextResponse.json({ error: 'Titre et client requis' }, { status: 400 });
        }
        if (typeof clientId !== 'string' || !isObjectId(clientId)) return NextResponse.json({ error: 'clientId invalide.' }, { status: 400 });
        const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
        if (!client) return NextResponse.json({ error: 'Client introuvable dans ce cabinet.' }, { status: 404 });

        // Un budget saisi 1 500 000 etait enregistre a 1 FCFA, puis propage
        // dans /missions/budget, /management/controlling et /missions/boni-mali ;
        // un NaN y contaminait chaque total de portefeuille.
        const budgetHonoraires = analyserMontantOptionnel(budget, { min: 0 });
        if (!budgetHonoraires.ok) {
            return NextResponse.json({ error: budgetHonoraires.raison }, { status: 400 });
        }

        const mission = await prisma.mission.create({
            data: {
                cabinetId: session.cabinetId,
                title,
                clientId,
                type: type || 'TENUE_COMPTABLE',
                deadline: deadline ? new Date(deadline) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                fixedPrice: budgetHonoraires.valeur,
                description: description || null,
                status: 'DRAFT',
                startDate: new Date(),
                createdById: session.id,
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
