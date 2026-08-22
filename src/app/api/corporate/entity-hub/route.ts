import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

  try {
    const clients = await prisma.client.findMany({
      where: { type: "ENTREPRISE" },
      select: { id: true, companyName: true, fiscalRegime: true, agStatus: true, mandatStatus: true, kycStatus: true },
      orderBy: { companyName: "asc" },
    });

    const entities = clients.map((c) => ({
      id: c.id,
      name: c.companyName || "—",
      legalForm: c.fiscalRegime === "REEL_NORMAL" ? "Société Anonyme" : "SARL",
      governance: c.mandatStatus || null,
      lastAG: null,
      nextAG: c.agStatus === "expiring" ? "À planifier" : null,
      kycStatus: c.kycStatus,
    }));

    return NextResponse.json({ entities });
  } catch (error) {
    console.error("Erreur GET corporate/entity-hub:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
