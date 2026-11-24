import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
const OPERATEURS = ["Wave", "Orange Money", "MTN MoMo"] as const;
export async function GET() {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    try {
        const transactions = await prisma.mobileMoneyTransaction.findMany({
            where: { cabinetId: session.cabinetId },
            orderBy: { transactionDate: 'desc' }
        });
        return NextResponse.json({
            transactions,
            canSimulate: process.env.NODE_ENV !== "production",
        });
    } catch (error) {
        console.error("Erreur GET MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    try {
        const data = await request.json();

        // Validation stricte : on n'invente jamais de valeurs par défaut pour des
        // données financières (montant, expéditeur). Le formulaire appelant doit
        // fournir des données réelles.
        const missing: string[] = [];
        if (!OPERATEURS.includes(data.operator)) missing.push('operator');
        if (typeof data.senderPhone !== "string" || !data.senderPhone.trim()) missing.push('senderPhone');
        if (!isObjectId(data.clientId)) missing.push('clientId');
        if (data.amount === undefined || data.amount === null || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) missing.push('amount');
        if (!data.type || !['IN', 'OUT'].includes(data.type)) missing.push('type');

        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Champs requis manquants ou invalides : ${missing.join(', ')}` },
                { status: 400 }
            );
        }

        if (typeof data.reference !== "string" || !data.reference.trim() || data.reference.length > 160) {
            return NextResponse.json(
                { error: "Une référence de transaction réelle (fournie par l'opérateur Mobile Money) est requise." },
                { status: 400 }
            );
        }

        const client = await prisma.client.findFirst({ where: { id: data.clientId, cabinetId: session.cabinetId } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        const transactionDate = data.transactionDate ? new Date(data.transactionDate) : null;
        if (data.transactionDate && (!transactionDate || Number.isNaN(transactionDate.getTime()))) {
            return NextResponse.json({ error: "Date de transaction invalide." }, { status: 400 });
        }
        const tx = await prisma.mobileMoneyTransaction.create({
            data: {
                cabinetId: session.cabinetId,
                operator: data.operator,
                reference: data.reference,
                senderName: data.senderName || null,
                senderPhone: data.senderPhone,
                amount: parseFloat(data.amount),
                type: data.type,
                status: 'PENDING',
                transactionDate: transactionDate ?? new Date(),
                clientId: client.id
            }
        });

        return NextResponse.json(tx, { status: 201 });
    } catch (error) {
        console.error("Erreur POST MobileMoney:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PATCH() {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    // Le rapprochement automatique nécessite une intégration réelle avec l'API de
    // l'opérateur (Wave/Orange/MTN) pour confirmer chaque transaction individuellement.
    // Aucune logique de correspondance fiable n'est câblée : on ne marque donc plus
    // les transactions en attente comme rapprochées en masse.
    return NextResponse.json(
        { error: "Réconciliation automatique non configurée — intégration opérateur (Wave/Orange/MTN) requise." },
        { status: 501 }
    );
}
