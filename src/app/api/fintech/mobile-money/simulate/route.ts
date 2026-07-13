import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const OPERATORS = ["Wave", "Orange Money", "MTN MoMo"];

/**
 * Endpoint de TEST INTERNE : génère une transaction Mobile Money réaliste mais
 * clairement identifiée comme simulée (référence préfixée "SIM-"), rattachée à
 * un client réel. Sert à démontrer/tester le flux de rapprochement sans
 * attendre les identifiants API des opérateurs (Wave/Orange/MTN).
 * Désactivé en production et réservé aux utilisateurs authentifiés.
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Simulation désactivée en production" }, { status: 403 });
    }
    await AuthService.requireAuth();

    const body = await req.json().catch(() => ({}));
    const clientId = body?.clientId as string | undefined;

    const client = clientId
      ? await prisma.client.findUnique({ where: { id: clientId } })
      : await prisma.client.findFirst({ orderBy: { createdAt: "desc" } });

    if (!client) {
      return NextResponse.json({ error: "Aucun client trouvé pour la simulation" }, { status: 404 });
    }

    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const amount = Math.round((5000 + Math.random() * 495000) / 500) * 500;
    const type = Math.random() > 0.3 ? "IN" : "OUT";

    const tx = await prisma.mobileMoneyTransaction.create({
      data: {
        operator,
        reference: `SIM-${randomBytes(4).toString("hex").toUpperCase()}`,
        senderName: client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim(),
        senderPhone: client.phone,
        amount,
        type,
        status: "PENDING",
        transactionDate: new Date(),
        clientId: client.id,
      },
    });

    return NextResponse.json({ simulated: true, transaction: tx });
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[MobileMoney Simulate] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
