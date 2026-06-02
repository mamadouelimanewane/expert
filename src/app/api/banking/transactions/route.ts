import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const transactions = await prisma.bankTransaction.findMany({
            include: {
                invoice: {
                    include: { client: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        
        // On renvoie aussi les factures en attente pour le split screen (qui ne sont pas PAID)
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                status: {
                    not: "PAID"
                }
            },
            include: { client: true },
            orderBy: {
                issueDate: 'desc'
            }
        });

        // Transformer les factures au format attendu par le front
        const formattedInvoices = pendingInvoices.map((inv: any) => ({
            id: inv.id,
            number: inv.invoiceNumber,
            clientName: inv.client?.companyName || "Client Inconnu",
            date: inv.issueDate,
            amount: inv.total,
            status: inv.status
        }));

        return NextResponse.json({ transactions, pendingInvoices: formattedInvoices });
    } catch (error) {
        console.error("Erreur API BankTransactions GET:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // S'il s'agit d'une demande de lettrage manuel
        if (body.action === 'reconcile') {
            const { transactionId, invoiceId } = body;
            
            const transaction = await prisma.bankTransaction.update({
                where: { id: transactionId },
                data: { 
                    status: 'RECONCILED',
                    invoiceId: invoiceId 
                }
            });
            
            // Mise à jour simplifiée de la facture (PAID)
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'PAID', paidDate: new Date() }
            });
            
            return NextResponse.json({ success: true, transaction });
        }
        
        // S'il s'agit d'ajouter une transaction manuelle ou via import
        if (body.action === 'import') {
            const { transactions } = body; // array of transactions
            const created = await prisma.bankTransaction.createMany({
                data: transactions.map((t: any) => ({
                    date: new Date(t.date),
                    description: t.description,
                    amount: t.amount,
                    type: t.amount >= 0 ? "CREDIT" : "DEBIT",
                    status: "PENDING"
                }))
            });
            return NextResponse.json({ success: true, count: created.count });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error) {
        console.error("Erreur API BankTransactions POST:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
