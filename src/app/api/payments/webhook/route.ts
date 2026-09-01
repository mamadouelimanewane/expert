import { NextResponse } from "next/server";
import { FintechService, PaymentProvider } from "@/lib/fintech";
import { verifierSignatureWebhook } from "@/lib/webhook-signature";
import { tracerWebhook } from "@/lib/webhook-trace";

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
            await tracerWebhook({
                fournisseur: provider,
                resultat: "REFUSE",
                detail: `Notification de paiement refusée : ${verification.reason}`,
            });
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
        const resultat = await FintechService.handleWebhook(provider, payload);

        await tracerWebhook({
            fournisseur: provider,
            resultat: "ACCEPTE",
            detail: resultat.traite
                ? `Paiement rapproché de la facture ${resultat.invoiceId}`
                : `Notification authentifiée non traitée : ${resultat.raison}`,
            reference: resultat.invoiceId,
        });

        return NextResponse.json({ status: "ACK", ...resultat });

    } catch (error) {
        console.error("[Webhook API] Error:", error);
        // Un ACK en 200 sur une erreur de traitement fait perdre le paiement :
        // le fournisseur considère la notification délivrée et ne la rejoue
        // jamais, alors que la facture n'a pas été mise à jour. On répond donc
        // en 500 pour déclencher un nouvel essai. Les cas non rejouables
        // (événement ignoré, facture introuvable) ne lèvent pas d'exception et
        // sortent en 200 avec leur raison.
        return NextResponse.json({ error: "Erreur traitement webhook" }, { status: 500 });
    }
}
