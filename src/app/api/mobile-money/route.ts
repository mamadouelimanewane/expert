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
            // La synchronisation automatique nécessite les API Wave/Orange Money/MTN MoMo
            // (clés WAVE_API_KEY, ORANGE_MONEY_API_KEY, ORANGE_MERCHANT_KEY, MTN_MOMO_API_KEY),
            // non configurées. Aucune transaction fictive n'est générée.
            const configured = !!(process.env.WAVE_API_KEY || process.env.ORANGE_MONEY_API_KEY || process.env.MTN_MOMO_API_KEY);
            if (!configured) {
                return NextResponse.json({
                    success: false,
                    error: "Intégration Mobile Money non configurée. Ajoutez les clés API des opérateurs dans les variables d'environnement pour activer la synchronisation.",
                }, { status: 503 });
            }
            // TODO: appeler les API réelles Wave/Orange Money/MTN MoMo une fois les clés fournies.
            return NextResponse.json({ success: true, synced: 0 });
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
