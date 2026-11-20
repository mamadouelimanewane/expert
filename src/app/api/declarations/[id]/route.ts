import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { DeclarationStatus } from '@prisma/client';
import { isObjectId } from '@/lib/tenant-security';
import { AuditService } from '@/lib/audit';

const TRANSITIONS: Record<DeclarationStatus, DeclarationStatus[]> = {
    DRAFT: ['PENDING'],
    PENDING: ['DRAFT', 'SUBMITTED', 'REJECTED'],
    SUBMITTED: ['VALIDATED', 'REJECTED'],
    VALIDATED: [],
    REJECTED: ['DRAFT', 'PENDING'],
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await AuthService.getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (!isObjectId(session.cabinetId)) return NextResponse.json({ error: 'Cabinet invalide' }, { status: 403 });
    if (!['ADMIN', 'EXPERT', 'COLLABORATOR'].includes(session.role)) {
        return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
    }
    const { id } = await context.params;
    if (!isObjectId(id)) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });

    try {
        const current = await prisma.taxDeclaration.findUnique({ where: { id } });
        if (!current) return NextResponse.json({ error: 'Déclaration introuvable' }, { status: 404 });
        const body = await request.json();
        const data: Record<string, any> = {};

        if (body.status !== undefined) {
            if (!Object.values(DeclarationStatus).includes(body.status)) {
                return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
            }
            const next = body.status as DeclarationStatus;
            if (!TRANSITIONS[current.status].includes(next)) {
                return NextResponse.json({ error: `Transition impossible : ${current.status} → ${next}` }, { status: 409 });
            }
            if (next === 'SUBMITTED' && !body.filingReceipt && !current.filingReceipt && !body.reference && !current.reference) {
                return NextResponse.json({ error: 'Enregistrez la référence ou la quittance du portail avant de marquer la déclaration déposée.' }, { status: 400 });
            }
            if (next === 'VALIDATED' && !body.paymentReference && !current.paymentReference) {
                return NextResponse.json({ error: 'Enregistrez la référence du paiement avant de clôturer la déclaration.' }, { status: 400 });
            }
            data.status = next;
            if (next === 'SUBMITTED') data.submittedDate = new Date();
            if (next === 'VALIDATED') data.paidAt = new Date();
        }
        if (body.amount !== undefined) {
            if (body.amount !== null && (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0)) {
                return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
            }
            data.amount = body.amount;
        }
        for (const key of ['reference', 'filingReceipt', 'paymentReference', 'calculationNotes'] as const) {
            if (body[key] !== undefined) {
                if (body[key] !== null && typeof body[key] !== 'string') return NextResponse.json({ error: `${key} invalide` }, { status: 400 });
                data[key] = typeof body[key] === 'string' ? body[key].slice(0, 4000) : null;
            }
        }

        const declaration = await prisma.taxDeclaration.update({ where: { id }, data });
        await AuditService.log({
            action: 'UPDATE', entity: 'TAX_DECLARATION', entityId: declaration.id,
            details: `Déclaration ${declaration.type} ${declaration.period} mise à jour${data.status ? ` : statut ${data.status}` : ''}.`,
        });
        return NextResponse.json({ declaration });
    } catch (error) {
        console.error('Erreur mise à jour déclaration fiscale:', error);
        return NextResponse.json({ error: 'Impossible de mettre à jour la déclaration' }, { status: 500 });
    }
}
