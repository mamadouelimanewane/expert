import { NextResponse } from "next/server";
import { FintechService, PaymentProvider } from "@/lib/fintech";

/**
 * Endpoint pour recevoir les notifications (hooks) des opérateurs
 * Prend en charge Wave, Orange Money et MTN
 */
export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const provider = url.searchParams.get("provider") as PaymentProvider;
        const payload = await request.json();

        if (!provider) {
            return NextResponse.json({ error: "Provider non spécifié" }, { status: 400 });
        }

        // Traitement du webhook
        await FintechService.handleWebhook(provider, payload);

        return NextResponse.json({ status: "ACK" });

    } catch (error) {
        console.error("[Webhook API] Error:", error);
        // Important: Toujours répondre avec 200 ou un statut accepté pour éviter les retries infinis si l'erreur est logicielle
        return NextResponse.json({ error: "Erreur traitement webhook" }, { status: 200 });
    }
}
