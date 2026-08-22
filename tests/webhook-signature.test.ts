import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { verifierSignatureWebhook } from "@/lib/webhook-signature";

const SECRET = "secret-de-test-webhook";

const hmac = (payload: string) =>
    createHmac("sha256", SECRET).update(payload, "utf8").digest("hex");

const headers = (init: Record<string, string>) => new Headers(init);

describe("vérification de signature des webhooks de paiement", () => {
    beforeEach(() => {
        process.env.PAYMENT_WEBHOOK_SECRET = SECRET;
    });

    afterEach(() => {
        delete process.env.PAYMENT_WEBHOOK_SECRET;
        delete process.env.WAVE_WEBHOOK_SECRET;
    });

    it("refuse tout webhook quand aucun secret n'est configuré (fail closed)", () => {
        delete process.env.PAYMENT_WEBHOOK_SECRET;
        const res = verifierSignatureWebhook("WAVE", "{}", headers({}));
        expect(res.ok).toBe(false);
        expect(res).toMatchObject({ status: 503, reason: "secret_webhook_non_configure" });
    });

    it("refuse une requête sans en-tête de signature", () => {
        const res = verifierSignatureWebhook("MTN_MOMO", '{"amount":1000}', headers({}));
        expect(res).toMatchObject({ ok: false, status: 401, reason: "signature_absente" });
    });

    describe("Wave", () => {
        const body = '{"id":"pay_1","status":"succeeded"}';

        it("accepte une signature valide et récente", () => {
            const t = Math.floor(Date.now() / 1000);
            const res = verifierSignatureWebhook(
                "WAVE",
                body,
                headers({ "wave-signature": `t=${t},v1=${hmac(`${t}.${body}`)}` })
            );
            expect(res.ok).toBe(true);
        });

        it("refuse une signature calculée sur un autre corps", () => {
            const t = Math.floor(Date.now() / 1000);
            const res = verifierSignatureWebhook(
                "WAVE",
                '{"id":"pay_1","status":"failed"}',
                headers({ "wave-signature": `t=${t},v1=${hmac(`${t}.${body}`)}` })
            );
            expect(res).toMatchObject({ ok: false, reason: "signature_invalide" });
        });

        it("refuse un horodatage hors tolérance (protection contre le rejeu)", () => {
            const t = Math.floor(Date.now() / 1000) - 3600;
            const res = verifierSignatureWebhook(
                "WAVE",
                body,
                headers({ "wave-signature": `t=${t},v1=${hmac(`${t}.${body}`)}` })
            );
            expect(res).toMatchObject({ ok: false, reason: "horodatage_hors_tolerance" });
        });

        it("refuse un en-tête malformé", () => {
            const res = verifierSignatureWebhook(
                "WAVE",
                body,
                headers({ "wave-signature": "nimporte-quoi" })
            );
            expect(res).toMatchObject({ ok: false, reason: "signature_malformee" });
        });

        it("préfère le secret spécifique au fournisseur", () => {
            process.env.WAVE_WEBHOOK_SECRET = "secret-wave-dedie";
            const t = Math.floor(Date.now() / 1000);
            const signature = createHmac("sha256", "secret-wave-dedie")
                .update(`${t}.${body}`, "utf8")
                .digest("hex");

            expect(
                verifierSignatureWebhook(
                    "WAVE",
                    body,
                    headers({ "wave-signature": `t=${t},v1=${signature}` })
                ).ok
            ).toBe(true);

            // La signature calculée avec le secret générique ne doit plus passer.
            expect(
                verifierSignatureWebhook(
                    "WAVE",
                    body,
                    headers({ "wave-signature": `t=${t},v1=${hmac(`${t}.${body}`)}` })
                ).ok
            ).toBe(false);
        });
    });

    describe("schéma générique", () => {
        const body = '{"transactionId":"abc","status":"SUCCESSFUL"}';

        it("accepte une signature HMAC valide", () => {
            const res = verifierSignatureWebhook(
                "ORANGE_MONEY",
                body,
                headers({ "x-webhook-signature": hmac(body) })
            );
            expect(res.ok).toBe(true);
        });

        it("accepte le préfixe sha256=", () => {
            const res = verifierSignatureWebhook(
                "MTN_MOMO",
                body,
                headers({ "x-webhook-signature": `sha256=${hmac(body)}` })
            );
            expect(res.ok).toBe(true);
        });

        it("refuse une signature falsifiée", () => {
            const res = verifierSignatureWebhook(
                "MTN_MOMO",
                body,
                headers({ "x-webhook-signature": "a".repeat(64) })
            );
            expect(res).toMatchObject({ ok: false, status: 401, reason: "signature_invalide" });
        });

        it("refuse une signature de longueur différente sans lever d'exception", () => {
            const res = verifierSignatureWebhook(
                "MTN_MOMO",
                body,
                headers({ "x-webhook-signature": "court" })
            );
            expect(res).toMatchObject({ ok: false, reason: "signature_invalide" });
        });
    });
});
