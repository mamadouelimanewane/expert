import { createHmac, timingSafeEqual } from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Vérification de signature des webhooks de paiement.
//
// Sans cette vérification, l'endpoint accepte le corps de requête de n'importe
// quel appelant : un tiers peut alors déclarer un paiement comme réussi. Le
// contrôle « la clé API est-elle configurée ? » ne protège de rien, puisqu'il
// porte sur notre propre configuration et non sur l'identité de l'appelant.
//
// Politique : fail closed. Sans secret configuré pour le fournisseur, aucun
// webhook n'est accepté.
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationResult =
    | { ok: true }
    | { ok: false; status: number; reason: string };

/** Tolérance d'horodatage, pour limiter la fenêtre de rejeu (5 minutes). */
const TOLERANCE_HORODATAGE_S = 300;

function comparerConstant(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

function hmac(secret: string, payload: string): string {
    return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

/**
 * Vérifie l'en-tête `Wave-Signature` au format `t=<timestamp>,v1=<hmac>`.
 * Le HMAC-SHA256 porte sur `${timestamp}.${corps brut}`.
 */
function verifierWave(rawBody: string, header: string | null, secret: string): VerificationResult {
    if (!header) return { ok: false, status: 401, reason: "signature_absente" };

    const parts = Object.fromEntries(
        header.split(",").map((p) => {
            const [k, ...rest] = p.trim().split("=");
            return [k, rest.join("=")];
        })
    );

    const timestamp = parts["t"];
    const signature = parts["v1"];
    if (!timestamp || !signature) {
        return { ok: false, status: 401, reason: "signature_malformee" };
    }

    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
    if (!Number.isFinite(age) || age > TOLERANCE_HORODATAGE_S) {
        return { ok: false, status: 401, reason: "horodatage_hors_tolerance" };
    }

    return comparerConstant(hmac(secret, `${timestamp}.${rawBody}`), signature)
        ? { ok: true }
        : { ok: false, status: 401, reason: "signature_invalide" };
}

/**
 * Schéma générique : HMAC-SHA256 du corps brut, transmis en hexadécimal dans
 * `x-webhook-signature`. Utilisé pour les fournisseurs dont le format propre
 * n'est pas encore implémenté — il vaut mieux un secret partagé vérifié qu'une
 * absence de contrôle.
 */
function verifierGenerique(rawBody: string, header: string | null, secret: string): VerificationResult {
    if (!header) return { ok: false, status: 401, reason: "signature_absente" };

    const recue = header.replace(/^sha256=/i, "").trim();
    return comparerConstant(hmac(secret, rawBody), recue)
        ? { ok: true }
        : { ok: false, status: 401, reason: "signature_invalide" };
}

/**
 * Vérifie l'authenticité d'un webhook de paiement.
 *
 * @param provider  WAVE | ORANGE_MONEY | MTN_MOMO
 * @param rawBody   corps de la requête tel que reçu, non re-sérialisé
 * @param headers   en-têtes de la requête
 */
export function verifierSignatureWebhook(
    provider: string,
    rawBody: string,
    headers: Headers
): VerificationResult {
    const secret =
        process.env[`${provider}_WEBHOOK_SECRET`] || process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
        // Fail closed : pas de secret, pas de webhook accepté.
        return { ok: false, status: 503, reason: "secret_webhook_non_configure" };
    }

    if (provider === "WAVE") {
        return verifierWave(rawBody, headers.get("wave-signature"), secret);
    }

    return verifierGenerique(rawBody, headers.get("x-webhook-signature"), secret);
}

/**
 * Vérifie l'authenticité d'un webhook Meta (WhatsApp Cloud API).
 *
 * Meta signe le corps brut en HMAC-SHA256 avec le secret de l'application et
 * transmet le résultat dans `x-hub-signature-256` au format `sha256=<hex>`.
 *
 * Même politique que les paiements : fail closed. Cet endpoint est exempté du
 * middleware de session (Meta n'a pas de compte chez nous) ; sans signature
 * vérifiée, n'importe qui pourrait injecter des écritures comptables dans le
 * dossier d'un client réel et sonder le portefeuille clients du cabinet.
 */
export function verifierSignatureMeta(rawBody: string, headers: Headers): VerificationResult {
    const secret = process.env.WHATSAPP_APP_SECRET;

    if (!secret) {
        return { ok: false, status: 503, reason: "secret_webhook_non_configure" };
    }

    return verifierGenerique(rawBody, headers.get("x-hub-signature-256"), secret);
}
