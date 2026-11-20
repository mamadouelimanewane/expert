import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const transactions = await prisma.bankTransaction.findMany({
            include: {
                invoice: {
                    // Objet Client brut = `portalToken` expose (cf. /api/clients/[id]).
                    include: { client: { omit: { portalToken: true } } }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        
        // On renvoie aussi les factures en attente pour le split screen (qui ne sont pas PAID)
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ["SENT", "OVERDUE"] },
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
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await request.json();
        
        // S'il s'agit d'une demande de lettrage manuel
        if (body.action === 'reconcile') {
            const { transactionId, invoiceId } = body;
            if (typeof transactionId !== "string" || typeof invoiceId !== "string") {
                return NextResponse.json({ error: "Transaction et facture requises." }, { status: 400 });
            }

            const [transaction, invoice] = await Promise.all([
                prisma.bankTransaction.findUnique({ where: { id: transactionId } }),
                prisma.invoice.findUnique({ where: { id: invoiceId } }),
            ]);
            if (!transaction || !invoice) {
                return NextResponse.json({ error: "Transaction ou facture introuvable." }, { status: 404 });
            }
            if (transaction.status !== "PENDING" || transaction.invoiceId) {
                return NextResponse.json({ error: "Cette transaction a déjà été traitée." }, { status: 409 });
            }
            if (transaction.type !== "CREDIT" || !["SENT", "OVERDUE"].includes(invoice.status)) {
                return NextResponse.json({ error: "Seul un encaissement peut être rapproché d'une facture ouverte." }, { status: 422 });
            }
            if (Math.abs(transaction.amount - invoice.total) > 0.01) {
                return NextResponse.json({ error: "Le montant du relevé ne correspond pas au total de la facture." }, { status: 422 });
            }
            const priorMatch = await prisma.bankTransaction.findFirst({
                where: { invoiceId, status: "RECONCILED" },
                select: { id: true },
            });
            if (priorMatch) {
                return NextResponse.json({ error: "Cette facture est déjà rapprochée d'un mouvement bancaire." }, { status: 409 });
            }

            // Le rapprochement est une association comptable, pas une preuve suffisante
            // pour solder la facture. Le règlement reste à confirmer dans la facturation.
            const changed = await prisma.bankTransaction.updateMany({
                where: { id: transactionId, status: "PENDING", invoiceId: null },
                data: { status: "RECONCILED", invoiceId },
            });
            if (changed.count !== 1) {
                return NextResponse.json({ error: "La transaction a été modifiée entre-temps." }, { status: 409 });
            }
            const updated = await prisma.bankTransaction.findUnique({ where: { id: transactionId } });
            return NextResponse.json({ success: true, transaction: updated, invoiceMarkedPaid: false });
        }
        
        // S'il s'agit d'ajouter une transaction manuelle ou via import
        if (body.action === 'import') {
            const transactions = body.transactions;
            if (!Array.isArray(transactions) || transactions.length === 0 || transactions.length > 500) {
                return NextResponse.json({ error: "L'import doit contenir entre 1 et 500 lignes." }, { status: 400 });
            }
            const rows: Array<{ date: Date; description: string; amount: number; type: "CREDIT" | "DEBIT"; status: "PENDING" }> = [];
            for (const value of transactions as unknown[]) {
                if (typeof value !== "object" || value === null) {
                    return NextResponse.json({ error: "Une ou plusieurs lignes ont une date, un montant ou un libellé invalide." }, { status: 400 });
                }
                const row = value as Record<string, unknown>;
                const date = new Date(String(row.date ?? ""));
                const amount = Number(row.amount);
                const description = typeof row.description === "string" ? row.description.trim() : "";
                if (!Number.isFinite(date.getTime()) || !Number.isFinite(amount) || amount === 0 || !description || description.length > 500) {
                    return NextResponse.json({ error: "Une ou plusieurs lignes ont une date, un montant ou un libellé invalide." }, { status: 400 });
                }
                rows.push({ date, description, amount, type: amount >= 0 ? "CREDIT" : "DEBIT", status: "PENDING" });
            }
            const created = await prisma.bankTransaction.createMany({
                data: rows,
            });
            return NextResponse.json({ success: true, count: created.count });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error) {
        console.error("Erreur API BankTransactions POST:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
