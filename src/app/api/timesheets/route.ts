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

        const entries = await prisma.timeEntry.findMany({
            where: { userId: session.id },
            orderBy: { date: 'desc' },
            include: {
                client: {
                    select: {
                        companyName: true,
                    }
                },
                mission: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        // Calcul des stats de productivité
        const totalHours = await prisma.timeEntry.aggregate({
            _sum: { duration: true },
            where: { userId: session.id }
        });

        const unbilledHours = await prisma.timeEntry.aggregate({
            _sum: { duration: true },
            where: {
                userId: session.id,
                status: 'SUBMITTED' // Considéré comme non facturé encore
            }
        });

        return NextResponse.json({
            entries,
            stats: {
                totalHours: totalHours._sum.duration || 0,
                unbilledHours: unbilledHours._sum.duration || 0,
            }
        });
    } catch (error) {
        console.error('❌ Error fetching timesheets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch timesheets' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();

        const entry = await prisma.timeEntry.create({
            data: {
                duration: parseFloat(body.duration),
                category: body.category,
                description: body.description,
                date: new Date(body.date),
                userId: session.id,
                clientId: body.clientId,
                missionId: body.missionId,
                status: 'SUBMITTED'
            }
        });

        // Log action
        await AuditService.log({
            action: 'CREATE',
            entity: 'TIME_ENTRY',
            entityId: entry.id,
            details: `Saisie de temps effectuée : ${entry.duration}h pour ${body.description || 'mission sans description'}`,
            newValue: entry
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating time entry:', error);
        return NextResponse.json(
            { error: 'Failed to create time entry' },
            { status: 500 }
        );
    }
}

