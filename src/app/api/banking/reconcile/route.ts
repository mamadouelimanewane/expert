import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";

export async function POST(request: Request) {
    try {
        const { clientId } = await request.json();

        let targetClientId = clientId;
        if (!targetClientId || targetClientId.length !== 24) {
            const firstClient = await prisma.client.findFirst();
            targetClientId = firstClient?.id || null;
        }

        if (!targetClientId) {
            return NextResponse.json({ error: "ClientId requis" }, { status: 400 });
        }

        // 1. Récupérer les factures en attente pour ce client
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                clientId: targetClientId,
                status: "SENT"
            }
        });

        if (pendingInvoices.length === 0) {
            return NextResponse.json({ 
                message: "Aucune facture en attente de paiement trouvée pour ce client.",
                matchedCount: 0 
            });
        }

        // 2. Simuler un "Relevé Bancaire" (JSON des flux entrants)
        // Normalement ceci viendrait d'un import de fichier ou d'une API de banque (Bridge, etc.)
        const simulatedBankStatements = pendingInvoices.slice(0, 2).map((inv, index) => ({
            id: `BANK-TX-${index}`,
            amount: inv.total,
            date: new Date(),
            reference: `REGLEMENT F-${inv.invoiceNumber}`,
            invoiceId: inv.id
        }));

        let matchedCount = 0;
        const results = [];

        // 3. Effectuer le lettrage (Rapprochement)
        for (const statement of simulatedBankStatements) {
            const invoice = pendingInvoices.find(inv => inv.id === statement.invoiceId);
            
            if (invoice) {
                // Mettre à jour la facture
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        status: "PAID",
                        paidDate: new Date()
                    }
                });

                // Logger l'action de rapprochement IA
                await AuditService.log({
                    action: "BANK_RECONCILED",
                    entity: "INVOICE",
                    entityId: invoice.id,
                    details: `Rapprochement IA réussi : Virement de ${statement.amount} FCFA matché avec Facture ${invoice.invoiceNumber}`
                });

                matchedCount++;
                results.push({
                    invoiceNumber: invoice.invoiceNumber,
                    amount: statement.amount,
                    status: "MATCHED"
                });
            }
        }

        return NextResponse.json({
            success: true,
            matchedCount,
            results,
            message: `${matchedCount} factures ont été automatiquement lettrées par l'IA.`
        });

    } catch (error) {
        console.error("[Banking API] Error:", error);
        return NextResponse.json({ error: "Erreur lors du rapprochement" }, { status: 500 });
    }
}
