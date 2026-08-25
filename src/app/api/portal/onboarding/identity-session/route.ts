import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// Cree une session Stripe Identity hebergee pour le depot de piece d'identite.
// Aucun fichier n'est recu ni stocke par ce serveur : le flux entier se
// deroule sur l'interface hebergee de Stripe.

function baseUrl(request: NextRequest) {
  return request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "La vérification d'identité n'est pas encore configurée (STRIPE_SECRET_KEY manquante)." }, { status: 503 });
  }

  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

    const client = await prisma.client.findFirst({ where: { portalToken: token } });
    if (!client) return NextResponse.json({ error: "Portail introuvable." }, { status: 404 });

    const returnUrl = new URL(`${baseUrl(request)}/onboarding/digital`);
    returnUrl.searchParams.set("token", token);
    returnUrl.searchParams.set("step", "1");

    const session = await getStripe().identity.verificationSessions.create({
      type: "document",
      metadata: { clientId: client.id },
      return_url: returnUrl.toString(),
    });

    await prisma.client.update({ where: { id: client.id }, data: { stripeIdentitySessionId: session.id } });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur POST onboarding/identity-session:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
