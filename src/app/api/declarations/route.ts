import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { DeclarationStatus, DeclarationType, Prisma } from '@prisma/client';
import { isObjectId } from '@/lib/tenant-security';
import { AuditService } from '@/lib/audit';
import { verifierReglePourDeclaration } from '@/lib/regulatory-rule-policy';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: Prisma.TaxDeclarationWhereInput = {};
        if (status && status !== 'tous') {
            const statusMap: Record<string, DeclarationStatus> = {
                'a_preparer': 'DRAFT',
                'validation': 'PENDING',
                'teletransmise': 'SUBMITTED',
                'payee': 'VALIDATED'
            };
            where.status = statusMap[status] || status;
        }

        const declarations = await prisma.taxDeclaration.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                client: {
                    select: {
                        id: true,
                        companyName: true,
                        firstName: true,
                        lastName: true,
                        country: true
                    }
                },
                regulatoryRule: { select: { version: true, title: true, sourceTitle: true, sourceUrl: true, sourceArticle: true, effectiveFrom: true, effectiveUntil: true } },
            }
        });

        // Format for the UI
        const now = new Date();
        const formatted = declarations.map(d => {
            // Risque derive du delai reel avant echeance : ce champ affichait
            // auparavant "faible" pour toutes les declarations, quelle que soit
            // leur date limite ou leur statut.
            const daysUntilDue = (new Date(d.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            let risk: "faible" | "moyen" | "élevé" = "faible";
            if (d.status !== "VALIDATED" && d.status !== "SUBMITTED") {
                if (daysUntilDue < 0) risk = "élevé";
                else if (daysUntilDue <= 7) risk = "moyen";
            }
            return {
                id: d.id,
                client: d.client.companyName || `${d.client.firstName} ${d.client.lastName}`,
                type: d.type as string,
                month: d.period,
                country: d.client.country,
                // TaxDeclaration.amount est optionnel : un montant non encore
                // calcule (null) s'affichait « 0 », indiscernable d'une
                // declaration reellement a zero.
                amountToPay: d.amount === null || d.amount === undefined ? null : d.amount.toLocaleString("fr-FR"),
                status: d.status === "VALIDATED" ? "payee" : (d.status === "SUBMITTED" ? "teletransmise" : (d.status === "PENDING" ? "validation" : "a_preparer")),
                rawStatus: d.status,
                obligationCode: d.obligationCode,
                ruleVersion: d.ruleVersion,
                regulatoryRule: d.regulatoryRule ? {
                    version: d.regulatoryRule.version,
                    title: d.regulatoryRule.title,
                    sourceTitle: d.regulatoryRule.sourceTitle,
                    sourceUrl: d.regulatoryRule.sourceUrl,
                    sourceArticle: d.regulatoryRule.sourceArticle,
                    effectiveFrom: d.regulatoryRule.effectiveFrom,
                    effectiveUntil: d.regulatoryRule.effectiveUntil,
                } : null,
                reference: d.reference,
                filingReceipt: d.filingReceipt,
                paymentReference: d.paymentReference,
                deadline: new Date(d.dueDate).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }),
                risk
            };
        });

        const totalToPay = await prisma.taxDeclaration.aggregate({
            _sum: { amount: true },
            where: { status: { in: ['DRAFT', 'PENDING', 'SUBMITTED'] } }
        });

        // `declarations` est trie par dueDate croissante mais sans filtre de date
        // ni de statut : declarations[0] etait la plus ANCIENNE echeance jamais
        // enregistree, deja validee le plus souvent. Une TVA de janvier 2024
        // deja payee figeait donc le KPI sur « 15 JANVIER ». Le KPI variait de
        // surcroit avec le filtre de statut de la liste, ce qui n'a pas de sens
        // pour un indicateur global.
        const prochaine = await prisma.taxDeclaration.findFirst({
            where: {
                dueDate: { gte: new Date() },
                status: { in: ['DRAFT', 'PENDING'] },
            },
            orderBy: { dueDate: 'asc' },
            select: { dueDate: true },
        });
        const nextDeadline = prochaine
            ? new Date(prochaine.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
            : 'N/A';

        return NextResponse.json({ 
            declarations: formatted,
            kpis: {
                totalToPay: totalToPay._sum.amount || 0,
                nextDeadline: nextDeadline.toUpperCase()
            }
        });
    } catch (error) {
        console.error('❌ Error fetching declarations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch declarations' },
            { status: 500 }
        );
    }
}

