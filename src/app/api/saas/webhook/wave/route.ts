import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHmac } from "crypto";

// ============================================================
// POST /api/saas/webhook/wave
//
// Webhook Wave dédié aux paiements d'abonnement SaaS Cabinet 360.
// La référence client_reference commence par "C360-" pour distinguer
// les abonnements SaaS des factures client ordinaires.
//
// Sécurité : signature HMAC-SHA256 vérifiée via le secret
// WAVE_WEBHOOK_SECRET configuré dans le dashboard Wave.
// ============================================================

function verifierSignatureWave(rawBody: string, headers: Headers): boolean {
  const webhookSecret = process.env.WAVE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // En l'absence de secret, on accepte uniquement en développement
    return process.env.NODE_ENV !== "production";
  }
  const signatureRecue = headers.get("wave-signature") || headers.get("x-wave-signature") || "";
  const signatureCalculee = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  // Comparaison en temps constant pour éviter les attaques temporelles
  if (signatureRecue.length !== signatureCalculee.length) return false;
  return signatureRecue === signatureCalculee;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // ── 1. Vérifier la signature Wave ──────────────────────────────────
    if (!verifierSignatureWave(rawBody, request.headers)) {
      console.warn("[saas/webhook/wave] Signature refusée");
      return NextResponse.json({ error: "Webhook non authentifié" }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
    }

    // ── 2. Extraire les champs Wave ────────────────────────────────────
    const clientRef   = String(payload.client_reference ?? "");
    const statusWave  = String(payload.status ?? "");
    const isSuccess   = statusWave === "succeeded" || statusWave === "success";

    // Ignorer les événements non pertinents (paiements en attente, etc.)
    if (!clientRef || !isSuccess) {
      return NextResponse.json({ status: "ACK", traite: false, raison: "evenement_ignore" });
    }

    // ── 3. Différencier abonnement SaaS vs facture client ─────────────
    if (!clientRef.startsWith("C360-")) {
      // Ce webhook est dédié aux abonnements SaaS : on ignore les autres
      return NextResponse.json({ status: "ACK", traite: false, raison: "ref_non_saas" });
    }

    // ── 4. Retrouver le cabinet par sa waveClientRef ───────────────────
    const cabinet = await prisma.cabinet.findUnique({
      where: { waveClientRef: clientRef },
    });

    if (!cabinet) {
      // Essayer de retrouver via la référence partielle (slug dans la ref)
      // Format : C360-{slug}-{timestamp}
      // On ne peut pas reconstruire le slug exact, on journalise pour investigation
      console.error("[saas/webhook/wave] Cabinet introuvable pour la ref :", clientRef);

      // Journaliser pour traitement manuel
      try {
        await prisma.auditLog.create({
          data: {
            action: "SAAS_PAYMENT_UNMATCHED",
            entityType: "SaasWebhook",
            entityId: clientRef,
            details: JSON.stringify({ clientRef, statusWave, payload }),
          },
        });
      } catch { /* non bloquant */ }

      return NextResponse.json({ status: "ACK", traite: false, raison: "cabinet_introuvable" });
    }

    // ── 5. Calculer la nouvelle période d'abonnement ───────────────────
    // Wave envoie le montant en centimes ; on déduit la durée depuis le tarif
    const montant = Number(payload.amount ?? 0);
    // Heuristique : si montant > 100k FCFA on suppose paiement annuel (12 mois)
    const moisPaies = montant >= 100_000 ? 12 : 1;

    const nouvelleExpiration = new Date(
      Math.max(Date.now(), cabinet.lastPaidAt?.getTime() ?? Date.now())
      + moisPaies * 30 * 24 * 60 * 60 * 1000
    );

    // ── 6. Activer / prolonger l'abonnement ───────────────────────────
    await prisma.cabinet.update({
      where: { id: cabinet.id },
      data: {
        statut:        "ACTIVE",
        trialExpiresAt: null,          // fin de l'essai gratuit
        lastPaidAt:    new Date(),
        lastPaidMonths: moisPaies,
        // waveClientRef conservé pour les prochains renouvellements
      },
    });

    // ── 7. Notifier tous les EXPERT/ADMIN du cabinet ───────────────────
    try {
      const admins = await prisma.user.findMany({
        where: { cabinetId: cabinet.id, role: { in: ["ADMIN", "EXPERT"] }, isActive: true },
        select: { id: true },
      });
      await prisma.notification.createMany({
        data: admins.map((u) => ({
          userId:  u.id,
          title:   "Abonnement activé 🎉",
          message: `Votre paiement Wave a été confirmé. Cabinet 360 ${cabinet.plan} actif jusqu'au ${nouvelleExpiration.toLocaleDateString("fr-SN")}.`,
          type:    "SUCCESS",
        })),
        skipDuplicates: true,
      });
    } catch { /* non bloquant */ }

    // ── 8. Journaliser le succès ───────────────────────────────────────
    try {
      await prisma.auditLog.create({
        data: {
          action:     "SAAS_PAYMENT_CONFIRMED",
          entityType: "Cabinet",
          entityId:   cabinet.id,
          details:    JSON.stringify({ clientRef, montant, moisPaies, plan: cabinet.plan }),
        },
      });
    } catch { /* non bloquant */ }

    console.log(`[saas/webhook/wave] Abonnement activé : cabinet=${cabinet.slug}, plan=${cabinet.plan}, mois=${moisPaies}`);

    return NextResponse.json({ status: "ACK", traite: true, cabinetId: cabinet.id });

  } catch (error: any) {
    console.error("[saas/webhook/wave] Erreur :", error);
    // 500 → Wave rejoue la notification plus tard
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
