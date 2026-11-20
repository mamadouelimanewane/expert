import prisma from "./prisma";

export type PaymentProvider = "WAVE" | "ORANGE_MONEY" | "MTN_MOMO";

export interface PaymentInitiation {
    amount: number;
    currency: string;
    invoiceId: string;
    phoneNumber: string;
    provider: PaymentProvider;
}

export interface PaymentStatus {
    transactionId: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    providerRef?: string;
}

interface InitiationResult {
    transactionId: string;
    checkoutUrl?: string;
}

/**
 * Service pour gérer les paiements Mobile Money (Wave, Orange, MTN)
 * Adapté aux spécificités de la zone OHADA (Sénégal, Côte d'Ivoire, Bénin, etc.)
 */
export class FintechService {
    /**
     * Initie un paiement auprès du fournisseur Mobile Money via API réelle.
     * Lève une erreur explicite si les identifiants requis pour ce fournisseur
     * ne sont pas configurés — jamais de simulation de succès.
     */
    static async initiatePayment(params: PaymentInitiation): Promise<InitiationResult> {
        switch (params.provider) {
            case "WAVE":
                return FintechService.initiateWave(params);
            case "ORANGE_MONEY":
                return FintechService.initiateOrangeMoney(params);
            case "MTN_MOMO":
                return FintechService.initiateMtnMomo(params);
        }
    }

    private static async initiateWave(params: PaymentInitiation): Promise<InitiationResult> {
        const apiKey = process.env.WAVE_API_KEY;
        if (!apiKey) {
            throw new Error("Intégration WAVE non configurée. Ajoutez WAVE_API_KEY dans les variables d'environnement.");
        }

        const response = await fetch("https://api.wave.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: String(params.amount),
                currency: params.currency || "XOF",
                error_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=error`,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
                client_reference: params.invoiceId,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Échec de l'initiation Wave (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return { transactionId: data.id, checkoutUrl: data.wave_launch_url };
    }

    /**
     * L'API Orange Money nécessite un échange OAuth (client_credentials) avant
     * chaque appel de paiement pour obtenir un token d'accès temporaire.
     */
    private static async getOrangeAccessToken(): Promise<string> {
        const consumerKey = process.env.ORANGE_CONSUMER_KEY;
        const consumerSecret = process.env.ORANGE_CONSUMER_SECRET;
        if (!consumerKey || !consumerSecret) {
            throw new Error(
                "Intégration ORANGE_MONEY non configurée. Ajoutez ORANGE_CONSUMER_KEY et ORANGE_CONSUMER_SECRET (Orange Developer Portal)."
            );
        }

        const basicAuth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const response = await fetch("https://api.orange.com/oauth/v3/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Échec de l'authentification Orange Money (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    private static async initiateOrangeMoney(params: PaymentInitiation): Promise<InitiationResult> {
        const merchantKey = process.env.ORANGE_MERCHANT_KEY;
        if (!merchantKey) {
            throw new Error("Intégration ORANGE_MONEY non configurée. Ajoutez ORANGE_MERCHANT_KEY dans les variables d'environnement.");
        }

        const accessToken = await FintechService.getOrangeAccessToken();
        const country = process.env.ORANGE_MONEY_COUNTRY || "sn";

        const response = await fetch(`https://api.orange.com/orange-money-webpay/${country}/v1/webpayment`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_key: merchantKey,
                currency: params.currency || "OUV",
                order_id: params.invoiceId,
                amount: params.amount,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=cancel`,
                notif_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook?provider=ORANGE_MONEY`,
                lang: "fr",
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Échec de l'initiation Orange Money (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return { transactionId: data.pay_token, checkoutUrl: data.payment_url };
    }

    /**
     * L'API MTN MoMo Collection nécessite un échange OAuth (API User + API Key)
     * avant chaque requête de paiement pour obtenir un token temporaire.
     */
    private static async getMtnMomoAccessToken(): Promise<string> {
        const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
        const apiUser = process.env.MTN_MOMO_API_USER;
        const apiKey = process.env.MTN_MOMO_API_KEY;
        if (!subscriptionKey || !apiUser || !apiKey) {
            throw new Error(
                "Intégration MTN_MOMO non configurée. Ajoutez MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_API_USER et MTN_MOMO_API_KEY."
            );
        }

        const baseUrl = process.env.MTN_MOMO_ENVIRONMENT === "production"
            ? "https://momoapi.mtn.com"
            : "https://sandbox.momodeveloper.mtn.com";

        const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");
        const response = await fetch(`${baseUrl}/collection/token/`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuth}`,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Échec de l'authentification MTN MoMo (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    private static async initiateMtnMomo(params: PaymentInitiation): Promise<InitiationResult> {
        const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
        const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox";
        if (!subscriptionKey) {
            throw new Error("Intégration MTN_MOMO non configurée. Ajoutez MTN_MOMO_SUBSCRIPTION_KEY dans les variables d'environnement.");
        }

        const accessToken = await FintechService.getMtnMomoAccessToken();
        const baseUrl = process.env.MTN_MOMO_ENVIRONMENT === "production"
            ? "https://momoapi.mtn.com"
            : "https://sandbox.momodeveloper.mtn.com";

        const referenceId = crypto.randomUUID();

        const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Reference-Id": referenceId,
                "X-Target-Environment": targetEnvironment,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: params.amount.toString(),
                currency: params.currency || "XOF",
                externalId: params.invoiceId,
                payer: {
                    partyIdType: "MSISDN",
                    partyId: params.phoneNumber.replace(/\D/g, ""),
                },
                payerMessage: "Paiement Facture Cabinet 360",
                payeeNote: "Cabinet 360",
            }),
        });

        // MTN MoMo requesttopay renvoie 202 Accepted sans corps ; le statut réel
        // s'obtient via GET /collection/v1_0/requesttopay/{referenceId} (polling ou webhook).
        if (response.status !== 202) {
            const errText = await response.text();
            throw new Error(`Échec de l'initiation MTN MoMo (${response.status}): ${errText}`);
        }

        return { transactionId: referenceId };
    }