/** Crée une déclaration réelle à préparer, associée à un client du cabinet. */
export async function POST(request: NextRequest) {
    const session = await AuthService.getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (!isObjectId(session.cabinetId)) return NextResponse.json({ error: 'Cabinet invalide' }, { status: 403 });
    if (!['ADMIN', 'EXPERT', 'COLLABORATOR'].includes(session.role)) {
        return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { clientId, type, period, dueDate, amount, obligationCode, calculationNotes } = body ?? {};
        if (!isObjectId(clientId)) return NextResponse.json({ error: 'Client invalide' }, { status: 400 });
        if (!Object.values(DeclarationType).includes(type)) return NextResponse.json({ error: 'Type de déclaration invalide' }, { status: 400 });
        if (typeof period !== 'string' || !/^\d{4}-(\d{2}|T[1-4]|A)$/.test(period)) {
            return NextResponse.json({ error: 'Période invalide. Utilisez AAAA-MM, AAAA-T1…T4 ou AAAA-A.' }, { status: 400 });
        }
        const due = new Date(dueDate);
        if (!dueDate || Number.isNaN(due.getTime())) return NextResponse.json({ error: 'Échéance invalide' }, { status: 400 });
        if (amount !== undefined && amount !== null && (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0)) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, country: true } });
        if (!client) return NextResponse.json({ error: 'Client introuvable dans ce cabinet' }, { status: 404 });

        let regulatoryRuleId: string | null = null;
        let ruleVersion: string | null = null;
        const codeObligation = typeof obligationCode === 'string' ? obligationCode.trim() : '';
        if (codeObligation) {
            const versions = await prisma.regulatoryObligationRule.findMany({
                where: { country: client.country, obligationCode: codeObligation, status: { in: ['VERIFIED', 'RETIRED'] } },
                orderBy: { version: 'desc' },
            });
            if (versions.length > 0) {
                const applicable = versions.find((rule) => verifierReglePourDeclaration(rule, {
                    country: client.country, type, period, dueDate: due,
                }) === null);
                if (!applicable) {
                    return NextResponse.json({ error: 'Aucune version validée de cette règle ne couvre le pays, le type, la période et la date de cette déclaration.' }, { status: 409 });
                }
                regulatoryRuleId = applicable.id;
                ruleVersion = String(applicable.version);
            }
        }

        const existing = await prisma.taxDeclaration.findFirst({
            where: {
                clientId, type, period,
                ...(obligationCode ? { OR: [{ obligationCode }, { obligationCode: null }] } : {}),
            },
            select: { id: true },
        });
        if (existing) return NextResponse.json({ error: 'Une déclaration de ce type existe déjà pour ce client et cette période.' }, { status: 409 });

        const declaration = await prisma.taxDeclaration.create({
            data: {
                cabinetId: session.cabinetId,
                clientId,
                type,
                period,
                dueDate: due,
                amount: amount ?? null,
                obligationCode: codeObligation || null,
                calculationNotes: typeof calculationNotes === 'string' ? calculationNotes.slice(0, 4000) : null,
                status: DeclarationStatus.DRAFT,
                ...(regulatoryRuleId ? { regulatoryRuleId, ruleVersion } : {}),
            },
        });
        await AuditService.log({ action: 'CREATE', entity: 'TAX_DECLARATION', entityId: declaration.id, details: `Brouillon ${declaration.type} créé pour ${declaration.period}.` });
        return NextResponse.json({ declaration }, { status: 201 });
    } catch (error) {
        console.error('Erreur création déclaration fiscale:', error);
        return NextResponse.json({ error: 'Impossible de créer la déclaration' }, { status: 500 });
    }
}
