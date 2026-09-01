import prisma from "./prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Traçabilité des webhooks entrants.
//
// Les notifications de Meta et des fournisseurs de paiement n'étaient visibles
// que dans les logs runtime de l'hébergeur. Conséquence pratique : quand un
// paiement n'était pas réconcilié ou qu'un message WhatsApp n'arrivait pas,
// rien dans l'application ne permettait de distinguer « le fournisseur n'a
// jamais appelé » de « il a appelé et la signature a été refusée » — les deux
// se ressemblent vus du métier, et se corrigent très différemment.
//
// Chaque livraison laisse donc une trace en base, consultable dans le journal
// d'audit.
//
// Volume : l'endpoint étant public, un tiers pourrait multiplier les appels
// refusés pour gonfler la table. Les refus sont donc écrits au plus une fois
// par minute et par fournisseur ; les livraisons acceptées, elles, sont
// toujours tracées puisqu'elles supposent une signature valide, impossible à
// forger sans le secret.
// ─────────────────────────────────────────────────────────────────────────────

export type ResultatWebhook = "ACCEPTE" | "REFUSE";

/** Dernière écriture d'un refus, par fournisseur (limitation de débit). */
const dernierRefus = new Map<string, number>();
const INTERVALLE_REFUS_MS = 60_000;

export async function tracerWebhook(params: {
    fournisseur: string;
    resultat: ResultatWebhook;
    detail: string;
    reference?: string;
}): Promise<void> {
    const { fournisseur, resultat, detail, reference } = params;

    if (resultat === "REFUSE") {
        const maintenant = Date.now();
        const precedent = dernierRefus.get(fournisseur) ?? 0;
        if (maintenant - precedent < INTERVALLE_REFUS_MS) return;
        dernierRefus.set(fournisseur, maintenant);
    }

    try {
        await prisma.auditLog.create({
            data: {
                action: resultat === "ACCEPTE" ? "WEBHOOK_RECU" : "WEBHOOK_REFUSE",
                entity: "WEBHOOK",
                entityId: reference ?? null,
                details: `${fournisseur} — ${detail}`,
                userId: null,
            },
        });
    } catch (error) {
        // La traçabilité ne doit jamais faire échouer le traitement du webhook :
        // un fournisseur qui reçoit une erreur rejouerait sa notification.
        console.error("[Webhook] Échec de la journalisation :", error);
    }
}