    /**
     * Interroge le statut réel d'une transaction MTN MoMo (les autres fournisseurs
     * notifient par webhook — voir handleWebhook).
     */
    static async checkMtnMomoStatus(referenceId: string): Promise<PaymentStatus> {
        const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
        const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox";
        if (!subscriptionKey) {
            throw new Error("Intégration MTN_MOMO non configurée.");
        }

        const accessToken = await FintechService.getMtnMomoAccessToken();
        const baseUrl = process.env.MTN_MOMO_ENVIRONMENT === "production"
            ? "https://momoapi.mtn.com"
            : "https://sandbox.momodeveloper.mtn.com";

        const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Target-Environment": targetEnvironment,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Impossible de récupérer le statut MTN MoMo (${response.status})`);
        }

        const data = await response.json();
        const status = data.status === "SUCCESSFUL" ? "SUCCESS" : data.status === "FAILED" ? "FAILED" : "PENDING";
        return { transactionId: referenceId, status, providerRef: data.financialTransactionId };
    }

    /**
     * Gère les notifications asynchrones (webhooks) des fournisseurs.
     *
     * L'échec de mise à jour de la facture était auparavant avalé par un
     * catch silencieux : l'appelant renvoyait alors un ACK au fournisseur,
     * qui ne réessayait jamais. L'argent avait bougé, la facture restait
     * SENT, et rien ne le signalait. Les erreurs techniques remontent donc
     * désormais à l'appelant, qui répond en 5xx pour déclencher un nouvel
     * essai côté fournisseur. Seule une facture introuvable est signalée
     * sans exception : un nouvel essai n'y changerait rien.
     */
    static async handleWebhook(
        provider: PaymentProvider,
        payload: Record<string, unknown>
    ): Promise<{ traite: boolean; raison?: string; invoiceId?: string }> {
        let invoiceId = "";
        let isSuccess = false;

        if (provider === "WAVE") {
            invoiceId = String(payload.client_reference ?? "");
            isSuccess = payload.status === "succeeded" || payload.status === "success";
        } else if (provider === "ORANGE_MONEY") {
            invoiceId = String(payload.order_id ?? "");
            isSuccess = payload.status === "SUCCESS";
        } else if (provider === "MTN_MOMO") {
            invoiceId = String(payload.externalId ?? "");
            isSuccess = payload.status === "SUCCESSFUL";
        }

        if (!invoiceId || !isSuccess) {
            return { traite: false, raison: "evenement_ignore", invoiceId: invoiceId || undefined };
        }

        const facture = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { id: true, status: true } });
        if (!facture) {
            // Non rejouable : le fournisseur a encaissé pour une référence qui
            // ne correspond à aucune facture. À traiter manuellement.
            console.error(`[Webhook] Paiement ${provider} confirmé pour une facture introuvable : ${invoiceId}`);
            return { traite: false, raison: "facture_introuvable", invoiceId };
        }

        // Compare-and-set: a provider can deliver the same signed event more
        // than once (and two deliveries can race). Only the first transition
        // from an unpaid state records the payment and audit event.
        const transition = await prisma.invoice.updateMany({
            where: { id: invoiceId, status: { in: ["SENT", "OVERDUE"] } },
            data: { status: "PAID", paidDate: new Date() },
        });
        if (transition.count !== 1) {
            const current = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { status: true } });
            if (current?.status === "PAID") {
                return { traite: false, raison: "paiement_deja_traite", invoiceId };
            }
            return { traite: false, raison: "facture_non_payable", invoiceId };
        }

        await prisma.auditLog.create({
            data: {
                action: "PAYMENT_SUCCESS",
                entity: "Invoice",
                entityId: invoiceId,
                details: `Paiement ${provider} confirmé via Webhook`,
            },
        });

        return { traite: true, invoiceId };
    }
}
