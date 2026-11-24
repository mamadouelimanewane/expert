import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStaff, requireWriteAccess } from '@/lib/api-auth';
import { isObjectId } from '@/lib/tenant-security';

const COUNTRIES = new Set(['SN', 'CI', 'CM', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GA', 'TD', 'CF', 'CG', 'CD', 'GQ', 'GW']);

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    const { id } = await context.params;
    if (!isObjectId(id)) return NextResponse.json({ error: 'Identifiant client invalide' }, { status: 400 });
    const client = await prisma.client.findFirst({ where: { id, cabinetId: session.cabinetId }, select: {
        id: true, companyName: true, country: true, fiscalRegime: true, sector: true,
        ninea: true, ifu: true, nif: true, subjectToTva: true, taxProfile: true,
    } });
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    return NextResponse.json({ profile: client });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;
    const { id } = await context.params;
    if (!isObjectId(id)) return NextResponse.json({ error: 'Identifiant client invalide' }, { status: 400 });

    try {
        const body = await request.json();
        const clientData: Record<string, any> = {};
        if (body.country !== undefined) {
            if (typeof body.country !== 'string' || !COUNTRIES.has(body.country.toUpperCase())) return NextResponse.json({ error: 'Pays non pris en charge dans le référentiel OHADA' }, { status: 400 });
            clientData.country = body.country.toUpperCase();
        }
        if (body.fiscalRegime !== undefined) {
            if (!['REEL_NORMAL', 'REEL_SIMPLIFIE', 'CME', 'MICRO_ENTREPRISE'].includes(body.fiscalRegime)) return NextResponse.json({ error: 'Régime fiscal invalide' }, { status: 400 });
            clientData.fiscalRegime = body.fiscalRegime;
        }
        if (body.sector !== undefined) {
            if (body.sector !== null && (typeof body.sector !== 'string' || body.sector.length > 160)) return NextResponse.json({ error: 'Secteur invalide' }, { status: 400 });
            clientData.sector = body.sector;
        }
        if (body.subjectToTva !== undefined) {
            if (typeof body.subjectToTva !== 'boolean') return NextResponse.json({ error: 'Assujettissement TVA invalide' }, { status: 400 });
            clientData.subjectToTva = body.subjectToTva;
        }

        if (body.taxProfile !== undefined) {
            const p = body.taxProfile;
            if (!p || typeof p !== 'object' || Array.isArray(p)) return NextResponse.json({ error: 'Profil fiscal invalide' }, { status: 400 });
            const textField = (key: string, max = 200) => p[key] === undefined || p[key] === null || (typeof p[key] === 'string' && p[key].length <= max);
            for (const key of ['taxId', 'taxOffice', 'fiscalYearEnd', 'taxCenter']) {
                if (!textField(key)) return NextResponse.json({ error: `Champ ${key} invalide` }, { status: 400 });
            }
            if (p.taxCenter && !['DGE', 'DME', 'CME', 'CIME', 'CDI', 'CSI', 'SAID'].includes(p.taxCenter)) return NextResponse.json({ error: 'Centre fiscal invalide' }, { status: 400 });
            if (p.fiscalYearEnd && !/^\d{2}-\d{2}$/.test(p.fiscalYearEnd)) return NextResponse.json({ error: 'La clôture doit être au format MM-JJ' }, { status: 400 });
            for (const key of ['vatRegistered', 'employer', 'withholdingAgent', 'foreignTransactions']) {
                if (p[key] !== undefined && typeof p[key] !== 'boolean') return NextResponse.json({ error: `Champ ${key} invalide` }, { status: 400 });
            }
            for (const key of ['activities', 'taxIncentives']) {
                if (p[key] !== undefined && (!Array.isArray(p[key]) || p[key].length > 30 || p[key].some((v: unknown) => typeof v !== 'string' || v.length > 160))) {
                    return NextResponse.json({ error: `Liste ${key} invalide` }, { status: 400 });
                }
            }
            clientData.taxProfile = {
                taxId: p.taxId ?? '', taxOffice: p.taxOffice ?? '', fiscalYearEnd: p.fiscalYearEnd ?? '12-31', taxCenter: p.taxCenter ?? '',
                vatRegistered: p.vatRegistered ?? false, employer: p.employer ?? false,
                withholdingAgent: p.withholdingAgent ?? false, foreignTransactions: p.foreignTransactions ?? false,
                activities: p.activities ?? [], taxIncentives: p.taxIncentives ?? [], reviewedAt: new Date().toISOString(),
            };
        }
        const updated = await prisma.client.updateMany({ where: { id, cabinetId: session.cabinetId }, data: clientData });
        if (!updated.count) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
        const profile = await prisma.client.findFirst({ where: { id, cabinetId: session.cabinetId }, select: {
            id: true, companyName: true, country: true, fiscalRegime: true, sector: true,
            ninea: true, ifu: true, nif: true, subjectToTva: true, taxProfile: true,
        } });
        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Erreur mise à jour profil fiscal:', error);
        return NextResponse.json({ error: 'Impossible de mettre à jour le profil fiscal' }, { status: 500 });
    }
}
