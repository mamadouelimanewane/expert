import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'tous') {
            const statusMap: Record<string, string> = {
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
                }
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
