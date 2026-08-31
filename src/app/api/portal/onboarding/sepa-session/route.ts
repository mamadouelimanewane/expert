import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clientDuPortail } from "@/lib/portal-auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// Cree une session Stripe Checkout (mode "setup") pour enregistrer un mandat
// de prelevement SEPA. Aucune coordonnee bancaire ne transite ni n'est
// stockee par ce serveur : le formulaire est entierement hebergé par Stripe.

function baseUrl(request: NextRequest) {
  return request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Le mandat de prélèvement SEPA n'est pas encore configuré (STRIPE_SECRET_KEY manquante)." }, { status: 503 });
  }

  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

    const client = await clientDuPortail(token);
    if (!client) return NextResponse.json({ error: "Portail introuvable ou désactivé." }, { status: 404 });

    const stripe = getStripe();

    let stripeCustomerId = client.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name: client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim(),
      });
      stripeCustomerId = customer.id;
      await prisma.client.update({ where: { id: client.id }, data: { stripeCustomerId } });
    }

    const returnUrl = new URL(`${baseUrl(request)}/onboarding/digital`);
    returnUrl.searchParams.set("token", token);
    returnUrl.searchParams.set("step", "4");

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: stripeCustomerId,
      payment_method_types: ["sepa_debit"],
      success_url: `${returnUrl.toString()}&sepa=success`,
      cancel_url: `${returnUrl.toString()}&sepa=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur POST onboarding/sepa-session:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
