import { NextResponse } from "next/server";
import { FintechService, PaymentProvider } from "@/lib/fintech";

/**
 * Endpoint pour recevoir les notifications (hooks) des opérateurs
 * Prend en charge Wave, Orange Money et MTN
 */
// Chaque fournisseur a des identifiants distincts requis pour l'authentification réelle.
const REQUIRED_ENV_VARS: Record<PaymentProvider, string[]> = {
    WAVE: ["WAVE_API_KEY"],
    ORANGE_MONEY: ["ORANGE_CONSUMER_KEY", "ORANGE_CONSUMER_SECRET", "ORANGE_MERCHANT_KEY"],
    MTN_MOMO: ["MTN_MOMO_SUBSCRIPTION_KEY", "MTN_MOMO_API_USER", "MTN_MOMO_API_KEY"],
};

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const provider = url.searchParams.get("provider") as PaymentProvider;
        const payload = await request.json();

        if (!provider) {
            return NextResponse.json({ error: "Provider non spécifié" }, { status: 400 });
        }

        // Tant que l'intégration n'est pas configurée, aucun paiement ne doit pouvoir être
        // marqué comme réussi via ce webhook (évite qu'un tiers non authentifié ne simule
        // un paiement réussi). Une fois la clé API renseignée, ajouter en plus la vérification
        // de signature propre au fournisseur avant d'appeler handleWebhook.
        const requiredVars = REQUIRED_ENV_VARS[provider];
        if (!requiredVars || requiredVars.some((v) => !process.env[v])) {
            return NextResponse.json({ error: `Intégration ${provider} non configurée` }, { status: 503 });
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
