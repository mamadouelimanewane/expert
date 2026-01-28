import { NextResponse } from "next/server";
import { FintechService, PaymentProvider } from "@/lib/fintech";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { invoiceId, amount, provider, phoneNumber } = body;

        if (!invoiceId || !amount || !provider) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }

        // Initiation du paiement
        const transactionId = await FintechService.initiatePayment({
            invoiceId,
            amount: parseFloat(amount.replace(/\s/g, "")),
            provider: provider as PaymentProvider,
            phoneNumber: phoneNumber || "",
            currency: "XOF"
        });

        return NextResponse.json({
            success: true,
            transactionId,
            message: "Paiement initié avec succès"
        });

    } catch (error) {
        console.error("[Payments API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de l'initiation du paiement" }, { status: 500 });
    }
}
