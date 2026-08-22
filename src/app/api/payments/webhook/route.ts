import { NextResponse } from "next/server";
import { FintechService, PaymentProvider } from "@/lib/fintech";
import { verifierSignatureWebhook } from "@/lib/webhook-signature";

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

        if (!provider) {
            return NextResponse.json({ error: "Provider non spécifié" }, { status: 400 });
        }

        // Tant que l'intégration n'est pas configurée, aucun paiement ne doit pouvoir
        // être marqué comme réussi via ce webhook.
        const requiredVars = REQUIRED_ENV_VARS[provider];
        if (!requiredVars || requiredVars.some((v) => !process.env[v])) {
            return NextResponse.json({ error: `Intégration ${provider} non configurée` }, { status: 503 });
        }

        // Le corps est lu en texte brut : la signature porte sur les octets reçus,
        // qu'une re-sérialisation JSON modifierait.
        const rawBody = await request.text();

        // Authentification AVANT tout traitement. Sans elle, la seule condition
        // pour faire enregistrer un paiement réussi serait de connaître l'URL.
        const verification = verifierSignatureWebhook(provider, rawBody, request.headers);
        if (!verification.ok) {
            console.warn(`[Webhook API] Signature refusée (${provider}) : ${verification.reason}`);
            return NextResponse.json(
                { error: "Webhook non authentifié", reason: verification.reason },
                { status: verification.status }
            );
        }

        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(rawBody) as Record<string, unknown>;
        } catch {
            return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
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
