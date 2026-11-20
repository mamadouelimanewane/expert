import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPortalClient } from "@/lib/portal-auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const STATUT_VERS_KYC: Record<string, string> = {
  verified: "valid",
  canceled: "invalid",
};

export async function GET(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Non configuré." }, { status: 503 });
  }

  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

    const response = await withPortalClient(token, async (client) => {
    if (!client.stripeIdentitySessionId) return NextResponse.json({ status: null });

    const session = await getStripe().identity.verificationSessions.retrieve(client.stripeIdentitySessionId);

    const kyc = STATUT_VERS_KYC[session.status];
    if (kyc && kyc !== client.kycStatus) {
      await prisma.client.update({ where: { id: client.id }, data: { kycStatus: kyc } });
    }

    return NextResponse.json({ status: session.status });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé." }, { status: 404 });
  } catch (error) {
    console.error("Erreur GET onboarding/identity-status:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
