import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPortalClient } from "@/lib/portal-auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Non configuré." }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

    const response = await withPortalClient(token, async (client) => {
    if (!client.stripeCustomerId) return NextResponse.json({ status: null });

    const stripe = getStripe();
    const paymentMethods = await stripe.paymentMethods.list({ customer: client.stripeCustomerId, type: "sepa_debit" });
    const actif = paymentMethods.data.length > 0;

    const statut = actif ? "active" : "pending";
    if (statut !== client.sepaMandateStatus) {
      await prisma.client.update({ where: { id: client.id }, data: { sepaMandateStatus: statut } });
    }

    return NextResponse.json({ status: statut });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé." }, { status: 404 });
  } catch (error) {
    console.error("Erreur GET onboarding/sepa-status:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
