import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Liste des transactions Mobile Money
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const operator = searchParams.get("operator");
    const status = searchParams.get("status");

    try {
        const where: any = {};
        if (operator) where.operator = operator;
        if (status) where.status = status;

        const transactions = await prisma.mobileMoneyTransaction.findMany({
            where,
            include: { client: true },
            orderBy: { transactionDate: "desc" },
            take: 100
        });

        // Statistiques globales
        const total = await prisma.mobileMoneyTransaction.count({ where });
        const totalIn = await prisma.mobileMoneyTransaction.aggregate({
            _sum: { amount: true },
            where: { ...where, type: "IN" }
        });
        const totalOut = await prisma.mobileMoneyTransaction.aggregate({
            _sum: { amount: true },
            where: { ...where, type: "OUT" }
        });
        const pending = await prisma.mobileMoneyTransaction.count({
            where: { ...where, status: "PENDING" }
        });

        return NextResponse.json({
            transactions,
            stats: {
                total,
                totalIn: totalIn._sum.amount || 0,
                totalOut: totalOut._sum.amount || 0,
                pending
            }
        });
    } catch (error) {
        console.error("Mobile Money GET error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// POST: Sync / Ajout de transactions
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === "sync") {
            // Simulation de sync depuis opérateur mobile
            const demoTransactions = [
                {
                    operator: "Wave",
                    reference: `WAVE-${Date.now()}-001`,
                    senderName: "Mamadou Diallo",
                    senderPhone: "+221 77 123 4567",
                    amount: 150000,
                    type: "IN",
                    status: "PENDING",
                    transactionDate: new Date(),
                    clientId: body.clientId || null
                },
                {
                    operator: "Orange Money",
                    reference: `OM-${Date.now()}-002`,
                    senderName: "Fatou Sall",
                    senderPhone: "+221 70 987 6543",
                    amount: 75000,
                    type: "OUT",
                    status: "PENDING",
                    transactionDate: new Date(Date.now() - 3600000),
                    clientId: body.clientId || null
                },
                {
                    operator: "MTN MoMo",
                    reference: `MTN-${Date.now()}-003`,
                    senderName: "Issa Kouyaté",
                    senderPhone: "+225 07 456 7890",
                    amount: 320000,
                    type: "IN",
                    status: "PENDING",
                    transactionDate: new Date(Date.now() - 7200000),
                    clientId: body.clientId || null
                }
            ];

            // Upsert par référence pour éviter les doublons
            let created = 0;
            for (const tx of demoTransactions) {
                await prisma.mobileMoneyTransaction.upsert({
                    where: { reference: tx.reference },
                    update: {},
                    create: tx as any
                });
                created++;
            }

            return NextResponse.json({ success: true, synced: created });
        }

        if (body.action === "reconcile") {
            const { transactionId } = body;
            const updated = await prisma.mobileMoneyTransaction.update({
                where: { id: transactionId },
                data: { status: "RECONCILED", reconciledAt: new Date() }
            });
            return NextResponse.json({ success: true, transaction: updated });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error) {
        console.error("Mobile Money POST error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
