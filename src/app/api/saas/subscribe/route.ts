import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TARIFS_FCFA, slugifyCabinet, type SaasPlan } from "@/lib/tenant";

// ============================================================
// POST /api/saas/subscribe
//
// Crée une session de paiement Wave Checkout pour l'abonnement
// SaaS Cabinet 360. Redirige le cabinet vers la page Wave puis
// confirme via le webhook Wave (/api/payments/webhook?provider=WAVE).
//
// Body attendu :
//   { plan: "STARTER" | "PRO" | "ENTERPRISE", cycle: "mensuel" | "annuel",
//     email: string, cabinetName: string }
// ============================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, cycle, email, cabinetName } = body as {
      plan: SaasPlan;
      cycle: "mensuel" | "annuel";
      email: string;
      cabinetName: string;
    };

    if (!plan || !email || !cabinetName) {
      return NextResponse.json({ error: "Champs requis : plan, email, cabinetName." }, { status: 400 });
    }

    const tarif = TARIFS_FCFA[plan];
    if (!tarif) {
      return NextResponse.json({ error: `Plan inconnu : ${plan}` }, { status: 400 });
    }

    const montantFCFA = cycle === "annuel" ? tarif.annuel * 12 : tarif.mensuel;
    const WAVE_API_KEY = process.env.WAVE_API_KEY;

    // ---- Référence de commande unique ----
    const ref = `C360-${slugifyCabinet(cabinetName).slice(0, 20)}-${Date.now()}`;

    if (!WAVE_API_KEY) {
      // Mode sandbox : retourner une URL de paiement fictive pour les tests
      return NextResponse.json({
        success: true,
        sandbox: true,
        message: "WAVE_API_KEY non configurée — session fictive pour les tests.",
        checkoutUrl: `/login?demo=1&ref=${ref}`,
        ref,
        montant: montantFCFA,
        devise: "XOF",
        plan,
        cycle,
      });
    }

    // ---- Création de la session Wave Checkout ----
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://expert-pi.vercel.app";

    const waveRes = await fetch("https://api.wave.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WAVE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "XOF",
        amount: String(montantFCFA),
        error_url: `${baseUrl}/tarifs?error=1&ref=${ref}`,
        success_url: `${baseUrl}/login?subscribed=1&ref=${ref}`,
        client_reference: ref,
      }),
    });

    if (!waveRes.ok) {
      const errText = await waveRes.text();
      console.error("[saas/subscribe] Erreur Wave API :", waveRes.status, errText);
      return NextResponse.json(
        { error: "Impossible de créer la session de paiement Wave. Réessayez dans un instant." },
        { status: 502 }
      );
    }

    const waveData = await waveRes.json();
    const checkoutUrl: string = waveData.wave_launch_url || waveData.checkout_url || "";

    // ---- Lier la waveClientRef au cabinet si l'utilisateur est déjà inscrit ----
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { cabinetId: true },
      });
      if (user?.cabinetId) {
        await prisma.cabinet.update({
          where: { id: user.cabinetId },
          data: { waveClientRef: ref },
        });
      }
    } catch { /* non bloquant */ }

    // ---- Journaliser la tentative de souscription ----
    try {
      await prisma.auditLog.create({
        data: {
          action: "SAAS_SUBSCRIBE_INIT",
          entityType: "SaasSubscription",
          entityId: ref,
          details: JSON.stringify({ email, cabinetName, plan, cycle, montantFCFA, ref }),
          ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        },
      });
    } catch {
      // Non bloquant
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      ref,
      montant: montantFCFA,
      devise: "XOF",
      plan,
      cycle,
    });
  } catch (error: any) {
    console.error("[saas/subscribe] Erreur inattendue :", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
